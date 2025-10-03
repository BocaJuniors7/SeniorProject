// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DiscoverView from '../views/DiscoverView.vue'
import ProfileView from '../views/ProfileView.vue'
import DashboardView from '../views/DashboardView.vue'
import MatchesView from '../views/MatchesView.vue'
import MessagesView from '../views/MessagesView.vue'

import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/signup', name: 'signup', component: SignupView },
  { path: '/discover', name: 'discover', component: DiscoverView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/matches', name: 'matches', component: MatchesView, meta: { requiresAuth: true } },
  { path: '/messages', name: 'messages', component: MessagesView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// fresh check every time (fast when currentUser is already known)
function getCurrentUser() {
  return new Promise((resolve) => {
    // Fast path: Firebase already knows
    if (auth.currentUser !== null) return resolve(auth.currentUser)

    // Otherwise wait once for the initial auth state
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub()
      resolve(u)
    })
  })
}

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  const user = await getCurrentUser()
  if (user) return true
  // choose where you want to send them:
  // return { name: 'login', query: { redirect: to.fullPath } }
  return { name: 'home' }
})

export default router
