<template>
  <footer class="bg-gray-800 text-gray-300 py-6 mt-auto">
    <div class="container mx-auto px-4 text-center">
      <p class="text-sm">
        &copy; {{ currentYear }} Aplikasi Akuntansi (Vue + Express)
      </p>
      <p class="text-xs mt-1 text-gray-500">
        Built with Vue 3, Vite, Tailwind CSS, and Express
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
