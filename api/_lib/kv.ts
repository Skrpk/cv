import { Redis } from "@upstash/redis";

// Small operational config and (later) agent state — never Applications
// themselves. Notion is the source of truth for those.
// See docs/adr/0001-notion-as-source-of-truth.md.
//
// Backed by Upstash Redis (the Vercel Marketplace "Redis" integration).
// Vercel injects KV_REST_API_URL / KV_REST_API_TOKEN; Upstash's own naming is
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Accept either.

let client: Redis | null = null;

function redis(): Redis {
  if (client) return client;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Redis is not configured (missing KV_REST_API_URL/TOKEN)");
  }
  client = new Redis({ url, token });
  return client;
}

const NOTION_DB_KEY = "notion:databaseId";

export async function getNotionDatabaseId(): Promise<string | null> {
  return (await redis().get<string>(NOTION_DB_KEY)) ?? null;
}

export async function setNotionDatabaseId(id: string): Promise<void> {
  await redis().set(NOTION_DB_KEY, id);
}
