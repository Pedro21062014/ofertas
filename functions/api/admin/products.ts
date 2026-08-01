import { fetchAllProducts, json, toProducts } from "../../_lib/api";

export async function onRequestGet(context: any) {
  try {
    const all = await fetchAllProducts(context.env);
    return json({ products: toProducts(all) });
  } catch {
    return json({ error: "Failed" }, { status: 500 });
  }
}
