import { createRouter, createWebHistory } from 'vue-router'

// Importamos nuestras vistas
import HomeView from '@/views/screens/mensajes/MessageMassive.vue'

// Lista de rutas
const routes = [
  {
    path: '/message', // URL raíz
    name: 'message',
    component: HomeView,
  },
//   {
//     path: '/vacaciones',
//     name: 'vacaciones',
//     component: VacacionesView,
//   },
]

// Creamos el router
const router = createRouter({
  history: createWebHistory(), // usa el modo historia en navegador
  routes, // nuestra lista de rutas
})

export default router
