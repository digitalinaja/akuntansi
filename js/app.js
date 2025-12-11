(() => {
  const navLinks = document.querySelectorAll("a.nav-link[data-view]");
  const views = document.querySelectorAll(".app-view");
  const footerYear = document.getElementById("footerYear");

  const debitSelect = document.getElementById("trxDebitAccount");
  const creditSelect = document.getElementById("trxCreditAccount");
  const formTransaksi = document.getElementById("formTransaksi");
  const tableTransaksiBody = document.querySelector("#tableTransaksi tbody");
  const tableJurnalBody = document.querySelector("#tableJurnal tbody");
  const bukuBesarContainer = document.getElementById("bukuBesarContainer");
  const tableTrialBody = document.querySelector("#tableTrialBalance tbody");
  const trialTotalDebit = document.getElementById("trialTotalDebit");
  const trialTotalCredit = document.getElementById("trialTotalCredit");
  const laporanLabaRugi = document.getElementById("laporanLabaRugi");
  const laporanNeraca = document.getElementById("laporanNeraca");
  const tableWorksheetBody = document.querySelector("#tableNeracaLajur tbody");
  const wsSaldoDebit = document.getElementById("wsSaldoDebit");
  const wsSaldoKredit = document.getElementById("wsSaldoKredit");
  const wsLrDebit = document.getElementById("wsLrDebit");
  const wsLrKredit = document.getElementById("wsLrKredit");
  const wsNeracaDebit = document.getElementById("wsNeracaDebit");
  const wsNeracaKredit = document.getElementById("wsNeracaKredit");
  const tableAccountsBody = document.querySelector("#tableAccounts tbody");
  const btnAddAccount = document.getElementById("btnAddAccount");
  const modalAccount = document.getElementById("modalAccount");
  const formAccount = document.getElementById("formAccount");
  const accIdInput = document.getElementById("accId");
  const accNameInput = document.getElementById("accName");
  const accTypeSelect = document.getElementById("accType");
  const accNormalSelect = document.getElementById("accNormalBalance");

  let accountModal = null;
  let currentAccountId = null;

  const btnExport = document.getElementById("btnExport");
  const inputImport = document.getElementById("inputImport");

  footerYear.textContent = new Date().getFullYear();
  const modalLib = (typeof window !== "undefined" && window.bootstrap) || null;
  if (modalAccount && modalLib && typeof modalLib.Modal === "function") {
    accountModal = new modalLib.Modal(modalAccount);
  } else if (modalAccount) {
    // Fallback sederhana bila Bootstrap JS tidak tersedia
    accountModal = {
      show() {
        modalAccount.classList.add("show");
        modalAccount.style.display = "block";
      },
      hide() {
        modalAccount.classList.remove("show");
        modalAccount.style.display = "none";
      }
    };
  }

  function showView(viewName) {
    views.forEach(v => {
      if (v.id === `view-${viewName}`) {
        v.classList.remove("d-none");
      } else {
        v.classList.add("d-none");
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.view === viewName);
    });

    if (viewName === "akun") {
      renderAccountsTable();
    } else if (viewName === "jurnal") {
      renderJurnal();
    } else if (viewName === "buku-besar") {
      renderBukuBesar();
    } else if (viewName === "trial-balance") {
      renderTrialBalance();
    } else if (viewName === "neraca-lajur") {
      renderNeracaLajur();
    } else if (viewName === "laporan") {
      renderLaporan();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showView(link.dataset.view);
    });
  });

  function populateAccountOptions() {
    const accounts = window.accountManager.getAll();
    [debitSelect, creditSelect].forEach(select => {
      select.innerHTML = '<option value="">Pilih Akun</option>';
      accounts.forEach(acc => {
        const opt = document.createElement("option");
        opt.value = acc.id;
        opt.textContent = `${acc.id} - ${acc.name}`;
        select.appendChild(opt);
      });
    });
  }

  function renderAccountsTable() {
    if (!tableAccountsBody) {
      return;
    }
    const accounts = window.accountManager.getAll();
    tableAccountsBody.innerHTML = "";
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
      tableAccountsBody.appendChild(row);
    });
  }

  function renderTransaksiTable() {
    const journals = window.journalManager.getAll().slice(-20).reverse();
    tableTransaksiBody.innerHTML = "";
    journals.forEach(j => {
      const row = document.createElement("tr");
      const debit = j.debit[0];
      const credit = j.credit[0];
      const debitAcc = window.accountManager.getById(debit.account);
      const creditAcc = window.accountManager.getById(credit.account);

      row.innerHTML = `
        <td>${j.date}</td>
        <td>${j.reference || ""}</td>
        <td>${j.description}</td>
        <td>${debitAcc ? debitAcc.name : debit.account}</td>
        <td>${creditAcc ? creditAcc.name : credit.account}</td>
        <td class="text-end">${debit.amount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
      `;
      tableTransaksiBody.appendChild(row);
    });
  }

  function renderJurnal() {
    const journals = window.journalManager.getAll();
    tableJurnalBody.innerHTML = "";
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
          const accD = window.accountManager.getById(d.account);
          akunText.push(accD ? `${accD.id} - ${accD.name}` : d.account);
          debitAmount = d.amount.toLocaleString("id-ID", { minimumFractionDigits: 2 });
        }
        if (c) {
          const accC = window.accountManager.getById(c.account);
          akunText.push(accC ? `${accC.id} - ${accC.name}` : c.account);
          creditAmount = c.amount.toLocaleString("id-ID", { minimumFractionDigits: 2 });
        }

        row.innerHTML = `
          <td>${i === 0 ? j.date : ""}</td>
          <td>${i === 0 ? (j.reference || "") : ""}</td>
          <td>${i === 0 ? j.description : ""}</td>
          <td>${akunText.join(" / ")}</td>
          <td class="text-end">${debitAmount}</td>
          <td class="text-end">${creditAmount}</td>
        `;
        tableJurnalBody.appendChild(row);
      }
    });
  }

  function renderBukuBesar() {
    const ledger = window.reportService.getBukuBesar();
    bukuBesarContainer.innerHTML = "";

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
            Saldo akhir: ${saldoAkhir.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
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
          <td class="text-end">${e.debit ? e.debit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
          <td class="text-end">${e.credit ? e.credit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
        `;
        tbody.appendChild(row);
      });
      bukuBesarContainer.appendChild(card);
    });
  }

  function renderTrialBalance() {
    const trial = window.reportService.getTrialBalance();
    tableTrialBody.innerHTML = "";
    trial.rows.forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.id} - ${r.name}</td>
        <td class="text-end">${r.debit ? r.debit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
        <td class="text-end">${r.credit ? r.credit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
      `;
      tableTrialBody.appendChild(row);
    });
    trialTotalDebit.textContent = trial.totalDebit.toLocaleString("id-ID", { minimumFractionDigits: 2 });
    trialTotalCredit.textContent = trial.totalCredit.toLocaleString("id-ID", { minimumFractionDigits: 2 });
    const balanced = trial.totalDebit === trial.totalCredit;
    trialTotalDebit.parentElement.classList.toggle("table-success", balanced);
    trialTotalDebit.parentElement.classList.toggle("table-danger", !balanced);
  }

  function renderNeracaLajur() {
    if (!tableWorksheetBody) {
      return;
    }
    const ws = window.reportService.getWorksheet();
    tableWorksheetBody.innerHTML = "";
    ws.rows.forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.id} - ${r.name}</td>
        <td class="text-end">${r.saldoDebit ? r.saldoDebit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
        <td class="text-end">${r.saldoKredit ? r.saldoKredit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
        <td class="text-end">${r.lrDebit ? r.lrDebit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
        <td class="text-end">${r.lrKredit ? r.lrKredit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
        <td class="text-end">${r.neracaDebit ? r.neracaDebit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
        <td class="text-end">${r.neracaKredit ? r.neracaKredit.toLocaleString("id-ID", { minimumFractionDigits: 2 }) : ""}</td>
      `;
      tableWorksheetBody.appendChild(row);
    });

    if (wsSaldoDebit) wsSaldoDebit.textContent = ws.totalSaldoDebit.toLocaleString("id-ID", { minimumFractionDigits: 2 });
    if (wsSaldoKredit) wsSaldoKredit.textContent = ws.totalSaldoKredit.toLocaleString("id-ID", { minimumFractionDigits: 2 });
    if (wsLrDebit) wsLrDebit.textContent = ws.totalLrDebit.toLocaleString("id-ID", { minimumFractionDigits: 2 });
    if (wsLrKredit) wsLrKredit.textContent = ws.totalLrKredit.toLocaleString("id-ID", { minimumFractionDigits: 2 });
    if (wsNeracaDebit) wsNeracaDebit.textContent = ws.totalNeracaDebit.toLocaleString("id-ID", { minimumFractionDigits: 2 });
    if (wsNeracaKredit) wsNeracaKredit.textContent = ws.totalNeracaKredit.toLocaleString("id-ID", { minimumFractionDigits: 2 });
  }

  function renderLaporan() {
    const labaRugi = window.reportService.getLabaRugi();
    const neraca = window.reportService.getNeraca();

    laporanLabaRugi.innerHTML = "";
    laporanNeraca.innerHTML = "";

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
        <td class="text-end">${p.amount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
      `;
      lrBody.appendChild(row);
    });

    labaRugi.beban.forEach(b => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Beban</td>
        <td>${b.account.id} - ${b.account.name}</td>
        <td class="text-end">${b.amount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
      `;
      lrBody.appendChild(row);
    });

    const totalRow = document.createElement("tr");
    totalRow.className = "fw-bold";
    totalRow.innerHTML = `
      <td colspan="2">Laba/Rugi Bersih</td>
      <td class="text-end">${labaRugi.labaRugi.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
    `;
    lrBody.appendChild(totalRow);

    lrTable.appendChild(lrBody);
    laporanLabaRugi.appendChild(lrTable);

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
        <td class="text-end">${a.amount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
      `;
      neracaBody.appendChild(row);
    });

    neraca.kewajiban.forEach(k => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Kewajiban</td>
        <td>${k.account.id} - ${k.account.name}</td>
        <td class="text-end">${k.amount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
      `;
      neracaBody.appendChild(row);
    });

    neraca.modal.forEach(m => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Modal</td>
        <td>${m.account.id} - ${m.account.name}</td>
        <td class="text-end">${m.amount.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
      `;
      neracaBody.appendChild(row);
    });

    const totalRowN = document.createElement("tr");
    totalRowN.className = "fw-bold";
    totalRowN.innerHTML = `
      <td colspan="2">Total Aset</td>
      <td class="text-end">${neraca.totalAset.toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
    `;
    neracaBody.appendChild(totalRowN);

    const totalRowKM = document.createElement("tr");
    totalRowKM.className = "fw-bold";
    totalRowKM.innerHTML = `
      <td colspan="2">Total Kewajiban + Modal</td>
      <td class="text-end">${(neraca.totalKewajiban + neraca.totalModal).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</td>
    `;
    neracaBody.appendChild(totalRowKM);

    neracaTable.appendChild(neracaBody);
    laporanNeraca.appendChild(neracaTable);
  }

  formTransaksi.addEventListener("submit", async e => {
    e.preventDefault();
    const date = document.getElementById("trxDate").value;
    const reference = document.getElementById("trxRef").value;
    const description = document.getElementById("trxDesc").value.trim();
    const debitAccountId = debitSelect.value;
    const creditAccountId = creditSelect.value;
    const amount = Number(document.getElementById("trxAmount").value);

    if (!date || !description || !debitAccountId || !creditAccountId || !amount) {
      alert("Semua field wajib diisi dan jumlah harus lebih dari 0.");
      return;
    }
    if (debitAccountId === creditAccountId) {
      alert("Akun debit dan kredit tidak boleh sama.");
      return;
    }

    await window.journalManager.addJournal({
      date,
      description,
      reference,
      debitAccountId,
      creditAccountId,
      amount
    });

    formTransaksi.reset();
    renderTransaksiTable();
  });

  btnExport.addEventListener("click", async () => {
    if (!window.storageAdapter || !window.storageAdapter.supportsBackup()) {
      alert("Backup hanya tersedia untuk adapter localStorage.");
      return;
    }
    const data = await window.storageAdapter.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-accounting-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  inputImport.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const data = JSON.parse(event.target.result);
        if (!window.storageAdapter || !window.storageAdapter.importData) {
          alert("Import tidak tersedia untuk adapter ini.");
          return;
        }
        await window.storageAdapter.importData(data);
        window.accountManager = new AccountManager(window.storageAdapter);
        window.journalManager = new JournalManager(window.storageAdapter, window.accountManager);
        window.reportService = new ReportService(window.accountManager, window.journalManager);
        await Promise.all([window.accountManager.ready(), window.journalManager.ready()]);
        populateAccountOptions();
        renderTransaksiTable();
        renderAccountsTable();
        alert("Data berhasil di-import.");
      } catch (err) {
        console.error(err);
        alert("Gagal meng-import data. Pastikan format file benar.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  async function bootstrap() {
    if (!window.accountManager || !window.journalManager || !window.reportService) {
      return;
    }
    await Promise.all([window.accountManager.ready(), window.journalManager.ready()]);
    populateAccountOptions();
    renderTransaksiTable();
    renderAccountsTable();
    showView("transaksi");
  }

  if (btnAddAccount && formAccount && tableAccountsBody) {
    btnAddAccount.addEventListener("click", () => {
      currentAccountId = null;
      formAccount.reset();
      accIdInput.removeAttribute("readonly");
      document.getElementById("modalAccountTitle").textContent = "Tambah Akun";
      if (accountModal) {
        accountModal.show();
      }
    });

    tableAccountsBody.addEventListener("click", e => {
      const btn = e.target.closest(".btn-edit-account");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const acc = window.accountManager.getById(id);
      if (!acc) return;
      currentAccountId = id;
      accIdInput.value = acc.id;
      accIdInput.setAttribute("readonly", "readonly");
      accNameInput.value = acc.name;
      accTypeSelect.value = acc.type;
      accNormalSelect.value = acc.normalBalance;
      document.getElementById("modalAccountTitle").textContent = "Edit Akun";
      if (accountModal) {
        accountModal.show();
      }
    });

    formAccount.addEventListener("submit", e => {
      e.preventDefault();
      const id = accIdInput.value.trim();
      const name = accNameInput.value.trim();
      const type = accTypeSelect.value;
      const normalBalance = accNormalSelect.value;

      if (!id || !name || !type || !normalBalance) {
        alert("Semua field akun wajib diisi.");
        return;
      }

      try {
        if (!currentAccountId) {
          window.accountManager.addAccount({ id, name, type, normalBalance });
        } else {
          window.accountManager.updateAccount(currentAccountId, { name, type, normalBalance });
        }
      } catch (err) {
        alert(err.message || "Gagal menyimpan akun.");
        return;
      }

      populateAccountOptions();
      renderAccountsTable();
      renderTransaksiTable();

      if (accountModal) {
        accountModal.hide();
      }
    });
  }

  bootstrap();
})();
