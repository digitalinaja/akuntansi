import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Accounts API
export const accountsApi = {
  getAll: async () => {
    const response = await api.get('/accounts')
    return response.data
  },

  create: async (account) => {
    const response = await api.post('/accounts', account)
    return response.data
  },

  update: async (id, updates) => {
    const response = await api.put(`/accounts/${id}`, updates)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/accounts/${id}`)
    return response.data
  }
}

// Journals API
export const journalsApi = {
  getAll: async () => {
    const response = await api.get('/journals')
    return response.data
  },

  getNextId: async () => {
    const response = await api.get('/journals/next-id')
    return response.data.nextId
  },

  create: async (journal) => {
    const response = await api.post('/journals', journal)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/journals/${id}`)
    return response.data
  }
}

// Export/Import API
export const dataApi = {
  export: async () => {
    const response = await api.get('/export')
    return response.data
  },

  import: async (data) => {
    const response = await api.post('/import', data)
    return response.data
  }
}

export default api
