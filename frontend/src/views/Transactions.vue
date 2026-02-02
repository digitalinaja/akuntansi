<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Transaksi Harian</h1>

    <!-- Transaction Form -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Input Transaksi Baru</h2>
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input v-model="form.date" type="date" required class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Referensi</label>
          <input v-model="form.reference" type="text" class="input" placeholder="Contoh: INV-001" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <input v-model="form.description" type="text" required class="input" placeholder="Deskripsi transaksi" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Akun Debit</label>
          <select v-model="form.debitAccountId" required class="input">
            <option value="">Pilih Akun Debit</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.id }} - {{ account.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Akun Kredit</label>
          <select v-model="form.creditAccountId" required class="input">
            <option value="">Pilih Akun Kredit</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.id }} - {{ account.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
          <input v-model.number="form.amount" type="number" min="0" step="0.01" required class="input" placeholder="0.00" />
        </div>

        <div class="md:col-span-2">
          <button type="submit" :disabled="loading" class="btn btn-primary disabled:opacity-50">
            <span v-if="loading">Loading...</span>
            <span v-else>+ Simpan Transaksi</span>
          </button>
        </div>
      </form>

      <div v-if="formError" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
        {{ formError }}
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="card">
      <h2 class="text-lg font-semibold mb-4">Transaksi Terakhir</h2>

      <div v-if="journalsLoading" class="text-center py-8">
        <p class="text-gray-500">Loading...</p>
      </div>

      <div v-else-if="recentJournals.length === 0" class="text-center py-8 text-gray-500">
        Belum ada transaksi.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Ref</th>
              <th>Deskripsi</th>
              <th>Akun Debit</th>
              <th>Akun Kredit</th>
              <th class="text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="journal in recentJournals" :key="journal.id">
              <td>{{ formatShortDate(journal.date) }}</td>
              <td>{{ journal.reference || '-' }}</td>
              <td>{{ journal.description }}</td>
              <td>{{ getAccountName(journal.debit[0]?.account) }}</td>
              <td>{{ getAccountName(journal.credit[0]?.account) }}</td>
              <td class="text-right">{{ formatNumber(journal.debit[0]?.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccounts } from '../composables/useAccounts'
import { useJournals } from '../composables/useJournals'
import { formatNumber, formatShortDate } from '../utils/format'

const { accounts, fetchAccounts } = useAccounts()
const { journals, loading: journalsLoading, fetchJournals, addJournal } = useJournals()

const loading = ref(false)
const formError = ref(null)

const form = ref({
  date: new Date().toISOString().split('T')[0],
  reference: '',
  description: '',
  debitAccountId: '',
  creditAccountId: '',
  amount: ''
})

// Get last 20 journals in reverse order
const recentJournals = computed(() => {
  return [...journals.value].reverse().slice(0, 20)
})

onMounted(async () => {
  await fetchAccounts()
  await fetchJournals()
})

const getAccountName = (accountId) => {
  if (!accountId) return '-'
  const account = accounts.value.find(a => a.id === accountId)
  return account ? `${account.id} - ${account.name}` : accountId
}

const handleSubmit = async () => {
  formError.value = null

  // Validation
  if (form.value.debitAccountId === form.value.creditAccountId) {
    formError.value = 'Akun debit dan kredit tidak boleh sama'
    return
  }

  if (!form.value.amount || form.value.amount <= 0) {
    formError.value = 'Jumlah harus lebih dari 0'
    return
  }

  loading.value = true
  try {
    await addJournal({
      date: form.value.date,
      description: form.value.description,
      reference: form.value.reference,
      debitAccountId: form.value.debitAccountId,
      creditAccountId: form.value.creditAccountId,
      amount: form.value.amount
    })

    // Reset form
    form.value = {
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      debitAccountId: '',
      creditAccountId: '',
      amount: ''
    }
  } catch (err) {
    formError.value = err.message || 'Gagal menyimpan transaksi'
  } finally {
    loading.value = false
  }
}
</script>
