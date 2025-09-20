import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DiscoverView from '../views/DiscoverView.vue'
import ProfileView from '../views/ProfileView.vue'
import DashboardView from '../views/DashboardView.vue'
import MatchesView from '../views/MatchesView.vue' // ← add this

import { authReady, getCurrentUser } from '../firebase'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/signup', name: 'signup', component: SignupView },
  { path: '/discover', name: 'discover', component: DiscoverView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/matches', name: 'matches', component: MatchesView, meta: { requiresAuth: true} }
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
