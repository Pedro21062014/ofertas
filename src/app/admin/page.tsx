"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Trash2, Pencil, Save, X, Sparkles, CheckCircle2, ImageIcon, RefreshCcw } from "lucide-react";
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

const BASE_CATEGORIES = ["Geral", "Cozinha", "Tecnologia", "Beleza", "Casa", "Moda", "Pet"];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ title: "", shopeeUrl: "", imageUrl: "", price: "", category: "Geral" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", shopeeUrl: "", imageUrl: "", price: "", category: "Geral", isActive: true });
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{ title?: string; imageUrl?: string; error?: string } | null>(null);
  const [message, setMessage] = useState("");

  const categories = useMemo(() => {
    const used = products.map((p) => p.category);
    return Array.from(new Set([...BASE_CATEGORIES, ...used])).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [products]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("achados_da_shopee_admin") : null;
    if (saved === "auth") setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (authenticated) fetchAll();
  }, [authenticated]);

  async function fetchAll() {
    try {
      const r = await fetch("/api/admin/products");
      const d = await r.json();
      setProducts(d.products || []);
    } catch { setProducts([]); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (d.ok) {
        setAuthenticated(true);
        if (typeof window !== "undefined") localStorage.setItem("achados_da_shopee_admin", "auth");
        setPassword("");
      } else {
        setMessage("Senha incorreta.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Erro no login.");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function handleScrape() {
    if (!form.shopeeUrl) return;
    setLoadingScrape(true);
    setScrapeResult(null);
    try {
      const r = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.shopeeUrl }),
      });
      const d = await r.json();
      if (d.error) {
        setScrapeResult({ error: d.error || "Não foi possível extrair. Preencha manualmente." });
      } else {
        setScrapeResult({ title: d.title, imageUrl: d.imageUrl });
        if (d.title) setForm((s) => ({ ...s, title: d.title }));
        if (d.imageUrl) setForm((s) => ({ ...s, imageUrl: d.imageUrl }));
      }
    } catch (e: any) {
      setScrapeResult({ error: e.message || "Erro de rede." });
    } finally {
      setLoadingScrape(false);
    }
  }

  async function handleAdd() {
    if (!form.title || !form.imageUrl || !form.shopeeUrl) {
      setMessage("Preencha título, link e imagem.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      const r = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: form.price ? parseInt(form.price, 10) || 0 : 0 }),
      });
      if (r.ok) {
        setForm({ title: "", shopeeUrl: "", imageUrl: "", price: "", category: "Geral" });
        setScrapeResult(null);
        setMessage("Produto adicionado!");
        setTimeout(() => setMessage(""), 3000);
        fetchAll();
      }
    } catch { setMessage("Erro ao salvar."); setTimeout(() => setMessage(""), 3000); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja excluir este produto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchAll();
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditForm({ title: p.title, shopeeUrl: p.shopeeUrl, imageUrl: p.imageUrl, price: String(p.price), category: p.category, isActive: p.isActive });
  }

  async function saveEdit() {
    if (!editingId) return;
    await fetch(`/api/products/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, price: parseInt(editForm.price, 10) || 0 }),
    });
    setEditingId(null);
    fetchAll();
    setMessage("Produto atualizado!");
    setTimeout(() => setMessage(""), 3000);
  }

  function formatPrice(n: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((n || 0) / 100);
  }

  const total = products.length;
  const active = products.filter((p) => p.isActive).length;

  if (!authenticated) {
    return (
      <main className="relative min-h-screen bg-stone-950 text-stone-50 flex items-center justify-center px-6 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, #F5341A 0%, transparent 65%)" }}
        />
        <div className="relative max-w-md w-full animate-fade-in-up">
          <div className="text-center mb-10">
            <LogoMark size={64} className="mx-auto mb-6" />
            <h1 className="font-serif text-4xl md:text-5xl tracking-[-0.03em] mb-3">
              Painel <span className="italic text-brand-400">Achados</span>
            </h1>
            <p className="text-stone-400 text-base">Acesso restrito ao gerenciamento dos achados.</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 backdrop-blur-md">
            <label htmlFor="pass" className="block text-[13px] font-medium text-stone-200">Senha de acesso</label>
            <input id="pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-stone-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-400/60" placeholder="••••••••" />
            <button type="submit" className="w-full rounded-xl bg-brand-500 text-white font-medium py-3 text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/25">Entrar</button>
            {message && <p className="text-rose-300 text-sm text-center">{message}</p>}
          </form>
          <p className="text-center text-stone-600 text-xs mt-6">Achados da Shopee © {new Date().getFullYear()}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950 selection:bg-brand-100">
      <nav className="sticky top-0 z-50 w-full bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <a href="/" className="group">
            <Logo size={38} className="transition-transform group-hover:scale-[1.02]" />
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-[13px] font-medium text-stone-600 hover:text-brand-600 transition-colors">Voltar ao site</a>
            <button
              onClick={() => {
                if (typeof window !== "undefined") localStorage.removeItem("achados_da_shopee_admin");
                setAuthenticated(false);
              }}
              className="text-[13px] font-medium text-stone-400 hover:text-stone-950 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-10 pb-24">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-serif text-4xl md:text-5xl tracking-[-0.03em] text-stone-950">Painel de <span className="italic text-brand-500">achados</span></h1>
          <div className="hidden md:flex items-center gap-6 text-sm text-stone-500">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {active} ativos</div>
            <div>Total: <span className="font-medium text-stone-950">{total}</span></div>
          </div>
        </div>
        <p className="text-stone-500 mb-10">Cole o link da Shopee, extraia os dados e o site atualiza automaticamente.</p>

        {message && (
          <div className="mb-6 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 px-5 py-3.5 flex items-center gap-2.5 text-sm font-medium shadow-sm">
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-[2rem] border border-stone-200/60 shadow-xl shadow-stone-200/30 p-7 md:p-8">
              <h2 className="font-serif text-2xl text-stone-950 mb-1">Novo achado</h2>
              <p className="text-stone-400 text-sm mb-7">Cole o link da Shopee e extraia os dados automaticamente.</p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-[12px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">Link Shopee</label>
                  <div className="flex gap-2">
                    <input id="url" type="url" value={form.shopeeUrl} onChange={(e) => setForm({ ...form, shopeeUrl: e.target.value })} className="flex-1 rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60" placeholder="https://shopee.com.br/..." />
                    <button onClick={handleScrape} disabled={loadingScrape || !form.shopeeUrl} className="inline-flex items-center gap-1.5 rounded-xl bg-stone-950 text-stone-50 px-3.5 py-2.5 text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors" title="Extrair automaticamente">
                      {loadingScrape ? <RefreshCcw size={16} className="animate-spin" /> : <Sparkles size={16} />} {loadingScrape ? "Extraindo..." : "Extrair"}
                    </button>
                  </div>
                  {scrapeResult?.error && <p className="text-rose-500 text-xs mt-1.5">{scrapeResult.error}</p>}
                  {scrapeResult && !scrapeResult.error && (
                    <p className="text-emerald-600 text-xs mt-1.5 flex items-center gap-1"><CheckCircle2 size={12} /> Dados extraídos do link.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="block text-[12px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">Título</label>
                  <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60" placeholder="Nome do produto" />
                </div>

                <div>
                  <label htmlFor="img" className="block text-[12px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">URL da imagem</label>
                  <div className="flex gap-2">
                    <input id="img" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="flex-1 rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60" placeholder="https://images.unsplash.com/..." />
                    <a href={`https://images.unsplash.com/search/photos?query=${encodeURIComponent(form.title || "product")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-stone-100 text-stone-600 px-3 py-2.5 text-sm font-medium hover:bg-stone-200 transition-colors" title="Buscar imagens"><ImageIcon size={16} /></a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="price" className="block text-[12px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">Preço (centavos)</label>
                    <input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60" placeholder="2990" />
                    <p className="text-[11px] text-stone-400 mt-1">Ex: 2990 = R$ 29,90</p>
                  </div>
                  <div>
                    <label htmlFor="cat" className="block text-[12px] font-medium uppercase tracking-wider text-stone-500 mb-1.5">Categoria</label>
                    <select id="cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300/60">
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <button onClick={handleAdd} className="w-full rounded-xl bg-brand-500 text-white py-3.5 font-medium text-sm hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/25">Salvar achado</button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-stone-950">Seus achados</h2>
              <button onClick={() => fetchAll()} className="text-sm text-stone-500 hover:text-stone-950 transition-colors flex items-center gap-1"><RefreshCcw size={14} /> Atualizar</button>
            </div>

            <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-xl shadow-stone-200/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-stone-500 text-[11px] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-5 py-3.5">Imagem</th>
                      <th className="text-left px-4 py-3.5">Título</th>
                      <th className="text-left px-4 py-3.5">Categoria</th>
                      <th className="text-left px-4 py-3.5">Preço</th>
                      <th className="text-left px-4 py-3.5">Status</th>
                      <th className="text-right px-5 py-3.5">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-5 py-3 align-middle">
                          <a href={p.imageUrl} target="_blank" rel="noopener noreferrer" className="block w-14 h-14 rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all"><img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" /></a>
                        </td>
                        <td className="px-4 py-3 align-top max-w-xs">
                          {editingId === p.id ? (
                            <div className="space-y-2">
                              <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-lg bg-stone-50 border border-stone-200 px-2 py-1 text-sm" />
                              <input value={editForm.shopeeUrl} onChange={e => setEditForm({ ...editForm, shopeeUrl: e.target.value })} className="w-full rounded-lg bg-stone-50 border border-stone-200 px-2 py-1 text-xs" />
                            </div>
                          ) : (
                            <>
                              <a href={p.shopeeUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-stone-950 hover:text-brand-600 hover:underline block text-sm leading-snug">{p.title}</a>
                              <a href={p.shopeeUrl} target="_blank" className="text-[11px] text-stone-400 hover:text-stone-600 flex items-center gap-0.5 mt-0.5">Link Shopee <ArrowUpRight size={10} /></a>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          {editingId === p.id ? (
                            <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="rounded-lg bg-stone-50 border border-stone-200 px-2 py-1 text-xs w-full">{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                          ) : (
                            <span className="inline-block bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-[12px] font-medium">{p.category}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle text-stone-950 font-semibold tabular-nums">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3 align-middle">
                          {editingId === p.id ? (
                            <button onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${editForm.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{editForm.isActive ? "Ativo" : "Inativo"}</button>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}><span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-400" : "bg-stone-400"}`} />{p.isActive ? "Ativo" : "Inativo"}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {editingId === p.id ? (
                              <>
                                <button onClick={saveEdit} className="inline-flex items-center gap-1 rounded-lg bg-stone-950 text-stone-50 px-2.5 py-1.5 text-xs font-medium hover:bg-stone-800 transition-colors"><Save size={13} /> Salvar</button>
                                <button onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 rounded-lg bg-stone-100 text-stone-600 px-2.5 py-1.5 text-xs font-medium hover:bg-stone-200 transition-colors"><X size={13} /> Cancelar</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 text-brand-700 px-2.5 py-1.5 text-xs font-medium hover:bg-brand-100 transition-colors" title="Editar"><Pencil size={13} /></button>
                                <button onClick={() => handleDelete(p.id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 text-rose-600 px-2.5 py-1.5 text-xs font-medium hover:bg-rose-100 transition-colors" title="Excluir"><Trash2 size={13} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-16 text-center text-stone-400">Nenhum achado cadastrado ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
