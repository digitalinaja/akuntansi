import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    redirect: '/transactions'
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('../views/Transactions.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('../views/Accounts.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/journals',
    name: 'journals',
    component: () => import('../views/Journals.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ledger',
    name: 'ledger',
    component: () => import('../views/Ledger.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trial-balance',
    name: 'trial-balance',
    component: () => import('../views/TrialBalance.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/worksheet',
    name: 'worksheet',
    component: () => import('../views/Worksheet.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/Reports.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/transactions'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    next('/transactions')
  } else {
    next()
  }
})

export default router
