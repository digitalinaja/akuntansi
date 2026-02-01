(() => {
  const navLinks = document.querySelectorAll("a.nav-link[data-view]");
  const views = document.querySelectorAll(".app-view");
  const footerYear = document.getElementById("footerYear");
  const btnExport = document.getElementById("btnExport");
  const inputImport = document.getElementById("inputImport");
  footerYear.textContent = new Date().getFullYear();

  const {
    AccountsView,
    TransactionsView,
    JournalView,
    LedgerView,
    TrialBalanceView,
    WorksheetView,
    ReportsView
  } = window.Views;

  // Instantiate view controllers
  const accountsView = new AccountsView({
    accountManager: window.accountManager,
    onChange: handleAccountsChanged
  });
  const transactionsView = new TransactionsView({
    accountManager: window.accountManager,
    journalManager: window.journalManager,
    onJournalAdded: handleJournalChanged
  });
  const journalView = new JournalView({
    accountManager: window.accountManager,
    journalManager: window.journalManager
  });
  const ledgerView = new LedgerView({ reportService: window.reportService });
  const trialBalanceView = new TrialBalanceView({ reportService: window.reportService });
  const worksheetView = new WorksheetView({ reportService: window.reportService });
  const reportsView = new ReportsView({ reportService: window.reportService });

  function handleAccountsChanged() {
    transactionsView.populateAccountOptions();
    renderDerived();
  }

  function handleJournalChanged() {
    renderDerived();
  }

  function renderDerived() {
    ledgerView.render();
    trialBalanceView.render();
    worksheetView.render();
    reportsView.render();
    journalView.render();
    transactionsView.renderTable();
  }

  function showView(viewName) {
    views.forEach(v => {
      v.classList.toggle("d-none", v.id !== `view-${viewName}`);
    });
    navLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.view === viewName);
    });

    // Render on-demand per view
    if (viewName === "akun") {
      accountsView.render();
    } else if (viewName === "jurnal") {
      journalView.render();
    } else if (viewName === "buku-besar") {
      ledgerView.render();
    } else if (viewName === "trial-balance") {
      trialBalanceView.render();
    } else if (viewName === "neraca-lajur") {
      worksheetView.render();
    } else if (viewName === "laporan") {
      reportsView.render();
    } else if (viewName === "transaksi") {
      transactionsView.renderTable();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showView(link.dataset.view);
    });
  });

  async function handleExport() {
    if (!window.storageAdapter || !window.storageAdapter.supportsBackup()) {
      alert("Backup tidak tersedia untuk adapter ini.");
      return;
    }
    try {
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
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan export data.");
    }
  }

  function bindExportImport() {
    if (btnExport) {
      btnExport.addEventListener("click", handleExport);
    }
    if (inputImport) {
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
            alert("Data berhasil di-import. Halaman akan dimuat ulang.");
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert("Gagal meng-import data. Pastikan format file benar.");
          }
        };
        reader.readAsText(file);
        e.target.value = "";
      });
    }
  }

  async function bootstrap() {
    await Promise.all([window.accountManager.ready(), window.journalManager.ready()]);
    await accountsView.init();
    await transactionsView.init();
    bindExportImport();
    renderDerived();
    showView("transaksi");
  }

  bootstrap();
})();
