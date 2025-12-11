class AccountManager {
  constructor(storage) {
    this.storage = storage;
    this.accounts = [];
    this._initPromise = this._init();
  }

  async _init() {
    this.accounts = (await this.storage.getAccounts()) || [];
    if (!this.accounts || this.accounts.length === 0) {
      await this._seedDefaultAccounts();
    }
  }

  async _seedDefaultAccounts() {
    const defaults = [
      { id: "101", name: "Kas", type: "Aset", normalBalance: "Debit" },
      { id: "102", name: "Bank", type: "Aset", normalBalance: "Debit" },
      { id: "201", name: "Hutang Usaha", type: "Kewajiban", normalBalance: "Kredit" },
      { id: "301", name: "Modal Pemilik", type: "Modal", normalBalance: "Kredit" },
      { id: "401", name: "Pendapatan Penjualan", type: "Pendapatan", normalBalance: "Kredit" },
      { id: "501", name: "Beban Gaji", type: "Beban", normalBalance: "Debit" },
      { id: "502", name: "Beban Sewa", type: "Beban", normalBalance: "Debit" }
    ];

    if (typeof this.storage.createAccount === "function") {
      for (const acc of defaults) {
        await this.storage.createAccount(acc);
      }
      this.accounts = (await this.storage.getAccounts()) || defaults;
      return;
    }

    this.accounts = defaults;
    await this.storage.saveAccounts(this.accounts);
  }

  ready() {
    return this._initPromise;
  }

  getAll() {
    return [...this.accounts];
  }

  getById(id) {
    return this.accounts.find(a => a.id === id) || null;
  }

  async addAccount(account) {
    const existing = this.getById(account.id);
    if (existing) {
      throw new Error("Kode akun sudah digunakan.");
    }
    if (typeof this.storage.createAccount === "function") {
      const created = await this.storage.createAccount(account);
      this.accounts.push(created);
      return created;
    }
    this.accounts.push(account);
    await this.storage.saveAccounts(this.accounts);
    return account;
  }

  async updateAccount(id, updates) {
    const index = this.accounts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error("Akun tidak ditemukan.");
    }
    const current = this.accounts[index];
    const next = { ...current, ...updates, id: current.id };
    if (typeof this.storage.updateAccount === "function") {
      const updated = await this.storage.updateAccount(id, updates);
      this.accounts[index] = { ...updated };
      return this.accounts[index];
    }
    this.accounts[index] = next;
    await this.storage.saveAccounts(this.accounts);
    return next;
  }
}

window.accountManager = new AccountManager(window.storageAdapter);
