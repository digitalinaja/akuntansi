const DEFAULT_APP_CONFIG = {
  storage: {
    type: "api", // opsi: "local" (LocalStorage) atau "api" (REST backend)
    key: "accounting-app",
    apiBaseUrl: `${window.location.origin.replace(/\/$/, "")}/api`
  }
};

class LocalStorageAdapter {
  constructor(options = {}) {
    this.key = options.key || "accounting-app";
  }

  _getRaw() {
    const raw = window.localStorage.getItem(this.key);
    if (!raw) {
      const initial = { accounts: [], journals: [], lastJournalId: 0 };
      window.localStorage.setItem(this.key, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      const fallback = { accounts: [], journals: [], lastJournalId: 0 };
      window.localStorage.setItem(this.key, JSON.stringify(fallback));
      return fallback;
    }
  }

  _saveRaw(data) {
    window.localStorage.setItem(this.key, JSON.stringify(data));
  }

  async getAccounts() {
    return this._getRaw().accounts;
  }

  async saveAccounts(accounts) {
    const data = this._getRaw();
    data.accounts = accounts;
    this._saveRaw(data);
  }

  async createAccount(account) {
    const accounts = await this.getAccounts();
    if (accounts.find(a => a.id === account.id)) {
      throw new Error("Kode akun sudah digunakan.");
    }
    accounts.push(account);
    await this.saveAccounts(accounts);
    return account;
  }

  async updateAccount(id, updates) {
    const accounts = await this.getAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("Akun tidak ditemukan.");
    accounts[idx] = { ...accounts[idx], ...updates, id };
    await this.saveAccounts(accounts);
    return accounts[idx];
  }

  async getJournals() {
    return this._getRaw().journals;
  }

  async saveJournals(journals) {
    const data = this._getRaw();
    data.journals = journals;
    this._saveRaw(data);
  }

  async getNextJournalId() {
    const data = this._getRaw();
    data.lastJournalId = (data.lastJournalId || 0) + 1;
    this._saveRaw(data);
    return data.lastJournalId;
  }

  async createJournal(payload) {
    const id = payload.id || (await this.getNextJournalId());
    const journals = await this.getJournals();
    const journal = { ...payload, id };
    journals.push(journal);
    await this.saveJournals(journals);
    return journal;
  }

  async exportData() {
    return this._getRaw();
  }

  async importData(jsonData) {
    const base = { accounts: [], journals: [], lastJournalId: 0 };
    const data = Object.assign(base, jsonData);
    this._saveRaw(data);
  }

  supportsBackup() {
    return true;
  }
}

class ApiAdapter {
  constructor(options = {}) {
    this.baseUrl = options.apiBaseUrl || "/api";
  }

  async _request(path, options = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  }

  async getAccounts() {
    return this._request("/accounts");
  }

  async createAccount(account) {
    return this._request("/accounts", {
      method: "POST",
      body: JSON.stringify(account)
    });
  }

  async updateAccount(id, updates) {
    return this._request(`/accounts/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
  }

  async getJournals() {
    return this._request("/journals");
  }

  async createJournal(journal) {
    return this._request("/journals", {
      method: "POST",
      body: JSON.stringify(journal)
    });
  }

  async getNextJournalId() {
    const data = await this._request("/journals/next-id");
    return data.nextId;
  }

  async exportData() {
    return this._request("/export");
  }

  async importData(data) {
    return this._request("/import", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  supportsBackup() {
    return true;
  }
}

function resolveConfig() {
  const query = new URLSearchParams(window.location.search);
  const qsType = query.get("storage"); // ?storage=api atau ?storage=local
  const baseCfg = (window.appConfig && window.appConfig.storage) || DEFAULT_APP_CONFIG.storage;
  const merged = { ...DEFAULT_APP_CONFIG.storage, ...baseCfg };
  if (qsType === "api") merged.type = "api";
  if (qsType === "local") merged.type = "local";
  return { storage: merged };
}

function createStorageAdapter(config) {
  const cfg = config?.storage || DEFAULT_APP_CONFIG.storage;
  if (cfg.type === "api") {
    return new ApiAdapter(cfg);
  }
  return new LocalStorageAdapter(cfg);
}

window.appConfig = resolveConfig();
window.storageAdapter = createStorageAdapter(window.appConfig);
