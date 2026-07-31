import { db } from "@/db";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = parseInt(id);
    const body = await req.json();

    const [existing] = await db.select().from(products).where(eq(products.id, numId));
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [updated] = await db
      .update(products)
      .set({
        title: body.title ?? existing.title,
        imageUrl: body.imageUrl ?? existing.imageUrl,
        shopeeUrl: body.shopeeUrl ?? existing.shopeeUrl,
        price: body.price !== undefined ? parseInt(String(body.price), 10) || 0 : existing.price,
        category: body.category ?? existing.category,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        shopName: body.shopName !== undefined ? body.shopName : existing.shopName,
        rating: body.rating !== undefined ? body.rating : existing.rating,
        sales: body.sales !== undefined ? Number(body.sales) || 0 : existing.sales,
        discount: body.discount !== undefined ? Number(body.discount) || 0 : existing.discount,
      })
      .where(eq(products.id, numId))
      .returning();

    return NextResponse.json({ product: updated });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(products).where(eq(products.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
