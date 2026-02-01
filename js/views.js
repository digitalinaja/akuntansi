// Utility helpers
function formatNumber(num) {
  if (num === null || num === undefined || Number.isNaN(num)) return "";
  return Number(num).toLocaleString("id-ID", { minimumFractionDigits: 2 });
}

// Accounts View
class AccountsView {
  constructor({ accountManager, onChange }) {
    this.accountManager = accountManager;
    this.onChange = onChange;
    this.tableBody = document.querySelector("#tableAccounts tbody");
    this.btnAdd = document.getElementById("btnAddAccount");
    this.modalAccount = document.getElementById("modalAccount");
    this.form = document.getElementById("formAccount");
    this.accIdInput = document.getElementById("accId");
    this.accNameInput = document.getElementById("accName");
    this.accTypeSelect = document.getElementById("accType");
    this.accNormalSelect = document.getElementById("accNormalBalance");
    this.currentAccountId = null;
    this.modalLib = (typeof window !== "undefined" && window.bootstrap) || null;
    this.accountModal =
      this.modalAccount && this.modalLib && typeof this.modalLib.Modal === "function"
        ? new this.modalLib.Modal(this.modalAccount)
        : this._fallbackModal();
  }

  _fallbackModal() {
    if (!this.modalAccount) return null;
    return {
      show: () => {
        this.modalAccount.classList.add("show");
        this.modalAccount.style.display = "block";
      },
      hide: () => {
        this.modalAccount.classList.remove("show");
        this.modalAccount.style.display = "none";
      }
    };
  }

  bindEvents() {
    if (this.btnAdd && this.form && this.tableBody) {
      this.btnAdd.addEventListener("click", () => this.openAdd());
      this.tableBody.addEventListener("click", e => this.handleEditClick(e));
      this.form.addEventListener("submit", e => this.handleSubmit(e));
    }
  }

  openAdd() {
    this.currentAccountId = null;
    this.form.reset();
    this.accIdInput.removeAttribute("readonly");
    document.getElementById("modalAccountTitle").textContent = "Tambah Akun";
    if (this.accountModal) this.accountModal.show();
  }

  openEdit(acc) {
    this.currentAccountId = acc.id;
    this.accIdInput.value = acc.id;
    this.accIdInput.setAttribute("readonly", "readonly");
    this.accNameInput.value = acc.name;
    this.accTypeSelect.value = acc.type;
    this.accNormalSelect.value = acc.normalBalance;
    document.getElementById("modalAccountTitle").textContent = "Edit Akun";
    if (this.accountModal) this.accountModal.show();
  }

  handleEditClick(e) {
    const btn = e.target.closest(".btn-edit-account");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const acc = this.accountManager.getById(id);
    if (!acc) return;
    this.openEdit(acc);
  }

  async handleSubmit(e) {
    e.preventDefault();
    const id = this.accIdInput.value.trim();
    const name = this.accNameInput.value.trim();
    const type = this.accTypeSelect.value;
    const normalBalance = this.accNormalSelect.value;

    if (!id || !name || !type || !normalBalance) {
      alert("Semua field akun wajib diisi.");
      return;
    }

    try {
      if (!this.currentAccountId) {
        await this.accountManager.addAccount({ id, name, type, normalBalance });
      } else {
        await this.accountManager.updateAccount(this.currentAccountId, { name, type, normalBalance });
      }
    } catch (err) {
      alert(err.message || "Gagal menyimpan akun.");
      return;
    }

    this.render();
    if (this.onChange) this.onChange();
    if (this.accountModal) this.accountModal.hide();
  }

