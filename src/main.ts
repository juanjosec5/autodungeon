import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { inject } from '@vercel/analytics'
import './style.css'
import App from './App.vue'
import router from './router/index'

inject()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
