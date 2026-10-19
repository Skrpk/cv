export interface PageCapture {
  url: string;
  title: string;
  pageText: string;
}

const HOST_ORIGINS = ["https://*/*", "http://*/*"];

/**
 * Ensures we can read page contents. activeTab alone is unreliable for a side
 * panel (the grant is tied to the icon click, not the later Analyze click), so
 * we request optional host access. Must be called directly from a user gesture
 * (the Analyze button) and before any other await, or Chrome ignores it.
 * Resolves immediately without a prompt once granted.
 */
export async function ensurePageAccess(): Promise<void> {
  const granted = await chrome.permissions.request({ origins: HOST_ORIGINS });
  if (!granted) {
    throw new Error(
      "Access to read pages was denied. Click Analyze again and choose Allow.",
    );
  }
}

/**
 * Reads the active tab's visible text. Uses chrome.scripting with the
 * activeTab grant (from the toolbar click that opened the panel) — no broad
 * host permissions, no content-script bundle.
 */
export async function captureActiveTab(): Promise<PageCapture> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab to read.");

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body?.innerText ?? "",
  });

  const pageText = typeof injection?.result === "string" ? injection.result : "";
  return {
    url: tab.url ?? "",
    title: tab.title ?? "",
    pageText,
  };
}
