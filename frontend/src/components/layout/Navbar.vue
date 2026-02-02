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
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

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
</script>
