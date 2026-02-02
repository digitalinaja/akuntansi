<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Neraca Lajur / Kertas Kerja</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading...</p>
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Akun</th>
            <th class="text-right">Saldo Debit</th>
            <th class="text-right">Saldo Kredit</th>
            <th class="text-right">Laba Rugi Debit</th>
            <th class="text-right">Laba Rugi Kredit</th>
            <th class="text-right">Neraca Debit</th>
            <th class="text-right">Neraca Kredit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in worksheet.rows" :key="row.id">
            <td>{{ row.id }} - {{ row.name }}</td>
            <td class="text-right">{{ row.saldoDebit ? formatNumber(row.saldoDebit) : '' }}</td>
            <td class="text-right">{{ row.saldoKredit ? formatNumber(row.saldoKredit) : '' }}</td>
            <td class="text-right">{{ row.lrDebit ? formatNumber(row.lrDebit) : '' }}</td>
            <td class="text-right">{{ row.lrKredit ? formatNumber(row.lrKredit) : '' }}</td>
            <td class="text-right">{{ row.neracaDebit ? formatNumber(row.neracaDebit) : '' }}</td>
            <td class="text-right">{{ row.neracaKredit ? formatNumber(row.neracaKredit) : '' }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 font-semibold">
          <tr>
            <td>Jumlah</td>
            <td class="text-right">{{ formatNumber(worksheet.totalSaldoDebit) }}</td>
            <td class="text-right">{{ formatNumber(worksheet.totalSaldoKredit) }}</td>
            <td class="text-right">{{ formatNumber(worksheet.totalLrDebit) }}</td>
            <td class="text-right">{{ formatNumber(worksheet.totalLrKredit) }}</td>
            <td class="text-right">{{ formatNumber(worksheet.totalNeracaDebit) }}</td>
            <td class="text-right">{{ formatNumber(worksheet.totalNeracaKredit) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useReports } from '../composables/useReports'
import { useJournals } from '../composables/useJournals'
import { useAccounts } from '../composables/useAccounts'
import { formatNumber } from '../utils/format'

const { worksheet } = useReports()
const { loading: journalsLoading, fetchJournals } = useJournals()
const { loading: accountsLoading, fetchAccounts } = useAccounts()

const loading = computed(() => journalsLoading.value || accountsLoading.value)

onMounted(async () => {
  await Promise.all([fetchAccounts(), fetchJournals()])
})
</script>
