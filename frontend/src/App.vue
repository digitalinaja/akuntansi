<template>
  <div id="app" class="min-h-screen flex flex-col">
    <Navbar v-if="isAuthenticated" />
    <main class="flex-1 container mx-auto px-4 py-6">
      <RouterView />
    </main>
    <Footer v-if="isAuthenticated" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'

const { isAuthenticated, checkAuth } = useAuth()

onMounted(() => {
  checkAuth()
})
</script>
