import { supabase, toProduct, toProducts } from "@/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categoria = searchParams.get("categoria") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const perPageRaw = parseInt(searchParams.get("perPage") || "0", 10) || 0;
    const paginate = perPageRaw > 0;
    const perPage = paginate ? Math.min(200, Math.max(1, perPageRaw)) : 0;

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (q) query = query.ilike("title", `%${q}%`);
    if (categoria && categoria !== "Todos") query = query.eq("category", categoria);

    if (paginate) {
      const from = (page - 1) * perPage;
      query = query.range(from, from + perPage - 1);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    const total = count ?? data?.length ?? 0;

    return NextResponse.json({
      products: toProducts(data),
      total,
      page: paginate ? page : 1,
      perPage: paginate ? perPage : total,
      totalPages: paginate ? Math.max(1, Math.ceil(total / perPage)) : 1,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, imageUrl, shopeeUrl, price, category } = body;
    if (!title || !imageUrl || !shopeeUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        title,
        image_url: imageUrl,
        shopee_url: shopeeUrl,
        price: price ? parseInt(String(price), 10) || 0 : 0,
        category: category || "Geral",
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ product: toProduct(data) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
