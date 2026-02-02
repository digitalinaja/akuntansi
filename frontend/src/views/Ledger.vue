<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Buku Besar</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading...</p>
    </div>

    <div v-else-if="ledgerData.length === 0" class="card text-center py-8">
      <p class="text-gray-500">Belum ada transaksi.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="account in ledgerData.filter(a => a.entries.length > 0)" :key="account.account.id" class="card">
        <div class="flex justify-between items-center border-b pb-3 mb-3">
          <h3 class="text-lg font-semibold">{{ account.account.id }} - {{ account.account.name }}</h3>
          <span class="text-sm text-gray-600">
            Saldo akhir: <strong>{{ formatNumber(account.totalDebit - account.totalCredit) }}</strong>
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Ref</th>
                <th>Deskripsi</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Kredit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, index) in account.entries" :key="index">
                <td>{{ formatShortDate(entry.date) }}</td>
                <td>{{ entry.reference || '-' }}</td>
                <td>{{ entry.description }}</td>
                <td class="text-right">{{ entry.debit ? formatNumber(entry.debit) : '' }}</td>
                <td class="text-right">{{ entry.credit ? formatNumber(entry.credit) : '' }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 font-semibold">
              <tr>
                <td colspan="3" class="text-right">Total:</td>
                <td class="text-right">{{ formatNumber(account.totalDebit) }}</td>
                <td class="text-right">{{ formatNumber(account.totalCredit) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useReports } from '../composables/useReports'
import { useJournals } from '../composables/useJournals'
import { useAccounts } from '../composables/useAccounts'
import { formatNumber, formatShortDate } from '../utils/format'

const { bukuBesar } = useReports()
const { loading: journalsLoading, fetchJournals } = useJournals()
const { loading: accountsLoading, fetchAccounts } = useAccounts()

const loading = computed(() => journalsLoading.value || accountsLoading.value)
const ledgerData = computed(() => bukuBesar.value)

onMounted(async () => {
  await Promise.all([fetchAccounts(), fetchJournals()])
})
</script>
