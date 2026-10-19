export interface PageCapture {
  url: string;
  title: string;
  pageText: string;
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
