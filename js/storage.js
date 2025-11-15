class StorageService {
  constructor(key = "accounting-app") {
    this.key = key;
  }

  _getRaw() {
    const raw = window.localStorage.getItem(this.key);
    if (!raw) {
      const initial = {
        accounts: [],
        journals: [],
        lastJournalId: 0
      };
      window.localStorage.setItem(this.key, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      const fallback = {
        accounts: [],
        journals: [],
        lastJournalId: 0
      };
      window.localStorage.setItem(this.key, JSON.stringify(fallback));
      return fallback;
    }
  }

  _saveRaw(data) {
    window.localStorage.setItem(this.key, JSON.stringify(data));
  }

  getAccounts() {
    return this._getRaw().accounts;
  }

  saveAccounts(accounts) {
    const data = this._getRaw();
    data.accounts = accounts;
    this._saveRaw(data);
  }

  getJournals() {
    return this._getRaw().journals;
  }

  saveJournals(journals) {
    const data = this._getRaw();
    data.journals = journals;
    this._saveRaw(data);
  }

  getNextJournalId() {
    const data = this._getRaw();
    data.lastJournalId = (data.lastJournalId || 0) + 1;
    this._saveRaw(data);
    return data.lastJournalId;
  }

  exportData() {
    return this._getRaw();
  }

  importData(jsonData) {
    const base = {
      accounts: [],
      journals: [],
      lastJournalId: 0
    };
    const data = Object.assign(base, jsonData);
    this._saveRaw(data);
  }
}

window.storageService = new StorageService();

