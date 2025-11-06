<template>
  <div class="space-y-4">
    <!-- Toast Notification -->
    <div
      v-if="notification.show"
      :class="[
        'fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] rounded-lg shadow-lg p-4 transition-all duration-300',
        notification.type === 'success' ? 'bg-green-50 border-2 border-green-500' : '',
        notification.type === 'error' ? 'bg-red-50 border-2 border-red-500' : '',
        notification.type === 'info' ? 'bg-blue-50 border-2 border-blue-500' : ''
      ]"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5 text-green-600" />
          <AlertCircle v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-600" />
          <AlertCircle v-else class="h-5 w-5 text-blue-600" />
        </div>
        <div class="flex-1">
          <h4
            :class="[
              'font-semibold text-sm',
              notification.type === 'success' ? 'text-green-900' : '',
              notification.type === 'error' ? 'text-red-900' : '',
              notification.type === 'info' ? 'text-blue-900' : ''
            ]"
          >
            {{ notification.title }}
          </h4>
          <p
            :class="[
              'text-sm mt-1',
              notification.type === 'success' ? 'text-green-700' : '',
              notification.type === 'error' ? 'text-red-700' : '',
              notification.type === 'info' ? 'text-blue-700' : ''
            ]"
          >
            {{ notification.message }}
          </p>
        </div>
        <button
          @click="notification.show = false"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <h3 class="text-lg font-semibold leading-none tracking-tight">Panel de Aprobación</h3>
        <p class="text-sm text-muted-foreground">Solicitudes pendientes de aprobación</p>
      </CardHeader>
    </Card>

    <!-- Loading State -->
    <Card v-if="isLoading">
      <CardContent class="py-12">
        <div class="flex flex-col items-center justify-center text-center space-y-4">
          <svg class="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold">Cargando solicitudes...</h3>
            <p class="text-sm text-muted-foreground">Por favor espera</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Error State -->
    <Card v-else-if="error">
      <CardContent class="py-8">
        <div class="flex flex-col items-center text-center space-y-3">
          <AlertCircle class="h-12 w-12 text-red-500" />
          <div>
            <h3 class="text-lg font-semibold text-red-900">Error al cargar solicitudes</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
          <button
            @click="fetchManagerRequests"
            class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <div v-else-if="pendingRequests.length === 0" class="text-center py-8">
      <CheckCircle class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p class="text-muted-foreground">No hay solicitudes pendientes</p>
    </div>

    <!-- Request List -->
    <div v-else class="space-y-4">
      <Card v-for="request in pendingRequests" :key="request.id_solicitud">
        <CardContent class="pt-6">
          <div class="space-y-4">
            <!-- Employee Info -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="font-medium">{{ request.empleado?.nombre || `Empleado #${request.emp_id}` }}</p>
                <p class="text-sm text-muted-foreground">{{ request.empleado?.cargo || 'N/A' }}</p>
              </div>
            </div>

            <!-- Request Details -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Período</p>
                <p class="font-medium">
                  {{ formatDate(request.fechas[0].fecha) }} - {{ formatDate(request.fechas[request.fechas.length - 1].fecha) }}
                </p>
              </div>
              <div>
                <p class="text-muted-foreground">Días solicitados</p>
                <p class="font-medium">{{ request.total_dias }} día{{ parseInt(request.total_dias) > 1 ? 's' : '' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Tipo</p>
                <p class="font-medium">{{ getVacationType(request.tipo) }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Estado</p>
                <span :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  request.estado === 'PROCESO' ? 'bg-yellow-100 text-yellow-800' : '',
                  request.estado === 'APROBADO' ? 'bg-green-100 text-green-800' : '',
                  request.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ request.estado }}
                </span>
              </div>
            </div>

            <!-- Fechas detalladas -->
            <div class="border-t pt-3">
              <p class="text-sm font-medium mb-2">Detalle de fechas:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(fecha, idx) in request.fechas"
                  :key="idx"
                  class="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  {{ formatDate(fecha.fecha) }} - {{ fecha.turno }}
                </span>
              </div>
            </div>

            <!-- Request Date -->
            <div class="text-xs text-muted-foreground">
              Solicitado el {{ formatDate(request.fecha_solicitud) }}
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t">
              <button
                @click="handleApprove(request.id_solicitud)"
                :disabled="isProcessing"
                class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
              >
                <CheckCircle class="h-4 w-4 mr-2" />
                Aprobar
              </button>

              <button
                @click="handleReject(request.id_solicitud)"
                :disabled="isProcessing"
                class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
              >
                <X class="h-4 w-4 mr-2" />
                Rechazar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Summary Stats -->
    <div v-if="requests.length > 0" class="grid grid-cols-3 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</div>
            <p class="text-xs text-muted-foreground">Pendientes</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ approvedCount }}</div>
            <p class="text-xs text-muted-foreground">Aprobadas</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ rejectedCount }}</div>
            <p class="text-xs text-muted-foreground">Rechazadas</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modal de Aprobación -->
    <div
      v-if="showApproveModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="cancelApprove"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
        @click.stop
      >
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-green-900">Aprobar Solicitud</h3>
            <p class="text-sm text-gray-600 mt-1">Confirma la aprobación de esta solicitud</p>
          </div>

          <!-- Resumen de la solicitud -->
          <div v-if="selectedRequest" class="p-4 bg-green-50 rounded-lg border border-green-200">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Empleado:</span>
                <span class="font-semibold text-gray-900">{{ selectedRequest.empleado?.nombre || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Cargo:</span>
                <span class="font-medium text-gray-700">{{ selectedRequest.empleado?.cargo || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tipo:</span>
                <span class="font-medium text-gray-700">{{ getVacationType(selectedRequest.tipo) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Días:</span>
                <span class="font-semibold text-green-700">{{ selectedRequest.total_dias }} día{{ parseInt(selectedRequest.total_dias) > 1 ? 's' : '' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Período:</span>
                <span class="font-medium text-gray-700">
                  {{ formatDate(selectedRequest.fechas[0].fecha) }} - {{ formatDate(selectedRequest.fechas[selectedRequest.fechas.length - 1].fecha) }}
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label for="approve-comment" class="text-sm font-medium text-gray-700">
              Comentario (opcional)
            </label>
            <textarea
              id="approve-comment"
              v-model="approveComment"
              rows="3"
              placeholder="Ej: Aprobado según disponibilidad del equipo"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              :disabled="isProcessing"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="cancelApprove"
              :disabled="isProcessing"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="confirmApprove"
              :disabled="isProcessing"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 disabled:opacity-50"
            >
              <CheckCircle class="h-4 w-4 mr-2" />
              <span v-if="isProcessing">Procesando...</span>
              <span v-else>Confirmar Aprobación</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Rechazo -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="cancelReject"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
        @click.stop
      >
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-red-900">Rechazar Solicitud</h3>
            <p class="text-sm text-gray-600 mt-1">Por favor proporciona un motivo para el rechazo</p>
          </div>

          <!-- Resumen de la solicitud -->
          <div v-if="selectedRequest" class="p-4 bg-red-50 rounded-lg border border-red-200">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Empleado:</span>
                <span class="font-semibold text-gray-900">{{ selectedRequest.empleado?.nombre || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Cargo:</span>
                <span class="font-medium text-gray-700">{{ selectedRequest.empleado?.cargo || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tipo:</span>
                <span class="font-medium text-gray-700">{{ getVacationType(selectedRequest.tipo) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Días:</span>
                <span class="font-semibold text-red-700">{{ selectedRequest.total_dias }} día{{ parseInt(selectedRequest.total_dias) > 1 ? 's' : '' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Período:</span>
                <span class="font-medium text-gray-700">
                  {{ formatDate(selectedRequest.fechas[0].fecha) }} - {{ formatDate(selectedRequest.fechas[selectedRequest.fechas.length - 1].fecha) }}
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label for="reject-comment" class="text-sm font-medium text-red-900">
              Motivo del rechazo *
            </label>
            <textarea
              id="reject-comment"
              v-model="rejectComment"
              rows="4"
              placeholder="Ej: Falta personal, periodo no disponible, etc."
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              :disabled="isProcessing"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="cancelReject"
              :disabled="isProcessing"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="confirmReject"
              :disabled="isProcessing || !rejectComment.trim()"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2 disabled:opacity-50"
            >
              <X class="h-4 w-4 mr-2" />
              <span v-if="isProcessing">Procesando...</span>
              <span v-else>Confirmar Rechazo</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="isProcessing"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 shadow-xl">
        <div class="flex items-center space-x-3">
          <svg class="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Procesando...</span>
        </div>
      </div>
    </div>

    <!-- Modal de Reemplazantes para Vacaciones Programadas -->
    <div
      v-if="showReplacementModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="showReplacementModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
        @click.stop
      >
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-green-900">Aprobar Vacaciones Programadas</h3>
            <p class="text-sm text-gray-600 mt-1">Selecciona los reemplazantes para esta solicitud</p>
          </div>

          <!-- Resumen de la solicitud -->
          <div v-if="selectedRequest" class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Empleado:</span>
                <span class="font-semibold text-gray-900">{{ selectedRequest.empleado?.nombre || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Días:</span>
                <span class="font-medium text-gray-700">{{ selectedRequest.total_dias }} día{{ parseInt(selectedRequest.total_dias) > 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>

          <!-- Selección de reemplazantes -->
          <div>
            <label class="text-sm font-medium mb-2 block">
              Reemplazantes * (puedes seleccionar varios)
            </label>
            <div class="rounded-md border border-input bg-background p-3 max-h-64 overflow-y-auto space-y-2">
              <div
                v-for="person in availableReplacements"
                :key="person.id"
                class="flex items-center space-x-2 hover:bg-accent p-2 rounded"
              >
                <input
                  type="checkbox"
                  :id="`replacement-boss-${person.id}`"
                  :value="person.id"
                  v-model="selectedReplacements"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  :for="`replacement-boss-${person.id}`"
                  class="flex-1 text-sm cursor-pointer"
                >
                  {{ person.name }} - {{ person.department }}
                </label>
              </div>
              <div v-if="availableReplacements.length === 0" class="text-sm text-muted-foreground text-center py-2">
                No hay reemplazantes disponibles. Será aprobada sin reemplazantes.
              </div>
            </div>
            <p v-if="availableReplacements.length > 0" class="text-xs text-muted-foreground mt-2">
              Selección opcional
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3">
            <button
              @click="confirmApproveWithReplacements"
              :disabled="isProcessing"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              Aprobar
            </button>
            <button
              @click="showReplacementModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CheckCircle, User, X, AlertCircle } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { saveVacationToExternalAPI, type SaveVacationPayload } from '@/services/vacationAPI'

interface VacationRequest {
  id_solicitud: string
  emp_id: string
  fecha_solicitud: string
  estado: string
  tipo: string
  total_dias: string
  fechas: Array<{
    fecha: string
    turno: string
    observacion: string | null
  }>
  empleado?: {
    nombre: string
    cargo: string
  }
  reemplazante?: Array<{ // Changed from reemplazantes to reemplazante (singular)
    emp_id: string;
    nombre: string;
    telefono?: string;
  }>
}

interface EmployeeCache {
  [empId: string]: {
    nombre: string
    cargo: string
  }
}

interface Props {
  managerId?: string
}

const props = defineProps<Props>()
// const emit = defineEmits<{
//   requestUpdate: [requests: any[]]
// }>()

const requests = ref<VacationRequest[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const employeeCache = ref<EmployeeCache>({})
const isProcessing = ref(false)
const showRejectModal = ref(false)
const showApproveModal = ref(false)
const showReplacementModal = ref(false)
const selectedRequestId = ref<string | null>(null)
const selectedRequest = ref<VacationRequest | null>(null)
const rejectComment = ref('')
const approveComment = ref('')
const availableReplacements = ref<any[]>([])
const selectedReplacements = ref<string[]>([])

// Notification state
const notification = ref({
  show: false,
  type: 'success' as 'success' | 'error' | 'info',
  title: '',
  message: ''
})

// Show notification function
const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  notification.value = {
    show: true,
    type,
    title,
    message
  }

  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

// Obtener información de un empleado desde el nuevo endpoint
const fetchEmployeeInfo = async (empId: string) => {
  // Si ya está en cache, retornar del cache
  if (employeeCache.value[empId]) {
    return employeeCache.value[empId]
  }

  try {
    const response = await fetch(`http://190.171.225.68/api/empleado/info?emp_id=${empId}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }

    const result = await response.json()

    if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
      const employeeData = result.data[0]
      const employeeInfo = {
        nombre: employeeData.fullName || `Empleado #${empId}`,
        cargo: employeeData.cargo || 'N/A'
      }

      // Guardar en cache
      employeeCache.value[empId] = employeeInfo
      return employeeInfo
    } else {
      throw new Error('No se encontró información del empleado')
    }
  } catch (err) {
    console.error(`❌ Error al cargar info del empleado ${empId}:`, err)
    const fallbackInfo = {
      nombre: `Empleado #${empId}`,
      cargo: 'N/A'
    }
    // Guardar en cache aunque sea fallback para no reintentar
    employeeCache.value[empId] = fallbackInfo
    return fallbackInfo
  }
}

// Cargar solicitudes del manager desde el API
const fetchManagerRequests = async () => {
  if (!props.managerId) {
    error.value = 'No se ha especificado el ID del manager'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // 1. Cargar las solicitudes del manager
    const response = await fetch(`http://190.171.225.68/api/vacacion-data-manager?manager=${props.managerId}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success && Array.isArray(data.data)) {
      // 2. Obtener IDs únicos de empleados
      const uniqueEmpIds = [...new Set(data.data.map((req: VacationRequest) => req.emp_id))] as string[]
      console.log('📋 Empleados únicos a cargar:', uniqueEmpIds)

      // 3. Cargar información de todos los empleados en paralelo
      await Promise.all(
        uniqueEmpIds.map((empId) => fetchEmployeeInfo(empId))
      )

      // 4. Agregar la info del empleado a cada solicitud desde el cache
      requests.value = data.data.map((req: VacationRequest) => ({
        ...req,
        empleado: employeeCache.value[req.emp_id]
      }))

      console.log('✅ Solicitudes con info de empleados:', requests.value)
      console.log('📊 Total de solicitudes:', requests.value.length)
      
      // 5. Emitir evento con las solicitudes para el calendario
      const event = new CustomEvent('vacations-loaded', {
        detail: { requests: requests.value }
      })
      console.log('📢 Disparando evento vacations-loaded con', requests.value.length, 'solicitudes')
      window.dispatchEvent(event)
    } else {
      throw new Error('Formato de respuesta inválido')
    }
  } catch (err: any) {
    console.error('❌ Error al cargar solicitudes del manager:', err)
    error.value = err.message || 'Error al cargar las solicitudes'
  } finally {
    isLoading.value = false
  }
}

// Watch para recargar cuando cambia el managerId
watch(() => props.managerId, (newId) => {
  if (newId) {
    fetchManagerRequests()
  }
}, { immediate: true })

const pendingRequests = computed(() => {
  // Excluir vacaciones programadas del panel de aprobación
  return requests.value.filter(req => 
    (req.estado === 'PROCESO' || req.estado === 'PENDIENTE') && 
    req.tipo !== 'PROGRAMADA'
  )
})

const pendingCount = computed(() => {
  return pendingRequests.value.length
})

const approvedCount = computed(() => {
  return requests.value.filter(req => 
    req.estado === 'APROBADO' && req.tipo !== 'PROGRAMADA'
  ).length
})

const rejectedCount = computed(() => {
  return requests.value.filter(req => 
    req.estado === 'RECHAZADO' && req.tipo !== 'PROGRAMADA'
  ).length
})

// Función para aprobar solicitud (abre modal)
const handleApprove = (requestId: string) => {
  const request = requests.value.find(r => r.id_solicitud === requestId)
  if (!request) return

  selectedRequestId.value = requestId
  selectedRequest.value = request
  approveComment.value = ''
  
  // Si es una solicitud programada, mostrar modal de reemplazantes
  if (request.tipo === 'PROGRAMADA') {
    showReplacementModal.value = true
    // Aquí deberías cargar los reemplazantes disponibles
    availableReplacements.value = []
  } else {
    showApproveModal.value = true
  }
}

// Confirmar aprobación con reemplazantes
const confirmApproveWithReplacements = async () => {
  if (!selectedRequestId.value) return

  isProcessing.value = true

  try {
    await updateRequestStatus(
      selectedRequestId.value,
      'APROBADO',
      approveComment.value.trim() || 'Aprobado por el jefe',
      selectedReplacements.value
    )

    // Cerrar modal
    showReplacementModal.value = false
    selectedRequestId.value = null
    selectedRequest.value = null
    selectedReplacements.value = []
  } finally {
    isProcessing.value = false
  }
}

// Confirmar aprobación
const confirmApprove = async () => {
  if (!selectedRequestId.value) return

  await updateRequestStatus(
    selectedRequestId.value,
    'APROBADO',
    approveComment.value.trim() || 'Aprobado por el jefe'
  )

  // Cerrar modal
  showApproveModal.value = false
  selectedRequestId.value = null
  selectedRequest.value = null
  approveComment.value = ''
}

// Cancelar aprobación
const cancelApprove = () => {
  showApproveModal.value = false
  selectedRequestId.value = null
  selectedRequest.value = null
  approveComment.value = ''
}

// Función para rechazar solicitud (abre modal)
const handleReject = (requestId: string) => {
  const request = requests.value.find(r => r.id_solicitud === requestId)
  if (!request) return

  selectedRequestId.value = requestId
  selectedRequest.value = request
  rejectComment.value = ''
  showRejectModal.value = true
}

// Confirmar rechazo con comentario
const confirmReject = async () => {
  if (!selectedRequestId.value) return

  if (!rejectComment.value.trim()) {
    showNotification('error', 'Campo requerido', 'Por favor ingresa un motivo para el rechazo')
    return
  }

  await updateRequestStatus(selectedRequestId.value, 'RECHAZADO', rejectComment.value)

  // Cerrar modal
  showRejectModal.value = false
  selectedRequestId.value = null
  selectedRequest.value = null
  rejectComment.value = ''
}

// Cancelar rechazo
const cancelReject = () => {
  showRejectModal.value = false
  selectedRequestId.value = null
  selectedRequest.value = null
  rejectComment.value = ''
}

// Función principal para actualizar el estado en el backend
const updateRequestStatus = async (requestId: string, estado: 'APROBADO' | 'RECHAZADO', comentario: string, reemplazantes?: string[]) => {
  if (isProcessing.value) {
    showNotification('info', 'Operación en proceso', 'Ya hay una operación en proceso. Por favor espera.')
    return
  }

  isProcessing.value = true

  try {
    console.log(`📤 Actualizando solicitud ${requestId} a ${estado}`)
    console.log(`📍 Reemplazantes:`, reemplazantes)

    const payload: any = {
      id_solicitud: parseInt(requestId),
      estado: estado,
      comentario: comentario || (estado === 'APROBADO' ? 'Aprobado por el jefe' : '')
    }
    
    if (reemplazantes && reemplazantes.length > 0) {
      payload.reemplazantes = reemplazantes
    }

    const response = await fetch('http://190.171.225.68/api/vacaciones/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || `Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.status === 'success' || response.ok) {
      console.log('✅ Solicitud actualizada exitosamente')

      // Actualizar localmente
      requests.value = requests.value.map(req => {
        if (req.id_solicitud === requestId) {
          return {
            ...req,
            estado: estado
          }
        }
        return req
      })

      // 🚀 GUARDAR EN API EXTERNA
      // Después de actualizar el estado, guardar en la API externa
      const requestData = requests.value.find(req => req.id_solicitud === requestId)
      if (requestData) {
        try {
          console.log('📤 Guardando vacación en API externa...')
          
          const vacationPayload: SaveVacationPayload = {
            emp_id: requestData.emp_id,
            emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
            manager_id: String(props.managerId || ''), // ID del manager que está aprobando
            manager_nombre: 'Manager', // TODO: Obtener nombre real del manager
            tipo: requestData.tipo,
            estado: estado,
            comentario: comentario,
            fechas: requestData.fechas.map(f => ({
              fecha: f.fecha,
              tipo_dia: f.turno || 'COMPLETO'
            })),
            branch: 1, // TODO: Obtener branch real
            dept: 10    // TODO: Obtener departamento real
          }

          const apiResult = await saveVacationToExternalAPI(vacationPayload)
          console.log('✅ Vacación guardada exitosamente en API externa:', apiResult)
          
        } catch (apiError: any) {
          console.error('❌ Error al guardar en API externa:', apiError)
          // No fallar la operación principal si falla la API externa
          showNotification('info', 'Advertencia', 
            'La solicitud fue procesada pero hubo un problema al guardar en el sistema externo. Contacta al administrador.')
        }
      }

      // 🔔 ENVIAR NOTIFICACIONES DE WHATSAPP
      // Enviar notificaciones a los reemplazantes (si es aprobado) o al empleado (si es rechazado)

      if (requestData) {
        try {
          // Usar los datos de reemplazantes que ya vienen en requestData
          let reemplazantesCompletos = []
          
          console.log('🔍 DEBUG - requestData completo:', JSON.stringify(requestData, null, 2))
          console.log('🔍 DEBUG - requestData.reemplazante:', requestData.reemplazante)
          console.log('🔍 DEBUG - requestData.reemplazante length:', requestData.reemplazante?.length)
          
          if (requestData.reemplazante && requestData.reemplazante.length > 0) {
            console.log('✅ Hay reemplazantes en la solicitud, usando datos existentes...')
            // Usar directamente los datos que ya vienen en requestData.reemplazante
            reemplazantesCompletos = requestData.reemplazante.map((rep: any) => ({
              emp_id: rep.emp_id,
              nombre: rep.nombre,
              telefono: rep.telefono || '77711124' // Fallback si no hay teléfono
            }))
            console.log('✅ Reemplazantes obtenidos de requestData:', reemplazantesCompletos)
          } else {
            console.log('⚠️ No hay reemplazantes en requestData, obteniendo desde API específica...')
            // Como la API vacacion-data-manager no incluye reemplazantes,
            // obtener los reemplazantes específicos de esta solicitud desde la API
            try {
              const reemplazanteResponse = await fetch(`http://190.171.225.68/api/reemplazante-vacation?idsolicitud=${requestId}`)
              if (reemplazanteResponse.ok) {
                const reemplazanteData = await reemplazanteResponse.json()
                if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                  // Usar los reemplazantes específicos de esta solicitud
                  reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                    emp_id: rep.EMP_ID,
                    nombre: rep.NOMBRE,
                    telefono: rep.TELEFONO
                  }))
                  console.log('✅ Reemplazantes específicos obtenidos de API:', reemplazantesCompletos)
                } else {
                  throw new Error('No se encontraron reemplazantes específicos en la API')
                }
              } else {
                throw new Error('Error al obtener reemplazantes específicos')
              }
            } catch (apiError) {
              console.warn('⚠️ Error al obtener reemplazantes específicos, usando fallback:', apiError)
              // Fallback: usar Charvel Santiago como default
              reemplazantesCompletos = [
                {
                  emp_id: '493',
                  nombre: 'Charvel Santiago',
                  telefono: '78003551'
                }
              ]
              console.log('✅ Usando reemplazantes de fallback:', reemplazantesCompletos)
            }
          }

          // Preparar payload para notificaciones
          const notificationPayload = {
            id_solicitud: requestId,
            emp_id: requestData.emp_id,
            emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
            estado: estado,
            comentario: comentario,
            tipo: requestData.tipo,
            dias_solicitados: parseInt(requestData.total_dias),
            fechas: requestData.fechas.map((f: any) => `${f.fecha} (${f.turno})`),
            // Usar los reemplazantes obtenidos de la API
            reemplazantes: reemplazantesCompletos.map((rep: any) => ({
              emp_id: rep.emp_id,
              nombre: rep.nombre,
              telefono: rep.telefono
            }))
          }

          console.log('🔍 DEBUG - Datos de la solicitud:', requestData)
          console.log('🔍 DEBUG - Reemplazantes obtenidos:', reemplazantesCompletos)
          console.log('🔍 DEBUG - Payload de notificación:', notificationPayload)

          // Enviar al bot de WhatsApp
          // Usa VITE_BACKEND_URL del .env
          const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'

          await fetch(`${BOT_URL}/api/vacation-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationPayload)
          }).catch(err => {
            console.warn('⚠️ No se pudo enviar notificación de WhatsApp:', err)
            // No fallar la operación si las notificaciones fallan
          })

          console.log('✅ Notificaciones de WhatsApp enviadas')
        } catch (notifError) {
          console.warn('⚠️ Error al enviar notificaciones:', notifError)
          // Continuar aunque fallen las notificaciones
        }
      }

      // Mostrar mensaje de éxito con toast notification
      if (estado === 'APROBADO') {
        showNotification(
          'success',
          'Solicitud Aprobada',
          'La solicitud ha sido aprobada exitosamente y se enviaron las notificaciones'
        )
      } else {
        showNotification(
          'success',
          'Solicitud Rechazada',
          `La solicitud ha sido rechazada. Motivo: ${comentario}`
        )
      }

      // Recargar solicitudes para actualizar la lista
      await fetchManagerRequests()
    } else {
      throw new Error(result.message || 'Error al actualizar la solicitud')
    }
  } catch (error: any) {
    console.error('❌ Error al actualizar solicitud:', error)

    let errorMessage = 'Error al actualizar la solicitud. '
    if (error.message.includes('Failed to fetch')) {
      errorMessage += 'No se pudo conectar con el servidor.'
    } else {
      errorMessage += error.message || 'Por favor intenta nuevamente.'
    }

    showNotification('error', 'Error al actualizar', errorMessage)
  } finally {
    isProcessing.value = false
  }
}

const getVacationType = (tipo: string) => {
  switch (tipo) {
    case 'PROGRAMADA':
      return 'Vacaciones Programadas'
    case 'A_CUENTA':
      return 'Vacaciones a Cuenta'
    case 'FERIADO':
      return 'Feriado'
    case 'PERMISO':
      return 'Permiso'
    default:
      return tipo
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}
</script>