import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vueform from '@vueform/vueform'

import App from './App.vue'
import router from './router'
import vueformConfig from '../vueform.config'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vueform, vueformConfig)

// Initialiser l'auth AVANT de monter l'application
const authStore = useAuthStore(pinia)
authStore.initAuth().finally(() => {
  app.mount('#app')
})
