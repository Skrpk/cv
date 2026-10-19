import { createClient, type RedisClientType } from "redis";
import type { Board } from "./types";

// Small operational config and (later) agent state — never Applications
// themselves. Notion is the source of truth for those.
// See docs/adr/0001-notion-as-source-of-truth.md.
//
// Uses a standard Redis connection string (REDIS_URL), which every Vercel
// Marketplace Redis integration injects. The connected client is cached across
// warm invocations.

let clientPromise: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType> {
  if (!clientPromise) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("Missing REDIS_URL");
    const client: RedisClientType = createClient({ url });
    // Prevent a transient socket error from crashing the function.
    client.on("error", () => {});
    clientPromise = client.connect();
  }
  try {
    return await clientPromise;
  } catch (err) {
    clientPromise = null; // let the next call retry a fresh connection
    throw err;
  }
}

const BOARD_KEY = "notion:board";

export async function getBoard(): Promise<Board | null> {
  const client = await getClient();
  const raw = await client.get(BOARD_KEY);
  return raw ? (JSON.parse(raw) as Board) : null;
}

export async function setBoard(board: Board): Promise<void> {
  const client = await getClient();
  await client.set(BOARD_KEY, JSON.stringify(board));
}
