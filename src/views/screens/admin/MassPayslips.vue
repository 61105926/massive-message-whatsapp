<template>
  <div class="min-h-screen">
    <!-- Corporate Header -->
    <div class="bg-white border-b-4 border-yellow-400 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="mr-4">
              <div class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <span class="text-yellow-400 text-xl font-bold">📄</span>
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-blue-900">Envío Masivo de Boletas</h1>
              <p class="text-gray-600 mt-1">Sistema ERP - MINOIL S.A.</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/admin/dashboard"
              class="bg-gray-100 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              ← Volver al Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <!-- Description Section -->
      <div class="bg-white border-l-4 border-blue-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-lg font-bold text-blue-900 mb-2">
          Sistema de Envío de Boletas de Pago
        </h2>
        <p class="text-gray-600">
          Plataforma empresarial para el envío masivo de boletas de pago a todos los empleados de manera eficiente y segura.
        </p>
      </div>

      <!-- Card with corporate styling -->
      <div class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg">
        <div class="px-6 py-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <span class="text-slate-600 text-xl">📄</span>
            </div>
            <div>
              <h3 class="text-xl text-slate-900 font-semibold">
                Configuración de Envío
              </h3>
              <p class="text-slate-500">
                Configure el período de boletas para distribución masiva
              </p>
            </div>
          </div>

          <form @submit.prevent="sendMassPayslips" class="space-y-8">
            <!-- Selector de Mes -->
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 text-slate-500">📅</span>
                <h4 class="text-lg font-semibold text-slate-900">Período de Boletas</h4>
              </div>

              <div class="max-w-md">
                <select
                  id="month"
                  v-model="selectedMonth"
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white shadow-sm"
                  required
                >
                  <option value="">Seleccione un mes</option>
                  <option v-for="month in availableMonths" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </select>
                <p class="mt-2 text-sm text-slate-500">
                  Seleccione el período de boletas para distribución
                </p>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer with button -->
        <div class="bg-slate-50/50 rounded-b-lg border-t border-slate-100 flex justify-between items-center py-6 px-6">
          <div class="text-sm text-slate-600">
            <span v-if="selectedMonth" class="font-medium">Período seleccionado: {{ availableMonths.find(m => m.value === selectedMonth)?.label }}</span>
            <span v-else class="font-medium">Ningún período seleccionado</span>
          </div>

          <div class="flex items-center space-x-4">
            
            <button
              @click="sendMassPayslips"
              :disabled="loading || isProcessing || !selectedMonth"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="mr-2">
                <svg class="animate-spin h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? 'Iniciando...' : isProcessing ? 'Enviando...' : ' Iniciar Envío Masivo' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      <div v-if="progressData.isActive || lastResult" class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg mt-8">
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-t-lg">
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="text-sm font-medium text-slate-700">
                📤 {{ progressData.isActive ? 'Enviando boletas...' : 'Último envío completado' }}
              </h4>
              <span v-if="progressData.total > 0" class="text-sm text-slate-500">
                {{ progressData.completed }} / {{ progressData.total }}
              </span>
            </div>

            <!-- Progress Bar -->
            <div v-if="progressData.total > 0" class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                class="bg-emerald-500 h-3 rounded-full transition-all duration-300 ease-out"
                :style="{ width: `${progressData.percentage}%` }"
              ></div>
            </div>

            <!-- Progress Stats -->
            <div v-if="progressData.total > 0" class="flex justify-between text-xs text-slate-600">
              <div class="flex gap-4">
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Exitosos: {{ progressData.completed }}
                </span>
                <span class="flex items-center gap-1" v-if="progressData.failed > 0">
                  <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                  Fallidos: {{ progressData.failed }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-slate-400 rounded-full"></span>
                  Pendientes: {{ progressData.pending }}
                </span>
              </div>
              <span>{{ progressData.percentage }}%</span>
            </div>

            <!-- Control Buttons -->
            <div class="flex justify-center gap-3 pt-3 border-t border-slate-200">
              <button
                v-if="!progressData.isPaused && progressData.isActive && !progressData.isCancelled"
                @click="pauseProcess"
                :disabled="actionLoading"
                class="px-4 py-2 text-amber-600 border border-amber-200 rounded-md hover:bg-amber-50 disabled:opacity-50 transition-colors text-sm"
              >
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Pausar
                </span>
              </button>

              <button
                v-if="progressData.isPaused && progressData.isActive && !progressData.isCancelled"
                @click="resumeProcess"
                :disabled="actionLoading"
                class="px-4 py-2 text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 disabled:opacity-50 transition-colors text-sm"
              >
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                  Reanudar
                </span>
              </button>

              <button
                v-if="progressData.isActive && !progressData.isCancelled"
                @click="cancelProcess"
                :disabled="actionLoading"
                class="px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors text-sm"
              >
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  Cancelar
                </span>
              </button>
            </div>

            <!-- Status Messages -->
            <div v-if="progressData.isPaused" class="text-center text-sm text-amber-600 font-medium">
              ⏸️ Envío pausado
            </div>
            <div v-if="progressData.isCancelled" class="text-center space-y-2">
              <div class="text-sm text-red-600 font-medium">
                ❌ Envío cancelado
              </div>
              <button
                @click="clearState"
                class="px-4 py-2 text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm"
              >
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  🧹 Limpiar Estado
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="text-center mt-8">
        <p class="text-xs text-slate-500">
          Sistema de distribución de boletas • Todos los envíos son registrados y auditables
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { buildApiUrl, buildExternalApiUrl, API_CONFIG } from '@/config/api'

// Estados reactivos
const selectedMonth = ref('')
const loading = ref(false)
const actionLoading = ref(false)
const isProcessing = ref(false)
const lastResult = ref<any>(null)

// Datos de progreso
const progressData = ref({
  batchId: null,
  total: 0,
  completed: 0,
  failed: 0,
  pending: 0,
  percentage: 0,
  isActive: false,
  isPaused: false,
  isCancelled: false
})

let progressInterval: number | null = null

// Meses disponibles
const availableMonths = ref<{value: string, label: string}[]>([])

const generateAvailableMonths = async () => {
  try {
    // Obtener meses desde la API usando un número de ejemplo
    const response = await fetch(buildExternalApiUrl('/api/dateConsult?numero=77711124'))
    const data = await response.json()

    if (data.availableMonths && Array.isArray(data.availableMonths)) {
      // Tomar solo los primeros 3 meses
      const recentMonths = data.availableMonths.slice(0, 3)

      availableMonths.value = recentMonths.map((monthData: any) => ({
        value: `${monthData.year}${monthData.month.toString().padStart(2, '0')}`,
        label: `${monthData.monthName} ${monthData.year}`
      }))
    } else {
      // Fallback: generar últimos 3 meses manualmente
      generateFallbackMonths()
    }
  } catch (error) {
    console.error('Error loading months from API:', error)
    generateFallbackMonths()
  }
}

const generateFallbackMonths = () => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const monthsList: {value: string, label: string}[] = []

  // Solo los últimos 3 meses (actual + 2 anteriores)
  for (let i = -2; i <= 0; i++) {
    const date = new Date(currentYear, currentMonth + i, 1)
    const year = date.getFullYear()
    const monthIndex = date.getMonth()

    const value = `${year}${(monthIndex + 1).toString().padStart(2, '0')}`
    const label = `${months[monthIndex]} ${year}`

    monthsList.push({ value, label })
  }

  availableMonths.value = monthsList
}

