import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 👈 Aquí importamos el router

const app = createApp(App)
app.use(router) // 👈 Registramos Vue Router
app.mount('#app') // Montamos la app
