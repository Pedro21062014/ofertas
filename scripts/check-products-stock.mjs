import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aklkhuxjixoorwcxytei.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const concurrency = Math.max(1, Number(process.env.CHECK_CONCURRENCY || 8));
const requestTimeoutMs = Math.max(3000, Number(process.env.CHECK_TIMEOUT_MS || 12000));
const maxProducts = Number(process.env.CHECK_MAX_PRODUCTS || 0); // 0 = all active products

if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
}

const restUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
const headers = {
  apikey: supabaseKey,
  authorization: `Bearer ${supabaseKey}`,
  "content-type": "application/json",
};

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${restUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error ${response.status}: ${text}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function fetchActiveProducts() {
  const products = [];
  const chunkSize = 1000;

  for (let from = 0; ; from += chunkSize) {
    if (maxProducts > 0 && products.length >= maxProducts) break;

    const to = maxProducts > 0
      ? Math.min(from + chunkSize - 1, maxProducts - 1)
      : from + chunkSize - 1;

    const rows = await supabaseRequest(
      `/products?select=id,title,shopee_url&is_active=eq.true&order=id.asc`,
      {
        headers: {
          Range: `${from}-${to}`,
          "Range-Unit": "items",
        },
      },
    );

    products.push(...(rows || []));
    if (!rows || rows.length < chunkSize) break;
  }

  return products;
}

function looksUnavailable(html) {
  const text = html.toLowerCase();
  return [
    "produto esgotado",
    "fora de estoque",
    "produto não encontrado",
    "produto nao encontrado",
    "item não existe",
    "item nao existe",
    "produto indisponível",
    "produto indisponivel",
    "sold out",
    "out of stock",
    "unavailable",
    "product not found",
    "this product has been deleted",
  ].some((pattern) => text.includes(pattern));
}

async function checkProduct(product) {
  const url = product.shopee_url;
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ...product, inactive: true, reason: "invalid_url" };
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    // 403/429 can mean bot protection/rate limit, not necessarily unavailable.
    if ([403, 429].includes(response.status)) {
      return { ...product, inactive: false, reason: `ignored_status_${response.status}` };
    }

    if ([404, 410].includes(response.status) || response.status >= 500) {
      return { ...product, inactive: true, reason: `http_${response.status}` };
    }

    const html = await response.text();
    if (looksUnavailable(html)) {
      return { ...product, inactive: true, reason: "unavailable_text" };
    }

    return { ...product, inactive: false, reason: "ok" };
  } catch (error) {
    // Network failures are not enough to deactivate a product.
    return { ...product, inactive: false, reason: `network_${error?.name || "error"}` };
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
      if ((currentIndex + 1) % 100 === 0) {
        console.log(`Verificados ${currentIndex + 1}/${items.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function deactivateProducts(products) {
  const ids = products.map((product) => product.id);
  if (ids.length === 0) return;

  const chunkSize = 100;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    await supabaseRequest(`/products?id=in.(${chunk.join(",")})`, {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ is_active: false }),
    });
  }
}

const products = await fetchActiveProducts();
console.log(`Produtos ativos para verificar: ${products.length}`);

const results = await mapWithConcurrency(products, concurrency, checkProduct);
const inactive = results.filter((result) => result.inactive);
const summary = results.reduce((acc, result) => {
  acc[result.reason] = (acc[result.reason] || 0) + 1;
  return acc;
}, {});

await deactivateProducts(inactive);

console.log("Resumo:", summary);
console.log(`Produtos desativados: ${inactive.length}`);
if (inactive.length > 0) {
  console.log("Primeiros desativados:", inactive.slice(0, 20).map((item) => ({ id: item.id, reason: item.reason, title: item.title })));
}
