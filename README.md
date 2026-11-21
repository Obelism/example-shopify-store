# Photo Studio example store

An example print shop for a fictional photographer, built to show how Obelism works on a real storefront:

- **Shopify** sells the prints: catalog, cart and checkout through the Hydrogen SDK, on the [Vercel Shop](https://github.com/vercel/shop) template (release in `.vercel-shop/template.json`), without its Eve shopping agent.

## Getting started

Requires pnpm 12 and Node.js 26.

```
pnpm install
cp .env.example .env.local
pnpm dev
```

Fill in `.env.local` with the store's Storefront API credentials (Shopify admin → Settings → Apps and sales channels → Headless). See [Storefront API permissions](https://vercel.shop/docs/reference/storefront-api-permissions) for the scopes it needs.

## Checks

```
pnpm lint
pnpm typecheck
pnpm build
```

## License

MIT, from the Vercel Shop template.
