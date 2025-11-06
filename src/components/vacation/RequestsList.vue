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
              <!-- Si es programada y tiene estado PROGRAMADA, mostrar botón "Tomar Vacaciones" -->
              <button
                v-if="request.tipo === 'PROGRAMADA' && request.estado === 'PROGRAMADA'"
                @click="() => openTakeVacationModal(request)"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 whitespace-nowrap"
              >
                <Calendar class="h-4 w-4 mr-1" />
                Tomar Vacaciones
              </button>
              <!-- Si ya tiene reemplazantes guardados, mostrar "Esperando aprobación" -->
              <div
                v-else-if="hasReplacements(request)"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 h-9 px-3 whitespace-nowrap"
              >
                <Clock class="h-4 w-4 mr-1" />
                Esperando aprobación
              </div>
              <!-- Si no, mostrar botón Tomar para seleccionar reemplazantes -->
              <button
                v-else
                @click="() => openViewVacationModal(request)"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 whitespace-nowrap"
              >
                <Calendar class="h-4 w-4 mr-1" />
                Tomar
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

    <!-- Modal de Ver Vacaciones (para seleccionar reemplazantes) -->
    <div
      v-if="showViewVacationModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showViewVacationModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Tomar Vacaciones Programadas</h3>
            <button
              @click="showViewVacationModal = false"
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
              {{ currentViewVacationRequest?.fechas_agrupadas?.[0] ? formatDate(currentViewVacationRequest.fechas_agrupadas[0]) : (currentViewVacationRequest?.fechas?.[0]?.fecha ? formatDate(currentViewVacationRequest.fechas[0].fecha) : '') }} 
              - 
              {{ currentViewVacationRequest?.fechas_agrupadas && currentViewVacationRequest.fechas_agrupadas.length > 0 ? formatDate(currentViewVacationRequest.fechas_agrupadas[currentViewVacationRequest.fechas_agrupadas.length - 1]) : (currentViewVacationRequest?.fechas && currentViewVacationRequest.fechas.length > 0 ? formatDate(currentViewVacationRequest.fechas[currentViewVacationRequest.fechas.length - 1].fecha) : '') }}
            </p>
            <p class="text-xs text-gray-600 mt-2">
              Días totales: {{ currentViewVacationRequest?.total_dias }}
            </p>
          </div>

          <!-- Selección de reemplazantes -->
          <div class="mb-4">
            <label class="text-sm font-medium mb-2 block">
              Reemplazantes * (puedes seleccionar varios)
            </label>
            <div class="rounded-md border border-input bg-background p-3 max-h-64 overflow-y-auto space-y-2">
              <!-- Indicador de carga -->
              <div v-if="isLoadingReplacements" class="flex items-center justify-center py-8">
                <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-2 text-sm text-muted-foreground">Cargando reemplazantes...</span>
              </div>
              
              <!-- Sección de recomendados -->
              <div v-else-if="availableReplacements.filter(p => p.isRecommended).length > 0" class="space-y-2">
                <div class="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  ✨ Recomendados por el sistema
                </div>
                <div
                  v-for="person in availableReplacements.filter(p => p.isRecommended)"
                  :key="person.id"
                  class="flex items-center space-x-2 hover:bg-accent p-2 rounded bg-green-50 border border-green-200"
                >
                  <input
                    type="checkbox"
                    :id="`replacement-view-${person.id}`"
                    :value="person.id"
                    v-model="selectedViewReplacements"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    :for="`replacement-view-${person.id}`"
                    class="flex-1 text-sm cursor-pointer flex items-center gap-2"
                  >
                    <span>{{ person.name }} - {{ person.department }}</span>
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                      <Sparkles class="h-2.5 w-2.5" />
                      Recomendado
                    </span>
                  </label>
                </div>
              </div>
              
              <!-- Sección de otros reemplazantes -->
              <div v-else-if="availableReplacements.filter(p => !p.isRecommended).length > 0" class="space-y-2">
                <div class="text-xs font-medium text-gray-600 px-2 py-1">
                  Otros reemplazantes disponibles
                </div>
                <div
                  v-for="person in availableReplacements.filter(p => !p.isRecommended)"
                  :key="person.id"
                  class="flex items-center space-x-2 hover:bg-accent p-2 rounded"
                >
                  <input
                    type="checkbox"
                    :id="`replacement-view-${person.id}`"
                    :value="person.id"
                    v-model="selectedViewReplacements"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    :for="`replacement-view-${person.id}`"
                    class="flex-1 text-sm cursor-pointer"
                  >
                    {{ person.name }} - {{ person.department }}
                  </label>
                </div>
              </div>
              
              <div v-else-if="!isLoadingReplacements && availableReplacements.length === 0" class="text-sm text-muted-foreground text-center py-2">
                No hay reemplazantes disponibles. Por favor contacta a tu supervisor.
              </div>
            </div>
            <p v-if="selectedViewReplacements.length > 0" class="text-xs text-muted-foreground mt-2">
              {{ selectedViewReplacements.length }} reemplazante(s) seleccionado(s)
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3">
            <button
              @click="confirmViewVacation"
              :disabled="selectedViewReplacements.length === 0 || isLoadingViewVacation"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ isLoadingViewVacation ? 'Procesando...' : 'Tomar Vacaciones' }}
            </button>
            <button
              @click="showViewVacationModal = false"
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
import { Calendar, Eye, AlertCircle, Sparkles, Clock } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { getReemplazantesRecomendados, type ReemplazanteRecomendado } from '@/services/recommendationAPI'

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
  employeeReplacements?: Array<{
    id: string
    name: string
    cargo: string
    phone?: string
    type?: string
  }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  takeVacation: [data: string | { requestId: string, replacements: string[] }]
}>()

