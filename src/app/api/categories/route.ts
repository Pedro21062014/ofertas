import { db } from "@/db";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({ category: products.category, count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.isActive, true))
      .groupBy(products.category)
      .orderBy(products.category);

    return NextResponse.json({
      categories: rows.map((r) => ({ name: r.category, count: Number(r.count) })),
    });
  } catch (e) {
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
