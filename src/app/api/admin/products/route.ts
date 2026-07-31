import { db } from "@/db";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const all = await db.select().from(products).orderBy(products.createdAt);
    return NextResponse.json({ products: all });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
