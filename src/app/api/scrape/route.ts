import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }
    // Try to fetch the URL for Open Graph data
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Could not fetch page", url }, { status: 404 });
    }
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

    const title = (ogTitle ? ogTitle[1] : titleMatch ? titleMatch[1] : "").trim();
    const imageUrl = ogImage ? ogImage[1].trim() : "";
    const description = ogDesc ? ogDesc[1].trim() : "";

    return NextResponse.json({ title, imageUrl, description, url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Fetch failed", auto: false }, { status: 500 });
  }
}
