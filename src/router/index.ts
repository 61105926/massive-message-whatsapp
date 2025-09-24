import { createRouter, createWebHistory } from 'vue-router'

// Importamos nuestras vistas
import HomeView from '@/views/screens/mensajes/MessageMassive.vue'
import WorkClimate from '@/views/screens/clima/WorkClimate.vue'
import AdminDashboard from '@/views/screens/admin/Dashboard.vue'
import BulkMessages from '@/views/screens/admin/BulkMessages.vue'
import MassPayslips from '@/views/screens/admin/MassPayslips.vue'

// Lista de rutas
const routes = [
  {
    path: '/',
    redirect: '/admin/dashboard'
  },
  {
    path: '/message',
    name: 'message',
    component: HomeView,
  },
  {
    path: '/clima',
    name: 'clima',
    component: WorkClimate,
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
  },
  {
    path: '/admin/bulk-messages',
    name: 'admin-bulk-messages',
    component: BulkMessages,
  },
  {
    path: '/admin/mass-payslips',
    name: 'admin-mass-payslips',
    component: MassPayslips,
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
