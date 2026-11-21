import { parseArgs } from "node:util";

import { catalog, type Print, printHandle, selectPrints, type Series } from "./catalog/index.mts";

const API_VERSION = "2026-10";

const { values: args } = parseArgs({
  options: { dry: { type: "boolean" }, only: { multiple: true, type: "string" } },
});

const domain = requireEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
const publicationName = requireEnv("SHOPIFY_HEADLESS_PUBLICATION");
function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} in .env.local. See .env.example.`);
  return value;
}

async function getAccessToken() {
  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    body: new URLSearchParams({
      client_id: requireEnv("SHOPIFY_ADMIN_CLIENT_ID"),
      client_secret: requireEnv("SHOPIFY_ADMIN_CLIENT_SECRET"),
      grant_type: "client_credentials",
    }),
    method: "POST",
  });
  if (!response.ok) throw new Error(`Admin token request failed: ${response.status}`);
  const { access_token } = (await response.json()) as { access_token: string };
  return access_token;
}

const token = args.dry ? "" : await getAccessToken();

async function admin<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    body: JSON.stringify({ query, variables }),
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    method: "POST",
  });
  const body = (await response.json()) as { data?: T; errors?: unknown };
  if (!response.ok || body.errors || !body.data) {
    throw new Error(`Admin API ${response.status}: ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.data;
}

function assertNoUserErrors(
  operation: string,
  userErrors: { field?: string[]; message: string }[],
) {
  if (userErrors.length) throw new Error(`${operation}: ${JSON.stringify(userErrors)}`);
}

const PUBLICATIONS_QUERY = `#graphql
  query Publications {
    publications(first: 50) {
      nodes {
        id
        name
      }
    }
  }
`;

const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle($handle: String!) {
    collectionByIdentifier(identifier: { handle: $handle }) {
      id
    }
  }
`;

const COLLECTION_CREATE_MUTATION = `#graphql
  mutation CollectionCreate($collection: CollectionCreateInput!) {
    collectionCreate(collection: $collection) {
      collection {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const COLLECTION_UPDATE_MUTATION = `#graphql
  mutation CollectionUpdate($collection: CollectionUpdateInput!) {
    collectionUpdate(collection: $collection) {
      collection {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_SET_MUTATION = `#graphql
  mutation ProductSet($identifier: ProductSetIdentifiers, $input: ProductSetInput!) {
    productSet(identifier: $identifier, input: $input, synchronous: true) {
      product {
        id
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PUBLISH_MUTATION = `#graphql
  mutation Publish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`;

async function upsertCollection(series: Series) {
  const fields = {
    descriptionHtml: `<p>${series.description}</p>`,
    handle: series.handle,
    title: series.title,
  };
  const { collectionByIdentifier } = await admin<{ collectionByIdentifier: { id: string } | null }>(
    COLLECTION_BY_HANDLE_QUERY,
    { handle: series.handle },
  );
  if (collectionByIdentifier) {
    const { collectionUpdate } = await admin<{
      collectionUpdate: { userErrors: { message: string }[] };
    }>(COLLECTION_UPDATE_MUTATION, { collection: { ...fields, id: collectionByIdentifier.id } });
    assertNoUserErrors(`collectionUpdate ${series.handle}`, collectionUpdate.userErrors);
    return collectionByIdentifier.id;
  }
  const { collectionCreate } = await admin<{
    collectionCreate: { collection: { id: string } | null; userErrors: { message: string }[] };
  }>(COLLECTION_CREATE_MUTATION, { collection: fields });
  assertNoUserErrors(`collectionCreate ${series.handle}`, collectionCreate.userErrors);
  return collectionCreate.collection!.id;
}

function productInput(print: Print, series: Series, collectionId: string) {
  const { frame, paper, size } = catalog.variants;
  return {
    collections: [collectionId],
    descriptionHtml: `<p>${print.title}, from the series ${series.title} by ${catalog.photographer}. ${series.description}</p><p>Archival pigment print, signed on the back.</p>`,
    handle: printHandle(print),
    productOptions: [
      { name: "Size", values: size.map(({ name }) => ({ name })) },
      { name: "Paper", values: paper.map(({ name }) => ({ name })) },
      { name: "Frame", values: frame.map(({ name }) => ({ name })) },
    ],
    productType: "Print",
    status: "ACTIVE",
    tags: [series.handle],
    title: print.title,
    variants: size.flatMap((s) =>
      paper.flatMap((p) =>
        frame.map((f) => ({
          inventoryItem: { tracked: false },
          inventoryPolicy: "CONTINUE",
          optionValues: [
            { name: s.name, optionName: "Size" },
            { name: p.name, optionName: "Paper" },
            { name: f.name, optionName: "Frame" },
          ],
          price: (s.price + p.surcharge[s.key] + f.surcharge[s.key]).toFixed(2),
        })),
      ),
    ),
    vendor: catalog.photographer,
  };
}

const prints = selectPrints(args.only);

if (args.dry) {
  for (const print of prints) console.log(`${printHandle(print)}\t${print.source}`);
  process.exit(0);
}

const { publications } = await admin<{ publications: { nodes: { id: string; name: string }[] } }>(
  PUBLICATIONS_QUERY,
);
const publication = publications.nodes.find(({ name }) => name === publicationName);
if (!publication) {
  throw new Error(
    `No publication named "${publicationName}". Found: ${publications.nodes.map(({ name }) => name).join(", ")}`,
  );
}

async function publish(id: string) {
  const { publishablePublish } = await admin<{
    publishablePublish: { userErrors: { message: string }[] };
  }>(PUBLISH_MUTATION, { id, input: [{ publicationId: publication!.id }] });
  assertNoUserErrors(`publishablePublish ${id}`, publishablePublish.userErrors);
}

const collections = new Map<string, string>();
for (const series of catalog.series.filter((s) => prints.some((p) => p.series === s.handle))) {
  const id = await upsertCollection(series);
  await publish(id);
  collections.set(series.handle, id);
  console.log(`collection ${series.handle}`);
}

for (const print of prints) {
  const series = catalog.series.find(({ handle }) => handle === print.series);
  if (!series) throw new Error(`Unknown series ${print.series} for ${print.title}`);
  const handle = printHandle(print);
  const { productSet } = await admin<{
    productSet: { product: { id: string } | null; userErrors: { message: string }[] };
  }>(PRODUCT_SET_MUTATION, {
    identifier: { handle },
    input: productInput(print, series, collections.get(series.handle)!),
  });
  assertNoUserErrors(`productSet ${handle}`, productSet.userErrors);
  await publish(productSet.product!.id);
  console.log(`product ${handle}`);
}
