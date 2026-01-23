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

const authStore = useAuthStore(pinia)
authStore.initAuth()

app.mount('#app')
