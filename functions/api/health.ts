import { getSupabase, json } from "../_lib/api";

export async function onRequestGet(context: any) {
  try {
    const supabase = getSupabase(context.env);
    const { error } = await supabase.from("products").select("id").limit(1);
    if (error) throw error;
    return json({ ok: true });
  } catch {
    return json({ ok: false }, { status: 500 });
  }
}
