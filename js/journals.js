class JournalManager {
  constructor(storage, accountManager) {
    this.storage = storage;
    this.accountManager = accountManager;
    this.journals = this.storage.getJournals();
  }

  getAll() {
    return [...this.journals].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  }

  addJournal({ date, description, reference, debitAccountId, creditAccountId, amount }) {
    const id = this.storage.getNextJournalId();
    const journal = {
      id,
      date,
      description,
      reference: reference || "",
      debit: [{ account: debitAccountId, amount: Number(amount) }],
      credit: [{ account: creditAccountId, amount: Number(amount) }]
    };
    this.journals.push(journal);
    this.storage.saveJournals(this.journals);
    return journal;
  }
}

window.journalManager = new JournalManager(window.storageService, window.accountManager);

