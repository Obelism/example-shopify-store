import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

const CONTENT_URL = "https://content.obelism.studio";
const VERCEL_API = "https://api.vercel.com";
const PHOTO_STUDIO = {
  organizationId: "org_119466XMRVU92QPQA1TN4UXR1K",
  spaceId: "space_BLD3ZBUFV68KCZCSTZ961WA1NE",
};
const DEMO_MARKER = "PHOTO_STUDIO_DEMO_BASE_SPACE";
const DEMO_PROJECT = /^photo-studio-[a-z0-9-]{1,80}$/;
const DEMO_TEAM_ID = "team_a7UrMX0EA3ZCCFVBxGVkkz0z";
const ORGANIZATION_ID = /^org_[A-Z0-9]+$/;
const SHOPIFY_KEYS = [
  "NEXT_PUBLIC_SHOPIFY_SHOP_ID",
  "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
  "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN",
];
const VERCEL_CLI = "vercel@66.6.0";
const USAGE = [
  "Usage:",
  "  node --env-file=.env.local scripts/demo.mts create --organization <org_…> --name <prospect> [--space-name <name>] [--ref <git ref>]",
  "  node --env-file=.env.local scripts/demo.mts remove --organization <org_…> --project <photo-studio-…>",
].join("\n");

const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: "string" },
    organization: { type: "string" },
    project: { type: "string" },
    ref: { default: "origin/main", type: "string" },
    "space-name": { default: "Photo Studio", type: "string" },
  },
});

const teamId = process.env.VERCEL_DEMO_TEAM_ID ?? DEMO_TEAM_ID;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} in .env.local. See .env.example.`);
  return value;
}

function requireArg(value: string | undefined, flag: string) {
  if (!value) throw new Error(`Missing --${flag}.\n${USAGE}`);
  return value;
}

function requireOrganization() {
  const organizationId = requireArg(args.organization, "organization");
  if (!ORGANIZATION_ID.test(organizationId))
    throw new Error(`${organizationId} isn't an organization id`);
  if (organizationId === PHOTO_STUDIO.organizationId) {
    throw new Error("Demos go in the prospect's organization, not Photo Studio's");
  }
  return organizationId;
}

async function vercel<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = new URL(path, VERCEL_API);
  url.searchParams.set("teamId", teamId);
  const response = await fetch(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${requireEnv("VERCEL_TOKEN")}`,
      "Content-Type": "application/json",
    },
    method,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Vercel ${method} ${url.pathname}: ${response.status} ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

async function obelism<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(new URL(path, CONTENT_URL), {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${requireEnv("OBELISM_AGENT_TOKEN")}`,
      "Content-Type": "application/json",
    },
    method,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Obelism ${method} ${path}: ${response.status} ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replaceAll(/\p{M}/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function run(
  command: string,
  commandArgs: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
) {
  const result = spawnSync(command, commandArgs, { stdio: "inherit", ...options });
  if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(" ")} failed`);
}

function commitOf(ref: string) {
  const result = spawnSync(
    "git",
    ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`],
    {
      encoding: "utf8",
    },
  );
  if (result.status !== 0) throw new Error(`${ref} isn't a commit`);
  return result.stdout.trim();
}

function deploy(projectId: string, ref: string) {
  run("git", ["fetch", "--quiet", "origin"]);
  const commit = commitOf(ref);
  const workdir = mkdtempSync(join(tmpdir(), "photo-studio-demo-"));
  const source = join(workdir, "source");
  try {
    mkdirSync(source);
    run("git", ["archive", "--format=tar", `--output=${join(workdir, "source.tar")}`, commit]);
    run("tar", ["-xf", join(workdir, "source.tar"), "-C", source]);
    run("npx", ["--yes", VERCEL_CLI, "deploy", "--prod", "--yes"], {
      cwd: source,
      env: {
        HOME: process.env.HOME,
        PATH: process.env.PATH,
        VERCEL_ORG_ID: teamId,
        VERCEL_PROJECT_ID: projectId,
        VERCEL_TOKEN: requireEnv("VERCEL_TOKEN"),
      },
    });
  } finally {
    rmSync(workdir, { force: true, recursive: true });
  }
}

interface SpaceCopy {
  deliveryToken: string;
  entries: number;
  files: number;
  space: { name: string; slug: string; spaceId: string };
  webhookSecret: null | string;
}

