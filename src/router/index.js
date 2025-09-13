import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import { authReady, getCurrentUser } from '../firebase'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Simple auth guard that waits until Firebase resolves initial auth state
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  await authReady
  const user = getCurrentUser()
  if (user) return true
  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
