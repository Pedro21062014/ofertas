import { readFileSync } from "node:fs";
import pg from "pg";

const data = JSON.parse(readFileSync("/tmp/products_novos.min.json", "utf8"));

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const rows = [];
for (const [cat, items] of Object.entries(data)) {
  for (const it of items) {
    const priceNum = Math.round(parseFloat(it.price || it.priceMin || "0") * 100) || 0;
    rows.push([
      it.productName,
      it.imageUrl,
      it.offerLink || it.productLink,
      priceNum,
      cap(cat),
      true,
      it.shopName || null,
      it.ratingStar ? String(it.ratingStar) : null,
      Number(it.sales) || 0,
      Number(it.priceDiscountRate) || 0,
    ]);
  }
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
});

await client.connect();
await client.query("DELETE FROM products");
await client.query("ALTER SEQUENCE products_id_seq RESTART WITH 1");

const sql = `INSERT INTO products (title, image_url, shopee_url, price, category, is_active, shop_name, rating, sales, discount)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;

let inserted = 0;
for (const r of rows) {
  try {
    await client.query(sql, r);
    inserted++;
  } catch (e) {
    console.error("Failed to insert:", r[0].substring(0, 50), e.message);
  }
}

const { rows: count } = await client.query("SELECT count(*)::int AS n, count(distinct category)::int AS c FROM products");
console.log(`Importados ${inserted} produtos em ${count[0].c} categorias.`);
await client.end();