  render() {
    if (!this.tableBody) return;
    const accounts = this.accountManager.getAll();
    this.tableBody.innerHTML = "";
    accounts.forEach(acc => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${acc.id}</td>
        <td>${acc.name}</td>
        <td>${acc.type}</td>
        <td>${acc.normalBalance}</td>
        <td class="text-end">
          <button type="button" class="btn btn-sm btn-outline-primary btn-edit-account" data-id="${acc.id}">
            <i class="bi bi-pencil-square"></i>
          </button>
        </td>
      `;
      this.tableBody.appendChild(row);
    });
  }

  async init() {
    await this.accountManager.ready();
    this.bindEvents();
    this.render();
  }
}

// Transactions View
class TransactionsView {
  constructor({ accountManager, journalManager, onJournalAdded }) {
    this.accountManager = accountManager;
    this.journalManager = journalManager;
    this.onJournalAdded = onJournalAdded;
    this.debitSelect = document.getElementById("trxDebitAccount");
    this.creditSelect = document.getElementById("trxCreditAccount");
    this.form = document.getElementById("formTransaksi");
    this.tableBody = document.querySelector("#tableTransaksi tbody");
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener("submit", e => this.handleSubmit(e));
    }
  }

  populateAccountOptions() {
    if (!this.debitSelect || !this.creditSelect) return;
    const accounts = this.accountManager.getAll();
    [this.debitSelect, this.creditSelect].forEach(select => {
      select.innerHTML = '<option value="">Pilih Akun</option>';
      accounts.forEach(acc => {
        const opt = document.createElement("option");
        opt.value = acc.id;
        opt.textContent = `${acc.id} - ${acc.name}`;
        select.appendChild(opt);
      });
    });
  }

  renderTable() {
    if (!this.tableBody) return;
    const journals = this.journalManager.getAll().slice(-20).reverse();
    this.tableBody.innerHTML = "";
    journals.forEach(j => {
      const row = document.createElement("tr");
      const debit = j.debit[0];
      const credit = j.credit[0];
      const debitAcc = this.accountManager.getById(debit.account);
      const creditAcc = this.accountManager.getById(credit.account);
      row.innerHTML = `
        <td>${j.date}</td>
        <td>${j.reference || ""}</td>
        <td>${j.description}</td>
        <td>${debitAcc ? debitAcc.name : debit.account}</td>
        <td>${creditAcc ? creditAcc.name : credit.account}</td>
        <td class="text-end">${formatNumber(debit.amount)}</td>
      `;
      this.tableBody.appendChild(row);
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const date = document.getElementById("trxDate").value;
    const reference = document.getElementById("trxRef").value;
    const description = document.getElementById("trxDesc").value.trim();
    const debitAccountId = this.debitSelect.value;
    const creditAccountId = this.creditSelect.value;
    const amount = Number(document.getElementById("trxAmount").value);

    if (!date || !description || !debitAccountId || !creditAccountId || !amount) {
      alert("Semua field wajib diisi dan jumlah harus lebih dari 0.");
      return;
    }
    if (debitAccountId === creditAccountId) {
      alert("Akun debit dan kredit tidak boleh sama.");
      return;
    }

    await this.journalManager.addJournal({
      date,
      description,
      reference,
      debitAccountId,
      creditAccountId,
      amount
    });

    this.form.reset();
    this.renderTable();
    if (this.onJournalAdded) this.onJournalAdded();
  }

  async init() {
    await Promise.all([this.accountManager.ready(), this.journalManager.ready()]);
    this.bindEvents();
    this.populateAccountOptions();
    this.renderTable();
  }
}

// Journal View
class JournalView {
  constructor({ accountManager, journalManager }) {
    this.accountManager = accountManager;
    this.journalManager = journalManager;
    this.tableBody = document.querySelector("#tableJurnal tbody");
  }

  render() {
    if (!this.tableBody) return;
    const journals = this.journalManager.getAll();
    this.tableBody.innerHTML = "";
    journals.forEach(j => {
      const maxLines = Math.max(j.debit.length, j.credit.length);
      for (let i = 0; i < maxLines; i++) {
        const d = j.debit[i];
        const c = j.credit[i];
        const row = document.createElement("tr");
        const akunText = [];
        let debitAmount = "";
        let creditAmount = "";

        if (d) {
          const accD = this.accountManager.getById(d.account);
          akunText.push(accD ? `${accD.id} - ${accD.name}` : d.account);
          debitAmount = formatNumber(d.amount);
        }
        if (c) {
          const accC = this.accountManager.getById(c.account);
          akunText.push(accC ? `${accC.id} - ${accC.name}` : c.account);
          creditAmount = formatNumber(c.amount);
        }

        row.innerHTML = `
          <td>${i === 0 ? j.date : ""}</td>
          <td>${i === 0 ? (j.reference || "") : ""}</td>
          <td>${i === 0 ? j.description : ""}</td>
          <td>${akunText.join(" / ")}</td>
          <td class="text-end">${debitAmount}</td>
          <td class="text-end">${creditAmount}</td>
        `;
        this.tableBody.appendChild(row);
      }
    });
  }
}

// Ledger View
class LedgerView {
  constructor({ reportService }) {
    this.reportService = reportService;
    this.container = document.getElementById("bukuBesarContainer");
  }

  render() {
    if (!this.container) return;
    const ledger = this.reportService.getBukuBesar();
    this.container.innerHTML = "";

    ledger.forEach(l => {
      if (l.entries.length === 0) {
        return;
      }
      const card = document.createElement("div");
      card.className = "card mb-3";
      const saldoAkhir = l.totalDebit - l.totalCredit;
      card.innerHTML = `
        <div class="card-header fw-semibold">
          ${l.account.id} - ${l.account.name}
          <span class="float-end small text-muted">
            Saldo akhir: ${formatNumber(saldoAkhir)}
          </span>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr>
                  <th>Tanggal</th>
                  <th>Ref</th>
                  <th>Deskripsi</th>
                  <th class="text-end">Debit</th>
                  <th class="text-end">Kredit</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      `;
      const tbody = card.querySelector("tbody");
      l.entries.forEach(e => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${e.date}</td>
          <td>${e.reference || ""}</td>
          <td>${e.description}</td>
          <td class="text-end">${e.debit ? formatNumber(e.debit) : ""}</td>
          <td class="text-end">${e.credit ? formatNumber(e.credit) : ""}</td>
        `;
        tbody.appendChild(row);
      });
      this.container.appendChild(card);
    });
  }
}

