import { getSupabase, json, toProduct, toProducts, fetchAllProducts } from "../_lib/api";

function getProductId(pathParts: string[]) {
  if (pathParts[0] !== "products" || pathParts.length !== 2) return null;
  const id = parseInt(pathParts[1], 10);
  return Number.isFinite(id) ? id : null;
}

async function handleProductsGet(context: any) {
  const supabase = getSupabase(context.env);
  const { searchParams } = new URL(context.request.url);
  const q = searchParams.get("q") || "";
  const categoria = searchParams.get("categoria") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const perPageRaw = parseInt(searchParams.get("perPage") || "0", 10) || 0;
  const paginate = perPageRaw > 0;
  const perPage = paginate ? Math.min(200, Math.max(1, perPageRaw)) : 48;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (q) query = query.ilike("title", `%${q}%`);
  if (categoria && categoria !== "Todos") query = query.eq("category", categoria);

  const from = paginate ? (page - 1) * perPage : 0;
  query = query.range(from, from + perPage - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? data?.length ?? 0;

  return json({
    products: toProducts(data),
    total,
    page: paginate ? page : 1,
    perPage: paginate ? perPage : total,
    totalPages: paginate ? Math.max(1, Math.ceil(total / perPage)) : 1,
  });
}

async function handleProductsPost(context: any) {
  const supabase = getSupabase(context.env);
  const body = await context.request.json();
  const { title, imageUrl, shopeeUrl, price, category } = body;

  if (!title || !imageUrl || !shopeeUrl) {
    return json({ error: "Missing fields" }, { status: 400 });
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

  return json({ product: toProduct(data) }, { status: 201 });
}

async function handleProductPut(context: any, id: number) {
  const supabase = getSupabase(context.env);
  const body = await context.request.json();

  const { data: existing, error: findError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (findError || !existing) return json({ error: "Not found" }, { status: 404 });

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
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return json({ product: toProduct(updated) });
}

async function handleProductDelete(context: any, id: number) {
  const supabase = getSupabase(context.env);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  return json({ success: true });
}

async function handleCategories(context: any) {
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
}

async function handleHealth(context: any) {
  const supabase = getSupabase(context.env);
  const { error } = await supabase.from("products").select("id").limit(1);
  if (error) throw error;
  return json({ ok: true });
}

async function handleAdminAuth(context: any) {
  const body = await context.request.json();
  const pass = body?.password || "";
  const correct = context.env.ADMIN_PASS || "selecaoshop";

  if (pass === correct) {
    return json(
      { ok: true },
      {
        headers: {
          "set-cookie": "admin_auth=yes; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/",
        },
      },
    );
  }

  return json({ ok: false }, { status: 401 });
}

async function handleAdminProducts(context: any) {
  const all = await fetchAllProducts(context.env);
  return json({ products: toProducts(all) });
}

async function handleScrape(context: any) {
  const { url } = await context.request.json();
  if (!url || typeof url !== "string") {
    return json({ error: "URL required" }, { status: 400 });
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return json({ error: "Could not fetch page", url }, { status: 404 });
  }

  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

  const title = (ogTitle ? ogTitle[1] : titleMatch ? titleMatch[1] : "").trim();
  const imageUrl = ogImage ? ogImage[1].trim() : "";
  const description = ogDesc ? ogDesc[1].trim() : "";

  return json({ title, imageUrl, description, url });
}

export async function onRequest(context: any) {
  try {
    const url = new URL(context.request.url);
    const pathParts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
    const method = context.request.method.toUpperCase();

    if (pathParts.length === 1 && pathParts[0] === "products") {
      if (method === "GET") return await handleProductsGet(context);
      if (method === "POST") return await handleProductsPost(context);
    }

    const productId = getProductId(pathParts);
    if (productId !== null) {
      if (method === "PUT") return await handleProductPut(context, productId);
      if (method === "DELETE") return await handleProductDelete(context, productId);
    }

    if (method === "GET" && pathParts.length === 1 && pathParts[0] === "categories") {
      return await handleCategories(context);
    }

    if (method === "GET" && pathParts.length === 1 && pathParts[0] === "health") {
      return await handleHealth(context);
    }

    if (method === "POST" && pathParts.join("/") === "admin/auth") {
      return await handleAdminAuth(context);
    }

    if (method === "GET" && pathParts.join("/") === "admin/products") {
      return await handleAdminProducts(context);
    }

    if (method === "POST" && pathParts.length === 1 && pathParts[0] === "scrape") {
      return await handleScrape(context);
    }

    return json({ error: "Not found" }, { status: 404 });
  } catch (e: any) {
    return json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}
