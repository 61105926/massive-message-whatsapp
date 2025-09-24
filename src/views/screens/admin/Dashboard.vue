<template>
  <div class="min-h-screen">
    <!-- Corporate Header -->
    <div class="bg-white border-b-4 border-yellow-400 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="mr-4">
              <div class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <BarChart3 class="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-blue-900">Dashboard Ejecutivo</h1>
              <p class="text-gray-600 mt-1">Sistema ERP - MINOIL S.A.</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-semibold">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span class="text-sm">Sistema Operativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <!-- ERP Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <router-link
          to="/admin/mass-payslips"
          class="bg-white border-l-4 border-blue-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
              <span class="text-blue-900 text-xl font-bold">📄</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-blue-900">Boletas Masivas</h3>
              <p class="text-gray-600">Envío automático</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/admin/bulk-messages"
          class="bg-white border-l-4 border-blue-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
              <span class="text-blue-900 text-xl font-bold">💬</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-blue-900">Comunicaciones</h3>
              <p class="text-gray-600">Mensajes corporativos</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/clima"
          class="bg-white border-l-4 border-blue-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
              <span class="text-blue-900 text-xl font-bold">🌤️</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-blue-900">Clima Laboral</h3>
              <p class="text-gray-600">Encuestas y análisis</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/admin/logs"
          class="bg-white border-l-4 border-blue-900 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
              <span class="text-blue-900 text-xl font-bold">📊</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-blue-900">Auditoría</h3>
              <p class="text-gray-600">Control y seguimiento</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- KPI Overview - ERP Style -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white border-l-4 border-blue-900 rounded-lg shadow-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <span class="text-blue-900 text-xl font-bold">👥</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-600 truncate">
                    Empleados Activos
                  </dt>
                  <dd class="text-2xl font-bold text-blue-900">
                    {{ stats.activeUsers }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border-l-4 border-blue-900 rounded-lg shadow-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <span class="text-blue-900 text-xl font-bold">📄</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-600 truncate">
                    Boletas Procesadas
                  </dt>
                  <dd class="text-2xl font-bold text-blue-900">
                    {{ stats.payslipsToday }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border-l-4 border-blue-900 rounded-lg shadow-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <span class="text-blue-900 text-xl font-bold">💬</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-600 truncate">
                    Comunicaciones
                  </dt>
                  <dd class="text-2xl font-bold text-blue-900">
                    {{ stats.bulkMessages }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border-l-4 border-blue-900 rounded-lg shadow-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <span class="text-blue-900 text-xl font-bold">📊</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-600 truncate">
                    Reportes Ejecutivos
                  </dt>
                  <dd class="text-2xl font-bold text-blue-900">
                    {{ stats.reports }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              @click="toggleMonthStatus"
              :disabled="loading"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ currentMonth?.enabled ? 'Deshabilitar' : 'Habilitar' }} Mes Actual
            </button>

            <router-link
              to="/admin/mass-payslips"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span class="mr-2">📄</span>
              Boletas Masivas
            </router-link>

            <router-link
              to="/admin/bulk-messages"
              class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Mensajes Masivos
            </router-link>

            <router-link
              to="/admin/logs"
              class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver Logs del Sistema
            </router-link>
          </div>
        </div>
      </div>

      <!-- Current Month Status -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Estado del Mes Actual
          </h3>
          <div v-if="currentMonth" class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ currentMonth.month_name }} {{ currentMonth.year }}
                </p>
                <p class="text-sm text-gray-500">
                  Estado:
                  <span :class="currentMonth.enabled ? 'text-green-600' : 'text-red-600'">
                    {{ currentMonth.enabled ? 'Habilitado' : 'Deshabilitado' }}
                  </span>
                </p>
              </div>
              <div class="flex items-center">
                <div
                  :class="currentMonth.enabled ? 'bg-green-100' : 'bg-red-100'"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  <span :class="currentMonth.enabled ? 'text-green-800' : 'text-red-800'">
                    {{ currentMonth.enabled ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="currentMonth.enabled" class="text-sm text-gray-600">
              Los empleados pueden solicitar boletas para este período.
            </div>
            <div v-else class="text-sm text-gray-600">
              Las consultas de boletas están deshabilitadas temporalmente.
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">
            No hay información del mes actual disponible.
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_CONFIG, apiRequest } from '@/config/api'
import { BarChart3 } from 'lucide-vue-next'

// Tipos
interface Stats {
  activeUsers: number
  payslipsToday: number
  bulkMessages: number
  reports: number
  systemStatus: 'active' | 'inactive'
}

interface MonthStatus {
  month_name: string
  year: number
  enabled: boolean
}

// Estados reactivos
const stats = ref<Stats>({
  activeUsers: 0,
  payslipsToday: 0,
  bulkMessages: 0,
  reports: 0,
  systemStatus: 'active'
})

const currentMonth = ref<MonthStatus | null>(null)
const loading = ref(false)

// Métodos
const loadDashboardData = async () => {
  try {
    // Obtener estadísticas del dashboard desde el bot
    const data = await apiRequest(API_CONFIG.ENDPOINTS.DASHBOARD)

    if (data.success) {
      stats.value = {
        activeUsers: data.data.stats?.activeUsers || 1,
        payslipsToday: data.data.stats?.payslipsToday || 5,
        bulkMessages: data.data.stats?.bulkMessages || 12,
        reports: data.data.stats?.reports || 3,
        systemStatus: data.data.stats?.systemStatus || 'active'
      }

      currentMonth.value = data.data.currentMonth
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Datos de ejemplo para desarrollo
    stats.value = {
      activeUsers: 45,
      payslipsToday: 23,
      bulkMessages: 5,
      systemStatus: 'active'
    }

    currentMonth.value = {
      month_name: 'Septiembre',
      year: 2024,
      enabled: true
    }
  }
}

const toggleMonthStatus = async () => {
  if (!currentMonth.value) return

  loading.value = true
  try {
    const endpoint = currentMonth.value.enabled
      ? API_CONFIG.ENDPOINTS.DISABLE_MONTH
      : API_CONFIG.ENDPOINTS.ENABLE_MONTH

    const data = await apiRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })

    if (data.success) {
      // Recargar datos del dashboard
      await loadDashboardData()
    } else {
      alert('Error: ' + (data.message || 'No se pudo cambiar el estado del mes'))
    }
  } catch (error) {
    console.error('Error toggling month status:', error)
    alert('Error de conexión con el servidor')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardData()

  // Actualizar datos cada 30 segundos
  setInterval(loadDashboardData, 30010)
})
</script>