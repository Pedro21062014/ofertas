"use client";

import { useEffect, useMemo, useState, Suspense, useCallback } from "react";
import { ArrowUpRight, Search, Star, Flame, ShoppingBag, X, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
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
}

const PER_PAGE_OPTIONS = [12, 24, 48, 96];

function formatPrice(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format((n || 0) / 100);
}

function formatSales(n: number) {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(".0", "")} mil`;
  }
  return String(n);
}

/** Builds a compact list of page numbers with ellipsis. */
function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

function ProdutosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gotoInput, setGotoInput] = useState("");

  // URL state
  const search = searchParams.get("q") || "";
  const filter = searchParams.get("categoria") || "Todos";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const perPage = PER_PAGE_OPTIONS.includes(parseInt(searchParams.get("perPage") || "24", 10))
    ? parseInt(searchParams.get("perPage") || "24", 10)
    : 24;

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // update URL helper
  const updateUrl = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const usp = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === "" || v === "Todos") usp.delete(k);
        else usp.set(k, String(v));
      });
      router.push(`/produtos?${usp.toString()}`);
    },
    [router, searchParams],
  );

  // fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // fetch products when filters/page change
  useEffect(() => {
    setLoading(true);
    const url = new URL("/api/products", window.location.href);
    if (search) url.searchParams.set("q", search);
    if (filter !== "Todos") url.searchParams.set("categoria", filter);
    url.searchParams.set("page", String(page));
    url.searchParams.set("perPage", String(perPage));

    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [search, filter, page, perPage]);

  // scroll to top on page change
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, perPage, filter, search]);

  const categoryPills = useMemo(() => {
    return ["Todos", ...categories.map((c) => c.name)];
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchInput, page: 1 });
  };

  const goToPage = (p: number) => {
    const clamped = Math.min(totalPages, Math.max(1, p));
    updateUrl({ page: clamped });
  };

  const handleGoto = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(gotoInput, 10);
    if (!isNaN(n)) goToPage(n);
    setGotoInput("");
  };

  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(total, page * perPage);
  const pageList = buildPages(page, totalPages);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      {/* Announcement */}
      <div className="w-full bg-stone-950 text-stone-50 text-[11px] tracking-[0.18em] uppercase font-medium py-2.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map((k) => (
            <span key={k} className="flex shrink-0">
              {["Achados selecionados a dedo", "Link direto para a Shopee", "Frete rápido", "Novos itens toda semana"].map(
                (t) => (
                  <span key={t} className="mx-6 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-500" />
                    {t}
                  </span>
                ),
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <a href="/" className="group">
            <Logo size={38} className="transition-transform group-hover:scale-[1.02]" />
          </a>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full rounded-full bg-stone-100 border border-stone-200 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60 pr-10"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-500 transition-colors">
                <Search size={16} />
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-stone-600">
            <a href="/" className="hover:text-stone-950 transition-colors">
              Início
            </a>
            <a href="/produtos" className="text-stone-950 hover:text-brand-600 transition-colors">
              Achados
            </a>
          </div>

          <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="md:hidden p-2 -mr-2" aria-label="Filtros">
            <Filter size={22} />
          </button>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-6 pb-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full rounded-full bg-stone-100 border border-stone-200 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60 pr-10"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand-500 transition-colors">
                <Search size={16} />
              </button>
            </div>
          </form>
        </div>
      </nav>

      {/* Mobile filters */}
      {mobileFiltersOpen && (
        <div className="md:hidden px-6 py-4 bg-stone-50/95 backdrop-blur-xl border-b border-stone-200/60">
          <div className="flex flex-wrap gap-2">
            {categoryPills.map((c) => (
              <button
                key={c}
                onClick={() => {
                  updateUrl({ categoria: c, page: 1 });
                  setMobileFiltersOpen(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${filter === c ? "bg-stone-950 text-stone-50 border-stone-950 shadow-lg shadow-stone-950/10" : "bg-white text-stone-600 border-stone-200 hover:border-brand-300 hover:text-brand-600"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 pt-16 md:pt-24 pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1 className="font-serif text-4xl md:text-6xl tracking-[-0.03em] text-stone-950 mb-3">
              Todos os achados
            </h1>
            <p className="text-stone-500 text-base md:text-lg max-w-md">
              {search ? `Busca por “${search}”` : "Explore nossa seleção completa"}
              {filter !== "Todos" && ` na categoria “${filter}”`}.
            </p>
          </div>
          <div className="hidden md:flex flex-wrap gap-2 max-w-lg justify-end">
            {categoryPills.map((c) => (
              <button
                key={c}
                onClick={() => updateUrl({ categoria: c, page: 1 })}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${filter === c ? "bg-stone-950 text-stone-50 border-stone-950 shadow-lg shadow-stone-950/10" : "bg-white text-stone-600 border-stone-200 hover:border-brand-300 hover:text-brand-600"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: results count + per-page selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
          <p className="text-sm text-stone-500">
            {loading ? (
              "Carregando..."
            ) : (
              <>
                Mostrando <span className="font-semibold text-stone-900">{startItem}–{endItem}</span> de{" "}
                <span className="font-semibold text-stone-900">{total}</span> produtos
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            <label htmlFor="perPage" className="text-sm text-stone-500 whitespace-nowrap">
              Produtos por página:
            </label>
            <select
              id="perPage"
              value={perPage}
              onChange={(e) => updateUrl({ perPage: e.target.value, page: 1 })}
              className="rounded-full bg-white border border-stone-200 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-300/60 cursor-pointer"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: Math.min(perPage, 12) }).map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-stone-200/60 bg-white overflow-hidden animate-pulse">
                <div className="aspect-square bg-stone-100" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-4 bg-stone-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {products.map((p) => (
              <a
                key={p.id}
                href={p.shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-[2rem] border border-stone-200/60 shadow-sm hover:shadow-2xl hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                onMouseEnter={() => setHoverId(p.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <div className="relative overflow-hidden aspect-square bg-stone-100">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${hoverId === p.id ? "scale-105" : "scale-100"}`}
                    loading="lazy"
                  />
                  {p.discount > 0 && (
                    <div className="absolute top-0 right-0 bg-brand-500 text-white text-center px-2.5 py-1.5 rounded-bl-2xl shadow-lg shadow-brand-500/30">
                      <span className="block text-[13px] font-bold leading-none">-{p.discount}%</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="inline-block bg-white/90 backdrop-blur-md text-stone-950 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {p.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30">
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-medium text-[15px] md:text-base text-stone-950 leading-snug mb-3 group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[2.6em]">
                    {p.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[12px] text-stone-500 mb-3">
                    {p.rating && (
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-700">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        {Number(p.rating).toFixed(1)}
                      </span>
                    )}
                    {p.sales > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Flame size={13} className="text-brand-400" />
                        {formatSales(p.sales)} vendidos
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <span className="text-brand-600 font-bold text-lg md:text-xl tracking-tight">
                        {formatPrice(p.price)}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone-500 group-hover:text-brand-600 transition-colors whitespace-nowrap">
                      Ver na Shopee <ArrowUpRight size={13} />
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-medium uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5">
                      <ShoppingBag size={13} className="text-brand-400" /> Shopee
                    </span>
                    {p.shopName && <span className="truncate max-w-[55%] normal-case tracking-normal text-stone-400">{p.shopName}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-28">
            <LogoMark size={56} className="mx-auto mb-6 opacity-40" />
            <p className="text-stone-400 text-lg">Nenhum achado encontrado.</p>
            <button
              onClick={() => router.push("/produtos")}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-100 text-stone-600 px-4 py-2 text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              <X size={14} /> Limpar filtros
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-14 flex flex-col items-center gap-6">
            <div className="flex items-center flex-wrap justify-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft size={16} /> <span className="hidden sm:inline">Anterior</span>
              </button>

              {pageList.map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-stone-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`min-w-[40px] rounded-full px-3 py-2 text-sm font-medium border transition-all ${p === page ? "bg-stone-950 text-stone-50 border-stone-950 shadow-lg shadow-stone-950/10" : "bg-white text-stone-600 border-stone-200 hover:border-brand-300 hover:text-brand-600"}`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <span className="hidden sm:inline">Próxima</span> <ChevronRight size={16} />
              </button>
            </div>

            {/* Go-to-page */}
            <form onSubmit={handleGoto} className="flex items-center gap-3 text-sm text-stone-500">
              <span>
                Página <span className="font-semibold text-stone-900">{page}</span> de{" "}
                <span className="font-semibold text-stone-900">{totalPages}</span>
              </span>
              <span className="text-stone-300">•</span>
              <label htmlFor="goto" className="whitespace-nowrap">
                Ir para:
              </label>
              <input
                id="goto"
                type="number"
                min={1}
                max={totalPages}
                value={gotoInput}
                onChange={(e) => setGotoInput(e.target.value)}
                placeholder={String(page)}
                className="w-20 rounded-full bg-white border border-stone-200 px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-300/60"
              />
              <button
                type="submit"
                className="rounded-full bg-brand-500 text-white px-4 py-1.5 text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                Ir
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 bg-white mt-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={38} />
          <div className="text-sm text-stone-400 text-center md:text-right">
            © {new Date().getFullYear()} Achados da Shopee. <br className="md:hidden" />
            Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50">
          <div className="mx-auto max-w-6xl px-6 md:px-10 pt-24">
            <Logo size={38} />
          </div>
        </div>
      }
    >
      <ProdutosContent />
    </Suspense>
  );
}
