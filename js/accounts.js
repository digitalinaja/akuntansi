class AccountManager {
  constructor(storage) {
    this.storage = storage;
    this.accounts = this.storage.getAccounts();
    if (!this.accounts || this.accounts.length === 0) {
      this._seedDefaultAccounts();
    }
  }

  _seedDefaultAccounts() {
    this.accounts = [
      { id: "101", name: "Kas", type: "Aset", normalBalance: "Debit" },
      { id: "102", name: "Bank", type: "Aset", normalBalance: "Debit" },
      { id: "201", name: "Hutang Usaha", type: "Kewajiban", normalBalance: "Kredit" },
      { id: "301", name: "Modal Pemilik", type: "Modal", normalBalance: "Kredit" },
      { id: "401", name: "Pendapatan Penjualan", type: "Pendapatan", normalBalance: "Kredit" },
      { id: "501", name: "Beban Gaji", type: "Beban", normalBalance: "Debit" },
      { id: "502", name: "Beban Sewa", type: "Beban", normalBalance: "Debit" }
    ];
    this.storage.saveAccounts(this.accounts);
  }

  getAll() {
    return [...this.accounts];
  }

  getById(id) {
    return this.accounts.find(a => a.id === id) || null;
  }

  addAccount(account) {
    const existing = this.getById(account.id);
    if (existing) {
      throw new Error("Kode akun sudah digunakan.");
    }
    this.accounts.push(account);
    this.storage.saveAccounts(this.accounts);
  }

  updateAccount(id, updates) {
    const index = this.accounts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error("Akun tidak ditemukan.");
    }
    const current = this.accounts[index];
    this.accounts[index] = {
      ...current,
      ...updates,
      id: current.id
    };
    this.storage.saveAccounts(this.accounts);
    return this.accounts[index];
  }
}

window.accountManager = new AccountManager(window.storageService);
