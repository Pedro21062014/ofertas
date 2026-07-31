import "dotenv/config";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const inputPath = process.env.PRODUCTS_JSON_PATH || "/tmp/products_novos.min.json";
const data = JSON.parse(readFileSync(inputPath, "utf8"));

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
if (!supabaseKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to import products");

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const rows = [];
for (const [cat, items] of Object.entries(data)) {
  for (const it of items) {
    const priceNum = Math.round(parseFloat(it.price || it.priceMin || "0") * 100) || 0;
    rows.push({
      title: it.productName,
      image_url: it.imageUrl,
      shopee_url: it.offerLink || it.productLink,
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

const { error: deleteError } = await supabase.from("products").delete().neq("id", -1);
if (deleteError) throw deleteError;

let inserted = 0;
const chunkSize = 500;
for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize);
  const { error } = await supabase.from("products").insert(chunk);
  if (error) throw error;
  inserted += chunk.length;
}

const categories = new Set(rows.map((row) => row.category));
console.log(`Importados ${inserted} produtos em ${categories.size} categorias.`);
