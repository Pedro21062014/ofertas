import { createClient } from "@supabase/supabase-js";

type Env = {
  SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_SERVICE_ROLE?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  ADMIN_PASS?: string;
};

type DbProduct = {
  id: number;
  title: string;
  image_url: string;
  shopee_url: string;
  price: number;
  category: string;
  is_active: boolean;
  shop_name: string | null;
  rating: string | number | null;
  sales: number;
  discount: number;
  created_at: string;
};

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

export function getSupabase(env: Env) {
  const supabaseUrl = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ??
    env.SUPABASE_SERVICE_ROLE ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
  if (!supabaseKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required");

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function toProduct(row: DbProduct) {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    shopeeUrl: row.shopee_url,
    price: row.price,
    category: row.category,
    isActive: row.is_active,
    shopName: row.shop_name,
    rating: row.rating === null ? null : String(row.rating),
    sales: row.sales,
    discount: row.discount,
    createdAt: row.created_at,
  };
}

export function toProducts(rows: DbProduct[] | null | undefined) {
  return (rows ?? []).map(toProduct);
}

export async function fetchAllProducts(env: Env) {
  const supabase = getSupabase(env);
  const all: DbProduct[] = [];
  const chunkSize = 1000;

  for (let from = 0; ; from += chunkSize) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + chunkSize - 1);

    if (error) throw error;
    all.push(...((data ?? []) as DbProduct[]));
    if (!data || data.length < chunkSize) break;
  }

  return all;
}

export function getIdParam(params: Record<string, string | string[]>) {
  const raw = params.id;
  return Array.isArray(raw) ? raw[0] : raw;
}

export type { Env };
