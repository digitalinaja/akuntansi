<template>
  <nav class="bg-primary-600 text-white shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <!-- Logo/Brand -->
        <router-link to="/transactions" class="text-xl font-bold hover:text-primary-100">
          Aplikasi Akuntansi
        </router-link>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-1">
          <router-link
            v-for="item in menuItems"
            :key="item.name"
            :to="item.to"
            class="px-3 py-2 rounded-md hover:bg-primary-700 transition-colors"
            active-class="bg-primary-800"
          >
            {{ item.label }}
          </router-link>
        </div>

        <!-- User Menu & Mobile Toggle -->
        <div class="flex items-center space-x-4">
          <span class="hidden sm:block text-sm">{{ user?.name || 'User' }}</span>

          <!-- Export/Import buttons (desktop) -->
          <div class="hidden sm:flex items-center space-x-2">
            <button
              @click="handleExport"
              class="px-3 py-1.5 text-sm bg-primary-700 hover:bg-primary-800 rounded-md transition-colors"
              title="Export Data"
            >
              <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <label class="px-3 py-1.5 text-sm bg-primary-700 hover:bg-primary-800 rounded-md transition-colors cursor-pointer" title="Import Data">
              <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
              <input type="file" accept="application/json" class="hidden" @change="handleImport" />
            </label>
          </div>

          <!-- Logout -->
          <button
            @click="handleLogout"
            class="px-3 py-1.5 text-sm bg-primary-700 hover:bg-primary-800 rounded-md transition-colors"
          >
            Logout
          </button>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-md hover:bg-primary-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4">
        <router-link
          v-for="item in menuItems"
          :key="item.name"
          :to="item.to"
          class="block px-3 py-2 rounded-md hover:bg-primary-700 transition-colors"
          active-class="bg-primary-800"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </router-link>

        <!-- Mobile Export/Import buttons -->
        <div class="border-t border-primary-500 mt-2 pt-2 space-y-2">
          <button
            @click="handleExport"
            class="w-full text-left px-3 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Data
          </button>
          <label class="w-full block px-3 py-2 rounded-md hover:bg-primary-700 transition-colors cursor-pointer">
            <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Data
            <input type="file" accept="application/json" class="hidden" @change="handleImport" />
          </label>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { dataApi } from '../../api/storage-api'

const { user, logout } = useAuth()
const router = useRouter()
const mobileMenuOpen = ref(false)

const menuItems = [
  { name: 'transactions', label: 'Transaksi', to: '/transactions' },
  { name: 'accounts', label: 'Akun', to: '/accounts' },
  { name: 'journals', label: 'Jurnal', to: '/journals' },
  { name: 'ledger', label: 'Buku Besar', to: '/ledger' },
  { name: 'trial-balance', label: 'Trial Balance', to: '/trial-balance' },
  { name: 'worksheet', label: 'Neraca Lajur', to: '/worksheet' },
  { name: 'reports', label: 'Laporan', to: '/reports' }
]

const handleLogout = () => {
  logout()
}

const handleExport = async () => {
  try {
    const data = await dataApi.export()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-accounting-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    alert('Data berhasil di-export!')
  } catch (err) {
    console.error(err)
    alert('Gagal melakukan export data.')
  }
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result)
      await dataApi.import(data)
      alert('Data berhasil di-import. Halaman akan dimuat ulang.')
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('Gagal meng-import data. Pastikan format file benar.')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>
