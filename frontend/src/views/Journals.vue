<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Jurnal Umum</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading...</p>
    </div>

    <div v-else-if="journals.length === 0" class="card text-center py-8">
      <p class="text-gray-500">Belum ada transaksi.</p>
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Ref</th>
            <th>Deskripsi</th>
            <th>Akun</th>
            <th class="text-right">Debit</th>
            <th class="text-right">Kredit</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="journal in journals" :key="journal.id">
            <tr v-for="(line, index) in getJournalLines(journal)" :key="`${journal.id}-${index}`">
              <td>{{ index === 0 ? formatShortDate(journal.date) : '' }}</td>
              <td>{{ index === 0 ? (journal.reference || '-') : '' }}</td>
              <td>{{ index === 0 ? journal.description : '' }}</td>
              <td>{{ line.account }}</td>
              <td class="text-right">{{ line.debit ? formatNumber(line.debit) : '' }}</td>
              <td class="text-right">{{ line.credit ? formatNumber(line.credit) : '' }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useJournals } from '../composables/useJournals'
import { useAccounts } from '../composables/useAccounts'
import { formatNumber, formatShortDate } from '../utils/format'

const { journals, loading, fetchJournals } = useJournals()
const { accounts } = useAccounts()

onMounted(() => {
  fetchJournals()
})

const getJournalLines = (journal) => {
  const lines = []
  const maxLines = Math.max(journal.debit.length, journal.credit.length)

  for (let i = 0; i < maxLines; i++) {
    const debit = journal.debit[i]
    const credit = journal.credit[i]

    const accountText = []
    let debitAmount = null
    let creditAmount = null

    if (debit) {
      const acc = accounts.value.find(a => a.id === debit.account)
      accountText.push(acc ? `${acc.id} - ${acc.name}` : debit.account)
      debitAmount = debit.amount
    }

    if (credit) {
      const acc = accounts.value.find(a => a.id === credit.account)
      accountText.push(acc ? `${acc.id} - ${acc.name}` : credit.account)
      creditAmount = credit.amount
    }

    lines.push({
      account: accountText.join(' / '),
      debit: debitAmount,
      credit: creditAmount
    })
  }

  return lines
}
</script>
