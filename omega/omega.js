// Omega dashboard logic

const cfg = window.DYNASTY_CONFIG || {};
const STORAGE_KEY = "omega_auth";

function isAuthenticated() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

if (!isAuthenticated()) {
  window.location.href = "login.html";
}

// Set portal title from config
const titleEl = document.getElementById('omegaTitle');
if (titleEl && cfg.omegaPortalTitle) {
  titleEl.textContent = cfg.omegaPortalTitle;
  document.title = cfg.omegaPortalTitle;
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "login.html";
  });
}

const coinData = document.getElementById('coinData');
const escrowData = document.getElementById('escrowData');
const escrowNote = document.getElementById('escrowNote');
const apiStatus = document.getElementById('apiStatus');
const pingApiBtn = document.getElementById('pingApiBtn');
const bailStatus = document.getElementById('bailStatus');
const bailList = document.getElementById('bailList');

// Coin & escrow display
if (coinData) {
  if (cfg.sovereignCoinAddress) {
    coinData.innerHTML = `Sovereign Coin: <a href="https://bscscan.com/token/${cfg.sovereignCoinAddress}" target="_blank">${cfg.sovereignCoinAddress}</a>`;
  } else {
    coinData.textContent = "Sovereign Coin address not set in config.js.";
  }
}

if (escrowData) {
  if (cfg.escrowContractAddress) {
    escrowData.textContent = `Escrow Contract: ${cfg.escrowContractAddress}`;
  } else {
    escrowData.textContent = "Escrow contract address not set in config.js.";
  }
}

if (escrowNote && cfg.bailEscrowNote) {
  escrowNote.textContent = cfg.bailEscrowNote;
}

// Logistics API ping
if (pingApiBtn && apiStatus) {
  apiStatus.textContent = cfg.logisticsApiBaseUrl ? "Click button to ping API." : "Logistics API base URL not set in config.js.";

  pingApiBtn.addEventListener('click', async () => {
    if (!cfg.logisticsApiBaseUrl) {
      apiStatus.textContent = "Logistics API base URL not set in config.js.";
      return;
    }
    apiStatus.textContent = "Pinging API…";
    try {
      const res = await fetch(cfg.logisticsApiBaseUrl + "/health");
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        apiStatus.textContent = "API OK: " + (data.status || "healthy");
      } else {
        apiStatus.textContent = "API error: " + res.status;
      }
    } catch (e) {
      apiStatus.textContent = "API unreachable.";
      console.error(e);
    }
  });
}

// Bail cases panel
async function loadBailCases() {
  if (!cfg.logisticsApiBaseUrl) {
    if (bailStatus) bailStatus.textContent = "Logistics API base URL not set in config.js.";
    return;
  }
  if (bailStatus) bailStatus.textContent = "Loading bail cases…";
  try {
    const res = await fetch(cfg.logisticsApiBaseUrl + "/bail/cases");
    if (!res.ok) {
      if (bailStatus) bailStatus.textContent = "Error loading bail cases: " + res.status;
      return;
    }
    const cases = await res.json();
    if (bailList) bailList.innerHTML = '';
    if (!Array.isArray(cases) || cases.length === 0) {
      if (bailStatus) bailStatus.textContent = "No bail cases yet.";
      return;
    }
    cases.forEach(c => {
      const div = document.createElement('div');
      div.className = 'omega-bail-card';
      div.innerHTML = `
        <p><strong>ID:</strong> ${c.id}</p>
        <p><strong>Defendant:</strong> ${c.defendantName}</p>
        <p><strong>Case #:</strong> ${c.caseNumber}</p>
        <p><strong>Facility:</strong> ${c.facility}</p>
        <p><strong>Bail Amount:</strong> ${c.bailAmount}</p>
        <p><strong>Status:</strong> <span class="bail-status-badge bail-${c.status}">${c.status}</span></p>
        <label>
          Update Status
          <select data-id="${c.id}" class="bail-status-select">
            <option value="">Select…</option>
            <option value="intake">Intake</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="posted">Posted</option>
            <option value="forfeited">Forfeited</option>
            <option value="released">Released</option>
          </select>
        </label>
      `;
      if (bailList) bailList.appendChild(div);
    });
    if (bailStatus) bailStatus.textContent = "";

    document.querySelectorAll('.bail-status-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-id');
        const status = sel.value;
        if (status) updateBailStatus(id, status);
      });
    });
  } catch (e) {
    console.error(e);
    if (bailStatus) bailStatus.textContent = "Failed to load bail cases.";
  }
}

async function updateBailStatus(id, status) {
  if (!cfg.logisticsApiBaseUrl) return;
  try {
    const res = await fetch(cfg.logisticsApiBaseUrl + "/bail/" + id + "/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      alert("Bail status updated.");
      loadBailCases();
    } else {
      alert("Failed to update bail status: " + res.status);
    }
  } catch (e) {
    console.error(e);
    alert("Error updating bail status.");
  }
}

loadBailCases();
