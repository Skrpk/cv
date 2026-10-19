export interface Settings {
  backendUrl: string;
  secret: string;
}

const EMPTY: Settings = { backendUrl: "", secret: "" };

export async function getSettings(): Promise<Settings> {
  const r = await chrome.storage.local.get(["backendUrl", "secret"]);
  return {
    backendUrl: typeof r.backendUrl === "string" ? r.backendUrl : EMPTY.backendUrl,
    secret: typeof r.secret === "string" ? r.secret : EMPTY.secret,
  };
}

export async function setSettings(s: Settings): Promise<void> {
  await chrome.storage.local.set(s);
}

export function isConfigured(s: Settings): boolean {
  return Boolean(s.backendUrl && s.secret);
}