// Métodos
const sendMassPayslips = async () => {
  if (!selectedMonth.value || !/^\d{6}$/.test(selectedMonth.value)) {
    alert('Por favor ingrese un mes válido en formato YYYYMM (ejemplo: 202409)')
    return
  }

  loading.value = true
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.BULK_PAYSLIPS), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        month: selectedMonth.value
      })
    })

    const result = await response.json()

    if (response.ok) {
      lastResult.value = {
        month: result.month,
        totalUsers: result.totalUsers,
        status: result.status,
        message: result.message,
        timestamp: new Date()
      }

      // Iniciar monitoreo del progreso
      isProcessing.value = true
      startProgressMonitoring()

      alert(`✅ Envío iniciado exitosamente!\n\nMes: ${result.month}\nEmpleados: ${result.totalUsers}\n\nPuede monitorear el progreso en esta pantalla.`)
    } else {
      alert(`❌ Error: ${result.error}`)
    }
  } catch (error) {
    console.error('Error sending mass payslips:', error)
    alert('❌ Error de conexión con el servidor')
  } finally {
    loading.value = false
  }
}

const startProgressMonitoring = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }

  progressInterval = setInterval(async () => {
    await checkProgress()
  }, 2000) // Verificar cada 2 segundos

  // Primera verificación inmediata
  checkProgress()
}

const checkProgress = async () => {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROGRESS))
    const data = await response.json()

    progressData.value = {
      batchId: data.batchId,
      total: data.total,
      completed: data.completed,
      failed: data.failed,
      pending: data.pending,
      percentage: data.percentage,
      isActive: data.isActive,
      isPaused: data.isPaused,
      isCancelled: data.isCancelled
    }

    // Si no está activo, detener el monitoreo
    if (!data.isActive) {
      isProcessing.value = false
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
    } else {
      isProcessing.value = true
    }
  } catch (error) {
    console.error('Error checking progress:', error)
  }
}

const pauseProcess = async () => {
  actionLoading.value = true
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PAUSE), { method: 'POST' })
    if (response.ok) {
      await checkProgress()
    }
  } catch (error) {
    console.error('Error pausing process:', error)
  } finally {
    actionLoading.value = false
  }
}

const resumeProcess = async () => {
  actionLoading.value = true
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RESUME), { method: 'POST' })
    if (response.ok) {
      await checkProgress()
    }
  } catch (error) {
    console.error('Error resuming process:', error)
  } finally {
    actionLoading.value = false
  }
}

const cancelProcess = async () => {
  if (!confirm('¿Está seguro que desea cancelar el envío masivo? Esta acción no se puede deshacer.')) {
    return
  }

  actionLoading.value = true
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CANCEL), { method: 'POST' })
    if (response.ok) {
      await checkProgress()
      isProcessing.value = false
    }
  } catch (error) {
    console.error('Error cancelling process:', error)
  } finally {
    actionLoading.value = false
  }
}

const clearState = async () => {
  try {
    // Limpiar backend
    await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RESET), {
      method: 'POST'
    })

    // Limpiar frontend
    progressData.value = {
      batchId: null,
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      percentage: 0,
      isActive: false,
      isPaused: false,
      isCancelled: false
    }

    isProcessing.value = false
    lastResult.value = null

    console.log('🧹 Estado limpiado completamente')
  } catch (error) {
    console.error('❌ Error limpiando estado:', error)
    // Limpiar frontend aunque falle el backend
    progressData.value = {
      batchId: null,
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      percentage: 0,
      isActive: false,
      isPaused: false,
      isCancelled: false
    }
    isProcessing.value = false
    lastResult.value = null
  }
}

// Lifecycle
onMounted(async () => {
  // Generar meses disponibles
  await generateAvailableMonths()

  // Verificar si hay un proceso en curso al cargar la página
  checkProgress()

  // Sugerir el mes más reciente disponible
  if (availableMonths.value.length > 0) {
    selectedMonth.value = availableMonths.value[availableMonths.value.length - 1].value
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>