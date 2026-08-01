import { json } from "../_lib/api";

export async function onRequestPost(context: any) {
  try {
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
  } catch (e: any) {
    return json({ error: e.message || "Fetch failed", auto: false }, { status: 500 });
  }
}