// Trial Balance View
class TrialBalanceView {
  constructor({ reportService }) {
    this.reportService = reportService;
    this.tableBody = document.querySelector("#tableTrialBalance tbody");
    this.totalDebitEl = document.getElementById("trialTotalDebit");
    this.totalCreditEl = document.getElementById("trialTotalCredit");
  }

  render() {
    if (!this.tableBody) return;
    const trial = this.reportService.getTrialBalance();
    this.tableBody.innerHTML = "";
    trial.rows.forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.id} - ${r.name}</td>
        <td class="text-end">${r.debit ? formatNumber(r.debit) : ""}</td>
        <td class="text-end">${r.credit ? formatNumber(r.credit) : ""}</td>
      `;
      this.tableBody.appendChild(row);
    });
    if (this.totalDebitEl) this.totalDebitEl.textContent = formatNumber(trial.totalDebit);
    if (this.totalCreditEl) this.totalCreditEl.textContent = formatNumber(trial.totalCredit);
    const balanced = trial.totalDebit === trial.totalCredit;
    this.totalDebitEl.parentElement.classList.toggle("table-success", balanced);
    this.totalDebitEl.parentElement.classList.toggle("table-danger", !balanced);
  }
}

// Worksheet View (Neraca Lajur)
class WorksheetView {
  constructor({ reportService }) {
    this.reportService = reportService;
    this.tableBody = document.querySelector("#tableNeracaLajur tbody");
    this.wsSaldoDebit = document.getElementById("wsSaldoDebit");
    this.wsSaldoKredit = document.getElementById("wsSaldoKredit");
    this.wsLrDebit = document.getElementById("wsLrDebit");
    this.wsLrKredit = document.getElementById("wsLrKredit");
    this.wsNeracaDebit = document.getElementById("wsNeracaDebit");
    this.wsNeracaKredit = document.getElementById("wsNeracaKredit");
  }

  render() {
    if (!this.tableBody) return;
    const ws = this.reportService.getWorksheet();
    this.tableBody.innerHTML = "";
    ws.rows.forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.id} - ${r.name}</td>
        <td class="text-end">${r.saldoDebit ? formatNumber(r.saldoDebit) : ""}</td>
        <td class="text-end">${r.saldoKredit ? formatNumber(r.saldoKredit) : ""}</td>
        <td class="text-end">${r.lrDebit ? formatNumber(r.lrDebit) : ""}</td>
        <td class="text-end">${r.lrKredit ? formatNumber(r.lrKredit) : ""}</td>
        <td class="text-end">${r.neracaDebit ? formatNumber(r.neracaDebit) : ""}</td>
        <td class="text-end">${r.neracaKredit ? formatNumber(r.neracaKredit) : ""}</td>
      `;
      this.tableBody.appendChild(row);
    });

    if (this.wsSaldoDebit) this.wsSaldoDebit.textContent = formatNumber(ws.totalSaldoDebit);
    if (this.wsSaldoKredit) this.wsSaldoKredit.textContent = formatNumber(ws.totalSaldoKredit);
    if (this.wsLrDebit) this.wsLrDebit.textContent = formatNumber(ws.totalLrDebit);
    if (this.wsLrKredit) this.wsLrKredit.textContent = formatNumber(ws.totalLrKredit);
    if (this.wsNeracaDebit) this.wsNeracaDebit.textContent = formatNumber(ws.totalNeracaDebit);
    if (this.wsNeracaKredit) this.wsNeracaKredit.textContent = formatNumber(ws.totalNeracaKredit);
  }
}

