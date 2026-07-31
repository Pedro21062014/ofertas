import { db } from "@/db";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, ilike, and, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categoria = searchParams.get("categoria") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const perPageRaw = parseInt(searchParams.get("perPage") || "0", 10) || 0;
    const paginate = perPageRaw > 0;
    const perPage = paginate ? Math.min(200, Math.max(1, perPageRaw)) : 0;

    const conditions = [];
    if (q) conditions.push(ilike(products.title, `%${q}%`));
    if (categoria && categoria !== "Todos") conditions.push(eq(products.category, categoria));
    conditions.push(eq(products.isActive, true));

    const whereClause = conditions.length > 0 ? and(...conditions) : sql`true`;

    // total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause);

    const total = Number(count) || 0;

    let query = db.select().from(products).where(whereClause).orderBy(products.createdAt).$dynamic();

    if (paginate) {
      query = query.limit(perPage).offset((page - 1) * perPage);
    }

    const all = await query;

    return NextResponse.json({
      products: all,
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
    const [inserted] = await db.insert(products).values({
      title,
      imageUrl,
      shopeeUrl,
      price: price ? parseInt(price, 10) : 0,
      category: category || "Geral",
      isActive: true,
    }).returning();
    return NextResponse.json({ product: inserted }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
