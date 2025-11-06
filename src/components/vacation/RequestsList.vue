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
                  <span v-if="(request as any).fechas_agrupadas">
                    {{ formatDate((request as any).fechas_agrupadas[0]) }} - {{ formatDate((request as any).fechas_agrupadas[(request as any).fechas_agrupadas.length - 1]) }}
                  </span>
                  <span v-else-if="request.fechas && request.fechas.length > 0">
                    {{ formatDate(request.fechas[0].fecha) }} - {{ formatDate(request.fechas[request.fechas.length - 1].fecha) }}
                  </span>
                  <span v-else>
                    No especificado
                  </span>
                </p>
                <p class="text-sm">
                  <strong>Tipo:</strong> {{ getVacationType(request.tipo) }}
                </p>
              </div>

              <!-- Fechas detalladas -->
              <div class="pt-2">
                <p class="text-xs font-medium mb-1 text-muted-foreground">Fechas:</p>
                <div class="flex flex-wrap gap-1">
                  <!-- Si tiene fechas agrupadas (programadas), mostrar solo las fechas principales -->
                  <span
                    v-if="(request as any).fechas_agrupadas"
                    class="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {{ formatDate((request as any).fechas_agrupadas[0]) }} - {{ formatDate((request as any).fechas_agrupadas[(request as any).fechas_agrupadas.length - 1]) }}
                    <span class="ml-1 text-blue-600">({{ (request as any).fechas_agrupadas.length }} días)</span>
                  </span>
                  <!-- Si no, mostrar fechas individuales -->
                  <span
                    v-else
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
              <!-- Si es programada, mostrar botón "Tomar Vacaciones" -->
              <button
                v-if="request.tipo === 'PROGRAMADA' && request.estado === 'PROGRAMADA'"
                @click="() => openTakeVacationModal(request)"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 whitespace-nowrap"
              >
                <Calendar class="h-4 w-4 mr-1" />
                Tomar Vacaciones
              </button>
              <!-- Si no, mostrar botón Ver normal -->
              <button
                v-else
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

    <!-- Modal de Tomar Vacaciones -->
    <div
      v-if="showTakeVacationModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showTakeVacationModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Tomar Vacaciones Programadas</h3>
            <button
              @click="showTakeVacationModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Información de la solicitud -->
          <div class="bg-blue-50 rounded-lg p-4 mb-4">
            <p class="text-sm text-gray-600 mb-1"><strong>Periodo:</strong></p>
            <p class="text-sm font-semibold">
              {{ currentTakeVacationRequest?.fechas_agrupadas?.[0] ? formatDate(currentTakeVacationRequest.fechas_agrupadas[0]) : (currentTakeVacationRequest?.fechas?.[0]?.fecha ? formatDate(currentTakeVacationRequest.fechas[0].fecha) : '') }} 
              - 
              {{ currentTakeVacationRequest?.fechas_agrupadas && currentTakeVacationRequest.fechas_agrupadas.length > 0 ? formatDate(currentTakeVacationRequest.fechas_agrupadas[currentTakeVacationRequest.fechas_agrupadas.length - 1]) : (currentTakeVacationRequest?.fechas && currentTakeVacationRequest.fechas.length > 0 ? formatDate(currentTakeVacationRequest.fechas[currentTakeVacationRequest.fechas.length - 1].fecha) : '') }}
            </p>
            <p class="text-xs text-gray-600 mt-2">
              Días totales: {{ currentTakeVacationRequest?.total_dias }}
            </p>
          </div>

          <!-- Selección de reemplazantes -->
          <div class="mb-4">
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
                  :id="`replacement-take-${person.id}`"
                  :value="person.id"
                  v-model="selectedReplacements"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  :for="`replacement-take-${person.id}`"
                  class="flex-1 text-sm cursor-pointer"
                >
                  {{ person.name }} - {{ person.department }}
                </label>
              </div>
              <div v-if="availableReplacements.length === 0" class="text-sm text-muted-foreground text-center py-2">
                No hay reemplazantes disponibles
              </div>
            </div>
            <p v-if="selectedReplacements.length > 0" class="text-xs text-muted-foreground mt-2">
              {{ selectedReplacements.length }} reemplazante(s) seleccionado(s)
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3">
            <button
              @click="confirmTakeVacation"
              :disabled="selectedReplacements.length === 0 || isLoadingTakeVacation"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ isLoadingTakeVacation ? 'Procesando...' : 'Confirmar' }}
            </button>
            <button
              @click="showTakeVacationModal = false"
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
  fechas_agrupadas?: string[]
}