// Reports View (Laba Rugi & Neraca)
class ReportsView {
  constructor({ reportService }) {
    this.reportService = reportService;
    this.labaRugiEl = document.getElementById("laporanLabaRugi");
    this.neracaEl = document.getElementById("laporanNeraca");
  }

  render() {
    if (!this.labaRugiEl || !this.neracaEl) return;
    const labaRugi = this.reportService.getLabaRugi();
    const neraca = this.reportService.getNeraca();

    this.labaRugiEl.innerHTML = "";
    this.neracaEl.innerHTML = "";

    const lrTable = document.createElement("table");
    lrTable.className = "table table-sm table-striped";
    const lrBody = document.createElement("tbody");

    lrTable.innerHTML = `
      <thead class="table-light">
        <tr><th>Kelompok</th><th>Akun</th><th class="text-end">Jumlah</th></tr>
      </thead>
    `;

    labaRugi.pendapatan.forEach(p => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Pendapatan</td>
        <td>${p.account.id} - ${p.account.name}</td>
        <td class="text-end">${formatNumber(p.amount)}</td>
      `;
      lrBody.appendChild(row);
    });

    labaRugi.beban.forEach(b => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Beban</td>
        <td>${b.account.id} - ${b.account.name}</td>
        <td class="text-end">${formatNumber(b.amount)}</td>
      `;
      lrBody.appendChild(row);
    });

    const totalRow = document.createElement("tr");
    totalRow.className = "fw-bold";
    totalRow.innerHTML = `
      <td colspan="2">Laba/Rugi Bersih</td>
      <td class="text-end">${formatNumber(labaRugi.labaRugi)}</td>
    `;
    lrBody.appendChild(totalRow);

    lrTable.appendChild(lrBody);
    this.labaRugiEl.appendChild(lrTable);

    const neracaTable = document.createElement("table");
    neracaTable.className = "table table-sm table-striped";
    const neracaBody = document.createElement("tbody");

    neracaTable.innerHTML = `
      <thead class="table-light">
        <tr><th>Kelompok</th><th>Akun</th><th class="text-end">Jumlah</th></tr>
      </thead>
    `;

    neraca.aset.forEach(a => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Aset</td>
        <td>${a.account.id} - ${a.account.name}</td>
        <td class="text-end">${formatNumber(a.amount)}</td>
      `;
      neracaBody.appendChild(row);
    });

    neraca.kewajiban.forEach(k => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Kewajiban</td>
        <td>${k.account.id} - ${k.account.name}</td>
        <td class="text-end">${formatNumber(k.amount)}</td>
      `;
      neracaBody.appendChild(row);
    });

    neraca.modal.forEach(m => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Modal</td>
        <td>${m.account.id} - ${m.account.name}</td>
        <td class="text-end">${formatNumber(m.amount)}</td>
      `;
      neracaBody.appendChild(row);
    });

    const totalRowN = document.createElement("tr");
    totalRowN.className = "fw-bold";
    totalRowN.innerHTML = `
      <td colspan="2">Total Aset</td>
      <td class="text-end">${formatNumber(neraca.totalAset)}</td>
    `;
    neracaBody.appendChild(totalRowN);

    const totalRowKM = document.createElement("tr");
    totalRowKM.className = "fw-bold";
    totalRowKM.innerHTML = `
      <td colspan="2">Total Kewajiban + Modal</td>
      <td class="text-end">${formatNumber(neraca.totalKewajiban + neraca.totalModal)}</td>
    `;
    neracaBody.appendChild(totalRowKM);

    neracaTable.appendChild(neracaBody);
    this.neracaEl.appendChild(neracaTable);
  }
}

window.Views = {
  AccountsView,
  TransactionsView,
  JournalView,
  LedgerView,
  TrialBalanceView,
  WorksheetView,
  ReportsView
};
