import { supabase, toProduct } from "@/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const body = await req.json();

    const { data: existing, error: findError } = await supabase
      .from("products")
      .select("*")
      .eq("id", numId)
      .single();

    if (findError || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: updated, error } = await supabase
      .from("products")
      .update({
        title: body.title ?? existing.title,
        image_url: body.imageUrl ?? existing.image_url,
        shopee_url: body.shopeeUrl ?? existing.shopee_url,
        price: body.price !== undefined ? parseInt(String(body.price), 10) || 0 : existing.price,
        category: body.category ?? existing.category,
        is_active: body.isActive !== undefined ? Boolean(body.isActive) : existing.is_active,
        shop_name: body.shopName !== undefined ? body.shopName : existing.shop_name,
        rating: body.rating !== undefined ? body.rating : existing.rating,
        sales: body.sales !== undefined ? Number(body.sales) || 0 : existing.sales,
        discount: body.discount !== undefined ? Number(body.discount) || 0 : existing.discount,
      })
      .eq("id", numId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ product: toProduct(updated) });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from("products").delete().eq("id", parseInt(id, 10));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
