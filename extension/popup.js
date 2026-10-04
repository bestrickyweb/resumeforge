const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");
const openDashboard = document.getElementById("openDashboard");

const API_BASE = "http://localhost:3000";

async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: API_BASE, name: "better-auth.session_token" }, (cookie) => {
      resolve(cookie?.value || null);
    });
  });
}

function showStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = "status " + type;
}

async function saveJob() {
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";
  showStatus("");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab");

    const response = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB" });
    if (!response?.success) {
      throw new Error(response?.error || "Could not extract job data from this page");
    }

    const token = await getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Cookie"] = `better-auth.session_token=${token}`;

    const res = await fetch(`${API_BASE}/api/jobs/import`, {
      method: "POST",
      headers,
      body: JSON.stringify(response.data),
      credentials: "include",
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to save job");

    showStatus("Job saved successfully!", "success");
    saveBtn.textContent = "Saved!";
    openDashboard.href = `${API_BASE}/dashboard/applications`;
  } catch (err) {
    showStatus(err.message, "error");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save to Tailorvance";
  }
}

saveBtn.addEventListener("click", saveJob);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "JOB_EXTRACTED") {
    showStatus("Job detected on this page", "");
  }
});

