<template>
  <div class="min-h-screen">
    <!-- Corporate Header -->
    <div class="bg-white border-b-4 border-yellow-400 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="mr-4">
              <div class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <span class="text-yellow-400 text-2xl">📄</span>
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-blue-900">Módulo de Nómina</h1>
              <p class="text-gray-600 mt-1">Gestión de boletas de pago - MINOIL S.A.</p>
            </div>
          </div>
          <router-link
            to="/admin/dashboard"
            class="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            ← Volver al Dashboard
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <!-- Month Control Section -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Control de Meses Habilitados
          </h3>

          <div v-if="currentMonth" class="space-y-4">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center space-x-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">
                    {{ currentMonth.month_name }} {{ currentMonth.year }}
                  </h4>
                  <p class="text-sm text-gray-500">
                    Último mes habilitado
                  </p>
                </div>
                <div
                  :class="currentMonth.enabled ? 'bg-green-100' : 'bg-red-100'"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  <span :class="currentMonth.enabled ? 'text-green-800' : 'text-red-800'">
                    {{ currentMonth.enabled ? 'Habilitado' : 'Deshabilitado' }}
                  </span>
                </div>
              </div>

              <div class="flex space-x-2">
                <button
                  @click="enableLatestMonth"
                  :disabled="loading || currentMonth.enabled"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Habilitar
                </button>

                <button
                  @click="disableCurrentMonth"
                  :disabled="loading || !currentMonth.enabled"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Deshabilitar
                </button>
              </div>
            </div>

            <div class="text-sm text-gray-600">
              <p><strong>Estado actual:</strong>
                <span v-if="currentMonth.enabled" class="text-green-600">
                  Los empleados pueden solicitar boletas para {{ currentMonth.month_name }} {{ currentMonth.year }}
                </span>
                <span v-else class="text-red-600">
                  Las consultas de boletas están temporalmente deshabilitadas
                </span>
              </p>
            </div>
          </div>

          <div v-else class="text-center py-4">
            <p class="text-gray-500">No hay información de meses disponible</p>
          </div>
        </div>
      </div>

      <!-- Bulk Payslip Sending -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Envío Masivo de Boletas
          </h3>

          <div class="space-y-6">
            <!-- Información del envío -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-blue-900 mb-3">Información del Envío Masivo</h4>
              <p class="text-sm text-blue-800">
                ⚠️ El envío masivo de boletas se enviará a TODOS los empleados registrados en el sistema.
                La funcionalidad de filtrado por regionales estará disponible en una próxima actualización.
              </p>
            </div>

            <!-- Regional Selection (Deshabilitado temporalmente) -->
            <div class="bg-gray-50 p-4 rounded-lg opacity-50">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Seleccionar Empleados por Regional (Próximamente)</h4>

              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="all-regionals-payslip"
                    v-model="selectAllRegionalsPayslip"
                    type="checkbox"
                    disabled
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    @change="toggleAllRegionalsPayslip"
                  >
                  <label for="all-regionals-payslip" class="ml-2 text-sm text-gray-900 font-medium">
                    Todas las regionales ({{ totalEmployees }} empleados)
                  </label>
                </div>

                <div v-if="!loadingEmployees" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  <div
                    v-for="regional in availableEmployees"
                    :key="regional.id"
                    class="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <input
                      :id="`regional-payslip-${regional.id}`"
                      v-model="selectedRegionalsPayslip"
                      :value="regional.id"
                      type="checkbox"
                      disabled
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <label :for="`regional-payslip-${regional.id}`" class="ml-2 text-sm text-gray-900 flex-1">
                      {{ regional.name }}
                      <span class="text-gray-500">({{ regional.count }} empleados)</span>
                    </label>
                  </div>
                </div>

                <div v-if="loadingEmployees" class="text-center py-4">
                  <div class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando empleados...
                  </div>
                </div>

                <div v-if="selectedEmployeeCount > 0" class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p class="text-sm text-blue-800">
                    <span class="font-medium">{{ selectedEmployeeCount }}</span> empleados seleccionados para recibir boletas
                  </p>
                </div>
              </div>
            </div>

            <!-- Period Selection -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Período para Envío de Boletas
                </label>
                <select
                  v-model="selectedPeriod"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar mes y año</option>
                  <option v-for="month in months" :key="`${month.year}-${month.value}`" :value="`${month.year}-${month.value}`">
                    {{ month.label }}
                  </option>
                </select>
                <p class="mt-1 text-sm text-gray-500">
                  Selecciona el período de las boletas que deseas enviar
                </p>
              </div>
            </div>


            <button
              @click="sendBulkPayslips"
              :disabled="!selectedPeriod || bulkSending"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="bulkSending" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ bulkSending ? 'Enviando...' : 'Enviar Boletas a Todos los Empleados' }}
            </button>

            <div v-if="bulkSendingProgress.total > 0" class="space-y-2">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Progreso: {{ bulkSendingProgress.sent }}/{{ bulkSendingProgress.total }}</span>
                <span>{{ Math.round((bulkSendingProgress.sent / bulkSendingProgress.total) * 100) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(bulkSendingProgress.sent / bulkSendingProgress.total) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Actividad Reciente
          </h3>

          <div class="flow-root">
            <ul class="-mb-8">
              <li v-for="(activity, index) in recentActivity" :key="index">
                <div class="relative pb-8" :class="{ 'pb-0': index === recentActivity.length - 1 }">
                  <span v-if="index !== recentActivity.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                            :class="activity.type === 'success' ? 'bg-green-500' : activity.type === 'error' ? 'bg-red-500' : 'bg-gray-400'">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path v-if="activity.type === 'success'" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          <path v-else-if="activity.type === 'error'" fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                          <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">{{ activity.message }}</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        {{ activity.time }}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { API_CONFIG } from '@/config/api'

// Tipos
interface MonthStatus {
  month_name: string
  year: number
  enabled: boolean
}

interface Activity {
  type: 'success' | 'error' | 'info'
  message: string
  time: string
}

interface BulkPayslipForm {
  year: string
  month: string
}

interface Employee {
  id: string
  name: string
  count: number
}

// Estados reactivos
const currentMonth = ref<MonthStatus | null>(null)
const loading = ref(false)
const bulkSending = ref(false)
const bulkSendingProgress = reactive({
  sent: 0,
  total: 0
})

// Employee/Regional selection for payslips
const availableEmployees = ref<Employee[]>([])
const selectedRegionalsPayslip = ref<string[]>([])
const selectAllRegionalsPayslip = ref(false)
const loadingEmployees = ref(false)
const totalEmployees = ref(0)

const selectedPeriod = ref('')

const bulkPayslipForm = reactive<BulkPayslipForm>({
  year: new Date().getFullYear().toString(),
  month: ''
})

const recentActivity = ref<Activity[]>([])

// Computed properties
const selectedEmployeeCount = computed(() => {
  return selectedRegionalsPayslip.value.reduce((total, regionalId) => {
    const regional = availableEmployees.value.find(r => r.id === regionalId)
    return total + (regional?.count || 0)
  }, 0)
})

// Meses disponibles (será actualizado dinámicamente)
const availableMonths = ref<Array<{value: string, label: string, available: boolean}>>([])

// Todos los meses para referencia
const allMonths = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
]

// Computed para obtener los meses relevantes (últimos 6 meses + mes actual + próximos 2 meses)
const months = computed(() => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // getMonth() es 0-indexed

  const relevantMonths: Array<{value: string, label: string, year: number}> = []

  // Generar los últimos 6 meses + mes actual + próximos 2 meses
  for (let i = -6; i <= 2; i++) {
    const date = new Date(currentYear, currentMonth - 1 + i, 1)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const monthStr = month.toString().padStart(2, '0')

    const monthData = allMonths.find(m => m.value === monthStr)
    if (monthData) {
      relevantMonths.push({
        value: monthStr,
        label: `${monthData.label} ${year}`,
        year: year
      })
    }
  }

  return relevantMonths.reverse() // Más recientes primero
})

