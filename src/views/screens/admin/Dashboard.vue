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
        <router-link
          to="/vacaciones"
          class="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <div class="p-8 text-center">
            <div class="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-yellow-400 text-3xl font-bold">📅</span>
            </div>
            <h3 class="text-2xl font-bold text-blue-900 mb-4">Solicitar Vacaciones</h3>
            <p class="text-gray-600 mb-6">
              Sistema de solicitud de vacaciones, permisos y días personales con aprobación automática
            </p>
            <div class="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg">
              📅 Solicitar Vacaciones
            </div>
          </div>
        </router-link>

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

// Estado reactivo para la conexión del backend
const backendStatus = ref({
  connected: false,
  lastCheck: null as Date | null,
  error: null as string | null
})

let statusInterval: number | null = null

// Función para verificar el estado del backend
const checkBackendStatus = async () => {
  try {
    // Crear AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch('http://localhost:3002/status', {
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
})

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
})
</script>