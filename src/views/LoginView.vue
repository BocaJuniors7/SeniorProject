<template>
  <section>
    <h1>Login</h1>
    <p>Use Google Sign-In (that's what I use)</p>
    <button @click="signInWithGoogle">Sign in with Google</button>

    <h2 style="margin-top: 1rem;">Email/password</h2>
    <form @submit.prevent="emailPasswordLogin">
      <input v-model="email" type="email" placeholder="email" required />
      <input v-model="password" type="password" placeholder="password" required />
      <button type="submit">Sign in</button>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { signInWithGooglePopup, signInWithEmailPassword } from '../firebase'

const email = ref('')
const password = ref('')

const signInWithGoogle = async () => {
  await signInWithGooglePopup()
}

const emailPasswordLogin = async () => {
  await signInWithEmailPassword(email.value, password.value)
}
</script>
