# Photo Studio example store

An example print shop for a fictional photographer, built to show how Obelism works on a real storefront:

- **Shopify** sells the prints: catalog, cart and checkout through the Hydrogen SDK, on the [Vercel Shop](https://github.com/vercel/shop) template (release in `.vercel-shop/template.json`), without its Eve shopping agent.
- **Obelism Media** holds the photographs and puts them on the Shopify products.
- **Obelism Content** holds the pages and the stories behind each series and print.
- **Obelism Numbers** counts visitors, clicks and the shop's events, through to paid orders.
- **Obelism Improve** runs A/B tests and feature flags, in code and from Content.

## Getting started

Requires npm 12 and Node.js 26.

```
npm install
cp .env.example .env.local
npm run dev
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

## Content

Pages (home, About, Printing), the story of each series and of some prints come from Obelism Content (`CONTENT_*` in `.env.example`).

- The content model is `content/content-model.json`, kept in step with `npx content model plan|apply` and reviewed in pull requests. `npx content types --file content/content-model.json` regenerates `content/content-types.ts`. The `Content model` workflow plans changes on pull requests and applies them to the develop environment on merge, with a develop management token in the `CONTENT_TOKEN_DEVELOP` repository secret; production gets the model by promotion in Content.
- Set the environment's preview URL to the site (`http://localhost:3000` locally) to edit pages in Content's canvas, or sign in on the site at `/cms/login` to edit with the prompt bar.
- Add a webhook in Content pointing at `/api/webhooks/content` with `CONTENT_WEBHOOK_SECRET` so publishing refreshes the site.

## Numbers

Set the three `NEXT_PUBLIC_OBELISM_*` values and the browser sends page views, clicks on elements with a `data-numbers-id` (every Content block has one), `view_item_list`, `view_item`, `add_to_cart` and `begin_checkout` to Obelism Numbers. The site's origin has to be in the space's Allowed origins for the environment; develop allows localhost.

`purchase` is sent by the server when Shopify reports a paid order: subscribe the store's `orders/paid` webhook to `/api/webhooks/shopify` (with `SHOPIFY_WEBHOOK_SECRET`) and set `OBELISM_API_TOKEN`. The order carries the visitor id from the cart, so the purchase counts for the visitor who placed it.

## Improve

With the `NEXT_PUBLIC_OBELISM_*` values set, `proxy.ts` assigns each visitor's variants on page requests, and the page shows them before it paints, though every page is prerendered.

- In code: the `print-page-details` test on the print page and the `shipping-banner` flag above the nav (`ImproveVariants`).
- From Content: editors add an A/B test or flag block to a page; the `home-intro` test on the home page is one.
- Goals are the Numbers events: `print-page-details` starts at `view_item` (`product_page`) and converts at `add_to_cart` (`product_form`).
- Add a webhook in Improve pointing at `/api/webhooks/improve` with `IMPROVE_WEBHOOK_SECRET`: a change refreshes the pages' test setup at once instead of within minutes (it revalidates the root layout, so every page). The proxy keeps assigning from the datafile it fetched up to 30 seconds earlier.

## Checks

```
npm run lint
npm run typecheck
npm run build
```

## License

MIT, from the Vercel Shop template.
