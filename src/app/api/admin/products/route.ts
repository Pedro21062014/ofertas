import { supabase, toProducts } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ products: toProducts(data) });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
