import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client";
import { STAGES } from "./types";
import type { Analysis, ApplyResult, Board } from "./types";

// Uses the data-sources model (Notion API version 2025-09-03): a database owns
// a data source; pages are created under, and queried from, the data source.

function notionClient(): Client {
  const auth = process.env.NOTION_TOKEN;
  if (!auth) throw new Error("Missing NOTION_TOKEN");
  return new Client({ auth, notionVersion: "2025-09-03" });
}

/** The Status options the Board is created with, in order. */
export const BOARD_STAGES = STAGES;

type PageProperties = NonNullable<CreatePageParameters["properties"]>;

/** Pulls the primary data source id out of a created/retrieved database. */
function dataSourceIdOf(db: unknown): string | null {
  const sources = (db as { data_sources?: Array<{ id: string }> }).data_sources;
  return sources && sources[0] ? sources[0].id : null;
}

/** Creates the Board (database + data source) under a parent page. */
export async function createBoard(parentPageId: string): Promise<Board> {
  const notion = notionClient();
  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: "Job Applications" } }],
    initial_data_source: {
      properties: {
        Role: { title: {} },
        Company: { rich_text: {} },
        URL: { url: {} },
        "Match score": { number: { format: "number" } },
        Applied: { date: {} },
        Status: { status: { options: STAGES.map((name) => ({ name })) } },
      },
    },
  });

  let dataSourceId = dataSourceIdOf(db);
  if (!dataSourceId) {
    const full = await notion.databases.retrieve({ database_id: db.id });
    dataSourceId = dataSourceIdOf(full);
  }
  if (!dataSourceId) {
    throw new Error("Created database but could not resolve its data source id");
  }

  return {
    databaseId: db.id,
    dataSourceId,
    url: (db as { url?: string }).url ?? "",
  };
}

function pageUrlOf(page: unknown): string {
  return (page as { url?: string }).url ?? "";
}

/** Properties shared by create and update (never includes Status/Applied). */
export function applicationProperties(
  url: string,
  analysis: Analysis,
): PageProperties {
  return {
    Role: {
      title: [{ type: "text", text: { content: analysis.role ?? "Untitled role" } }],
    },
    Company: {
      rich_text: analysis.company
        ? [{ type: "text", text: { content: analysis.company } }]
        : [],
    },
    URL: { url },
    "Match score": { number: analysis.matchScore },
  };
}

/** The page body (summary + strengths + gaps) as Notion-flavored Markdown. */
export function buildApplicationMarkdown(analysis: Analysis): string {
  const lines: string[] = [];
  if (analysis.summary) lines.push(analysis.summary, "");
  if (analysis.strengths.length) {
    lines.push("## Strengths", ...analysis.strengths.map((s) => `- ${s}`), "");
  }
  if (analysis.gaps.length) {
    lines.push("## Gaps", ...analysis.gaps.map((g) => `- ${g}`), "");
  }
  if (analysis.tips.length) {
    lines.push("## Tailoring tips", ...analysis.tips.map((t) => `- ${t}`));
  }
  return lines.join("\n").trim();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function findPageIdByUrl(
  notion: Client,
  dataSourceId: string,
  url: string,
): Promise<string | null> {
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property: "URL", url: { equals: url } },
    page_size: 1,
  });
  const first = res.results[0];
  return first ? first.id : null;
}

/**
 * Records an Application on the Board, deduped by URL. An existing card is
 * updated (Role/Company/Match score only — Stage and Applied date are left as
 * the human set them); a new card is created at Stage "Applied" with a body.
 */
export async function upsertApplication(
  dataSourceId: string,
  url: string,
  analysis: Analysis,
): Promise<ApplyResult> {
  const notion = notionClient();
  const props = applicationProperties(url, analysis);

  const existingId = await findPageIdByUrl(notion, dataSourceId, url);
  if (existingId) {
    const page = await notion.pages.update({
      page_id: existingId,
      properties: props,
    });
    return { action: "updated", pageId: page.id, pageUrl: pageUrlOf(page) };
  }

  const page = await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties: {
      ...props,
      Applied: { date: { start: today() } },
      Status: { status: { name: "Applied" } },
    },
    markdown: buildApplicationMarkdown(analysis),
  });
  return { action: "created", pageId: page.id, pageUrl: pageUrlOf(page) };
}
