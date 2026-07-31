import { supabase } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await supabase.from("products").select("id").limit(1);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
