<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Laporan Keuangan</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading...</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Laba Rugi -->
      <div class="card">
        <h2 class="text-lg font-bold mb-4">Laporan Laba Rugi</h2>

        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Kelompok</th>
                <th>Akun</th>
                <th class="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in labaRugi.pendapatan" :key="p.account.id">
                <td>Pendapatan</td>
                <td>{{ p.account.id }} - {{ p.account.name }}</td>
                <td class="text-right">{{ formatNumber(p.amount) }}</td>
              </tr>
              <tr v-for="b in labaRugi.beban" :key="b.account.id">
                <td>Beban</td>
                <td>{{ b.account.id }} - {{ b.account.name }}</td>
                <td class="text-right">{{ formatNumber(b.amount) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 font-bold">
              <tr>
                <td colspan="2">Laba/Rugi Bersih</td>
                <td class="text-right" :class="labaRugi.labaRugiBersih >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatNumber(Math.abs(labaRugi.labaRugiBersih)) }}
                  {{ labaRugi.labaRugiBersih >= 0 ? '(Laba)' : '(Rugi)' }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="mt-4 pt-4 border-t">
          <div class="flex justify-between text-sm">
            <span>Total Pendapatan:</span>
            <span class="font-semibold">{{ formatNumber(labaRugi.totalPendapatan) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Total Beban:</span>
            <span class="font-semibold text-red-600">({{ formatNumber(labaRugi.totalBeban) }})</span>
          </div>
          <div class="flex justify-between text-lg font-bold mt-2">
            <span>Laba/Rugi Bersih:</span>
            <span :class="labaRugi.labaRugiBersih >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatNumber(Math.abs(labaRugi.labaRugiBersih)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Neraca -->
      <div class="card">
        <h2 class="text-lg font-bold mb-4">Neraca (Balance Sheet)</h2>

        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Kelompok</th>
                <th>Akun</th>
                <th class="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in neraca.aset" :key="a.account.id">
                <td>Aset</td>
                <td>{{ a.account.id }} - {{ a.account.name }}</td>
                <td class="text-right">{{ formatNumber(a.amount) }}</td>
              </tr>
              <tr v-for="k in neraca.kewajiban" :key="k.account.id">
                <td>Kewajiban</td>
                <td>{{ k.account.id }} - {{ k.account.name }}</td>
                <td class="text-right">{{ formatNumber(k.amount) }}</td>
              </tr>
              <tr v-for="m in neraca.modal" :key="m.account.id">
                <td>Modal</td>
                <td>{{ m.account.id }} - {{ m.account.name }}</td>
                <td class="text-right">{{ formatNumber(m.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 pt-4 border-t space-y-2">
          <div class="flex justify-between">
            <span class="font-semibold">Total Aset:</span>
            <span class="font-bold">{{ formatNumber(neraca.totalAset) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Total Kewajiban:</span>
            <span class="font-bold text-red-600">({{ formatNumber(neraca.totalKewajiban) }})</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Total Modal:</span>
            <span class="font-bold">{{ formatNumber(neraca.totalModal) }}</span>
          </div>
          <hr>
          <div class="flex justify-between text-lg">
            <span class="font-semibold">Total Kewajiban + Modal:</span>
            <span class="font-bold">{{ formatNumber(neraca.totalKewajiban + neraca.totalModal) }}</span>
          </div>
          <div class="mt-2 p-3 rounded-lg text-center font-bold text-lg"
               :class="isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
            {{ isBalanced ? '✓ Neraca Seimbang' : '✗ Neraca Tidak Seimbang' }}
          </div>
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
import { formatNumber } from '../utils/format'

const { labaRugi, neraca } = useReports()
const { loading: journalsLoading, fetchJournals } = useJournals()
const { loading: accountsLoading, fetchAccounts } = useAccounts()

const loading = computed(() => journalsLoading.value || accountsLoading.value)
const isBalanced = computed(() => neraca.value.totalAset === (neraca.value.totalKewajiban + neraca.value.totalModal))

onMounted(async () => {
  await Promise.all([fetchAccounts(), fetchJournals()])
})
</script>
