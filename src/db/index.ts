import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
}

if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type DbProduct = {
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

export type Product = {
  id: number;
  title: string;
  imageUrl: string;
  shopeeUrl: string;
  price: number;
  category: string;
  isActive: boolean;
  shopName: string | null;
  rating: string | null;
  sales: number;
  discount: number;
  createdAt: string;
};

export function toProduct(row: DbProduct): Product {
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

export function toProducts(rows: DbProduct[] | null | undefined): Product[] {
  return (rows ?? []).map(toProduct);
}
