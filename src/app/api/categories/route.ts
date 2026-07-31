import { supabase } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .eq("is_active", true)
      .order("category", { ascending: true });

    if (error) throw error;

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const category = row.category || "Geral";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return NextResponse.json({
      categories: Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
    });
  } catch (e) {
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
