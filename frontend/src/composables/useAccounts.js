import { accountsApi } from '../api/storage-api'
import { useAccountsStore } from '../stores/accountsStore'

export function useAccounts() {
  const { accounts, loading, error, setAccounts, setLoading, setError } = useAccountsStore()

  const fetchAccounts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await accountsApi.getAll()
      setAccounts(data)

      // Seed default accounts if none exist
      if (data.length === 0) {
        await seedDefaultAccounts()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch accounts')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const seedDefaultAccounts = async () => {
    const defaults = [
      { id: '101', name: 'Kas', type: 'Aset', normalBalance: 'Debit' },
      { id: '102', name: 'Bank', type: 'Aset', normalBalance: 'Debit' },
      { id: '201', name: 'Hutang Usaha', type: 'Kewajiban', normalBalance: 'Kredit' },
      { id: '301', name: 'Modal Pemilik', type: 'Modal', normalBalance: 'Kredit' },
      { id: '401', name: 'Pendapatan Penjualan', type: 'Pendapatan', normalBalance: 'Kredit' },
      { id: '501', name: 'Beban Gaji', type: 'Beban', normalBalance: 'Debit' },
      { id: '502', name: 'Beban Sewa', type: 'Beban', normalBalance: 'Debit' }
    ]

    for (const account of defaults) {
      try {
        await accountsApi.create(account)
      } catch (err) {
        // Ignore duplicate errors
      }
    }

    await fetchAccounts()
  }

  const addAccount = async (accountData) => {
    setLoading(true)
    setError(null)
    try {
      await accountsApi.create(accountData)
      await fetchAccounts()
    } catch (err) {
      setError(err.response?.data || 'Failed to create account')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateAccount = async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      await accountsApi.update(id, updates)
      await fetchAccounts()
    } catch (err) {
      setError(err.response?.data || 'Failed to update account')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await accountsApi.delete(id)
      await fetchAccounts()
    } catch (err) {
      setError(err.response?.data || 'Failed to delete account')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getAccountById = (id) => {
    return accounts.value.find(a => a.id === id) || null
  }

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById
  }
}
