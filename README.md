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

## The catalog

`scripts/catalog/catalog.json` is the photographer's work: six series (Shopify collections) and a print per photo (a Shopify product with size, paper and frame variants). Shopify gets the products from the seed script and their images from Obelism Media.

1. Seed the collections and products. Re-running updates them by handle.

   ```
   node --env-file=.env.local scripts/seed-shopify.mts [--only <handle>] [--dry]
   ```

   `--dry` lists the handles and source files without calling Shopify.

   Needs `SHOPIFY_ADMIN_CLIENT_ID`, `SHOPIFY_ADMIN_CLIENT_SECRET` and `SHOPIFY_HEADLESS_PUBLICATION` (see `.env.example`).

2. Prepare the photos: resized to fit Shopify's 25 MP limit, metadata stripped (only the colour profile stays), and named `<product-handle>__<image>.jpg`. Requires ImageMagick 7 (`magick`). It also writes `manifest.json` with each file's title and alt text.

   ```
   node scripts/prepare-photos.mts --in <originals> --out <dir> [--only <handle>]
   ```

3. Upload them to the space's Media library, with the title and alt text from `manifest.json`. Two rules there do the rest:
   - Upload rule: file name pattern `*__*` → folder `Prints`, tag `print`.
   - Product rule: file name pattern `{handle}__*`, with **Send to Shopify** on. Each file goes onto the product its name starts with, with its alt text.

## Checks

```
pnpm lint
pnpm typecheck
pnpm build
```

## License

MIT, from the Vercel Shop template.
