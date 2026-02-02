<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Trial Balance</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading...</p>
    </div>

    <div v-else class="card">
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Akun</th>
              <th class="text-right">Saldo Debit</th>
              <th class="text-right">Saldo Kredit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in trialBalance.rows" :key="row.id">
              <td>{{ row.id }} - {{ row.name }}</td>
              <td class="text-right">{{ row.debit ? formatNumber(row.debit) : '' }}</td>
              <td class="text-right">{{ row.credit ? formatNumber(row.credit) : '' }}</td>
            </tr>
          </tbody>
          <tfoot :class="isBalanced ? 'bg-green-50' : 'bg-red-50'">
            <tr class="font-bold">
              <td>Total</td>
              <td class="text-right">{{ formatNumber(trialBalance.totalDebit) }}</td>
              <td class="text-right">{{ formatNumber(trialBalance.totalCredit) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="mt-4 p-4 rounded-lg" :class="isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
        <p class="font-semibold" :class="isBalanced ? 'text-green-800' : 'text-red-800'">
          {{ isBalanced ? '✓ Neraca Seimbang' : '✗ Neraca Tidak Seimbang' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useReports } from '../composables/useReports'
import { useJournals } from '../composables/useJournals'
import { useAccounts } from '../composables/useAccounts'
import { formatNumber } from '../utils/format'

const { trialBalance } = useReports()
const { loading: journalsLoading, fetchJournals } = useJournals()
const { loading: accountsLoading, fetchAccounts } = useAccounts()

const loading = computed(() => journalsLoading.value || accountsLoading.value)
const isBalanced = computed(() => trialBalance.value.totalDebit === trialBalance.value.totalCredit)

onMounted(async () => {
  await Promise.all([fetchAccounts(), fetchJournals()])
})
</script>
