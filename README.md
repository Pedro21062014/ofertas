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

```bash
PRODUCTS_JSON_PATH=/caminho/products_novos.min.json npm run import:products
```
