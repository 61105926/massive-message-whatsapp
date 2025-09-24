<template>
  <div class="min-h-screen">
    <!-- Corporate Header -->
    <div class="bg-white border-b-4 border-yellow-400 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="mr-4">
              <div class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <span class="text-yellow-400 text-2xl">💬</span>
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-blue-900">Módulo de Comunicaciones</h1>
              <p class="text-gray-600 mt-1">Mensajes masivos - MINOIL S.A.</p>
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
      <!-- Message Composer -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Enviar Mensaje Masivo
          </h3>

          <form @submit.prevent="sendBulkMessage" class="space-y-6">
            <!-- Información importante -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-blue-800">Mensaje Masivo de WhatsApp</h3>
                  <div class="mt-2 text-sm text-blue-700">
                    <p>• Los mensajes se enviarán a TODOS los empleados registrados en el sistema</p>
                    <p>• Es obligatorio incluir una imagen con el mensaje</p>
                    <p>• Puedes programar el envío para una fecha y hora específica</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recipients Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-4">
                Destinatarios del Mensaje
              </label>

              <div class="space-y-6">
                <!-- Regional Filter (Informativo) -->
                <div class="bg-gray-50 p-4 rounded-lg opacity-75">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">Vista de Regionales (Solo Informativa)</h4>

                  <div class="space-y-3">
                    <div class="flex items-center">
                      <input
                        id="all-regionals"
                        v-model="selectAllRegionals"
                        type="checkbox"
                        disabled
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        @change="toggleAllRegionals"
                      >
                      <label for="all-regionals" class="ml-2 text-sm text-gray-900 font-medium">
                        Todas las regionales ({{ totalRecipients }} personas)
                      </label>
                    </div>

                    <div v-if="!loadingRegionals" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                      <div
                        v-for="regional in availableRegionals"
                        :key="regional.id"
                        class="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <input
                          :id="`regional-${regional.id}`"
                          v-model="selectedRegionals"
                          :value="regional.id"
                          type="checkbox"
                          disabled
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          @change="updateTotalRecipients"
                        >
                        <label :for="`regional-${regional.id}`" class="ml-2 text-sm text-gray-900 flex-1">
                          {{ regional.name }}
                          <span class="text-gray-500">({{ regional.count }})</span>
                        </label>
                      </div>
                    </div>

                    <div v-if="loadingRegionals" class="text-center py-4">
                      <div class="inline-flex items-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando regionales...
                      </div>
                    </div>
                  </div>

                  <div v-if="selectedRecipientCount > 0" class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p class="text-sm text-blue-800">
                      <span class="font-medium">{{ selectedRecipientCount }}</span> destinatarios seleccionados
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <!-- Message Content -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Contenido del Mensaje
              </label>

              <!-- Sugerencias de variables -->
              <div class="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <h5 class="text-sm font-medium text-amber-800 mb-2">💡 Variables disponibles:</h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-700">
                  <div>• <code class="bg-amber-100 px-1 rounded">{<!-- -->{nombre}}</code> - Nombre del empleado</div>
                  <div>• <code class="bg-amber-100 px-1 rounded">{<!-- -->{link}}</code> - Enlace personalizado</div>
                </div>
              </div>

              <textarea
                v-model="messageForm.message"
                rows="6"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: Hola {<!-- -->{nombre}}, te enviamos información importante sobre..."
                required
              ></textarea>

              <div class="mt-2 flex justify-between items-center">
                <p class="text-sm text-gray-500">
                  Caracteres: {{ messageForm.message.length }} / 1000
                </p>
                <div class="flex space-x-2">
                  <span v-if="messageForm.message.length > 800" class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    Mensaje largo
                  </span>
                  <span v-if="messageForm.message.length > 1000" class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                    Muy largo
                  </span>
                </div>
              </div>
            </div>

            <!-- Image Upload (Primary) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                📸 Imagen del Mensaje <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500 mb-3">
                La imagen es requerida para enviar el mensaje masivo
              </p>

              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h36v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2zM6 20v16a2 2 0 002 2h32a2 2 0 002-2V20H6z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="image-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Subir imagen</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        class="sr-only"
                        accept="image/*"
                        required
                        @change="handleImageUpload"
                      >
                    </label>
                    <p class="pl-1">o arrastra y suelta</p>
                  </div>
                  <p class="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 10MB (recomendado: 1080x1080px)
                  </p>
                </div>
              </div>

              <!-- Image Preview -->
              <div v-if="imageFile" class="mt-4">
                <div class="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div class="flex-shrink-0">
                    <img
                      v-if="imagePreview"
                      :src="imagePreview"
                      alt="Vista previa"
                      class="h-20 w-20 object-cover rounded-lg border border-gray-300"
                    />
                    <div v-else class="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ imageFile.name }}
                        </p>
                        <p class="text-sm text-gray-500">
                          {{ formatFileSize(imageFile.size) }}
                        </p>
                      </div>
                      <button
                        type="button"
                        @click="clearImageFile"
                        class="ml-4 text-sm text-red-600 hover:text-red-500 font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schedule Option -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center">
                <input
                  id="schedule-message"
                  v-model="messageForm.scheduled"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="schedule-message" class="ml-2 block text-sm font-medium text-gray-900">
                  📅 Programar envío para una fecha específica
                </label>
              </div>
              <p v-if="!messageForm.scheduled" class="mt-1 text-sm text-gray-500">
                Sin programación, el mensaje se enviará inmediatamente
              </p>

              <div v-if="messageForm.scheduled" class="mt-4 space-y-4">
                <div class="bg-blue-50 p-3 rounded-md">
                  <p class="text-sm text-blue-800">
                    ⏰ El mensaje se enviará automáticamente en la fecha y hora programada
                  </p>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Fecha
                    </label>
                    <input
                      v-model="messageForm.scheduleDate"
                      type="date"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :min="new Date().toISOString().split('T')[0]"
                      required
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">
                      Hora
                    </label>
                    <input
                      v-model="messageForm.scheduleTime"
                      type="time"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Send Button -->
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="resetForm"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Limpiar
              </button>
              <button
                type="submit"
                :disabled="!canSendMessage || sending"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="sending" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ sending ? 'Enviando...' : messageForm.scheduled ? 'Programar Envío' : 'Enviar Ahora' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Sending Progress -->
      <div v-if="sendingProgress.total > 0" class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Progreso del Envío
          </h3>

          <div class="space-y-4">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Enviados: {{ sendingProgress.sent }}/{{ sendingProgress.total }}</span>
              <span>{{ Math.round((sendingProgress.sent / sendingProgress.total) * 100) }}%</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-blue-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${(sendingProgress.sent / sendingProgress.total) * 100}%` }"
              ></div>
            </div>

            <div v-if="sendingProgress.errors > 0" class="text-sm text-red-600">
              Errores: {{ sendingProgress.errors }}
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Messages -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Mensajes Recientes
          </h3>

          <div class="overflow-hidden">
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
                    Mensaje (preview)
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultados
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="message in recentMessages" :key="message.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(message.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ message.recipients }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="max-w-xs truncate">
                      {{ message.message }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': message.status === 'completed',
                        'bg-yellow-100 text-yellow-800': message.status === 'sending',
                        'bg-blue-100 text-blue-800': message.status === 'scheduled',
                        'bg-red-100 text-red-800': message.status === 'failed'
                      }"
                    >
                      {{ getStatusText(message.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ message.sent }}/{{ message.total }}
                    <span v-if="message.errors > 0" class="text-red-600">
                      ({{ message.errors }} errores)
                    </span>
                  </td>
                </tr>
                <tr v-if="recentMessages.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    No hay mensajes masivos recientes
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
import { API_CONFIG } from '@/config/api'

// Tipos
interface MessageForm {
  message: string
  scheduled: boolean
  scheduleDate: string
  scheduleTime: string
}

interface RecentMessage {
  id: string
  timestamp: Date
  recipients: number
  message: string
  status: 'sending' | 'completed' | 'failed' | 'scheduled'
  sent: number
  total: number
  errors: number
}

interface Regional {
  id: string
  name: string
  count: number
}

// Estados reactivos
const messageForm = reactive<MessageForm>({
  message: '',
  scheduled: false,
  scheduleDate: '',
  scheduleTime: ''
})

// Recipients selection
const availableRegionals = ref<Regional[]>([])
const selectedRegionals = ref<string[]>([])
const selectAllRegionals = ref(false)
const loadingRegionals = ref(false)
const totalRecipients = ref(0)

// Files
const recipientsFile = ref<File | null>(null)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const sending = ref(false)

const sendingProgress = reactive({
  sent: 0,
  total: 0,
  errors: 0
})

const recentMessages = ref<RecentMessage[]>([])

// Computed properties
const selectedRecipientCount = computed(() => {
  if (recipientsFile.value) {
    return 0 // Se calculará después de procesar el archivo
  }

  return selectedRegionals.value.reduce((total, regionalId) => {
    const regional = availableRegionals.value.find(r => r.id === regionalId)
    return total + (regional?.count || 0)
  }, 0)
})

const canSendMessage = computed(() => {
  // Ya no necesitamos validar destinatarios específicos porque se envía a todos
  const hasMessage = messageForm.message.trim().length > 0
  const hasImage = imageFile.value
  const hasValidSchedule = !messageForm.scheduled || (messageForm.scheduleDate && messageForm.scheduleTime)
  const messageNotTooLong = messageForm.message.length <= 1000

  return hasMessage && hasImage && hasValidSchedule && messageNotTooLong && !sending.value
})

// Métodos
const loadRegionals = async () => {
  loadingRegionals.value = true
  try {
    // TODO: Implementar carga de regionales cuando esté disponible la funcionalidad
    // const response = await fetch(buildExternalApiUrl(API_CONFIG.ENDPOINTS.SURVEY_API))
    // const data = await response.json()

    // Por ahora, datos de ejemplo para la interfaz
    availableRegionals.value = [
      { id: '1', name: 'Regional La Paz', count: 45 },
      { id: '2', name: 'Regional Santa Cruz', count: 38 },
      { id: '3', name: 'Regional Cochabamba', count: 32 },
      { id: '4', name: 'Regional Oruro', count: 15 },
      { id: '5', name: 'Regional Potosí', count: 12 }
    ]

    // Calcular total de recipients
    totalRecipients.value = availableRegionals.value.reduce((total, regional) => total + regional.count, 0)

  } catch (error) {
    console.error('Error loading regionals:', error)
    availableRegionals.value = []
    totalRecipients.value = 0
  } finally {
    loadingRegionals.value = false
  }
}

const toggleAllRegionals = () => {
  if (selectAllRegionals.value) {
    selectedRegionals.value = availableRegionals.value.map(r => r.id)
  } else {
    selectedRegionals.value = []
  }
}

const updateTotalRecipients = () => {
  // Actualizar el estado del "seleccionar todo"
  selectAllRegionals.value = selectedRegionals.value.length === availableRegionals.value.length
}

const handleRecipientsFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    recipientsFile.value = target.files[0]
    // Limpiar selección de regionales
    selectedRegionals.value = []
    selectAllRegionals.value = false
  }
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    imageFile.value = file

    // Crear preview de la imagen
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const clearRecipientsFile = () => {
  recipientsFile.value = null
}

const clearImageFile = () => {
  imageFile.value = null
  imagePreview.value = null
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const resetForm = () => {
  messageForm.message = ''
  messageForm.scheduled = false
  messageForm.scheduleDate = ''
  messageForm.scheduleTime = ''

  // Limpiar selección de regionales
  selectedRegionals.value = []
  selectAllRegionals.value = false

  // Limpiar archivos
  recipientsFile.value = null
  imageFile.value = null
  imagePreview.value = null
}

const sendBulkMessage = async () => {
  if (!canSendMessage.value) return

  sending.value = true
  sendingProgress.sent = 0
  sendingProgress.total = 0
  sendingProgress.errors = 0

  try {
    const formData = new FormData()

    // Agregar mensaje y configuración (el backend espera un array de mensajes)
    formData.append('messages', JSON.stringify([messageForm.message]))

    if (messageForm.scheduled) {
      formData.append('scheduled', 'true')
      formData.append('scheduleDate', messageForm.scheduleDate)
      formData.append('scheduleTime', messageForm.scheduleTime)
    }

    // Agregar imagen (requerida) - el backend espera 'file'
    if (imageFile.value) {
      formData.append('file', imageFile.value)
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BULK_MESSAGES}`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (data.success) {
      // El mensaje se envía a todos los empleados
      const totalRecipientsCount = data.total || totalRecipients.value || 142

      // Agregar mensaje a la lista de recientes
      const newMessage: RecentMessage = {
        id: Date.now().toString(),
        timestamp: new Date(),
        recipients: totalRecipientsCount,
        message: messageForm.message,
        status: messageForm.scheduled ? 'scheduled' : 'sending',
        sent: 0,
        total: totalRecipientsCount,
        errors: 0
      }

      recentMessages.value.unshift(newMessage)

      if (!messageForm.scheduled) {
        // Simular progreso para envío inmediato
        sendingProgress.total = totalRecipientsCount
        const interval = setInterval(() => {
          if (sendingProgress.sent < sendingProgress.total) {
            sendingProgress.sent++
            newMessage.sent = sendingProgress.sent

            // Simular algunos errores aleatoriamente
            if (Math.random() < 0.03) { // 3% de probabilidad de error
              sendingProgress.errors++
              newMessage.errors = sendingProgress.errors
            }
          } else {
            clearInterval(interval)
            newMessage.status = 'completed'
          }
        }, 300) // Más rápido para testing
      }

      // Mostrar mensaje de éxito
      alert(`✅ Mensaje enviado exitosamente a ${totalRecipientsCount} destinatarios`)

      // Limpiar formulario después del envío exitoso
      resetForm()

    } else {
      alert('Error: ' + (data.message || 'Error desconocido'))
    }
  } catch (error) {
    console.error('Error sending bulk message:', error)
    alert('Error de conexión con el servidor')
  } finally {
    sending.value = false
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    sending: 'Enviando',
    completed: 'Completado',
    failed: 'Fallido',
    scheduled: 'Programado'
  }
  return statusMap[status] || status
}

const loadRecentMessages = async () => {
  try {
    const response = await fetch('http://localhost:3001/logs/bulk-messages')
    const data = await response.json()

    if (data.success && data.messages) {
      recentMessages.value = data.messages.map((msg: any) => ({
        id: msg.id,
        timestamp: new Date(msg.timestamp),
        recipients: msg.recipients,
        message: msg.message,
        status: msg.status,
        sent: msg.sent,
        total: msg.total,
        errors: msg.errors || 0
      }))
    }
  } catch (error) {
    console.error('Error loading recent messages:', error)

    // Datos de ejemplo para desarrollo
    recentMessages.value = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000),
        recipients: 25,
        message: 'Recordatorio: Las boletas de septiembre están disponibles...',
        status: 'completed',
        sent: 25,
        total: 25,
        errors: 0
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 86400000),
        recipients: 150,
        message: 'Información importante sobre cambios en el sistema...',
        status: 'completed',
        sent: 148,
        total: 150,
        errors: 2
      }
    ]
  }
}

// Lifecycle
onMounted(() => {
  loadRegionals()
  loadRecentMessages()

  // Actualizar cada minuto
  setInterval(loadRecentMessages, 60000)
})
</script>