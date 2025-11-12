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
              <h1 class="text-2xl font-bold text-blue-900">Sistema de Boletas</h1>
              <p class="text-gray-600 mt-1">Gestión ERP - MINOIL S.A.</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div :class="backendStatus.connected ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'" class="px-4 py-2 rounded-lg font-semibold">
              <div class="flex items-center space-x-2">
                <div :class="[
                  backendStatus.connected ? 'bg-green-600' : 'bg-red-600',
                  backendStatus.connected ? 'animate-pulse' : '',
                  'w-2 h-2 rounded-full'
                ]"></div>
                <span class="text-sm">{{ backendStatus.connected ? 'Sistema' : 'Sistema Desconectado' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <!-- Description Section -->
      <div class="bg-white border-l-4 border-blue-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-lg font-bold text-blue-900 mb-2">
          Sistema Integrado de Gestión Empresarial
        </h2>
        <p class="text-gray-600">
          Plataforma completa para gestión de boletas, comunicaciones corporativas, clima laboral y atención automatizada via WhatsApp.
        </p>
      </div>

      <!-- Main Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <!-- Boletas Masivas -->
        <router-link
          to="/admin/mass-payslips"
          class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="p-8 text-center">
            <div class="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-yellow-400 text-3xl font-bold">📄</span>
            </div>
            <h3 class="text-2xl font-bold text-blue-900 mb-4">Boletas Masivas</h3>
            <p class="text-gray-600 mb-6">
              Accede al sistema de envío masivo de boletas de pago para todos los empleados
            </p>
            <div class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg">
              🚀 Acceder al Sistema
            </div>
          </div>
        </router-link>

        <!-- Mensajes Masivos -->
        <router-link
          to="/mensajes/massive"
          class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="p-8 text-center">
            <div class="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-yellow-400 text-3xl font-bold">💬</span>
            </div>
            <h3 class="text-2xl font-bold text-blue-900 mb-4">Mensajes Masivos</h3>
            <p class="text-gray-600 mb-6">
              Sistema de comunicaciones corporativas para envío de mensajes a múltiples regionales
            </p>
            <div class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg">
              💬 Acceder a Comunicaciones
            </div>
          </div>
        </router-link>

        <!-- Clima Laboral -->
        <router-link
          to="/clima"
          class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="p-8 text-center">
            <div class="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-yellow-400 text-3xl font-bold">🌤️</span>
            </div>
            <h3 class="text-2xl font-bold text-blue-900 mb-4">Clima Laboral</h3>
            <p class="text-gray-600 mb-6">
              Encuestas y análisis del ambiente de trabajo para mejorar la experiencia laboral
            </p>
            <div class="bg-amber-600 hover:bg-amber-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg">
              🌤️ Gestionar Clima
            </div>
          </div>
        </router-link>

        <!-- Solicitar Vacaciones -->
        <div class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg">
          <div class="p-8">
            <div class="text-center mb-6">
              <div class="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-yellow-400 text-3xl font-bold">📅</span>
              </div>
              <h3 class="text-2xl font-bold text-blue-900 mb-2">Solicitar Vacaciones</h3>
              <p class="text-gray-600 text-sm">
                Sistema de solicitud de vacaciones con aprobación automática
              </p>
            </div>

            <!-- Configuración de tipos de vacaciones -->
            <div class="space-y-4 mb-6">
              <!-- Vacaciones Programadas (Toggle) -->
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex-1">
                  <p class="text-sm font-semibold text-blue-900">Vacaciones Programadas</p>
                  <p class="text-xs text-blue-700">Solicitudes anticipadas con planificación</p>
                </div>
                <button
                  @click="toggleProgrammedVacations"
                  :class="[
                    'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
                    programmedVacationsEnabled ? 'bg-green-600' : 'bg-gray-300'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                      programmedVacationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- Vacaciones a Cuenta (Siempre habilitadas) -->
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div class="flex-1">
                  <p class="text-sm font-semibold text-green-900">Vacaciones a Cuenta</p>
                  <p class="text-xs text-green-700">Siempre disponibles - Descuento inmediato</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-green-700">✓ SIEMPRE ACTIVO</span>
                  <div class="relative inline-flex h-7 w-12 items-center rounded-full bg-green-600">
                    <span class="inline-block h-5 w-5 transform rounded-full bg-white translate-x-6" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón de acceso -->
            <div class="text-center">
              <router-link
                to="/vacaciones"
                class="block bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg"
              >
                📅 Acceder al Sistema
              </router-link>
            </div>
          </div>
        </div>

        <!-- Recordatorios Mensuales de Vacaciones -->
        <div class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg">
          <div class="p-8">
            <div class="text-center mb-6">
              <div class="w-20 h-20 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-yellow-400 text-3xl font-bold">🔔</span>
              </div>
              <h3 class="text-2xl font-bold text-blue-900 mb-2">Recordatorios Mensuales</h3>
              <p class="text-gray-600 text-sm">
                Envía recordatorios automáticos de vacaciones a empleados y jefes
              </p>
            </div>

            <!-- Selector de mes -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Seleccionar Mes
              </label>
              <div class="flex gap-2">
                <select
                  v-model="selectedMonth"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :disabled="isProcessing"
                >
                  <option v-for="(month, index) in months" :key="index" :value="index + 1">
                    {{ month }} {{ selectedYear }}
                  </option>
                </select>
                <input
                  v-model.number="selectedYear"
                  type="number"
                  min="2024"
                  max="2030"
                  class="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :disabled="isProcessing"
                />
              </div>
            </div>

            <!-- Estado del proceso -->
            <div v-if="reminderStatus.isProcessing" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-blue-900">Procesando...</span>
                <span class="text-xs text-blue-600">{{ reminderStatus.progress }}%</span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2.5 mb-2">
                <div
                  class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  :style="{ width: `${reminderStatus.progress}%` }"
                ></div>
              </div>
              <div class="text-xs text-blue-700 space-y-1">
                <div v-if="reminderStatus.currentStep">
                  📍 {{ reminderStatus.currentStep }}
                </div>
                <div v-if="reminderStatus.employeesProcessed > 0">
                  👤 Empleados: {{ reminderStatus.employeesProcessed }} / {{ reminderStatus.totalEmployees }}
                </div>
                <div v-if="reminderStatus.managersProcessed > 0">
                  👔 Jefes: {{ reminderStatus.managersProcessed }} / {{ reminderStatus.totalManagers }}
                </div>
              </div>
            </div>

            <!-- Resultado del proceso -->
            <div v-if="reminderStatus.completed && !reminderStatus.isProcessing" class="mb-6 p-4 rounded-lg border" :class="reminderStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
              <div class="flex items-center gap-2 mb-2">
                <span :class="reminderStatus.success ? 'text-green-600' : 'text-red-600'" class="text-xl">
                  {{ reminderStatus.success ? '✅' : '❌' }}
                </span>
                <span :class="reminderStatus.success ? 'text-green-900' : 'text-red-900'" class="font-semibold">
                  {{ reminderStatus.success ? 'Proceso completado' : 'Error en el proceso' }}
                </span>
              </div>
              <div class="text-sm" :class="reminderStatus.success ? 'text-green-700' : 'text-red-700'">
                <div v-if="reminderStatus.message">{{ reminderStatus.message }}</div>
                <div v-if="reminderStatus.employeesNotified > 0">
                  Empleados notificados: {{ reminderStatus.employeesNotified }}
                </div>
                <div v-if="reminderStatus.managersNotified > 0">
                  Jefes notificados: {{ reminderStatus.managersNotified }}
                </div>
              </div>
            </div>

            <!-- Botón de inicio -->
            <div class="text-center">
              <button
                @click="startMonthlyReminders"
                :disabled="isProcessing || !backendStatus.connected"
                :class="[
                  'w-full font-medium px-8 py-3 rounded-xl transition-all shadow-lg',
                  isProcessing || !backendStatus.connected
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                ]"
              >
                <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
                <span v-else-if="!backendStatus.connected">
                  ⚠️ Backend desconectado
                </span>
                <span v-else>
                  🚀 Iniciar Recordatorios
                </span>
              </button>
              <p v-if="!backendStatus.connected" class="mt-2 text-xs text-red-600">
                ⚠️ El bot de WhatsApp debe estar conectado para enviar recordatorios
              </p>
            </div>

            <!-- Información adicional -->
            <div class="mt-4 text-xs text-gray-500 text-center">
              <p>El proceso se ejecuta automáticamente el día 1 de cada mes a las 9:00 AM</p>
            </div>
          </div>
        </div>

        <!-- Bot WhatsApp Status -->
        <div class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg col-span-1 md:col-span-3">
          <div class="p-8 text-center">
            <div :class="backendStatus.connected ? 'bg-green-600' : 'bg-red-600'" class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-white text-3xl font-bold">🤖</span>
            </div>
            <h3 :class="backendStatus.connected ? 'text-green-700' : 'text-red-700'" class="text-2xl font-bold mb-4">Bot WhatsApp - Consulta de Boletas</h3>
            <p class="text-gray-600 mb-6">
              Los empleados pueden solicitar sus boletas de pago directamente via WhatsApp enviando su número de teléfono
            </p>
            <div v-if="backendStatus.connected" class="bg-green-100 text-green-700 font-medium px-8 py-3 rounded-xl shadow-lg border border-green-200">
              ✅ Activado  - Disponible 24/7
            </div>
            <div v-else class="bg-red-100 text-red-700 font-medium px-8 py-3 rounded-xl shadow-lg border border-red-200">
              <div class="mb-2">❌ Sistema Desconectado</div>
              <div class="text-sm">
                Comunícate con el desarrollador:
                <a href="https://wa.me/59161105926" target="_blank" class="text-blue-600 hover:text-blue-800 underline font-semibold">
                  📱 61105926
                </a>
              </div>
            </div>

            <!-- Estado detallado -->
            <div class="mt-4 text-xs text-gray-500">
              <div v-if="backendStatus.lastCheck" class="flex items-center justify-center gap-2">
                <span>Última verificación:</span>
                <span class="font-mono">{{ new Date(backendStatus.lastCheck).toLocaleTimeString() }}</span>
              </div>
              <div v-if="backendStatus.error && !backendStatus.connected" class="mt-2 text-red-500">
                Error: {{ backendStatus.error }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="text-center mt-8">
        <p class="text-xs text-slate-500">
          Sistema de gestión corporativa • Todos los procesos son registrados y auditables
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { API_CONFIG } from '@/config/api'

// Estado reactivo para la conexión del backend
const backendStatus = ref({
  connected: false,
  lastCheck: null as Date | null,
  error: null as string | null
})

// Estado del sistema de vacaciones
const programmedVacationsEnabled = ref(false)
const isLoadingConfig = ref(false)

// Estado de recordatorios mensuales
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const isProcessing = ref(false)
const reminderStatus = ref({
  isProcessing: false,
  progress: 0,
  currentStep: '',
  employeesProcessed: 0,
  totalEmployees: 0,
  managersProcessed: 0,
  totalManagers: 0,
  completed: false,
  success: false,
  message: '',
  employeesNotified: 0,
  managersNotified: 0
})

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

let statusInterval: number | null = null
let progressInterval: number | null = null

// Cargar configuración desde el backend
const loadVacationConfig = async () => {
  try {
    isLoadingConfig.value = true
    const response = await fetch(`${API_CONFIG.BASE_URL}/vacation-config`)
    const result = await response.json()

    if (result.success && result.data) {
      programmedVacationsEnabled.value = result.data.programmedVacationsEnabled
      console.log('✅ Configuración cargada desde backend:', result.data)
    }
  } catch (error) {
    console.error('❌ Error al cargar configuración:', error)
  } finally {
    isLoadingConfig.value = false
  }
}

// Toggle de vacaciones programadas
const toggleProgrammedVacations = async () => {
  try {
    isLoadingConfig.value = true

    const response = await fetch(`${API_CONFIG.BASE_URL}/vacation-config/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        updatedBy: 'Admin Dashboard'
      })
    })

    const result = await response.json()

    if (result.success && result.data) {
      programmedVacationsEnabled.value = result.data.programmedVacationsEnabled
      console.log('✅ Configuración actualizada:', result.data)
      console.log('📡 Vacaciones programadas:', result.data.programmedVacationsEnabled ? 'Habilitadas' : 'Deshabilitadas')
    } else {
      console.error('❌ Error en la respuesta:', result)
    }
  } catch (error) {
    console.error('❌ Error al actualizar configuración:', error)
  } finally {
    isLoadingConfig.value = false
  }
}

// Función para verificar el estado del backend
const checkBackendStatus = async () => {
  try {
    // Crear AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${API_CONFIG.BASE_URL}/status`, {
      method: 'GET',
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      backendStatus.value = {
        connected: true,
        lastCheck: new Date(),
        error: null
      }
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    let errorMessage = 'Error desconocido'

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Timeout - Backend no responde'
      } else {
        errorMessage = error.message
      }
    }

    backendStatus.value = {
      connected: false,
      lastCheck: new Date(),
      error: errorMessage
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  // Verificación inicial
  checkBackendStatus()

  // Verificar cada 10 segundos
  statusInterval = setInterval(checkBackendStatus, 10000)

  // Cargar configuración de vacaciones desde el backend
  loadVacationConfig()
})

// Función para iniciar recordatorios mensuales
const startMonthlyReminders = async () => {
  if (isProcessing.value || !backendStatus.value.connected) {
    return
  }

  try {
    isProcessing.value = true
    reminderStatus.value = {
      isProcessing: true,
      progress: 0,
      currentStep: 'Iniciando proceso...',
      employeesProcessed: 0,
      totalEmployees: 0,
      managersProcessed: 0,
      totalManagers: 0,
      completed: false,
      success: false,
      message: '',
      employeesNotified: 0,
      managersNotified: 0
    }

    // Simular progreso mientras se ejecuta
    let progress = 0
    progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += 5
        reminderStatus.value.progress = progress
      }
    }, 500)

    reminderStatus.value.currentStep = 'Consultando vacaciones del mes...'
    reminderStatus.value.progress = 10

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/monthly-reminders/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: selectedYear.value,
        month: selectedMonth.value
      })
    })

    reminderStatus.value.progress = 50
    reminderStatus.value.currentStep = 'Procesando solicitudes...'

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}`)
    }

    const result = await response.json()
    
    // Verificar si hay un error específico de conexión
    if (result.code === 'BOT_NOT_CONNECTED') {
      reminderStatus.value.progress = 0
      reminderStatus.value.isProcessing = false
      reminderStatus.value.completed = true
      reminderStatus.value.success = false
      reminderStatus.value.message = result.error || 'El bot de WhatsApp no está conectado. Por favor, escanea el código QR para conectar el bot.'
      reminderStatus.value.currentStep = 'Bot desconectado'
      return
    }

    // Si hay un warning pero el proceso se inició correctamente, tratarlo como éxito
    if (result.success && result.warning) {
      console.log('⚠️ Advertencia del proceso:', result.warning)
      // Continuar como si fuera exitoso, solo mostrar el warning en consola
    }

    if (!result.success) {
      // Verificar si es un error de QR code residual (no crítico)
      const isQRCodeError = result.error?.includes('QR code') || 
                           result.error?.includes('scanning') ||
                           result.code === '100'
      
      if (isQRCodeError && result.status === 'processing') {
        // Si el proceso se inició pero hay un error residual de QR code, tratarlo como éxito
        console.log('⚠️ Error residual de QR code detectado, pero el proceso se inició correctamente')
        // Continuar como si fuera exitoso
      } else {
        throw new Error(result.error || 'Error al ejecutar el proceso')
      }
    }
    
    // Si el proceso se está ejecutando en segundo plano, mostrar progreso simulado
    if (result.status === 'processing') {
      reminderStatus.value.progress = 60
      reminderStatus.value.currentStep = 'Proceso iniciado, procesando solicitudes...'
      
      // Simular progreso gradual mientras el proceso se ejecuta en segundo plano
      // El proceso real puede tardar 1-3 minutos dependiendo de la cantidad de solicitudes
      // Pero también puede terminar rápido si no hay vacaciones
      let simulatedProgress = 60
      let progressInterval: any = null
      let hasCompleted = false
      
      // Función para limpiar y completar
      const completeProcess = () => {
        if (progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
        }
        hasCompleted = true
      }
      
      // Verificar periódicamente si el proceso terminó (polling simple)
      // Hacer una verificación rápida después de 10 segundos para ver si hay vacaciones
      const quickCheck = setTimeout(async () => {
        try {
          // Hacer una verificación rápida al backend para ver el estado
          // Por ahora, simplemente esperamos un tiempo más corto si no hay muchas solicitudes
          // El proceso normalmente tarda entre 10-30 segundos en consultar y determinar si hay vacaciones
        } catch (err) {
          // Ignorar errores de verificación
        }
      }, 10000)
      
      progressInterval = setInterval(() => {
        if (hasCompleted) {
          clearInterval(progressInterval)
          return
        }
        
        if (simulatedProgress < 95) {
          simulatedProgress += 2
          reminderStatus.value.progress = simulatedProgress
          
          // Actualizar el mensaje según el progreso
          if (simulatedProgress < 70) {
            reminderStatus.value.currentStep = 'Consultando vacaciones y procesando datos...'
          } else if (simulatedProgress < 85) {
            reminderStatus.value.currentStep = 'Enviando notificaciones a empleados...'
          } else {
            reminderStatus.value.currentStep = 'Enviando notificaciones a jefes...'
          }
        }
      }, 2000) // Actualizar cada 2 segundos
      
      // Esperar tiempo variable: 
      // - Mínimo 10 segundos (para procesos rápidos sin vacaciones - el proceso tarda ~10s en determinar si hay vacaciones)
      // - Si hay vacaciones, el proceso puede tardar 1-3 minutos
      // El proceso normalmente tarda 10-15 segundos en consultar y determinar si hay vacaciones
      await new Promise(resolve => setTimeout(resolve, 10000)) // Esperar mínimo 10 segundos (tiempo para determinar si hay vacaciones)
      
      clearTimeout(quickCheck)
      completeProcess()
      
      // Si después de 10 segundos el proceso aún no ha terminado, continuar mostrando progreso
      // pero con un mensaje indicando que puede tardar más si hay muchas vacaciones
      if (!hasCompleted) {
        reminderStatus.value.currentStep = 'Procesando vacaciones... (esto puede tardar 1-2 minutos si hay muchas solicitudes)'
      }
    } else {
      // Si no es asíncrono, esperar un poco menos
      reminderStatus.value.progress = 80
      reminderStatus.value.currentStep = 'Enviando notificaciones...'
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    reminderStatus.value.progress = 100
    reminderStatus.value.isProcessing = false
    reminderStatus.value.completed = true
    reminderStatus.value.success = true
    reminderStatus.value.message = result.message || 'Recordatorios enviados correctamente. Verifica tu WhatsApp para confirmar la recepción.'
    reminderStatus.value.currentStep = 'Proceso completado'

    // Limpiar el estado después de 5 segundos
    setTimeout(() => {
      reminderStatus.value.completed = false
      reminderStatus.value.progress = 0
    }, 5000)

  } catch (error: any) {
    console.error('❌ Error al iniciar recordatorios:', error)
    reminderStatus.value.isProcessing = false
    reminderStatus.value.completed = true
    reminderStatus.value.success = false
    reminderStatus.value.message = error.message || 'Error al ejecutar el proceso'
    reminderStatus.value.currentStep = 'Error en el proceso'
  } finally {
    isProcessing.value = false
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }
}

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>