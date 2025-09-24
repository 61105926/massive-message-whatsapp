<template>
  <div class="min-h-screen">
    <!-- Corporate Header -->
    <div class="bg-white border-b-4 border-yellow-400 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="mr-4">
              <div class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <span class="text-yellow-400 text-2xl">📊</span>
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-blue-900">Módulo de Auditoría</h1>
              <p class="text-gray-600 mt-1">Logs del sistema - MINOIL S.A.</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="refreshLogs"
              :disabled="loading"
              class="bg-white border-2 border-blue-900 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              <svg class="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <router-link
              to="/admin/dashboard"
              class="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              ← Volver al Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <!-- Log Type Tabs -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex">
            <button
              @click="activeTab = 'payslips'"
              :class="[
                'py-4 px-6 text-sm font-medium border-b-2',
                activeTab === 'payslips'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Boletas de Pago
                <span v-if="payslipLogs.length > 0" class="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {{ payslipLogs.length }}
                </span>
              </div>
            </button>

            <button
              @click="activeTab = 'messages'"
              :class="[
                'py-4 px-6 text-sm font-medium border-b-2',
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Mensajes Masivos
                <span v-if="messageLogs.length > 0" class="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {{ messageLogs.length }}
                </span>
              </div>
            </button>

            <button
              @click="activeTab = 'system'"
              :class="[
                'py-4 px-6 text-sm font-medium border-b-2',
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Sistema
                <span v-if="systemLogs.length > 0" class="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {{ systemLogs.length }}
                </span>
              </div>
            </button>
          </nav>
        </div>

        <!-- Filters -->
        <div class="p-4 border-b border-gray-200">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Buscar
              </label>
              <input
                v-model="filters.search"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar en logs..."
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Fecha desde
              </label>
              <input
                v-model="filters.dateFrom"
                type="date"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Fecha hasta
              </label>
              <input
                v-model="filters.dateTo"
                type="date"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                v-model="filters.type"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todos</option>
                <option value="success">Exitosos</option>
                <option value="error">Errores</option>
                <option value="info">Información</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Payslip Logs -->
      <div v-if="activeTab === 'payslips'" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Logs de Boletas de Pago
            </h3>
            <div class="text-sm text-gray-500">
              Total: {{ filteredPayslipLogs.length }} registros
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="log in filteredPayslipLogs" :key="log.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(log.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ log.employeeNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ log.whatsappNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ log.period }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': log.status === 'success',
                        'bg-red-100 text-red-800': log.status === 'error',
                        'bg-blue-100 text-blue-800': log.status === 'info'
                      }"
                    >
                      {{ getStatusText(log.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {{ log.details }}
                  </td>
                </tr>
                <tr v-if="filteredPayslipLogs.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    {{ loading ? 'Cargando...' : 'No hay logs de boletas para mostrar' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Message Logs -->
      <div v-if="activeTab === 'messages'" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Logs de Mensajes Masivos
            </h3>
            <div class="text-sm text-gray-500">
              Total: {{ filteredMessageLogs.length }} registros
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinatarios
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensaje
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="log in filteredMessageLogs" :key="log.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(log.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ log.recipients }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {{ log.message }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': log.status === 'success',
                        'bg-red-100 text-red-800': log.status === 'error',
                        'bg-yellow-100 text-yellow-800': log.status === 'pending'
                      }"
                    >
                      {{ getStatusText(log.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ log.sent }}/{{ log.total }}
                    <span v-if="log.errors > 0" class="text-red-600">
                      ({{ log.errors }} errores)
                    </span>
                  </td>
                </tr>
                <tr v-if="filteredMessageLogs.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    {{ loading ? 'Cargando...' : 'No hay logs de mensajes para mostrar' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- System Logs -->
      <div v-if="activeTab === 'system'" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Logs del Sistema
            </h3>
            <div class="text-sm text-gray-500">
              Total: {{ filteredSystemLogs.length }} registros
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensaje
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="log in filteredSystemLogs" :key="log.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(log.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': log.level === 'info',
                        'bg-yellow-100 text-yellow-800': log.level === 'warning',
                        'bg-red-100 text-red-800': log.level === 'error',
                        'bg-blue-100 text-blue-800': log.level === 'debug'
                      }"
                    >
                      {{ log.level.toUpperCase() }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ log.category }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ log.message }}
                  </td>
                </tr>
                <tr v-if="filteredSystemLogs.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    {{ loading ? 'Cargando...' : 'No hay logs del sistema para mostrar' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'

// Tipos
interface PayslipLog {
  id: string
  timestamp: Date
  employeeNumber: string
  whatsappNumber: string
  period: string
  status: 'success' | 'error' | 'info'
  details: string
}

interface MessageLog {
  id: string
  timestamp: Date
  recipients: number
  message: string
  status: 'success' | 'error' | 'pending'
  sent: number
  total: number
  errors: number
}

