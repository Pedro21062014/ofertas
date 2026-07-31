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


## Deploy no Cloudflare

Este projeto usa `@opennextjs/cloudflare`, o adaptador recomendado para rodar Next.js full-stack no runtime da Cloudflare.

### Variáveis de ambiente no Cloudflare

Configure em **Workers & Pages > seu projeto > Settings > Variables and Secrets**:

- `NODE_VERSION` = `22`
- `NEXT_PUBLIC_SUPABASE_URL` = URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = service role key do Supabase, como secret
- `ADMIN_PASS` = senha do painel admin, como secret

### Build/deploy

Para deploy via Git/Workers Builds, use:

- Build command: `npm run cf:build`
- Deploy command: `npm run cf:deploy`

Para testar localmente no runtime da Cloudflare:

```bash
cp .dev.vars.example .dev.vars
# preencha as chaves reais em .dev.vars
npm run cf:preview
```
