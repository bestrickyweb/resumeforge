chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SAVE_JOB") {
    chrome.storage.local.set({ lastJobData: msg.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (msg.type === "GET_JOB_DATA") {
    chrome.storage.local.get("lastJobData", (result) => {
      sendResponse({ data: result.lastJobData || null });
    });
    return true;
  }

  if (msg.type === "CLEAR_JOB_DATA") {
    chrome.storage.local.remove("lastJobData", () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear();
});
