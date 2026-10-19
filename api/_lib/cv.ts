import fs from "node:fs";
import path from "node:path";

let cache: string | null = null;

/**
 * Loads the canonical CV (Markdown) that every Analysis reasons against.
 * Bundled with the analyze function via vercel.json `includeFiles`.
 */
export function loadCv(): string {
  if (cache !== null) return cache;
  cache = fs.readFileSync(
    path.join(process.cwd(), "Vitalii_Skrypka_CV.md"),
    "utf8",
  );
  return cache;
}
