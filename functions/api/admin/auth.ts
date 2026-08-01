import { json } from "../../_lib/api";

export async function onRequestPost(context: any) {
  try {
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
  } catch {
    return json({ ok: false }, { status: 500 });
  }
}
