import { Redis } from "@upstash/redis";
import type { Board } from "./types";

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

const BOARD_KEY = "notion:board";

export async function getBoard(): Promise<Board | null> {
  return (await redis().get<Board>(BOARD_KEY)) ?? null;
}

export async function setBoard(board: Board): Promise<void> {
  await redis().set(BOARD_KEY, board);
}
