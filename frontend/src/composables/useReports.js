import { computed } from 'vue'
import { useAccountsStore } from '../stores/accountsStore'
import { useJournalsStore } from '../stores/journalsStore'

export function useReports() {
  const { accounts } = useAccountsStore()
  const { journals } = useJournalsStore()

  // Calculate balances for all accounts
  const calculateBalances = () => {
    const balances = {}

    accounts.value.forEach(acc => {
      balances[acc.id] = { account: acc, debit: 0, credit: 0 }
    })

    journals.value.forEach(j => {
      j.debit.forEach(d => {
        if (!balances[d.account]) return
        balances[d.account].debit += d.amount
      })
      j.credit.forEach(c => {
        if (!balances[c.account]) return
        balances[c.account].credit += c.amount
      })
    })

    return balances
  }

  // Trial Balance
  const trialBalance = computed(() => {
    const balances = calculateBalances()
    const rows = Object.values(balances).map(b => {
      const account = b.account
      const net = b.debit - b.credit
      const debit = net > 0 ? net : 0
      const credit = net < 0 ? -net : 0
      return {
        id: account.id,
        name: account.name,
        debit,
        credit
      }
    })

    const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0)
    const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0)

    return { rows, totalDebit, totalCredit }
  })

  // Buku Besar (General Ledger)
  const bukuBesar = computed(() => {
    const ledger = {}

    accounts.value.forEach(acc => {
      ledger[acc.id] = {
        account: acc,
        entries: [],
        totalDebit: 0,
        totalCredit: 0
      }
    })

    journals.value.forEach(j => {
      j.debit.forEach(d => {
        const l = ledger[d.account]
        if (!l) return
        l.entries.push({
          date: j.date,
          reference: j.reference,
          description: j.description,
          debit: d.amount,
          credit: 0
        })
        l.totalDebit += d.amount
      })
      j.credit.forEach(c => {
        const l = ledger[c.account]
        if (!l) return
        l.entries.push({
          date: j.date,
          reference: j.reference,
          description: j.description,
          debit: 0,
          credit: c.amount
        })
        l.totalCredit += c.amount
      })
    })

    return Object.values(ledger)
  })

  // Laba Rugi (Income Statement)
  const labaRugi = computed(() => {
    const balances = calculateBalances()
    const pendapatan = []
    const beban = []

    Object.values(balances).forEach(b => {
      const { account, debit, credit } = b
      if (account.type === 'Pendapatan') {
        const net = credit - debit
        if (net !== 0) {
          pendapatan.push({ account, amount: net })
        }
      } else if (account.type === 'Beban') {
        const net = debit - credit
        if (net !== 0) {
          beban.push({ account, amount: net })
        }
      }
    })

    const totalPendapatan = pendapatan.reduce((s, r) => s + r.amount, 0)
    const totalBeban = beban.reduce((s, r) => s + r.amount, 0)
    const labaRugiBersih = totalPendapatan - totalBeban

    return { pendapatan, beban, totalPendapatan, totalBeban, labaRugiBersih }
  })

  // Neraca (Balance Sheet)
  const neraca = computed(() => {
    const balances = calculateBalances()
    const aset = []
    const kewajiban = []
    const modal = []

    Object.values(balances).forEach(b => {
      const { account, debit, credit } = b
      const normal = account.normalBalance
      const net = normal === 'Debit' ? debit - credit : credit - debit

      if (account.type === 'Aset') {
        if (net !== 0) aset.push({ account, amount: net })
      } else if (account.type === 'Kewajiban') {
        if (net !== 0) kewajiban.push({ account, amount: net })
      } else if (account.type === 'Modal') {
        if (net !== 0) modal.push({ account, amount: net })
      }
    })

    const totalAset = aset.reduce((s, r) => s + r.amount, 0)
    const totalKewajiban = kewajiban.reduce((s, r) => s + r.amount, 0)
    const totalModal = modal.reduce((s, r) => s + r.amount, 0)

    return { aset, kewajiban, modal, totalAset, totalKewajiban, totalModal }
  })

  // Neraca Lajur (Worksheet)
  const worksheet = computed(() => {
    const balances = calculateBalances()
    const rows = []

    let totalSaldoDebit = 0
    let totalSaldoKredit = 0
    let totalLrDebit = 0
    let totalLrKredit = 0
    let totalNeracaDebit = 0
    let totalNeracaKredit = 0

    Object.values(balances).forEach(b => {
      const account = b.account
      const net = b.debit - b.credit
      const saldoDebit = net > 0 ? net : 0
      const saldoKredit = net < 0 ? -net : 0

      let lrDebit = 0
      let lrKredit = 0
      let neracaDebit = 0
      let neracaKredit = 0

      if (account.type === 'Pendapatan' || account.type === 'Beban') {
        lrDebit = saldoDebit
        lrKredit = saldoKredit
      } else if (account.type === 'Aset' || account.type === 'Kewajiban' || account.type === 'Modal') {
        neracaDebit = saldoDebit
        neracaKredit = saldoKredit
      }

      rows.push({
        id: account.id,
        name: account.name,
        saldoDebit,
        saldoKredit,
        lrDebit,
        lrKredit,
        neracaDebit,
        neracaKredit
      })

      totalSaldoDebit += saldoDebit
      totalSaldoKredit += saldoKredit
      totalLrDebit += lrDebit
      totalLrKredit += lrKredit
      totalNeracaDebit += neracaDebit
      totalNeracaKredit += neracaKredit
    })

    return {
      rows,
      totalSaldoDebit,
      totalSaldoKredit,
      totalLrDebit,
      totalLrKredit,
      totalNeracaDebit,
      totalNeracaKredit
    }
  })

  return {
    trialBalance,
    bukuBesar,
    labaRugi,
    neraca,
    worksheet
  }
}
