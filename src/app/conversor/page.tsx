"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Check, Copy, Link2, Loader2, Sparkles } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";

export default function ConversorPage() {
  const [url, setUrl] = useState("");
  const [subId, setSubId] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAffiliateLink("");
    setCopied(false);

    try {
      const response = await fetch("/api/affiliate/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, subId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Não foi possível converter o link.");

      setAffiliateLink(data.affiliateLink || "");
    } catch (err: any) {
      setError(err?.message || "Erro ao converter o link.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!affiliateLink) return;
    await navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <nav className="sticky top-0 z-50 w-full bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="group">
            <Logo size={38} className="transition-transform group-hover:scale-[1.02]" />
          </Link>
          <div className="flex items-center gap-5 text-[13px] font-medium text-stone-600">
            <Link href="/" className="hover:text-stone-950 transition-colors">
              Início
            </Link>
            <Link href="/produtos" className="hover:text-stone-950 transition-colors">
              Achados
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-stone-950 text-stone-50">
        <div
          className="absolute -top-40 -right-40 w-[38rem] h-[38rem] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, #F5341A 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-50 transition-colors mb-10">
            <ArrowLeft size={16} /> Voltar ao site
          </Link>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium tracking-wide uppercase text-stone-200 backdrop-blur-md mb-8">
              <Sparkles size={13} className="text-brand-400" /> Conversor de afiliado
            </div>
            <h1 className="font-serif text-5xl md:text-7xl tracking-[-0.04em] leading-[0.95] mb-6">
              Transforme links da Shopee em <span className="italic text-brand-400">links afiliados.</span>
            </h1>
            <p className="text-stone-300/90 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
              Cole o link do produto, gere seu link de afiliado e copie para divulgar com rastreamento.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 md:px-10 -mt-12 relative z-10 pb-24">
        <div className="bg-white rounded-[2rem] border border-stone-200/70 shadow-2xl shadow-stone-200/50 p-6 md:p-9">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Link2 size={22} />
            </div>
            <div>
              <h2 className="font-serif text-3xl text-stone-950 mb-1">Converter link</h2>
              <p className="text-sm text-stone-500">Funciona com links de produto da Shopee Brasil.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="url" className="block text-[12px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Link do produto
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://shopee.com.br/..."
                className="w-full rounded-2xl bg-stone-50 border border-stone-200 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60"
                required
              />
            </div>

            <div>
              <label htmlFor="subId" className="block text-[12px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Sub ID opcional
              </label>
              <input
                id="subId"
                value={subId}
                onChange={(event) => setSubId(event.target.value)}
                placeholder="ex: instagram, tiktok, campanha01"
                className="w-full rounded-2xl bg-stone-50 border border-stone-200 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60"
              />
              <p className="text-xs text-stone-400 mt-2">Use para identificar de onde veio o clique. Separe vários por vírgula.</p>
            </div>

            <button
              type="submit"
              disabled={loading || !url}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 text-white px-6 py-4 font-semibold text-sm hover:bg-brand-600 disabled:opacity-60 transition-colors shadow-xl shadow-brand-500/25"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "Convertendo..." : "Gerar link afiliado"}
            </button>
          </form>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {affiliateLink && (
            <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:p-5">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-3">
                <Check size={17} /> Link afiliado gerado
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <a
                  href={affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-white border border-emerald-200 px-3.5 py-3 text-sm text-brand-700 hover:text-brand-800 hover:border-brand-300 transition-colors break-all underline underline-offset-4"
                  title="Abrir produto com link afiliado"
                >
                  {affiliateLink}
                </a>
                <a
                  href={affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white px-5 py-3 text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  Abrir produto
                </a>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 text-stone-50 px-5 py-3 text-sm font-medium hover:bg-stone-800 transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p className="text-xs text-emerald-700/80 mt-3">
                Clique no link ou em “Abrir produto” para abrir a página da Shopee já com seu link afiliado.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-10 text-xs text-stone-400">
          <LogoMark size={34} className="mx-auto mb-3 opacity-60" />
          Achados da Shopee — ferramenta de conversão de afiliados
        </div>
      </section>
    </main>
  );
}
