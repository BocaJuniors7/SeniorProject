import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initFirebaseAuthListener } from './firebase'  // ← import
import { initNotifications } from './services/notifications'  // ← import notifications

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Start auth listener only after Pinia exists
initFirebaseAuthListener()

// Initialize notifications (will auto-start when user logs in)
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
onAuthStateChanged(auth, (user) => {
  if (user) {
    initNotifications(user.uid)
  }
})

app.mount('#app')