interface SystemLog {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  category: string
  message: string
}

interface Filters {
  search: string
  dateFrom: string
  dateTo: string
  type: string
}

// Estados reactivos
const activeTab = ref<'payslips' | 'messages' | 'system'>('payslips')
const loading = ref(false)

const filters = reactive<Filters>({
  search: '',
  dateFrom: '',
  dateTo: '',
  type: ''
})

const payslipLogs = ref<PayslipLog[]>([])
const messageLogs = ref<MessageLog[]>([])
const systemLogs = ref<SystemLog[]>([])

// Computed properties
const filteredPayslipLogs = computed(() => {
  return filterLogs(payslipLogs.value)
})

const filteredMessageLogs = computed(() => {
  return filterLogs(messageLogs.value)
})

const filteredSystemLogs = computed(() => {
  return filterLogs(systemLogs.value)
})

// Métodos
const filterLogs = (logs: any[]) => {
  return logs.filter(log => {
    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = Object.values(log).join(' ').toLowerCase()
      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    // Filtro de fecha desde
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]
      if (logDate < filters.dateFrom) {
        return false
      }
    }

    // Filtro de fecha hasta
    if (filters.dateTo) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]
      if (logDate > filters.dateTo) {
        return false
      }
    }

    // Filtro de tipo
    if (filters.type) {
      const logStatus = log.status || log.level
      if (logStatus !== filters.type) {
        return false
      }
    }

    return true
  })
}

const loadPayslipLogs = async () => {
  try {
    const response = await fetch('http://localhost:3001/logs/payslips')
    const data = await response.json()

    if (data.success && data.logs) {
      payslipLogs.value = data.logs.map((log: any) => ({
        id: log.id,
        timestamp: new Date(log.timestamp),
        employeeNumber: log.employeeNumber,
        whatsappNumber: log.whatsappNumber,
        period: log.period,
        status: log.status,
        details: log.details
      }))
    }
  } catch (error) {
    console.error('Error loading payslip logs:', error)

    // Datos de ejemplo para desarrollo
    payslipLogs.value = [
      {
        id: '1',
        timestamp: new Date(),
        employeeNumber: '77711124',
        whatsappNumber: '591123456789',
        period: 'Septiembre 2024',
        status: 'success',
        details: 'Boleta enviada exitosamente'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000),
        employeeNumber: '77711125',
        whatsappNumber: '591987654321',
        period: 'Septiembre 2024',
        status: 'error',
        details: 'Error al descargar boleta del servidor'
      }
    ]
  }
}

const loadMessageLogs = async () => {
  try {
    const response = await fetch('http://localhost:3001/logs/bulk-messages')
    const data = await response.json()

    if (data.success && data.logs) {
      messageLogs.value = data.logs.map((log: any) => ({
        id: log.id,
        timestamp: new Date(log.timestamp),
        recipients: log.recipients,
        message: log.message,
        status: log.status,
        sent: log.sent,
        total: log.total,
        errors: log.errors || 0
      }))
    }
  } catch (error) {
    console.error('Error loading message logs:', error)

    // Datos de ejemplo para desarrollo
    messageLogs.value = [
      {
        id: '1',
        timestamp: new Date(),
        recipients: 25,
        message: 'Recordatorio: Las boletas están disponibles',
        status: 'success',
        sent: 25,
        total: 25,
        errors: 0
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 86400000),
        recipients: 150,
        message: 'Información importante sobre el sistema',
        status: 'success',
        sent: 148,
        total: 150,
        errors: 2
      }
    ]
  }
}

const loadSystemLogs = async () => {
  try {
    // En una implementación real, esto vendría de un endpoint del sistema
    systemLogs.value = [
      {
        id: '1',
        timestamp: new Date(),
        level: 'info',
        category: 'WhatsApp Bot',
        message: 'Bot conectado exitosamente'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1800000),
        level: 'info',
        category: 'Database',
        message: 'Base de datos inicializada correctamente'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 3600000),
        level: 'warning',
        category: 'API',
        message: 'Tiempo de respuesta elevado en endpoint de boletas'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 7200000),
        level: 'error',
        category: 'WhatsApp Bot',
        message: 'Error temporal de conexión con WhatsApp'
      }
    ]
  } catch (error) {
    console.error('Error loading system logs:', error)
  }
}

const refreshLogs = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadPayslipLogs(),
      loadMessageLogs(),
      loadSystemLogs()
    ])
  } catch (error) {
    console.error('Error refreshing logs:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    success: 'Exitoso',
    error: 'Error',
    info: 'Información',
    pending: 'Pendiente',
    warning: 'Advertencia',
    debug: 'Debug'
  }
  return statusMap[status] || status
}

// Lifecycle
onMounted(() => {
  refreshLogs()

  // Actualizar logs cada 30 segundos
  setInterval(refreshLogs, 30010)
})
</script>