interface Props {
  empId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  takeVacation: [data: string | { requestId: string, replacements: string[] }]
}>()

const requests = ref<VacationRequest[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Modal de tomar vacaciones
const showTakeVacationModal = ref(false)
const currentTakeVacationRequest = ref<VacationRequest | null>(null)
const selectedReplacements = ref<string[]>([])
const isLoadingTakeVacation = ref(false)
const availableReplacements = ref<any[]>([])

// Abrir modal de tomar vacaciones
const openTakeVacationModal = (request: VacationRequest) => {
  currentTakeVacationRequest.value = request
  selectedReplacements.value = []
  showTakeVacationModal.value = true
  // Aquí puedes cargar los reemplazantes disponibles desde la API
  // Por ahora usamos datos de ejemplo
  availableReplacements.value = [
    { id: '1', name: 'Juan Pérez', department: 'Desarrollo' },
    { id: '2', name: 'María García', department: 'Desarrollo' },
    { id: '3', name: 'Carlos López', department: 'QA' }
  ]
}

// Confirmar tomar vacaciones
const confirmTakeVacation = async () => {
  if (selectedReplacements.value.length === 0) {
    return
  }

  isLoadingTakeVacation.value = true
  
  try {
    // Llamar a la API para activar las vacaciones
    emit('takeVacation', {
      requestId: currentTakeVacationRequest.value?.id_solicitud || '',
      replacements: selectedReplacements.value
    })
    
    showTakeVacationModal.value = false
    // Recargar el historial
    await fetchEmployeeRequests()
  } catch (error) {
    console.error('Error al tomar vacaciones:', error)
  } finally {
    isLoadingTakeVacation.value = false
  }
}

// Cargar solicitudes del empleado desde el API
const fetchEmployeeRequests = async () => {
  console.log('🔍 RequestsList - fetchEmployeeRequests llamado')
  console.log('🔍 RequestsList - props.empId:', props.empId)
  
  if (!props.empId) {
    console.error('❌ No se ha especificado el ID del empleado')
    error.value = 'No se ha especificado el ID del empleado'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const url = `http://190.171.225.68/api/vacacion-data-empleado?emp_id=${props.empId}`
    console.log('📡 Fetching URL:', url)
    
    const response = await fetch(url)

    if (!response.ok) {
      console.error('❌ Error en la respuesta:', response.status, response.statusText)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📦 Respuesta recibida:', data)

    if (data.success && Array.isArray(data.data)) {
      requests.value = data.data
      console.log('✅ Solicitudes del empleado cargadas:', requests.value)
      console.log('📊 Total de solicitudes:', requests.value.length)
      
      // Debug: mostrar tipos y estados
      console.log('📋 Tipos de solicitudes:', [...new Set(requests.value.map(r => r.tipo))])
      console.log('📋 Estados de solicitudes:', [...new Set(requests.value.map(r => r.estado))])
    } else {
      console.error('❌ Formato de respuesta inválido:', data)
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
  console.log('👀 RequestsList - empId cambió:', newId)
  if (newId) {
    fetchEmployeeRequests()
  } else {
    console.warn('⚠️ RequestsList - No hay empId')
  }
}, { immediate: true })

// Función para agrupar fechas consecutivas
const agruparFechasConsecutivas = (fechas: string[]): string[][] => {
  if (fechas.length === 0) return []
  
  const ordenadas = [...fechas].sort()
  console.log('📅 Fechas ordenadas para agrupar:', ordenadas)
  
  const grupos: string[][] = []
  let grupoActual: string[] = [ordenadas[0]]
  
  for (let i = 1; i < ordenadas.length; i++) {
    const fechaActual = new Date(ordenadas[i] + 'T00:00:00')
    const fechaAnterior = new Date(ordenadas[i - 1] + 'T00:00:00')
    
    // Calcular diferencia en días
    const diferenciaMs = fechaActual.getTime() - fechaAnterior.getTime()
    const diferenciaDias = diferenciaMs / (1000 * 60 * 60 * 24)
    
    console.log(`🔍 Comparando ${ordenadas[i - 1]} con ${ordenadas[i]}: ${diferenciaDias} días`)
    
    if (diferenciaDias === 1) {
      // Son consecutivas, agregar al grupo actual
      grupoActual.push(ordenadas[i])
    } else {
      // No son consecutivas, terminar grupo actual y empezar uno nuevo
      grupos.push([...grupoActual])
      grupoActual = [ordenadas[i]]
    }
  }
  
  // Agregar el último grupo
  grupos.push(grupoActual)
  
  console.log('📅 Grupos de fechas consecutivas:', grupos)
  
  return grupos
}

// Agrupar solicitudes programadas por fecha de solicitud Y por fechas consecutivas
const groupedProgrammedRequests = computed(() => {
  const programadas_individuales = requests.value.filter(r => r.tipo === 'PROGRAMADA')
  
  if (programadas_individuales.length === 0) {
    return []
  }
  
  // Agrupar por fecha_solicitud Y estado (las rechazadas se separan)
  const grouped = new Map<string, VacationRequest[]>()
  
  for (const request of programadas_individuales) {
    // La clave es combinada: fecha_solicitud + estado
    const key = `${request.fecha_solicitud}_${request.estado}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(request)
  }
  
  console.log('📅 Agrupando solicitudes por fecha de solicitud:', Array.from(grouped.keys()))
  
  // Convertir agrupaciones en requests separadas por bloques consecutivos
  const result: (VacationRequest & { fechas_agrupadas: string[], id_grupo: string })[] = []
  
  for (const [fecha_solicitud, solicitudes] of grouped.entries()) {
    const primera = solicitudes[0]
    const todas_fechas = solicitudes.flatMap(s => s.fechas.map(f => f.fecha))
    const fechas_unicas = [...new Set(todas_fechas)].sort()
    
    console.log(`📅 Fechas de solicitud ${fecha_solicitud}:`, fechas_unicas)
    
    // Dividir en grupos de fechas consecutivas
    const grupos = agruparFechasConsecutivas(fechas_unicas)
    
    console.log(`📅 Grupos para ${fecha_solicitud}:`, grupos)
    
    // Crear un request para cada grupo de fechas consecutivas
    for (let i = 0; i < grupos.length; i++) {
      result.push({
        ...primera,
        id_solicitud: `${primera.id_solicitud}_grupo_${i}`, // ID único para cada grupo
        fechas: [], // Limpiar fechas individuales
        fechas_agrupadas: grupos[i],
        id_grupo: `${primera.id_solicitud}_grupo_${i}` as any
      })
    }
  }
  
  console.log('📅 Resultado agrupado:', result)
  
  return result
})

// Combinar solicitudes programadas (agrupadas) con las demás
const sortedRequests = computed(() => {
  console.log('🔍 sortedRequests - Total requests:', requests.value.length)
  console.log('🔍 sortedRequests - Requests:', requests.value)
  
  // Separar programadas y no programadas
  const noProgramadas = requests.value.filter(r => r.tipo !== 'PROGRAMADA')
  const programadas = groupedProgrammedRequests.value
  
  console.log('🔍 sortedRequests - No programadas:', noProgramadas.length)
  console.log('🔍 sortedRequests - Programadas agrupadas:', programadas.length)
  
  // Combinar y ordenar por fecha más antigua del grupo
  const todas = [...noProgramadas, ...programadas].sort((a, b) => {
    const fechaA = a.fechas_agrupadas?.[0] || a.fechas?.[0]?.fecha || a.fecha_solicitud
    const fechaB = b.fechas_agrupadas?.[0] || b.fechas?.[0]?.fecha || b.fecha_solicitud
    return new Date(fechaA).getTime() - new Date(fechaB).getTime()
  })
  
  console.log('🔍 sortedRequests - Total después de ordenar:', todas.length)
  return todas
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