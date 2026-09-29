# Serviço de similaridade facial do Goosley

Este diretório é autocontido: contém o Container Python, Worker Cloudflare,
embeddings, manifesto e a release WebP usados pela rota pública
`/criminalidadefacial`.

## Verificação local

```powershell
Set-Location worker
npm install
npm test
npm run typecheck
npx wrangler deploy --dry-run --containers-rollout=none --config wrangler.jsonc
```

O Worker usa dois buckets R2 privados: `criminalidadefacial-release` para
`gallery-release.json` e `criminalidadefacial-references` para os WebP em
`release/references/`. O operador precisa definir o segredo
`TURNSTILE_SECRET_KEY` no Worker e, no build do Goosley, preencher
`NEXT_PUBLIC_FACIAL_SIMILARITY_API_ORIGIN` e
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

O deploy é uma ação separada e autorizada pelo operador da conta Cloudflare.
