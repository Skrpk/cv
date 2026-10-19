import { getSettings, isConfigured } from "./storage";
import type {
  Analysis,
  AnalyzeRequest,
  ApplyResult,
  CoverResult,
  SetupResult,
} from "./types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const settings = await getSettings();
  if (!isConfigured(settings)) {
    throw new Error("Set the backend URL and secret in the extension options first.");
  }
  const base = settings.backendUrl.replace(/\/+$/, "");
  const res = await fetch(base + path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-app-secret": settings.secret,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j?.error) message = j.error;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export function analyze(input: AnalyzeRequest): Promise<Analysis> {
  return post<Analysis>("/api/analyze", input);
}

export function apply(input: { url: string; analysis: Analysis }): Promise<ApplyResult> {
  return post<ApplyResult>("/api/apply", input);
}

export function cover(input: AnalyzeRequest): Promise<CoverResult> {
  return post<CoverResult>("/api/cover", input);
}

export function setup(parentPageId: string): Promise<SetupResult> {
  return post<SetupResult>("/api/setup", { parentPageId });
}
