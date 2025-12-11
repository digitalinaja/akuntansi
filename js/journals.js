class JournalManager {
  constructor(storage, accountManager) {
    this.storage = storage;
    this.accountManager = accountManager;
    this.journals = [];
    this._initPromise = this._init();
  }

  async _init() {
    this.journals = (await this.storage.getJournals()) || [];
  }

  ready() {
    return this._initPromise;
  }

  getAll() {
    return [...this.journals].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  }

  async addJournal({ date, description, reference, debitAccountId, creditAccountId, amount }) {
    const baseJournal = {
      date,
      description,
      reference: reference || "",
      debit: [{ account: debitAccountId, amount: Number(amount) }],
      credit: [{ account: creditAccountId, amount: Number(amount) }]
    };

    let created = null;
    if (typeof this.storage.createJournal === "function") {
      created = await this.storage.createJournal(baseJournal);
    } else {
      const id = await this.storage.getNextJournalId();
      created = { ...baseJournal, id };
      this.journals.push(created);
      await this.storage.saveJournals(this.journals);
      return created;
    }
    this.journals.push(created);
    return created;
  }
}

window.journalManager = new JournalManager(window.storageAdapter, window.accountManager);