const requests = ref<VacationRequest[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const requestsWithReplacements = ref<Set<string>>(new Set()) // IDs de solicitudes que tienen reemplazantes guardados

// Modal de tomar vacaciones
const showTakeVacationModal = ref(false)
const currentTakeVacationRequest = ref<VacationRequest | null>(null)
const selectedReplacements = ref<string[]>([])
const isLoadingTakeVacation = ref(false)
const availableReplacements = ref<any[]>([])

// Modal de ver vacaciones (para seleccionar reemplazantes)
const showViewVacationModal = ref(false)
const currentViewVacationRequest = ref<VacationRequest | null>(null)
const selectedViewReplacements = ref<string[]>([])
const isLoadingViewVacation = ref(false)
const isLoadingReplacements = ref(false)
const recommendedReplacements = ref<ReemplazanteRecomendado[]>([])

// Abrir modal de tomar vacaciones
const openTakeVacationModal = (request: VacationRequest) => {
  currentTakeVacationRequest.value = request
  selectedReplacements.value = []
  showTakeVacationModal.value = true
  loadAvailableReplacements()
}

// Abrir modal de tomar vacaciones programadas (para seleccionar reemplazantes)
const openViewVacationModal = async (request: VacationRequest) => {
  console.log('🔍 openViewVacationModal - request:', request)
  console.log('🔍 openViewVacationModal - props.empId:', props.empId)
  console.log('🔍 openViewVacationModal - request.emp_id:', request.emp_id)
  
  currentViewVacationRequest.value = request
  selectedViewReplacements.value = []
  availableReplacements.value = []
  recommendedReplacements.value = []
  showViewVacationModal.value = true
  
  // Usar el emp_id de la solicitud si props.empId no está disponible
  const empIdToUse = props.empId || request.emp_id
  console.log('🔍 openViewVacationModal - empIdToUse:', empIdToUse)
  
  await loadRecommendedReplacements(empIdToUse)
}

// Cargar reemplazantes recomendados y pre-seleccionarlos
const loadRecommendedReplacements = async (empId?: string) => {
  isLoadingReplacements.value = true
  availableReplacements.value = []
  recommendedReplacements.value = []
  
  try {
    // Usar el empId pasado como parámetro, o el de props, o el de la solicitud actual
    const empIdToUse = empId || props.empId || currentViewVacationRequest.value?.emp_id
    
    console.log('🔍 ===== INICIANDO CARGA DE REEMPLAZANTES =====')
    console.log('🔍 empId parámetro:', empId)
    console.log('🔍 props.empId:', props.empId)
    console.log('🔍 currentViewVacationRequest.value?.emp_id:', currentViewVacationRequest.value?.emp_id)
    console.log('🔍 empIdToUse final:', empIdToUse)
    
    if (!empIdToUse || !currentViewVacationRequest.value) {
      console.error('❌ No hay empId o solicitud para cargar reemplazantes')
      availableReplacements.value = []
      recommendedReplacements.value = []
      return
    }
    
    // Extraer el id_solicitud real (sin _grupo_X si existe)
    const requestId = currentViewVacationRequest.value.id_solicitud || ''
    const realRequestId = requestId.split('_grupo_')[0]
    
    const allReplacements: any[] = []
    const savedReplacements: any[] = []
    
    // 1. Primero cargar los reemplazantes ya guardados desde /api/reemplazante-vacation
    try {
      const savedUrl = `http://190.171.225.68/api/reemplazante-vacation?id_solicitud=${realRequestId}`
      console.log('📡 Llamando API de reemplazantes guardados:', savedUrl)
      
      const savedResponse = await fetch(savedUrl)
      
      if (savedResponse.ok) {
        const savedData = await savedResponse.json()
        console.log('📦 Reemplazantes guardados recibidos:', savedData)
        
        // Procesar reemplazantes guardados
        if (savedData.reemplazantes && Array.isArray(savedData.reemplazantes)) {
          savedReplacements.push(...savedData.reemplazantes.map((rep: any) => ({
            id: rep.emp_id || rep.REEMPLAZANTE_EMP_ID || String(rep.emp_id || rep.REEMPLAZANTE_EMP_ID),
            name: rep.nombre || rep.REEMPLAZANTE_NOMBRE || 'Sin nombre',
            department: rep.cargo || rep.CARGO || 'N/A',
            phone: rep.telefono || rep.TELEFONO || '',
            isRecommended: false,
            isSaved: true
          })))
          console.log('✅ Reemplazantes guardados cargados:', savedReplacements.length)
        }
      } else {
        console.log('ℹ️ No hay reemplazantes guardados para esta solicitud')
      }
    } catch (savedError) {
      console.warn('⚠️ Error al cargar reemplazantes guardados:', savedError)
    }
    
    // 2. Luego cargar los reemplazantes recomendados usando el mismo servicio que "vacación a cuenta"
    try {
      console.log('📡 ===== CARGANDO REEMPLAZANTES RECOMENDADOS =====')
      console.log('📡 Usando getReemplazantesRecomendados para empId:', empIdToUse)
      
      const response = await getReemplazantesRecomendados(String(empIdToUse))
      console.log('📦 Respuesta completa de getReemplazantesRecomendados:', response)
      
      const recommendedData = response.reemplazantes || []
      
      console.log('📦 Reemplazantes recomendados recibidos:', recommendedData)
      console.log('📋 Total de reemplazantes recomendados:', recommendedData.length)
      console.log('📋 Tipo de recommendedData:', Array.isArray(recommendedData))
      
      if (recommendedData.length > 0) {
        // Mapear recomendados y evitar duplicados con los guardados
        const savedIds = new Set(savedReplacements.map(r => r.id))
        console.log('📋 IDs de reemplazantes guardados (para filtrar duplicados):', Array.from(savedIds))
        
        // Usar la misma lógica de mapeo que VacationRequestForm
        const filteredRecommended = recommendedData.filter((rec: ReemplazanteRecomendado) => {
          const recId = rec.REEMPLAZANTE_EMP_ID
          const isDuplicate = savedIds.has(recId)
          if (isDuplicate) {
            console.log('⚠️ Reemplazante duplicado filtrado:', recId, rec.REEMPLAZANTE_NOMBRE)
          }
          return !isDuplicate
        })
        
        console.log('📋 Reemplazantes recomendados después de filtrar duplicados:', filteredRecommended.length)
        
        // Guardar los datos originales para el computed
        recommendedReplacements.value = filteredRecommended
        
        console.log('✅ Reemplazantes recomendados guardados en ref:', recommendedReplacements.value.length)
      } else {
        console.warn('⚠️ No se recibieron reemplazantes recomendados de la API')
        recommendedReplacements.value = []
      }
    } catch (recommendedError: any) {
      console.error('❌ Error al cargar reemplazantes recomendados:', recommendedError)
      console.error('❌ Detalles del error:', {
        message: recommendedError.message,
        stack: recommendedError.stack,
        response: recommendedError.response?.data
      })
      recommendedReplacements.value = []
    }
    
    // 3. Combinar ambos usando la misma lógica que VacationRequestForm
    // Primero agregar recomendados (mapeados igual que en VacationRequestForm)
    if (recommendedReplacements.value.length > 0) {
      const recommended = recommendedReplacements.value.map((rec: ReemplazanteRecomendado) => ({
        id: rec.REEMPLAZANTE_EMP_ID,
        name: rec.REEMPLAZANTE_NOMBRE,
        department: rec.CARGO,
        phone: rec.TELEFONO,
        type: rec.TIPO,
        empID: rec.REEMPLAZANTE_EMP_ID,
        isRecommended: true,
      }));
      allReplacements.push(...recommended);
    }
    
    // Luego agregar los guardados (evitando duplicados)
    if (savedReplacements.length > 0) {
      const savedIds = new Set(allReplacements.map(r => r.id));
      const uniqueSaved = savedReplacements.filter(rep => !savedIds.has(rep.id));
      allReplacements.push(...uniqueSaved);
    }
    
    // Finalmente agregar los reemplazantes del empleado (de employeeData.replacements)
    // Esto es lo que hace que funcione en "vacación a cuenta"
    if (props.employeeReplacements && props.employeeReplacements.length > 0) {
      const existingIds = new Set(allReplacements.map(r => r.id));
      const regularReplacements = props.employeeReplacements
        .filter((rep: any) => {
          // Evitar duplicados con las recomendaciones y guardados
          const repId = rep.id || String(rep.empID || '');
          return !existingIds.has(repId) && 
                 !recommendedReplacements.value.some(rec => rec.REEMPLAZANTE_EMP_ID === repId);
        })
        .map((rep: any) => ({
          id: rep.id || String(rep.empID || ''),
          name: rep.name,
          department: rep.cargo,
          phone: rep.phone || '',
          type: rep.type || '',
          empID: rep.id || rep.empID,
          isRecommended: false,
        }));
      allReplacements.push(...regularReplacements);
      console.log('✅ Reemplazantes del empleado agregados:', regularReplacements.length)
    }
    
    availableReplacements.value = allReplacements
    
    // 4. Pre-seleccionar automáticamente los recomendados
    if (recommendedReplacements.value.length > 0) {
      const recommendedIds = recommendedReplacements.value.map((rec: ReemplazanteRecomendado) => rec.REEMPLAZANTE_EMP_ID);
      selectedViewReplacements.value = [...new Set([...selectedViewReplacements.value, ...recommendedIds])];
    }
    
    // Si hay reemplazantes guardados, también pre-seleccionarlos
    if (savedReplacements.length > 0) {
      selectedViewReplacements.value = [...new Set([...selectedViewReplacements.value, ...savedReplacements.map(rep => rep.id)])];
    }
    
    console.log('✅ ===== RESUMEN FINAL =====')
    console.log('✅ Total de reemplazantes disponibles:', availableReplacements.value.length)
    console.log('✅ Reemplazantes guardados:', savedReplacements.length)
    console.log('✅ Reemplazantes recomendados:', recommendedReplacements.value.length)
    console.log('✅ IDs pre-seleccionados:', selectedViewReplacements.value)
    console.log('✅ AvailableReplacements completo:', JSON.stringify(availableReplacements.value, null, 2))
    
    if (availableReplacements.value.length === 0) {
      console.error('❌ PROBLEMA: No hay reemplazantes disponibles después de cargar')
      console.error('❌ Verificar:')
      console.error('   - ¿El empId es correcto?', empIdToUse)
      console.error('   - ¿La API respondió correctamente?')
      console.error('   - ¿Hay reemplazantes guardados?', savedReplacements.length)
      console.error('   - ¿Hay reemplazantes recomendados?', recommendedReplacements.value.length)
    }
    
  } catch (error) {
    console.error('❌ Error al cargar reemplazantes:', error)
    availableReplacements.value = []
    recommendedReplacements.value = []
  } finally {
    isLoadingReplacements.value = false
  }
}

// Cargar reemplazantes disponibles desde la API (para modal de tomar vacaciones)
const loadAvailableReplacements = async () => {
  try {
    if (!props.empId) {
      console.warn('⚠️ No hay empId para cargar reemplazantes')
      availableReplacements.value = []
      return
    }
    
    // Cargar reemplazantes recomendados desde la API
    const response = await fetch(`http://190.171.225.68/api/recomendar-reemplazante?empId=${props.empId}`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.reemplazantes && Array.isArray(data.reemplazantes)) {
        availableReplacements.value = data.reemplazantes.map((rep: any) => ({
          id: rep.REEMPLAZANTE_EMP_ID || rep.emp_id,
          name: rep.REEMPLAZANTE_NOMBRE || rep.nombre,
          department: rep.CARGO || rep.cargo || 'N/A'
        }))
        console.log('✅ Reemplazantes cargados:', availableReplacements.value.length)
      } else {
        availableReplacements.value = []
      }
    } else {
      console.warn('⚠️ No se pudieron cargar reemplazantes desde la API')
      availableReplacements.value = []
    }
  } catch (error) {
    console.error('Error al cargar reemplazantes:', error)
    availableReplacements.value = []
  }
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

// Confirmar selección de reemplazantes en modal "Ver"
const confirmViewVacation = async () => {
  if (selectedViewReplacements.value.length === 0) {
    return
  }

  isLoadingViewVacation.value = true
  
  try {
    // Extraer el id_solicitud real (sin _grupo_X si existe)
    const requestId = currentViewVacationRequest.value?.id_solicitud || ''
    const realRequestId = requestId.split('_grupo_')[0]
    
    const empId = props.empId || currentViewVacationRequest.value?.emp_id
    
    console.log('💾 Guardando reemplazantes...')
    console.log('💾 id_solicitud:', realRequestId)
    console.log('💾 emp_id:', empId)
    console.log('💾 Reemplazantes seleccionados:', selectedViewReplacements.value)
    
    // Obtener los datos completos de cada reemplazante seleccionado
    const replacementsToSave = selectedViewReplacements.value.map((repId: string) => {
      // Buscar el reemplazante en availableReplacements para obtener todos sus datos
      const replacement = availableReplacements.value.find(r => r.id === repId || r.empID === repId)
      
      if (replacement) {
        return {
          id_solicitud: parseInt(realRequestId),
          emp_id: parseInt(String(empId || '0')),
          nombre: replacement.name,
          cargo: replacement.department,
          telefono: replacement.phone || '',
          tipo: replacement.type || 'Suplente'
        }
      } else {
        // Si no se encuentra en availableReplacements, buscar en employeeReplacements
        const empReplacement = props.employeeReplacements?.find((r: any) => 
          (r.id || String(r.empID || '')) === repId
        )
        
        if (empReplacement) {
          return {
            id_solicitud: parseInt(realRequestId),
            emp_id: parseInt(String(empId || '0')),
            nombre: empReplacement.name,
            cargo: empReplacement.cargo,
            telefono: empReplacement.phone || '',
            tipo: empReplacement.type || 'Suplente'
          }
        }
        
        // Si no se encuentra, usar datos mínimos
        return {
          id_solicitud: parseInt(realRequestId),
          emp_id: parseInt(String(empId || '0')),
          nombre: 'Reemplazante',
          cargo: 'N/A',
          telefono: '',
          tipo: 'Suplente'
        }
      }
    })
    
    console.log('💾 Reemplazantes a guardar:', replacementsToSave)
    
    // Guardar cada reemplazante individualmente usando la API correcta
    const savePromises = replacementsToSave.map(replacement => 
      fetch('http://190.171.225.68/api/vacaciones/reemplazante/guardar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replacement)
      })
    )
    
    const responses = await Promise.all(savePromises)
    const allSuccessful = responses.every(r => r.ok)
    
    if (allSuccessful) {
      console.log('✅ Todos los reemplazantes guardados exitosamente')
      
      // Marcar esta solicitud como que tiene reemplazantes
      requestsWithReplacements.value.add(realRequestId)
      
      showViewVacationModal.value = false
      // Recargar el historial para actualizar la vista
      await fetchEmployeeRequests()
    } else {
      const errors = await Promise.all(
        responses
          .filter(r => !r.ok)
          .map(async r => {
            const text = await r.text().catch(() => 'Error desconocido')
            return `Error ${r.status}: ${text}`
          })
      )
      console.error('❌ Error al guardar algunos reemplazantes:', errors)
      alert(`Error al guardar los reemplazantes: ${errors.join(', ')}`)
    }
  } catch (error) {
    console.error('Error al guardar reemplazantes:', error)
    alert('Error al guardar los reemplazantes. Por favor intenta nuevamente.')
  } finally {
    isLoadingViewVacation.value = false
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
      
      // Verificar qué solicitudes tienen reemplazantes guardados (en segundo plano, no bloquea)
      checkRequestsWithReplacements().catch(err => {
        console.error('❌ Error al verificar reemplazantes:', err)
      })
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

// Verificar qué solicitudes tienen reemplazantes guardados
const checkRequestsWithReplacements = async () => {
  requestsWithReplacements.value.clear()
  
  if (requests.value.length === 0) {
    console.log('ℹ️ No hay solicitudes para verificar reemplazantes')
    return
  }
  
  // Obtener IDs únicos de solicitudes (sin _grupo_X)
  const uniqueRequestIds = Array.from(new Set(
    requests.value.map(r => {
      const id = String(r.id_solicitud)
      return id.split('_grupo_')[0]
    })
  ))
  
  if (uniqueRequestIds.length === 0) {
    console.log('ℹ️ No hay IDs únicos para verificar')
    return
  }
  
  console.log('🔍 ===== VERIFICANDO REEMPLAZANTES =====')
  console.log('🔍 IDs únicos de solicitudes a verificar:', uniqueRequestIds)
  console.log('🔍 Total de solicitudes a verificar:', uniqueRequestIds.length)
  
  // Verificar todas las solicitudes en paralelo (más rápido)
  const checkPromises = uniqueRequestIds.map(async (requestId) => {
    try {
      // Intentar con ambos formatos de parámetro (id_solicitud e idsolicitud)
      const url1 = `http://190.171.225.68/api/reemplazante-vacation?id_solicitud=${requestId}`
      const url2 = `http://190.171.225.68/api/reemplazante-vacation?idsolicitud=${requestId}`
      
      let response = await fetch(url1)
      if (!response.ok) {
        // Si falla con id_solicitud, intentar con idsolicitud
        response = await fetch(url2)
      }
      
      if (response.ok) {
        const data = await response.json()
        console.log(`📦 Respuesta para solicitud ${requestId}:`, data)
        
        // Verificar diferentes formatos de respuesta
        let reemplazantes = null
        if (data.reemplazantes && Array.isArray(data.reemplazantes)) {
          reemplazantes = data.reemplazantes
        } else if (data.success && data.data && Array.isArray(data.data)) {
          reemplazantes = data.data
        } else if (Array.isArray(data)) {
          reemplazantes = data
        }
        
        if (reemplazantes && reemplazantes.length > 0) {
          requestsWithReplacements.value.add(requestId)
          console.log(`✅ Solicitud ${requestId} tiene ${reemplazantes.length} reemplazante(s) guardado(s)`)
          return { requestId, hasReplacements: true, count: reemplazantes.length }
        }
        console.log(`ℹ️ Solicitud ${requestId} no tiene reemplazantes guardados`)
        return { requestId, hasReplacements: false, count: 0 }
      } else {
        console.warn(`⚠️ Error ${response.status} al verificar solicitud ${requestId}`)
        return { requestId, hasReplacements: false, count: 0 }
      }
    } catch (error) {
      console.warn(`⚠️ Error al verificar reemplazantes para solicitud ${requestId}:`, error)
      return { requestId, hasReplacements: false, count: 0 }
    }
  })
  
  const results = await Promise.all(checkPromises)
  const withReplacements = results.filter(r => r.hasReplacements)
  
  console.log('✅ ===== VERIFICACIÓN COMPLETA =====')
  console.log('✅ Solicitudes con reemplazantes:', withReplacements.map(r => `${r.requestId} (${r.count})`))
  console.log('✅ Total de solicitudes con reemplazantes:', requestsWithReplacements.value.size)
  console.log('✅ Set completo:', Array.from(requestsWithReplacements.value))
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

// Función para agrupar fechas que están muy cerca (1-2 días) - misma lógica que el jefe
const agruparFechasCercanas = (fechas: string[]): string[][] => {
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
    
    // Agrupar si están a 1-2 días de distancia (misma lógica que el jefe)
    if (diferenciaDias <= 2) {
      grupoActual.push(ordenadas[i])
    } else {
      // Están más separadas, terminar grupo actual y empezar uno nuevo
      grupos.push([...grupoActual])
      grupoActual = [ordenadas[i]]
    }
  }
  
  // Agregar el último grupo
  grupos.push(grupoActual)
  
  console.log('📅 Grupos de fechas cercanas (1-2 días):', grupos)
  
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
    
    // Dividir en grupos de fechas cercanas (1-2 días) - misma lógica que el jefe
    const grupos = agruparFechasCercanas(fechas_unicas)
    
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

// Verificar si una solicitud tiene reemplazantes guardados
const hasReplacements = (request: VacationRequest): boolean => {
  const requestId = String(request.id_solicitud).split('_grupo_')[0]
  const hasRep = requestsWithReplacements.value.has(requestId)
  console.log(`🔍 hasReplacements para solicitud ${request.id_solicitud} (${requestId}):`, hasRep)
  return hasRep
}
</script>