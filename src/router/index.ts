import { createRouter, createWebHistory } from 'vue-router'

// Importamos nuestras vistas
import MessageMassive from '@/views/screens/mensajes/MessageMassive.vue'
import WorkClimate from '@/views/screens/clima/WorkClimate.vue'
import VacationRequest from '@/views/screens/vacaciones/VacationRequest.vue'
import AdminDashboard from '@/views/screens/admin/Dashboard.vue'
import MassPayslips from '@/views/screens/admin/MassPayslips.vue'

// Lista de rutas
const routes = [
  {
    path: '/',
    redirect: '/admin/dashboard'
  },
  {
    path: '/mensajes/massive',
    name: 'mensajes-massive',
    component: MessageMassive,
  },
  {
    path: '/clima',
    name: 'clima',
    component: WorkClimate,
  },
  {
    path: '/vacaciones',
    name: 'vacaciones',
    component: VacationRequest,
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
  },
  {
    path: '/admin/mass-payslips',
    name: 'admin-mass-payslips',
    component: MassPayslips,
  }
]

// Creamos el router
const router = createRouter({
  history: createWebHistory(), // usa el modo historia en navegador
  routes, // nuestra lista de rutas
})

export default router