// Métodos
const loadCurrentMonth = async () => {
  try {
    const response = await fetch('http://localhost:3001/admin/dashboard', {
      headers: {
        'Accept': 'application/json'
      }
    })
    const data = await response.json()

    if (data.success && data.data.currentMonth) {
      currentMonth.value = data.data.currentMonth
    }
  } catch (error) {
    console.error('Error loading current month:', error)
  }
}

const loadEmployees = async () => {
  loadingEmployees.value = true
  try {
    // TODO: Implementar carga de regionales cuando esté disponible la funcionalidad
    // const response = await fetch(buildExternalApiUrl(API_CONFIG.ENDPOINTS.SURVEY_API))
    // const data = await response.json()

    // Por ahora, datos de ejemplo para la interfaz (funcionalidad deshabilitada)
    availableEmployees.value = [
      { id: '1', name: 'Regional La Paz', count: 45 },
      { id: '2', name: 'Regional Santa Cruz', count: 38 },
      { id: '3', name: 'Regional Cochabamba', count: 32 },
      { id: '4', name: 'Regional Oruro', count: 15 },
      { id: '5', name: 'Regional Potosí', count: 12 }
    ]

    // Calcular total de empleados
    totalEmployees.value = availableEmployees.value.reduce((total, regional) => total + regional.count, 0)

  } catch (error) {
    console.error('Error loading employees:', error)
    availableEmployees.value = []
    totalEmployees.value = 0
  } finally {
    loadingEmployees.value = false
  }
}

