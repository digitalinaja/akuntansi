import { ref } from 'vue'

// Shared state for journals
const journals = ref([])
const loading = ref(false)
const error = ref(null)

export function useJournalsStore() {
  const setJournals = (data) => {
    journals.value = data
  }

  const setLoading = (value) => {
    loading.value = value
  }

  const setError = (err) => {
    error.value = err
  }

  return {
    journals,
    loading,
    error,
    setJournals,
    setLoading,
    setError
  }
}
