<template>
  <div class="space-y-4">
    <Card>
      <CardHeader>
        <h3 class="text-lg font-semibold leading-none tracking-tight">Historial de Solicitudes</h3>
        <p class="text-sm text-muted-foreground">Todas tus solicitudes de vacaciones</p>
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
            <h3 class="text-lg font-semibold">Cargando historial...</h3>
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
            <h3 class="text-lg font-semibold text-red-900">Error al cargar historial</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
          <button
            @click="fetchEmployeeRequests"
            class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Empty State -->
    <div v-else-if="requests.length === 0" class="text-center py-8">
      <Calendar class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p class="text-muted-foreground">No tienes solicitudes de vacaciones aún</p>
    </div>

    <!-- Request List -->
    <div v-else class="space-y-3">
      <Card v-for="request in sortedRequests" :key="request.id_solicitud">
        <CardContent class="pt-6">
          <div class="flex items-start justify-between">
            <div class="space-y-2 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  :class="[
                    'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
                    getStatusBadgeClass(request.estado)
                  ]"
                >
                  {{ getStatusText(request.estado) }}
                </span>
                <span class="text-sm text-muted-foreground">
                  {{ request.total_dias }} día{{ parseInt(request.total_dias) > 1 ? 's' : '' }}
                </span>
                <span class="text-xs text-muted-foreground">
                  ID: {{ request.id_solicitud }}
                </span>
              </div>

              <div class="space-y-1">
                <p class="text-sm">
                  <strong>Período:</strong>
                  {{ formatDate(request.fechas[0].fecha) }} - {{ formatDate(request.fechas[request.fechas.length - 1].fecha) }}
                </p>
                <p class="text-sm">
                  <strong>Tipo:</strong> {{ getVacationType(request.tipo) }}
                </p>
              </div>

              <!-- Fechas detalladas -->
              <div class="pt-2">
                <p class="text-xs font-medium mb-1 text-muted-foreground">Fechas:</p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="(fecha, idx) in request.fechas"
                    :key="idx"
                    class="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {{ formatDate(fecha.fecha) }} - {{ fecha.turno }}
                  </span>
                </div>
              </div>

              <div class="text-xs text-muted-foreground">
                Solicitado el {{ formatDate(request.fecha_solicitud) }}
              </div>
            </div>

            <div class="flex flex-col gap-2 ml-3">
              <button
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 whitespace-nowrap"
              >
                <Eye class="h-4 w-4 mr-1" />
                Ver
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Calendar, Eye, AlertCircle } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'

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
}

interface Props {
  empId?: string
}

const props = defineProps<Props>()
defineEmits<{
  takeVacation: [requestId: string]
}>()

const requests = ref<VacationRequest[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Cargar solicitudes del empleado desde el API
const fetchEmployeeRequests = async () => {
  if (!props.empId) {
    error.value = 'No se ha especificado el ID del empleado'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await fetch(`http://190.171.225.68/api/vacacion-data-empleado?emp_id=${props.empId}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success && Array.isArray(data.data)) {
      requests.value = data.data
      console.log('✅ Solicitudes del empleado cargadas:', requests.value)
    } else {
      throw new Error('Formato de respuesta inválido')
    }
  } catch (err: any) {
    console.error('❌ Error al cargar solicitudes del empleado:', err)
    error.value = err.message || 'Error al cargar las solicitudes'
  } finally {
    isLoading.value = false
  }
}

// Watch para recargar cuando cambia el empId
watch(() => props.empId, (newId) => {
  if (newId) {
    fetchEmployeeRequests()
  }
}, { immediate: true })

const sortedRequests = computed(() => {
  return [...requests.value].sort((a, b) => new Date(b.fecha_solicitud).getTime() - new Date(a.fecha_solicitud).getTime())
})

const getStatusBadgeClass = (estado: string) => {
  switch (estado) {
    case 'PROCESO':
    case 'PENDIENTE':
      return 'bg-yellow-100 text-yellow-800'
    case 'APROBADO':
      return 'bg-green-100 text-green-800'
    case 'RECHAZADO':
      return 'bg-red-100 text-red-800'
    case 'PROGRAMADA':
      return 'bg-blue-100 text-blue-800'
    case 'COMPLETADO':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (estado: string) => {
  switch (estado) {
    case 'PROCESO':
      return 'En Proceso'
    case 'PENDIENTE':
      return 'Pendiente'
    case 'APROBADO':
      return 'Aprobado'
    case 'RECHAZADO':
      return 'Rechazado'
    case 'PROGRAMADA':
      return 'Programado'
    case 'COMPLETADO':
      return 'Completado'
    default:
      return estado
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