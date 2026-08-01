import { fetchAllProducts, json } from "../_lib/api";

export async function onRequestGet(context: any) {
  try {
    const rows = await fetchAllProducts(context.env);
    const counts = new Map<string, number>();

    for (const row of rows) {
      if (!row.is_active) continue;
      const category = row.category || "Geral";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return json({
      categories: Array.from(counts.entries())
        .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
        .map(([name, count]) => ({ name, count })),
    });
  } catch {
    return json({ categories: [] }, { status: 500 });
  }
}
