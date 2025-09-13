<template>
  <header style="border-bottom:1px solid #eee;">
    <nav class="container" style="max-width:860px; margin:0 auto; padding: .75rem 1rem; display:flex; gap:1rem; align-items:center; justify-content:space-between;">
      <div style="display:flex; gap:1rem; align-items:center;">
        <router-link to="/">Home</router-link>
        <router-link to="/dashboard">Dashboard</router-link>
      </div>
      <div>
        <template v-if="user">
          <span style="margin-right:.5rem;">{{ user.email }}</span>
          <button @click="logout">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'
import { signOutFirebase } from '../firebase'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const logout = async () => {
  await signOutFirebase()
}
</script>