async function create() {
  const organizationId = requireOrganization();
  const name = requireArg(args.name, "name");

  const projectName = `photo-studio-${slugify(name)}`;
  if (!DEMO_PROJECT.test(projectName))
    throw new Error(`"${name}" makes no project name: use letters or digits`);
  commitOf(args.ref);
  const shopify = SHOPIFY_KEYS.map((key) => ({ key, value: requireEnv(key) }));
  requireEnv("OBELISM_AGENT_TOKEN");
  const siteUrl = `https://${projectName}.vercel.app`;
  const project = await vercel<{ id: string }>("POST", "/v11/projects", {
    framework: "nextjs",
    name: projectName,
  });
  console.log(`Created the Vercel project ${projectName}`);

  let copy: SpaceCopy | undefined;
  try {
    await vercel("PATCH", `/v9/projects/${project.id}`, {
      nodeVersion: "26.x",
      ssoProtection: null,
    });
    await vercel("POST", `/v10/projects/${project.id}/domains`, {
      name: `${projectName}.vercel.app`,
    });

    copy = await obelism<SpaceCopy>(
      "POST",
      `/api/agent/organizations/${organizationId}/spaces/copies`,
      {
        baseOrganizationId: PHOTO_STUDIO.organizationId,
        baseSpaceId: PHOTO_STUDIO.spaceId,
        name: args["space-name"],
        previewUrl: siteUrl,
        webhookUrl: `${siteUrl}/api/webhooks/content`,
      },
    );
    console.log(
      `Copied Photo Studio into ${copy.space.name} (${copy.space.spaceId}): ${copy.entries} entries, ${copy.files} files`,
    );

    const target = ["production", "preview"];
    await vercel("POST", `/v10/projects/${project.id}/env?upsert=true`, [
      ...shopify.map(({ key, value }) => ({ key, target, type: "encrypted", value })),
      { key: "CONTENT_ENVIRONMENT", target, type: "encrypted", value: "production" },
      { key: DEMO_MARKER, target, type: "encrypted", value: PHOTO_STUDIO.spaceId },
      { key: "CONTENT_SPACE_ID", target, type: "encrypted", value: copy.space.spaceId },
      { key: "CONTENT_DELIVERY_TOKEN", target, type: "sensitive", value: copy.deliveryToken },
      ...(copy.webhookSecret
        ? [{ key: "CONTENT_WEBHOOK_SECRET", target, type: "sensitive", value: copy.webhookSecret }]
        : []),
    ]);

    deploy(project.id, args.ref);
    console.log(`\nThe demo is live at ${siteUrl}, with its content in ${copy.space.name}.`);
  } catch (error) {
    if (copy) {
      const { slug, spaceId } = copy.space;
      console.error(`Deleting the space ${spaceId} again`);
      await obelism(
        "DELETE",
        `/api/agent/organizations/${organizationId}/spaces/${spaceId}?confirm=${encodeURIComponent(slug)}`,
      ).catch((cleanup: unknown) => console.error(`Delete ${spaceId} by hand:`, cleanup));
    }
    console.error(`Deleting the Vercel project ${projectName} again`);
    await vercel("DELETE", `/v9/projects/${project.id}`).catch((cleanup: unknown) =>
      console.error(`Delete the Vercel project ${project.id} by hand:`, cleanup),
    );
    throw error;
  }
}

async function remove() {
  const organizationId = requireOrganization();
  const projectName = requireArg(args.project, "project");
  if (!DEMO_PROJECT.test(projectName)) {
    throw new Error(`${projectName} isn't a demo: their projects are called photo-studio-…`);
  }

  const { envs } = await vercel<{ envs: Array<{ id: string; key: string }> }>(
    "GET",
    `/v10/projects/${projectName}/env`,
  );
  const spaceEnv = envs.find(({ key }) => key === "CONTENT_SPACE_ID");
  if (!spaceEnv || !envs.some(({ key }) => key === DEMO_MARKER)) {
    throw new Error(`${projectName} wasn't made by this script, so it stays`);
  }
  const { value: spaceId } = await vercel<{ value: string }>(
    "GET",
    `/v1/projects/${projectName}/env/${spaceEnv.id}`,
  );
  const { spaces } = await obelism<{ spaces: Array<{ slug: string; spaceId: string }> }>(
    "GET",
    `/api/agent/organizations/${organizationId}/spaces`,
  );
  const space = spaces.find((candidate) => candidate.spaceId === spaceId);
  if (!space) throw new Error(`${spaceId} isn't a space of ${organizationId}`);
  if (space.spaceId === PHOTO_STUDIO.spaceId) throw new Error("That is Photo Studio itself");

  await obelism(
    "DELETE",
    `/api/agent/organizations/${organizationId}/spaces/${space.spaceId}?confirm=${encodeURIComponent(space.slug)}`,
  );
  console.log(`Deleted ${space.spaceId}; it can be restored for 30 days`);
  await vercel("DELETE", `/v9/projects/${projectName}`);
  console.log(`Deleted the Vercel project ${projectName}`);
}

const command = positionals[0];
if (command === "create") await create();
else if (command === "remove") await remove();
else {
  console.error(USAGE);
  process.exit(1);
}
