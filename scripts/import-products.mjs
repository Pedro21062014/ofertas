import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const defaultInputPath = existsSync("data/produtos_TODOS.json")
  ? "data/produtos_TODOS.json"
  : "/tmp/products_novos.min.json";
const inputPath = process.env.PRODUCTS_JSON_PATH || defaultInputPath;
const data = JSON.parse(readFileSync(inputPath, "utf8"));

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const importMode = (process.env.IMPORT_MODE || "upsert").toLowerCase();

if (!supabaseUrl) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
if (!supabaseKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to import products");

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const byUrl = new Map();
for (const [cat, items] of Object.entries(data)) {
  for (const it of items) {
    const title = it.productName?.trim();
    const imageUrl = it.imageUrl?.trim();
    const shopeeUrl = (it.offerLink || it.productLink || "").trim();

    if (!title || !imageUrl || !shopeeUrl) continue;

    const priceNum = Math.round(parseFloat(it.price || it.priceMin || "0") * 100) || 0;
    byUrl.set(shopeeUrl, {
      title,
      image_url: imageUrl,
      shopee_url: shopeeUrl,
      price: priceNum,
      category: cap(cat),
      is_active: true,
      shop_name: it.shopName || null,
      rating: it.ratingStar ? String(it.ratingStar) : null,
      sales: Number(it.sales) || 0,
      discount: Number(it.priceDiscountRate) || 0,
    });
  }
}

const rows = Array.from(byUrl.values());

if (importMode === "replace") {
  const { error: deleteError } = await supabase.from("products").delete().neq("id", -1);
  if (deleteError) throw deleteError;
}

let imported = 0;
const chunkSize = 500;
for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize);
  const query = supabase.from("products");
  const { error } = importMode === "insert"
    ? await query.insert(chunk)
    : await query.upsert(chunk, { onConflict: "shopee_url" });

  if (error) throw error;
  imported += chunk.length;
}

const categories = new Set(rows.map((row) => row.category));
console.log(`${importMode === "replace" ? "Importados/substituídos" : "Importados/atualizados"} ${imported} produtos em ${categories.size} categorias.`);
