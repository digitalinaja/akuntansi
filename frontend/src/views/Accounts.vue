<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Daftar Akun</h1>
      <button @click="showAddModal = true" class="btn btn-primary">
        + Tambah Akun
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      {{ error }}
    </div>

    <div v-else class="card overflow-hidden">
      <table class="table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Tipe</th>
            <th>Saldo Normal</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id">
            <td class="font-medium">{{ account.id }}</td>
            <td>{{ account.name }}</td>
            <td>
              <span :class="getAccountTypeClass(account.type)" class="px-2 py-1 rounded-full text-xs">
                {{ account.type }}
              </span>
            </td>
            <td>{{ account.normalBalance }}</td>
            <td class="text-right">
              <button
                @click="openEditModal(account)"
                class="text-primary-600 hover:text-primary-700 mr-3"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(account)"
                class="text-red-600 hover:text-red-700"
              >
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="accounts.length === 0" class="text-center py-8 text-gray-500">
        Belum ada akun. Silakan tambah akun baru.
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold mb-4">
          {{ showEditModal ? 'Edit Akun' : 'Tambah Akun' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kode Akun</label>
            <input
              v-model="form.id"
              type="text"
              required
              class="input"
              :readonly="showEditModal"
              placeholder="Contoh: 101"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Nama akun"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select v-model="form.type" required class="input">
              <option value="">Pilih tipe</option>
              <option value="Aset">Aset</option>
              <option value="Kewajiban">Kewajiban</option>
              <option value="Modal">Modal</option>
              <option value="Pendapatan">Pendapatan</option>
              <option value="Beban">Beban</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Saldo Normal</label>
            <select v-model="form.normalBalance" required class="input">
              <option value="">Pilih saldo normal</option>
              <option value="Debit">Debit</option>
              <option value="Kredit">Kredit</option>
            </select>
          </div>

          <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {{ formError }}
          </div>

          <div class="flex space-x-3">
            <button type="submit" :disabled="formLoading" class="flex-1 btn btn-primary">
              <span v-if="formLoading">Loading...</span>
              <span v-else>Simpan</span>
            </button>
            <button type="button" @click="closeModal" class="flex-1 btn btn-secondary">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 class="text-xl font-bold mb-4">Hapus Akun</h2>
        <p class="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus akun "{{ accountToDelete?.name }}"?
        </p>
        <div class="flex space-x-3">
          <button @click="handleDelete" :disabled="deleteLoading" class="flex-1 btn btn-danger">
            <span v-if="deleteLoading">Loading...</span>
            <span v-else>Ya, Hapus</span>
          </button>
          <button @click="showDeleteModal = false" class="flex-1 btn btn-secondary">
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAccounts } from '../composables/useAccounts'

const { accounts, loading, error, fetchAccounts, addAccount, updateAccount, deleteAccount } = useAccounts()

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const formLoading = ref(false)
const deleteLoading = ref(false)
const formError = ref(null)
const accountToDelete = ref(null)

const form = ref({
  id: '',
  name: '',
  type: '',
  normalBalance: ''
})

onMounted(() => {
  fetchAccounts()
})

const getAccountTypeClass = (type) => {
  const classes = {
    'Aset': 'bg-blue-100 text-blue-800',
    'Kewajiban': 'bg-red-100 text-red-800',
    'Modal': 'bg-purple-100 text-purple-800',
    'Pendapatan': 'bg-green-100 text-green-800',
    'Beban': 'bg-yellow-100 text-yellow-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const openEditModal = (account) => {
  form.value = { ...account }
  showEditModal.value = true
  formError.value = null
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  form.value = { id: '', name: '', type: '', normalBalance: '' }
  formError.value = null
}

const handleSubmit = async () => {
  formLoading.value = true
  formError.value = null

  try {
    if (showEditModal.value) {
      const { id, ...updates } = form.value
      await updateAccount(id, updates)
    } else {
      await addAccount(form.value)
    }
    closeModal()
  } catch (err) {
    formError.value = err.message || 'Terjadi kesalahan'
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = (account) => {
  accountToDelete.value = account
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!accountToDelete.value) return

  deleteLoading.value = true
  try {
    await deleteAccount(accountToDelete.value.id)
    showDeleteModal.value = false
    accountToDelete.value = null
  } catch (err) {
    alert('Gagal menghapus akun: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    deleteLoading.value = false
  }
}
</script>
