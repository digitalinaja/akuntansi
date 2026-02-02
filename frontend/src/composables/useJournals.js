import { journalsApi } from '../api/storage-api'
import { useJournalsStore } from '../stores/journalsStore'

export function useJournals() {
  const { journals, loading, error, setJournals, setLoading, setError } = useJournalsStore()

  const fetchJournals = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await journalsApi.getAll()
      setJournals(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch journals')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addJournal = async (journalData) => {
    setLoading(true)
    setError(null)
    try {
      await journalsApi.create(journalData)
      await fetchJournals()
    } catch (err) {
      setError(err.response?.data || 'Failed to create journal')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteJournal = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await journalsApi.delete(id)
      await fetchJournals()
    } catch (err) {
      setError(err.response?.data || 'Failed to delete journal')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    journals,
    loading,
    error,
    fetchJournals,
    addJournal,
    deleteJournal
  }
}
