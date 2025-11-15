class ReportService {
  constructor(accountManager, journalManager) {
    this.accountManager = accountManager;
    this.journalManager = journalManager;
  }

  _calculateBalances() {
    const accounts = this.accountManager.getAll();
    const journals = this.journalManager.getAll();
    const balances = {};

    accounts.forEach(acc => {
      balances[acc.id] = { account: acc, debit: 0, credit: 0 };
    });

    journals.forEach(j => {
      j.debit.forEach(d => {
        if (!balances[d.account]) return;
        balances[d.account].debit += d.amount;
      });
      j.credit.forEach(c => {
        if (!balances[c.account]) return;
        balances[c.account].credit += c.amount;
      });
    });

    return balances;
  }

  getTrialBalance() {
    const balances = this._calculateBalances();
    const rows = Object.values(balances).map(b => {
      const account = b.account;
      const normal = account.normalBalance;
      const net = b.debit - b.credit;
      const debit = net > 0 ? net : 0;
      const credit = net < 0 ? -net : 0;
      return {
        id: account.id,
        name: account.name,
        debit,
        credit
      };
    });

    const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);

    return { rows, totalDebit, totalCredit };
  }

  getBukuBesar() {
    const accounts = this.accountManager.getAll();
    const journals = this.journalManager.getAll();
    const ledger = {};

    accounts.forEach(acc => {
      ledger[acc.id] = {
        account: acc,
        entries: [],
        totalDebit: 0,
        totalCredit: 0
      };
    });

    journals.forEach(j => {
      j.debit.forEach(d => {
        const l = ledger[d.account];
        if (!l) return;
        l.entries.push({
          date: j.date,
          reference: j.reference,
          description: j.description,
          debit: d.amount,
          credit: 0
        });
        l.totalDebit += d.amount;
      });
      j.credit.forEach(c => {
        const l = ledger[c.account];
        if (!l) return;
        l.entries.push({
          date: c.date || j.date,
          reference: j.reference,
          description: j.description,
          debit: 0,
          credit: c.amount
        });
        l.totalCredit += c.amount;
      });
    });

    return Object.values(ledger);
  }

  getLabaRugi() {
    const balances = this._calculateBalances();
    const pendapatan = [];
    const beban = [];

    Object.values(balances).forEach(b => {
      const { account, debit, credit } = b;
      if (account.type === "Pendapatan") {
        const net = credit - debit;
        pendapatan.push({ account, amount: net });
      } else if (account.type === "Beban") {
        const net = debit - credit;
        beban.push({ account, amount: net });
      }
    });

    const totalPendapatan = pendapatan.reduce((s, r) => s + r.amount, 0);
    const totalBeban = beban.reduce((s, r) => s + r.amount, 0);
    const labaRugi = totalPendapatan - totalBeban;

    return { pendapatan, beban, totalPendapatan, totalBeban, labaRugi };
  }

  getNeraca() {
    const balances = this._calculateBalances();
    const aset = [];
    const kewajiban = [];
    const modal = [];

    Object.values(balances).forEach(b => {
      const { account, debit, credit } = b;
      const normal = account.normalBalance;
      const net = normal === "Debit" ? debit - credit : credit - debit;

      if (account.type === "Aset") {
        aset.push({ account, amount: net });
      } else if (account.type === "Kewajiban") {
        kewajiban.push({ account, amount: net });
      } else if (account.type === "Modal") {
        modal.push({ account, amount: net });
      }
    });

    const totalAset = aset.reduce((s, r) => s + r.amount, 0);
    const totalKewajiban = kewajiban.reduce((s, r) => s + r.amount, 0);
    const totalModal = modal.reduce((s, r) => s + r.amount, 0);

    return { aset, kewajiban, modal, totalAset, totalKewajiban, totalModal };
  }
}

window.reportService = new ReportService(window.accountManager, window.journalManager);

