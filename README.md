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
- `SHOPEE_AFFILIATE_APP_ID` = `18333870469`
- `SHOPEE_AFFILIATE_SECRET` = senha/secret da API de afiliados da Shopee, como Secret

### APIs via Functions

As rotas abaixo são Cloudflare Pages Functions:

- `/api/products`
- `/api/products/:id`
- `/api/categories`
- `/api/health`
- `/api/scrape`
- `/api/admin/auth`
- `/api/admin/products`

## Conversor de links afiliados

A página `/conversor` permite colar um link de produto da Shopee e gerar um link afiliado usando a Shopee Affiliate Open API. A rota usada é `/api/affiliate/convert` em Cloudflare Pages Functions.

A senha da API da Shopee **não deve ir para o frontend nem para o GitHub**. Configure `SHOPEE_AFFILIATE_SECRET` como Secret no Cloudflare.

## Salvamento automático e verificação semanal

Quando alguém usa `/conversor` com um link de produto que ainda não está cadastrado, a Function `/api/affiliate/convert` tenta salvar o produto automaticamente na tabela `products` com categoria `Convertidos`.

A verificação semanal de produtos fica em `.github/workflows/check-products-stock.yml` e roda toda segunda-feira. Ela chama `npm run check:products`, verifica links ativos da Shopee e marca `is_active = false` para produtos removidos/fora de estoque quando detectar 404/410 ou textos de indisponibilidade.

Para a verificação semanal funcionar no GitHub Actions, configure no repositório o Secret:

- `SUPABASE_SERVICE_ROLE_KEY`
