"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Sparkles, Menu, X, ShoppingBag, Check, Star, Flame } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";

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
  createdAt: string;
}

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("Todos");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleCategories = useMemo(() => {
    const used = Array.from(new Set(products.map((p) => p.category))).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return ["Todos", ...used];
  }, [products]);

  const filtered = useMemo(() => {
    if (filter === "Todos") return products;
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

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
          <Link href="/" className="group">
            <Logo size={38} className="transition-transform group-hover:scale-[1.02]" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-stone-600">
            <a href="#produtos" className="hover:text-stone-950 transition-colors">
              Achados
            </a>
            <a href="#sobre" className="hover:text-stone-950 transition-colors">
              Sobre
            </a>
            <a href="#contato" className="hover:text-stone-950 transition-colors">
              Contato
            </a>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 -mr-2" aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-6 pb-6 pt-2 bg-stone-50/95 backdrop-blur-xl border-b border-stone-200/60 flex flex-col gap-3 text-sm font-medium text-stone-700">
            <a href="#produtos" onClick={() => setMobileOpen(false)}>
              Achados
            </a>
            <a href="#sobre" onClick={() => setMobileOpen(false)}>
              Sobre
            </a>
            <a href="#contato" onClick={() => setMobileOpen(false)}>
              Contato
            </a>

          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-950 text-stone-50">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950/70 to-stone-950" />
        <div
          className="absolute -top-32 -right-32 w-[38rem] h-[38rem] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #F5341A 0%, transparent 65%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 md:px-10 pt-24 pb-24 md:pt-36 md:pb-36">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium tracking-wide uppercase text-stone-200 backdrop-blur-md mb-8">
              <Sparkles size={13} className="text-brand-400" /> Curadoria independente
            </div>

            <div className="mb-8 md:hidden">
              <LogoMark size={64} />
            </div>

            <h1 className="font-serif text-6xl md:text-8xl lg:text-[8.5rem] leading-[0.85] tracking-[-0.04em] text-stone-50 mb-8">
              Achados <br />
              <span className="italic text-brand-400">da Shopee.</span>
            </h1>
            <p className="text-stone-300/90 text-lg md:text-2xl leading-relaxed max-w-xl font-light">
              Garimpamos os melhores produtos para você não perder tempo. Preço justo, qualidade real e link direto para
              comprar com segurança.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#produtos"
                className="inline-flex items-center gap-2.5 rounded-full bg-brand-500 text-white px-7 py-3.5 font-medium text-sm hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/25"
              >
                Ver os achados <ArrowUpRight size={16} />
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { title: "Garimpado a dedo", desc: "Cada achado é conferido antes de entrar na lista." },
            { title: "Link direto", desc: "Um clique e você já está na página oficial da Shopee." },
            { title: "Sempre novo", desc: "A vitrine é atualizada com frequência pelo painel." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl bg-white border border-stone-200/60 shadow-xl shadow-stone-200/40 p-7 md:p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="font-serif text-2xl md:text-3xl text-stone-950 mb-3">{f.title}</h3>
              <p className="text-stone-500 leading-relaxed text-[15px]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 pt-24 md:pt-32 text-center">
        <blockquote className="font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-[-0.03em] text-stone-950 max-w-4xl mx-auto mb-8">
          “O melhor achado é aquele que <span className="italic text-brand-500">você não precisou procurar</span>.”
        </blockquote>
        <div className="w-16 h-px bg-brand-300 mx-auto mb-4" />
        <p className="text-stone-400 text-sm tracking-[0.2em] uppercase">Achados da Shopee</p>
      </section>

      {/* Products */}
      <section id="produtos" className="mx-auto max-w-6xl px-6 md:px-10 pt-20 md:pt-28 pb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
             <h2 className="font-serif text-4xl md:text-6xl tracking-[-0.03em] text-stone-950 mb-3">Destaques</h2>
             <p className="text-stone-500 text-base md:text-lg max-w-md">
               Uma seleção dos achados mais populares e bem avaliados.
             </p>
            </div>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/25"
            >
              Ver todos os achados <ArrowUpRight size={16} />
            </Link>
      </div>

      {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
             {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-[2rem] border border-stone-200/60 bg-white overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-stone-100" />
                <div className="p-7 space-y-3">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-4 bg-stone-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((p) => (
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
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                      hoverId === p.id ? "scale-105" : "scale-100"
                    }`}
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

         {!loading && filtered.length === 0 && (
           <div className="text-center py-28">
             <LogoMark size={56} className="mx-auto mb-6 opacity-40" />
             <p className="text-stone-400 text-lg">Nenhum achado encontrado.</p>
           </div>
         )}
       </section>

      {/* Sobre */}
      <section id="sobre" className="bg-stone-950 text-stone-50 mt-12">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-36 grid md:grid-cols-2 gap-14 md:gap-24 items-center">
          <div>
            <h2 className="font-serif text-4xl md:text-7xl tracking-[-0.03em] leading-[1.05] mb-8">
              Uma curadoria <br />
              <span className="italic text-brand-400">simples e direta.</span>
            </h2>
            <p className="text-stone-300/80 text-lg leading-relaxed mb-8">
              Não somos um marketplace gigante — somos uma seleção. Reunimos os achados que realmente valem a pena, com
              link direto para a Shopee, onde você compra com a mesma segurança de sempre.
            </p>
            <ul className="space-y-3 text-stone-300/80 text-base">
              {["Produtos conferidos um a um", "Links diretos e seguros", "Atualizado com frequência", "Design pensado para você decidir rápido"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check size={18} className="text-brand-400 shrink-0" /> <span>{item}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
            <img
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1000&q=80"
              alt="Achados da Shopee"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 to-transparent" />
            <div className="absolute bottom-5 left-5">
              <LogoMark size={44} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section id="contato" className="mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32 text-center">
        <LogoMark size={56} className="mx-auto mb-8" />
        <h2 className="font-serif text-5xl md:text-7xl tracking-[-0.03em] text-stone-950 mb-6">
          Não perca <br />
          <span className="italic text-stone-500">os próximos achados.</span>
        </h2>
        <p className="text-stone-500 text-lg max-w-xl mx-auto mb-10">
          Novos produtos são adicionados com frequência. Volte sempre para conferir as novidades!
        </p>
        <a
          href="#produtos"
          className="inline-flex items-center gap-2.5 rounded-full bg-brand-500 text-white px-8 py-4 font-medium text-base hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/25"
        >
           Ver todos os achados <ArrowUpRight size={18} />
         </a>
       </section>

       {/* Sobre */}

       {/* Sobre */}
      <footer className="border-t border-stone-200/60 bg-white">
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
