# Ofertas

Aplicação Next.js para vitrine de achados/ofertas, usando Supabase como banco de dados.

## Configuração do Supabase

1. No painel do Supabase, abra **SQL Editor** e execute o arquivo `supabase/schema.sql`.
2. Copie `.env.example` para `.env.local`.
3. Preencha as chaves do Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` somente no servidor/deploy.
4. Instale dependências e rode:

```bash
npm install
npm run dev
```

## Importar produtos

O arquivo `data/produtos_TODOS.json` já está incluído no projeto. Depois de criar a tabela no Supabase, rode:

```bash
npm run import:products
```

Por padrão, o script faz upsert por `shopee_url`, evitando duplicados. Para limpar a tabela e importar tudo do zero:

```bash
IMPORT_MODE=replace npm run import:products
```

## Deploy no Cloudflare Pages estático + Functions

Este projeto é gerado como site estático em `out/` e as APIs ficam em `functions/` usando Cloudflare Pages Functions.

### Configuração no Cloudflare Pages

Use:

- Framework preset: `None`
- Build command: `npm run pages:build`
- Build output directory: `out`
- Root directory: `/`
- Node version: `22`

O arquivo `wrangler.toml` também já define `pages_build_output_dir = "out"` e `nodejs_compat`.

### Variáveis no Cloudflare

Configure em **Workers & Pages > seu projeto > Settings > Variables and Secrets**:

- `NODE_VERSION` = `22`
- `NEXT_PUBLIC_SUPABASE_URL` = `https://aklkhuxjixoorwcxytei.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = service role key do Supabase, como Secret
- `ADMIN_PASS` = senha do painel admin, como Secret

### APIs via Functions

As rotas abaixo são Cloudflare Pages Functions:

- `/api/products`
- `/api/products/:id`
- `/api/categories`
- `/api/health`
- `/api/scrape`
- `/api/admin/auth`
- `/api/admin/products`
