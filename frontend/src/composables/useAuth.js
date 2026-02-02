import { ref, computed } from 'vue'
import { authApiEndpoints } from '../api/auth-api'
import { useRouter } from 'vue-router'

const user = ref(null)
const token = ref(localStorage.getItem('token') || null)
const loading = ref(false)
const error = ref(null)

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const checkAuth = async () => {
    if (!token.value) {
      user.value = null
      return false
    }

    try {
      const data = await authApiEndpoints.me()
      user.value = data.user
      return true
    } catch (err) {
      logout()
      return false
    }
  }

  const register = async (userData) => {
    loading.value = true
    error.value = null
    try {
      const data = await authApiEndpoints.register(userData)
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      router.push('/transactions')
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    loading.value = true
    error.value = null
    try {
      const data = await authApiEndpoints.login(credentials)
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      router.push('/transactions')
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    router.push('/login')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    checkAuth,
    register,
    login,
    logout
  }
}
