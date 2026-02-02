import { ref } from 'vue'

// Shared state for accounts
const accounts = ref([])
const loading = ref(false)
const error = ref(null)

export function useAccountsStore() {
  const setAccounts = (data) => {
    accounts.value = data
  }

  const setLoading = (value) => {
    loading.value = value
  }

  const setError = (err) => {
    error.value = err
  }

  return {
    accounts,
    loading,
    error,
    setAccounts,
    setLoading,
    setError
  }
}