const toggleAllRegionalsPayslip = () => {
  if (selectAllRegionalsPayslip.value) {
    selectedRegionalsPayslip.value = availableEmployees.value.map(r => r.id)
  } else {
    selectedRegionalsPayslip.value = []
  }
}


const enableLatestMonth = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3001/admin/enable-latest-month', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })

    const data = await response.json()

    if (data.success) {
      await loadCurrentMonth()
      addActivity('success', 'Mes habilitado correctamente')
    } else {
      addActivity('error', 'Error: ' + (data.message || 'No se pudo habilitar el mes'))
    }
  } catch (error) {
    console.error('Error enabling month:', error)
    addActivity('error', 'Error de conexión con el servidor')
  } finally {
    loading.value = false
  }
}

const disableCurrentMonth = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3001/admin/disable-current-month', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })

    const data = await response.json()

    if (data.success) {
      await loadCurrentMonth()
      addActivity('success', 'Mes deshabilitado correctamente')
    } else {
      addActivity('error', 'Error: ' + (data.message || 'No se pudo deshabilitar el mes'))
    }
  } catch (error) {
    console.error('Error disabling month:', error)
    addActivity('error', 'Error de conexión con el servidor')
  } finally {
    loading.value = false
  }
}


const sendBulkPayslips = async () => {
  // Ya no se validan regionales porque el backend envía a todos los empleados automáticamente

  bulkSending.value = true
  bulkSendingProgress.sent = 0
  bulkSendingProgress.total = 0

  try {
    // El período ya viene en formato YYYY-MM desde selectedPeriod
    if (!selectedPeriod.value) {
      addActivity('error', 'Debe seleccionar un período válido')
      return
    }

    // El backend actual solo acepta formato JSON simple
    const requestBody = {
      month: selectedPeriod.value,
      authorize: true
    }

    // Log de la acción
    addActivity('info', `Enviando boletas a todos los empleados del sistema`)

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BULK_PAYSLIPS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    if (response.ok) {
      const totalEmployees = data.totalUsers || 0

      addActivity('success', `Envío masivo iniciado para ${totalEmployees} empleados - ${data.month}`)

      // Simular progreso (en una implementación real, esto vendría del servidor)
      bulkSendingProgress.total = totalEmployees
      const interval = setInterval(() => {
        if (bulkSendingProgress.sent < bulkSendingProgress.total) {
          bulkSendingProgress.sent++
        } else {
          clearInterval(interval)
          addActivity('success', 'Envío masivo de boletas completado exitosamente')

          // Limpiar formulario después del envío exitoso
          selectedRegionalsPayslip.value = []
          selectAllRegionalsPayslip.value = false
        }
      }, 800) // Velocidad de simulación

    } else {
      addActivity('error', 'Error en envío masivo: ' + (data.error || data.message || 'Error desconocido'))
    }
  } catch (error) {
    console.error('Error sending bulk payslips:', error)
    addActivity('error', 'Error de conexión durante el envío masivo')
  } finally {
    bulkSending.value = false
  }
}

const addActivity = (type: 'success' | 'error' | 'info', message: string) => {
  const now = new Date()
  const time = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  recentActivity.value.unshift({
    type,
    message,
    time
  })

  // Mantener solo las últimas 10 actividades
  if (recentActivity.value.length > 10) {
    recentActivity.value = recentActivity.value.slice(0, 10)
  }
}

// Lifecycle
onMounted(() => {
  loadCurrentMonth()
  loadEmployees()

  // Actividad inicial
  addActivity('info', 'Panel de gestión de boletas inicializado')
})
</script>