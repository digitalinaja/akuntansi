import axios from 'axios'

const authApi = axios.create({
  baseURL: '/api/auth',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const authApiEndpoints = {
  register: async (userData) => {
    const response = await authApi.post('/register', userData)
    return response.data
  },

  login: async (credentials) => {
    const response = await authApi.post('/login', credentials)
    return response.data
  },

  refreshToken: async () => {
    const token = localStorage.getItem('refreshToken')
    const response = await authApi.post('/refresh', { token })
    return response.data
  },

  me: async () => {
    const response = await axios.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.data
  }
}

export default authApiEndpoints
