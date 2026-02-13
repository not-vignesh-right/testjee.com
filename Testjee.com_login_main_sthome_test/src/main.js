import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

import { useAuthStore } from './stores/authStore'  // ✅ IMPORTANT: import it

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// ⭐ Now that Pinia is active, we can safely use useAuthStore()
const auth = useAuthStore()

// ⭐ Wait for session BEFORE mounting the app
auth.loadSession().then(() => {
  app.use(router)
  app.mount('#app')
})