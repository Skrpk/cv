// Classic service worker (no imports). Opens the side panel when the toolbar
// icon is clicked, which also grants activeTab for the current tab.
function enableActionOpensPanel() {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch(() => {});
  }
}

chrome.runtime.onInstalled.addListener(enableActionOpensPanel);
enableActionOpensPanel();
