import { Client } from "@notionhq/client";
import { STAGES } from "./types";
import type { Analysis, ApplyResult } from "./types";

export function notionClient(): Client {
  return new Client({ auth: process.env.NOTION_TOKEN });
}

/** The Status options the Board is created with, in order. */
export const BOARD_STAGES = STAGES;

// --- Phase 3 ------------------------------------------------------------
// createBoard(parentPageId): create the kanban database with a Status
//   property holding BOARD_STAGES, return its id.
// findApplicationByUrl(databaseId, url): query the Board for an existing card.
// upsertApplication(databaseId, url, analysis): create or update a card.
// ------------------------------------------------------------------------

export async function createBoard(_parentPageId: string): Promise<string> {
  throw new Error("createBoard not implemented yet (Phase 3)");
}

export async function upsertApplication(
  _databaseId: string,
  _url: string,
  _analysis: Analysis,
): Promise<ApplyResult> {
  throw new Error("upsertApplication not implemented yet (Phase 3)");
}
