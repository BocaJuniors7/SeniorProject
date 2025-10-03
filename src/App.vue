<template>
  <div>
    <NavBar />
    <main class="container" style="max-width: 860px; margin: 1rem auto; padding: 0 1rem;">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style>
/* not scoped! */
[v-cloak] { display: none !important; }
</style>
