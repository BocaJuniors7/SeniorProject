import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initFirebaseAuthListener } from './firebase'  // ← import

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Start auth listener only after Pinia exists
initFirebaseAuthListener()

app.mount('#app')
