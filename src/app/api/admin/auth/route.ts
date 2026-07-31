import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pass = body?.password || "";
    const correct = process.env.ADMIN_PASS || "selecaoshop";
    if (pass === correct) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set("admin_auth", "yes", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 });
      return res;
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
