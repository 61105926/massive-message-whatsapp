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
    <div v-else-if="!sortedRequests || sortedRequests.length === 0" class="text-center py-8">
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
                  {{ calcularDiasTotales(request) }} día{{ calcularDiasTotales(request) !== 1 ? 's' : '' }}
                </span>
                <span class="text-xs text-muted-foreground">
                  ID: {{ request.id_solicitud }}
                </span>
              </div>

              <div class="space-y-1">
                <p class="text-sm">
                  <strong>Período:</strong>
                  <span v-if="(request as any).fechas_agrupadas">
                    {{ formatFechasAgrupadas((request as any).fechas_agrupadas) }}
                  </span>
                  <span v-else-if="request.fechas && request.fechas.length > 0">
                    {{ formatFechasList(request.fechas.map((f: any) => f.fecha)) }}
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
                    {{ formatFechasAgrupadas((request as any).fechas_agrupadas) }}
                    <span class="ml-1 text-blue-600">({{ calcularDiasTotales(request) }} días)</span>
                  </span>
                  <!-- Si no, mostrar fechas individuales -->
                  <span
                    v-else
                    v-for="(fecha, idx) in request.fechas"
                    :key="idx"
                    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-yellow-50 text-yellow-700': fecha.turno === 'TARDE',
                      'bg-blue-50 text-blue-700': fecha.turno === 'MAÑANA',
                      'bg-green-50 text-green-700': !fecha.turno || fecha.turno === 'COMPLETO'
                    }"
                  >
                    {{ formatDate(fecha.fecha) }}
                    <span class="ml-1 font-semibold">
                      {{ fecha.turno === 'MAÑANA' ? '(Mañana)' : fecha.turno === 'TARDE' ? '(Tarde)' : '(Completo)' }}
                    </span>
                    <span class="ml-1 text-gray-600">
                      ({{ (fecha.turno === 'MAÑANA' || fecha.turno === 'TARDE') ? '0.5' : '1' }} día)
                    </span>
                  </span>
                </div>
              </div>
              
              <!-- Detalle de fechas (similar al panel del jefe) -->
              <div v-if="request.fechas && request.fechas.length > 0" class="border-t pt-2 mt-2">
                <p class="text-xs font-medium mb-2 text-muted-foreground">Detalle de fechas:</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(fecha, idx) in request.fechas"
                    :key="idx"
                    class="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-yellow-50 text-yellow-700': fecha.turno === 'TARDE',
                      'bg-blue-50 text-blue-700': fecha.turno === 'MAÑANA',
                      'bg-green-50 text-green-700': !fecha.turno || fecha.turno === 'COMPLETO'
                    }"
                  >
                    {{ formatDate(fecha.fecha) }}
                    <span class="ml-1 font-semibold">
                      {{ fecha.turno === 'MAÑANA' ? '(Mañana)' : fecha.turno === 'TARDE' ? '(Tarde)' : '(Completo)' }}
                    </span>
                    <span class="ml-1 text-gray-600">
                      ({{ (fecha.turno === 'MAÑANA' || fecha.turno === 'TARDE') ? '0.5' : '1' }} día)
                    </span>
                  </span>
                </div>
              </div>

              <div class="text-xs text-muted-foreground">
                Solicitado el {{ formatDate(request.fecha_solicitud) }}
              </div>
            </div>

            <div class="flex flex-col gap-2 ml-3">
              <!-- Si está rechazada, no mostrar ningún botón -->
              <div
                v-if="request.estado === 'RECHAZADO'"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-gray-100 text-gray-600 border border-gray-300 h-9 px-3 whitespace-nowrap"
              >
                Rechazada
              </div>
            <!-- Si está aprobada, SIEMPRE mostrar botón de descargar boleta (sin importar si es programada o no) -->
            <button
              v-if="request.estado === 'APROBADO'"
              @click="() => downloadBoleta(request)"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-9 px-3 whitespace-nowrap"
            >
              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Boleta
            </button>
            <!-- Si está en proceso/pendiente/preaprobado, mostrar "Esperando aprobación" (sin importar el tipo) -->
            <div
              v-else-if="request.estado === 'PROCESO' || request.estado === 'PENDIENTE' || request.estado === 'PREAPROBADO'"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 h-9 px-3 whitespace-nowrap"
            >
              <Clock class="h-4 w-4 mr-1" />
              Esperando aprobación
            </div>
            <!-- Si no cumple ninguna condición, mostrar "Esperando aprobación" por defecto -->
            <div
              v-else
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 h-9 px-3 whitespace-nowrap"
            >
              <Clock class="h-4 w-4 mr-1" />
              Esperando aprobación
            </div>
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
              Días totales: {{ calcularDiasTotales(currentTakeVacationRequest) }}
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
              Días totales: {{ calcularDiasTotales(currentViewVacationRequest) }}
            </p>
            
            <!-- Detalle de fechas con turno -->
            <div v-if="currentViewVacationRequest?.fechas && currentViewVacationRequest.fechas.length > 0" class="mt-3 pt-3 border-t border-blue-200">
              <p class="text-xs font-medium mb-2 text-gray-700">Detalle de fechas:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(fecha, idx) in currentViewVacationRequest.fechas"
                  :key="idx"
                  class="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-yellow-50 text-yellow-700': fecha.turno === 'TARDE',
                    'bg-blue-50 text-blue-700': fecha.turno === 'MAÑANA',
                    'bg-green-50 text-green-700': !fecha.turno || fecha.turno === 'COMPLETO'
                  }"
                >
                  {{ formatDate(fecha.fecha) }}
                  <span class="ml-1 font-semibold">
                    {{ fecha.turno === 'MAÑANA' ? '(Mañana)' : fecha.turno === 'TARDE' ? '(Tarde)' : '(Completo)' }}
                  </span>
                  <span class="ml-1 text-gray-600">
                    ({{ (fecha.turno === 'MAÑANA' || fecha.turno === 'TARDE') ? '0.5' : '1' }} día)
                  </span>
                </span>
              </div>
            </div>
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
import { Calendar, AlertCircle, Sparkles, Clock } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
// Import eliminado: getReemplazantesRecomendados - no se usa
// import { getReemplazantesRecomendados, type ReemplazanteRecomendado } from '@/services/recommendationAPI'

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
  reemplazantes?: Array<{
    ID_REEMPLAZO: string
    NOMBRE: string
    CARGO: string
    TELEFONO: string
    TIPO: string
  }>
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
// Variable eliminada: recommendedReplacements - no se usa
// const recommendedReplacements = ref<ReemplazanteRecomendado[]>([])

// Función no utilizada - comentada porque ya no se muestra el botón "Tomar Vacaciones" para estado PROGRAMADA
// const openTakeVacationModal = (request: VacationRequest) => {
//   currentTakeVacationRequest.value = request
//   selectedReplacements.value = []
//   showTakeVacationModal.value = true
//   loadAvailableReplacements()
// }


// Función eliminada: loadRecommendedReplacements - no se usa

// Función no utilizada - comentada porque solo se usaba en openTakeVacationModal que ya no se usa
// Cargar reemplazantes disponibles desde la API (para modal de tomar vacaciones)
// const loadAvailableReplacements = async () => {
//   try {
//     if (!props.empId) {
//       console.warn('⚠️ No hay empId para cargar reemplazantes')
//       availableReplacements.value = []
//       return
//     }
//     
//     // Cargar reemplazantes recomendados desde la API
//     const response = await fetch(`http://190.171.225.68:8006/api/recomendar-reemplazante?empId=${props.empId}`)
//     
//     if (response.ok) {
//       const data = await response.json()
//       if (data.reemplazantes && Array.isArray(data.reemplazantes)) {
//         availableReplacements.value = data.reemplazantes.map((rep: any) => ({
//           id: rep.REEMPLAZANTE_EMP_ID || rep.emp_id,
//           name: rep.REEMPLAZANTE_NOMBRE || rep.nombre,
//           department: rep.CARGO || rep.cargo || 'N/A'
//         }))
//         console.log('✅ Reemplazantes cargados:', availableReplacements.value.length)
//       } else {
//         availableReplacements.value = []
//       }
//     } else {
//       console.warn('⚠️ No se pudieron cargar reemplazantes desde la API')
//       availableReplacements.value = []
//     }
//   } catch (error) {
//     console.error('Error al cargar reemplazantes:', error)
//     availableReplacements.value = []
//   }
// }

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
    const requestId = currentViewVacationRequest.value?.id_solicitud || ''
    const isGrouped = String(requestId).includes('_grupo_')
    const realRequestId = requestId.split('_grupo_')[0]
    
    const empId = props.empId || currentViewVacationRequest.value?.emp_id
    
    console.log('💾 Guardando reemplazantes...')
    console.log('💾 requestId:', requestId)
    console.log('💾 isGrouped:', isGrouped)
    console.log('💾 realRequestId:', realRequestId)
    console.log('💾 emp_id:', empId)
    console.log('💾 Reemplazantes seleccionados:', selectedViewReplacements.value)
    
    // Si es un grupo, encontrar todas las solicitudes individuales que corresponden a las fechas del grupo
    let solicitudesAActualizar: any[] = []
    
    if (isGrouped) {
      // Es un grupo, obtener las fechas del grupo
      const fechasGrupo = (currentViewVacationRequest.value as any)?.fechas_agrupadas || []
      const fechaSolicitud = currentViewVacationRequest.value?.fecha_solicitud
      
      console.log('💾 Grupo detectado. Fechas del grupo:', fechasGrupo)
      console.log('💾 Fecha de solicitud:', fechaSolicitud)
      console.log('💾 Emp ID:', empId)
      
      // Buscar todas las solicitudes originales que corresponden a estas fechas
      // IMPORTANTE: No filtrar por realRequestId, sino por fecha_solicitud, emp_id y fechas
      solicitudesAActualizar = requests.value.filter(req => {
        // Verificar que sea del mismo empleado
        const mismoEmpleado = String(req.emp_id) === String(empId)
        
        // Verificar que tenga la misma fecha_solicitud (para agrupar correctamente)
        const mismaFechaSolicitud = req.fecha_solicitud === fechaSolicitud
        
        // Verificar que tenga alguna de las fechas del grupo
        const tieneFechaGrupo = req.fechas.some((f: any) => fechasGrupo.includes(f.fecha))
        
        // Verificar que NO sea un grupo (solo solicitudes individuales)
        const noEsGrupo = !String(req.id_solicitud).includes('_grupo_')
        
        const cumple = mismoEmpleado && mismaFechaSolicitud && tieneFechaGrupo && noEsGrupo
        
        if (cumple) {
          console.log(`✅ Solicitud ${req.id_solicitud} cumple criterios:`, {
            fecha: req.fechas[0]?.fecha,
            fecha_solicitud: req.fecha_solicitud,
            emp_id: req.emp_id
          })
        }
        
        return cumple
      })
      
      console.log(`💾 Encontradas ${solicitudesAActualizar.length} solicitudes individuales para el grupo`)
      console.log('💾 IDs de solicitudes:', solicitudesAActualizar.map(s => s.id_solicitud))
      console.log('💾 Fechas de solicitudes:', solicitudesAActualizar.map(s => s.fechas[0]?.fecha))
    } else {
      // No es grupo, usar solo esta solicitud
      const solicitud = requests.value.find(r => 
        String(r.id_solicitud) === String(realRequestId) && 
        !String(r.id_solicitud).includes('_grupo_')
      )
      if (solicitud) {
        solicitudesAActualizar = [solicitud]
      }
    }
    
    if (solicitudesAActualizar.length === 0) {
      throw new Error('No se encontraron solicitudes para actualizar')
    }
    
    // Obtener los datos completos de cada reemplazante seleccionado
    const replacementsData = selectedViewReplacements.value.map((repId: string) => {
      // Buscar el reemplazante en availableReplacements para obtener todos sus datos
      const replacement = availableReplacements.value.find(r => r.id === repId || r.empID === repId)
      
      if (replacement) {
        return {
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
            nombre: empReplacement.name,
            cargo: empReplacement.cargo,
            telefono: empReplacement.phone || '',
            tipo: empReplacement.type || 'Suplente'
          }
        }
        
        // Si no se encuentra, usar datos mínimos
        return {
          nombre: 'Reemplazante',
          cargo: 'N/A',
          telefono: '',
          tipo: 'Suplente'
        }
      }
    })
    
    // Crear un array de reemplazantes a guardar para cada solicitud
    const replacementsToSave: any[] = []
    
    for (const solicitud of solicitudesAActualizar) {
      for (const replacementData of replacementsData) {
        replacementsToSave.push({
          id_solicitud: parseInt(String(solicitud.id_solicitud)),
          emp_id: parseInt(String(empId || '0')),
          nombre: replacementData.nombre,
          cargo: replacementData.cargo,
          telefono: replacementData.telefono,
          tipo: replacementData.tipo
        })
      }
    }
    
    console.log('💾 Reemplazantes a guardar:', replacementsToSave)
    console.log(`💾 Total de registros a guardar: ${replacementsToSave.length} (${solicitudesAActualizar.length} solicitudes × ${replacementsData.length} reemplazantes)`)
    
    // Guardar cada reemplazante individualmente usando la API correcta
    const savePromises = replacementsToSave.map(replacement => 
      fetch('http://190.171.225.68:8006/api/vacaciones/reemplazante/guardar', {
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
      console.log('✅ Todos los reemplazantes guardados exitosamente para todas las solicitudes del grupo')
      
      // Marcar esta solicitud/grupo específico como que tiene reemplazantes
      // Usar el ID completo del grupo si es un grupo, o el ID base si no
      const requestIdToMark = currentViewVacationRequest.value?.id_solicitud || realRequestId
      requestsWithReplacements.value.add(requestIdToMark)
      console.log(`✅ Marcando solicitud/grupo ${requestIdToMark} como que tiene reemplazantes`)
      
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
    const url = `http://190.171.225.68:8006/api/vacacion-data-empleado?emp_id=${props.empId}`
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
      
      // Verificar qué solicitudes tienen reemplazantes guardados (usando los datos que ya vienen en la respuesta)
      checkRequestsWithReplacementsFromData()
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

// Verificar qué solicitudes tienen reemplazantes guardados usando los datos que ya vienen en la respuesta
const checkRequestsWithReplacementsFromData = () => {
  requestsWithReplacements.value.clear()
  
  if (requests.value.length === 0) {
    console.log('ℹ️ No hay solicitudes para verificar reemplazantes')
    return
  }
  
  console.log('🔍 ===== VERIFICANDO REEMPLAZANTES DESDE DATOS =====')
  
  // Crear un mapa de fechas que tienen reemplazantes
  // Clave: fecha (YYYY-MM-DD), Valor: true si tiene reemplazantes
  const fechasConReemplazantes = new Map<string, boolean>()
  
  // Verificar cada solicitud original (antes de agrupar) usando los datos que ya vienen en la respuesta
  requests.value.forEach((request) => {
    // Verificar si la solicitud tiene reemplazantes en el campo reemplazantes
    if (request.reemplazantes && Array.isArray(request.reemplazantes) && request.reemplazantes.length > 0) {
      // Obtener las fechas de esta solicitud
      const fechas = request.fechas.map(f => f.fecha)
      
      fechas.forEach(fecha => {
        fechasConReemplazantes.set(fecha, true)
      })
      
      console.log(`✅ Solicitud ${request.id_solicitud} tiene ${request.reemplazantes.length} reemplazante(s) para fechas:`, fechas)
    }
  })
  
  // Ahora verificar las solicitudes agrupadas
  // Solo marcar como "con reemplazantes" si TODAS las fechas del grupo tienen reemplazantes
  const groupedRequests = sortedRequests.value
  console.log('🔍 Verificando grupos:', groupedRequests.length)
  
  groupedRequests.forEach((request: any) => {
    const requestId = String(request.id_solicitud).split('_grupo_')[0]
    const isGrouped = String(request.id_solicitud).includes('_grupo_')
    
    console.log(`🔍 Verificando request: ${request.id_solicitud}, isGrouped: ${isGrouped}`)
    
    if (isGrouped) {
      // Es un grupo, verificar si todas las fechas del grupo tienen reemplazantes
      const fechasGrupo = request.fechas_agrupadas || []
      console.log(`🔍 Grupo ${request.id_solicitud} tiene fechas:`, fechasGrupo)
      
      // Verificar si TODAS las fechas del grupo tienen reemplazantes
      const fechasConReemplazantesList: string[] = []
      const fechasSinReemplazantesList: string[] = []
      
      fechasGrupo.forEach((fechaGrupo: string) => {
        if (fechasConReemplazantes.has(fechaGrupo)) {
          fechasConReemplazantesList.push(fechaGrupo)
        } else {
          fechasSinReemplazantesList.push(fechaGrupo)
        }
      })
      
      console.log(`🔍 Grupo ${request.id_solicitud}:`)
      console.log(`   - Fechas con reemplazantes:`, fechasConReemplazantesList)
      console.log(`   - Fechas sin reemplazantes:`, fechasSinReemplazantesList)
      
      // Solo marcar si TODAS las fechas tienen reemplazantes
      if (fechasSinReemplazantesList.length === 0 && fechasConReemplazantesList.length > 0) {
        // Usar el ID completo del grupo para identificar específicamente este grupo
        requestsWithReplacements.value.add(request.id_solicitud)
        console.log(`✅ Grupo ${request.id_solicitud} (fechas: ${fechasGrupo.join(', ')}) tiene reemplazantes para TODAS sus fechas`)
      } else {
        console.log(`ℹ️ Grupo ${request.id_solicitud} NO tiene reemplazantes para todas sus fechas (${fechasSinReemplazantesList.length} sin reemplazantes)`)
      }
    } else {
      // No es grupo, verificar directamente por fechas
      const fechasSolicitud = request.fechas?.map((f: any) => f.fecha) || []
      const todasTienenReemplazantes = fechasSolicitud.length > 0 && 
        fechasSolicitud.every((fecha: string) => fechasConReemplazantes.has(fecha))
      
      if (todasTienenReemplazantes) {
        requestsWithReplacements.value.add(requestId)
        console.log(`✅ Solicitud ${requestId} tiene reemplazantes para todas sus fechas`)
      }
    }
  })
  
  console.log('✅ ===== VERIFICACIÓN COMPLETA =====')
  console.log('✅ Solicitudes/grupos con reemplazantes:', Array.from(requestsWithReplacements.value))
  console.log('✅ Total de solicitudes/grupos con reemplazantes:', requestsWithReplacements.value.size)
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
      // Obtener las fechas completas (con turno) para este grupo
      const fechasCompletas = solicitudes
        .flatMap(s => s.fechas)
        .filter(f => grupos[i].includes(f.fecha))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
      
      // Calcular días considerando turnos
      const diasCalculados = calcularDiasTotales({ fechas: fechasCompletas })
      
      result.push({
        ...primera,
        id_solicitud: `${primera.id_solicitud}_grupo_${i}`, // ID único para cada grupo
        fechas: fechasCompletas, // ✅ Mantener fechas con turno
        fechas_agrupadas: grupos[i],
        total_dias: String(diasCalculados), // ✅ Calcular días considerando turnos
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

// Función para calcular el total de días considerando medio día = 0.5
const calcularDiasTotales = (request: any): number => {
  // Si tiene fechas con turno, calcular sumando 0.5 para MAÑANA/TARDE y 1 para COMPLETO
  if (request.fechas && Array.isArray(request.fechas) && request.fechas.length > 0) {
    return request.fechas.reduce((total: number, fecha: any) => {
      const turno = fecha.turno || fecha.tipo_dia || 'COMPLETO'
      if (turno === 'MAÑANA' || turno === 'TARDE') {
        return total + 0.5
      }
      return total + 1
    }, 0)
  }
  
  // Si tiene fechas_agrupadas, asumir que son días completos (pero esto podría ser incorrecto)
  // Por ahora, contamos las fechas como días completos
  if ((request as any).fechas_agrupadas && Array.isArray((request as any).fechas_agrupadas)) {
    return (request as any).fechas_agrupadas.length
  }
  
  // Si tiene total_dias, intentar usarlo
  if (request.total_dias) {
    const total = parseFloat(String(request.total_dias))
    if (!isNaN(total)) {
      return total
    }
  }
  
  // Fallback: retornar 0 si no hay información
  return 0
}

const formatDate = (dateString: string) => {
  // Evitar problemas de zona horaria: parsear la fecha directamente sin conversión
  // Si la fecha viene como "YYYY-MM-DD", crear la fecha en hora local
  if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number)
    // month - 1 porque Date usa meses de 0-11
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-ES')
  }
  // Si viene en otro formato, usar el método normal pero con cuidado
  const date = new Date(dateString)
  // Verificar que la fecha sea válida
  if (isNaN(date.getTime())) {
    return dateString // Devolver el string original si no es válido
  }
  return date.toLocaleDateString('es-ES')
}

// Formatear fechas agrupadas mostrando solo las fechas reales (no rangos)
const formatFechasAgrupadas = (fechas: string[] | undefined): string => {
  try {
    if (!fechas || !Array.isArray(fechas) || fechas.length === 0) return 'No especificado'
    
    // Si hay muchas fechas, mostrar rango pero indicar que no son consecutivas
    if (fechas.length > 5) {
      const primera = fechas[0]
      const ultima = fechas[fechas.length - 1]
      if (primera && ultima) {
        return `${formatDate(primera)} - ${formatDate(ultima)} (${fechas.length} días)`
      }
    }
    
    // Si son pocas fechas, mostrarlas todas
    return fechas.filter(f => f).map(f => formatDate(f)).join(', ')
  } catch (error) {
    console.error('Error en formatFechasAgrupadas:', error)
    return 'Error al formatear fechas'
  }
}

// Formatear lista de fechas
const formatFechasList = (fechas: string[] | undefined): string => {
  try {
    if (!fechas || !Array.isArray(fechas) || fechas.length === 0) return 'No especificado'
    
    // Ordenar fechas
    const fechasOrdenadas = [...fechas].filter(f => f).sort()
    
    if (fechasOrdenadas.length === 0) return 'No especificado'
    
    // Si hay muchas fechas, mostrar rango
    if (fechasOrdenadas.length > 5) {
      return `${formatDate(fechasOrdenadas[0])} - ${formatDate(fechasOrdenadas[fechasOrdenadas.length - 1])} (${fechasOrdenadas.length} días)`
    }
    
    // Si son pocas fechas, mostrarlas todas
    return fechasOrdenadas.map(f => formatDate(f)).join(', ')
  } catch (error) {
    console.error('Error en formatFechasList:', error)
    return 'Error al formatear fechas'
  }
}


// Descargar boleta de vacación
const downloadBoleta = async (request: VacationRequest | any) => {
  try {
    console.log('📄 Generando boleta para solicitud:', request.id_solicitud)
    console.log('📄 Request completo:', request)
    
    // Obtener datos del empleado desde la API
    let employeeData: any = null
    const empIdToUse = props.empId || request.emp_id
    console.log('📄 Emp ID a usar:', empIdToUse)
    
    try {
      const empResponse = await fetch(`http://190.171.225.68:8006/api/empleado/info?emp_id=${empIdToUse}`)
      console.log('📄 Respuesta de empleado/info:', empResponse.status, empResponse.statusText)
      
      if (empResponse.ok) {
        const empResult = await empResponse.json()
        console.log('📄 Resultado de empleado/info:', empResult)
        
        // La API puede devolver directamente un array o un objeto con status
        if (Array.isArray(empResult) && empResult.length > 0) {
          // Nuevo formato: array directo
          employeeData = empResult[0]
          console.log('📄 Datos del empleado obtenidos (formato array):', employeeData)
        } else if (empResult.status === 'success' && Array.isArray(empResult.data) && empResult.data.length > 0) {
          // Formato antiguo: objeto con status y data
          employeeData = empResult.data[0]
          console.log('📄 Datos del empleado obtenidos (formato objeto):', employeeData)
        } else {
          console.warn('📄 Formato de respuesta no reconocido:', empResult)
        }
      } else {
        const errorText = await empResponse.text()
        console.warn('📄 Error al obtener datos del empleado:', empResponse.status, errorText)
      }
    } catch (err: any) {
      console.warn('📄 Excepción al obtener datos del empleado:', err.message)
    }

    // Obtener fechas de la solicitud con su turno
    let fechasConTurno: Array<{ fecha: string; turno: string; dias: number }> = []
    
    console.log('📄 Request completo para PDF:', JSON.stringify(request, null, 2))
    console.log('📄 request.fechas:', request.fechas)
    console.log('📄 request.fechas_agrupadas:', (request as any).fechas_agrupadas)
    
    // ✅ PRIORIZAR: Si tiene fechas con turno, usarlas (son más precisas)
    if (request.fechas && Array.isArray(request.fechas) && request.fechas.length > 0) {
      // Si tiene fechas con turno, usar esos datos
      fechasConTurno = request.fechas.map((f: any) => {
        // Manejar tanto objetos como strings
        const fechaStr = typeof f === 'string' ? f : f.fecha
        let turno = (typeof f === 'object' && f.turno) ? f.turno : 
                    (typeof f === 'object' && f.tipo_dia) ? f.tipo_dia : 'COMPLETO'
        
        // Normalizar turno a mayúsculas para comparación
        const turnoUpper = String(turno).toUpperCase().trim()
        const esMedioDia = turnoUpper === 'MAÑANA' || turnoUpper === 'MANANA' || turnoUpper === 'TARDE'
        const dias = esMedioDia ? 0.5 : 1
        
        // Normalizar turno para guardarlo (mantener formato original pero asegurar consistencia)
        if (esMedioDia) {
          turno = turnoUpper === 'MAÑANA' || turnoUpper === 'MANANA' ? 'MAÑANA' : 'TARDE'
        } else {
          turno = 'COMPLETO'
        }
        
        console.log(`📄 Fecha procesada: ${fechaStr}, Turno original: ${f.turno || f.tipo_dia}, Turno normalizado: ${turno}, Días: ${dias}`)
        return {
          fecha: fechaStr,
          turno,
          dias
        }
      })
    } else if ((request as any).fechas_agrupadas && Array.isArray((request as any).fechas_agrupadas)) {
      // Si solo tiene fechas_agrupadas (sin turno), asumir que son días completos
      // Esto es un fallback, idealmente siempre debería tener request.fechas
      console.warn('⚠️ Usando fechas_agrupadas sin información de turno, asumiendo COMPLETO')
      fechasConTurno = (request as any).fechas_agrupadas.map((fecha: string) => ({
        fecha,
        turno: 'COMPLETO',
        dias: 1
      }))
    } else {
      throw new Error('No se encontraron fechas en la solicitud')
    }
    
    console.log('📄 Fechas con turno obtenidas:', fechasConTurno)
    console.log('📄 Total días calculado desde fechas:', fechasConTurno.reduce((sum, f) => sum + f.dias, 0))
    
    if (fechasConTurno.length === 0) {
      throw new Error('No se encontraron fechas en la solicitud')
    }
    
    // Validar y formatear FechaIngreso - buscar en múltiples campos posibles
    // ✅ La API devuelve: fechaIngreso
    let fechaIngreso = employeeData?.fechaIngreso || 
                      employeeData?.FechaIngreso || 
                      employeeData?.fecha_ingreso || 
                      employeeData?.FECHA_INGRESO ||
                      employeeData?.fecha_ingreso_empleado ||
                      employeeData?.fecha_ingreso_emp ||
                      employeeData?.fecha_inicio ||
                      employeeData?.fecha_inicio_laboral ||
                      request?.fecha_ingreso ||
                      request?.emp_fecha_ingreso ||
                      null
    
    console.log('📄 Fecha de ingreso encontrada:', fechaIngreso)
    console.log('📄 employeeData completo:', employeeData)
    
    if (!fechaIngreso || fechaIngreso === 'N/A' || fechaIngreso === '' || fechaIngreso === null) {
      // Si no hay fecha de ingreso, intentar obtenerla desde la solicitud o usar una fecha por defecto
      console.warn('📄 No se encontró fecha de ingreso en employeeData, buscando en request...')
      
      // Intentar desde el request si tiene información del empleado
      if (request.emp_fecha_ingreso) {
        fechaIngreso = request.emp_fecha_ingreso
        console.log('📄 Usando fecha de ingreso del request:', fechaIngreso)
      } else {
        // Si no hay fecha de ingreso, usar una fecha por defecto (1 año atrás desde hoy)
        const fechaDefault = new Date()
        fechaDefault.setFullYear(fechaDefault.getFullYear() - 1)
        fechaIngreso = fechaDefault.toISOString().split('T')[0]
        console.warn('📄 No se encontró fecha de ingreso, usando fecha por defecto:', fechaIngreso)
      }
    }
    
    // Asegurar que la fecha esté en formato YYYY-MM-DD
    try {
      const fechaParsed = new Date(fechaIngreso)
      if (isNaN(fechaParsed.getTime())) {
        throw new Error('Fecha inválida')
      }
      fechaIngreso = fechaParsed.toISOString().split('T')[0]
      console.log('📄 Fecha de ingreso formateada:', fechaIngreso)
    } catch (e) {
      // Si no se puede parsear, usar fecha por defecto
      const fechaDefault = new Date()
      fechaDefault.setFullYear(fechaDefault.getFullYear() - 1)
      fechaIngreso = fechaDefault.toISOString().split('T')[0]
      console.warn('📄 Error al parsear fecha de ingreso, usando fecha por defecto:', fechaIngreso)
    }
    
    // Construir payload para la boleta
    // Intentar obtener datos del empleado desde múltiples fuentes
    // ✅ La API devuelve: fullName, cargo, departamento, fechaIngreso, empID
    const nombreEmpleado = employeeData?.fullName || 
                          employeeData?.nombre || 
                          employeeData?.NOMBRE || 
                          employeeData?.nombre_completo ||
                          employeeData?.EmpleadoNombre ||
                          request.emp_nombre || 
                          'Empleado'
    
    const cargoEmpleado = employeeData?.cargo || 
                         employeeData?.CARGO || 
                         employeeData?.puesto ||
                         employeeData?.EmpleadoCargo ||
                         request.emp_cargo ||
                         'N/A'
    
    const departamentoEmpleado = employeeData?.departamento || 
                                employeeData?.Departamento ||
                                employeeData?.dept || 
                                employeeData?.DEPARTAMENTO || 
                                employeeData?.DEPT ||
                                employeeData?.departamento_nombre ||
                                request.emp_departamento ||
                                'N/A'
    
    const codigoEmpleado = employeeData?.empID || 
                          employeeData?.EmpleadoID ||
                          employeeData?.codigo || 
                          employeeData?.EMP_ID ||
                          employeeData?.codigo_empleado ||
                          empIdToUse || 
                          'N/A'
    
    console.log('📄 Datos del empleado para PDF:', {
      nombre: nombreEmpleado,
      cargo: cargoEmpleado,
      departamento: departamentoEmpleado,
      codigo: codigoEmpleado,
      fechaIngreso: fechaIngreso,
      employeeData: employeeData
    })
    
    const boletaPayload: any = {
      Codigo: codigoEmpleado,
      Empleado: nombreEmpleado,
      Cargo: cargoEmpleado,
      Departamento: departamentoEmpleado,
      FechaIngreso: fechaIngreso, // Ahora siempre será una fecha válida
      FechaSolicitud: request.fecha_solicitud || new Date().toISOString().split('T')[0],
      Estado: 'Autorizado',
      Observaciones: request.comentario || 'Vacación aprobada',
      detalle: []
    }

    // Agrupar fechas consecutivas en el detalle, considerando turnos
    // ✅ IMPORTANTE: Para medio día, NO agrupar fechas no consecutivas, mostrar cada una por separado
    if (fechasConTurno.length > 0) {
      // Ordenar por fecha
      const fechasOrdenadas = [...fechasConTurno].sort((a, b) => a.fecha.localeCompare(b.fecha))
      
      // Si todas las fechas son medio día (0.5), NO agrupar, mostrar cada una por separado
      const todasSonMedioDia = fechasOrdenadas.every(f => f.dias === 0.5)
      
      if (todasSonMedioDia) {
        // ✅ Para medio día, crear un registro por cada fecha individual
        console.log('📄 Todas las fechas son medio día - Creando registros individuales')
        fechasOrdenadas.forEach(fecha => {
          boletaPayload.detalle.push({
            Desde: fecha.fecha,
            Hasta: fecha.fecha,
            Dias: fecha.dias,
            Tipo: request.tipo === 'PROGRAMADA' ? 'Vacación' : request.tipo || 'Vacación',
            Turno: fecha.turno !== 'COMPLETO' ? fecha.turno : null
          })
          console.log(`📄 Registro individual - Fecha: ${fecha.fecha}, Días: ${fecha.dias}, Turno: ${fecha.turno}`)
        })
      } else {
        // Para días completos o mixtos, agrupar por turno primero, luego por fechas consecutivas
        const gruposPorTurno = new Map<string, typeof fechasOrdenadas>()
        
        // Separar por turno
        fechasOrdenadas.forEach(fecha => {
          const turno = fecha.turno || 'COMPLETO'
          if (!gruposPorTurno.has(turno)) {
            gruposPorTurno.set(turno, [])
          }
          gruposPorTurno.get(turno)!.push(fecha)
        })
        
        // Para cada turno, agrupar fechas consecutivas
        gruposPorTurno.forEach((fechasDelTurno, turno) => {
          console.log(`📄 Procesando turno: ${turno}, Fechas:`, fechasDelTurno)
          let grupoInicio = fechasDelTurno[0]
          let grupoFin = fechasDelTurno[0]
          let totalDiasGrupo = grupoInicio.dias
          
          console.log(`📄 Grupo inicial - Desde: ${grupoInicio.fecha}, Turno: ${grupoInicio.turno}, Días: ${grupoInicio.dias}, Total días grupo: ${totalDiasGrupo}`)

          for (let i = 1; i < fechasDelTurno.length; i++) {
            const fechaActual = fechasDelTurno[i]
            const fechaAnterior = new Date(fechasDelTurno[i - 1].fecha + 'T00:00:00')
            const fechaActualDate = new Date(fechaActual.fecha + 'T00:00:00')
            const diferenciaDias = (fechaActualDate.getTime() - fechaAnterior.getTime()) / (1000 * 60 * 60 * 24)

            // Verificar si es consecutiva (mismo turno ya está garantizado)
            const esConsecutiva = diferenciaDias === 1

            if (esConsecutiva) {
              // Fecha consecutiva, extender el grupo
              grupoFin = fechaActual
              totalDiasGrupo += fechaActual.dias
              console.log(`📄 Fecha consecutiva agregada - Fecha: ${fechaActual.fecha}, Días: ${fechaActual.dias}, Total acumulado: ${totalDiasGrupo}`)
            } else {
              // Nueva secuencia, guardar el grupo anterior
              console.log(`📄 Guardando grupo anterior - Desde: ${grupoInicio.fecha}, Hasta: ${grupoFin.fecha}, Días: ${totalDiasGrupo}, Turno: ${turno}`)
              boletaPayload.detalle.push({
                Desde: grupoInicio.fecha,
                Hasta: grupoFin.fecha,
                Dias: totalDiasGrupo,
                Tipo: request.tipo === 'PROGRAMADA' ? 'Vacación' : request.tipo || 'Vacación',
                Turno: turno !== 'COMPLETO' ? turno : null
              })
              grupoInicio = fechaActual
              grupoFin = fechaActual
              totalDiasGrupo = fechaActual.dias
              console.log(`📄 Nuevo grupo iniciado - Desde: ${grupoInicio.fecha}, Días: ${totalDiasGrupo}`)
            }
          }

          // Agregar el último grupo de este turno
          console.log(`📄 Guardando último grupo - Desde: ${grupoInicio.fecha}, Hasta: ${grupoFin.fecha}, Días: ${totalDiasGrupo}, Turno: ${turno}`)
          boletaPayload.detalle.push({
            Desde: grupoInicio.fecha,
            Hasta: grupoFin.fecha,
            Dias: totalDiasGrupo,
            Tipo: request.tipo === 'PROGRAMADA' ? 'Vacación' : request.tipo || 'Vacación',
            Turno: turno !== 'COMPLETO' ? turno : null
          })
        })
      }
    }

    console.log('📄 Payload de boleta completo:', JSON.stringify(boletaPayload, null, 2))
    console.log('📄 Detalle del payload:', boletaPayload.detalle)
    const totalDiasPayload = boletaPayload.detalle.reduce((sum: number, item: any) => sum + parseFloat(item.Dias || 0), 0)
    console.log('📄 Total días en payload:', totalDiasPayload)

    // Generar PDF usando GET (la API solo acepta GET)
    console.log('📄 Enviando request a /api/vacacion...')
    
    // Construir URL con parámetros individuales (la API puede esperar esto)
    const params = new URLSearchParams()
    params.append('Codigo', String(boletaPayload.Codigo))
    params.append('Empleado', String(boletaPayload.Empleado))
    params.append('Cargo', String(boletaPayload.Cargo))
    params.append('Departamento', String(boletaPayload.Departamento))
    params.append('FechaIngreso', String(boletaPayload.FechaIngreso))
    params.append('FechaSolicitud', String(boletaPayload.FechaSolicitud))
    params.append('Estado', String(boletaPayload.Estado))
    params.append('Observaciones', String(boletaPayload.Observaciones))
    
    // Agregar cada elemento del detalle como parámetros separados
    // Formato: detalle[0][Desde]=...&detalle[0][Hasta]=...&detalle[0][Dias]=...&detalle[0][Tipo]=...&detalle[0][Turno]=...
    boletaPayload.detalle.forEach((item: any, index: number) => {
      params.append(`detalle[${index}][Desde]`, String(item.Desde))
      params.append(`detalle[${index}][Hasta]`, String(item.Hasta))
      params.append(`detalle[${index}][Dias]`, String(item.Dias))
      params.append(`detalle[${index}][Tipo]`, String(item.Tipo))
      // ✅ Siempre enviar Turno, incluso si es null o undefined (el backend lo manejará)
      if (item.Turno !== null && item.Turno !== undefined) {
        params.append(`detalle[${index}][Turno]`, String(item.Turno))
      } else {
        // Si no hay turno, enviar 'COMPLETO' explícitamente
        params.append(`detalle[${index}][Turno]`, 'COMPLETO')
      }
    })
    
    const apiUrl = `http://190.171.225.68:8006/api/vacacion?${params.toString()}`
    console.log('📄 URL completa (primeros 500 chars):', apiUrl.substring(0, 500))
    console.log('📄 Total de parámetros:', params.toString().split('&').length)
    
    let response: Response
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf, application/octet-stream, */*',
        }
      })
    } catch (fetchError: any) {
      console.error('❌ Error de red al hacer fetch:', fetchError)
      throw new Error(`Error de conexión: ${fetchError.message}`)
    }

    console.log('📄 Respuesta de /api/vacacion:', response.status, response.statusText)
    const contentType = response.headers.get('content-type')
    console.log('📄 Content-Type:', contentType)
    console.log('📄 Headers completos:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      // Si hay error, intentar leer el texto de error
      let errorText = ''
      try {
        // Intentar leer como texto primero
        const responseClone = response.clone()
        errorText = await responseClone.text()
        console.error('📄 Error en respuesta (texto):', errorText.substring(0, 500))
        
        // Si parece JSON, intentar parsearlo
        try {
          const errorJson = JSON.parse(errorText)
          console.error('📄 Error en respuesta (JSON):', errorJson)
          errorText = errorJson.message || errorJson.error || JSON.stringify(errorJson)
        } catch (e) {
          // No es JSON, usar el texto tal cual
        }
      } catch (e: any) {
        errorText = `Error ${response.status}: ${response.statusText} - ${e.message}`
      }
      console.error('📄 Error completo en respuesta:', errorText)
      throw new Error(`Error al generar boleta (${response.status}): ${errorText.substring(0, 200)}`)
    }

    // Verificar que sea un PDF (pero no bloquear si no lo especifica, algunos servidores no lo hacen)
    if (contentType && !contentType.includes('pdf') && !contentType.includes('application/octet-stream') && !contentType.includes('binary')) {
      console.warn('📄 Content-Type inesperado:', contentType, '- Continuando de todas formas')
    }

    // Descargar el PDF
    console.log('📄 Convirtiendo respuesta a blob...')
    const blob = await response.blob()
    console.log('📄 Blob creado, tamaño:', blob.size, 'bytes', 'tipo:', blob.type)
    
    if (blob.size === 0) {
      throw new Error('El PDF generado está vacío')
    }
    
    // Verificar que el blob no sea un JSON de error
    if (blob.type && blob.type.includes('json')) {
      const text = await blob.text()
      console.error('📄 Respuesta es JSON (probable error):', text)
      let errorMessage = 'Error del servidor'
      try {
        const errorJson = JSON.parse(text)
        errorMessage = errorJson.message || errorJson.error || text
      } catch (e) {
        errorMessage = text
      }
      throw new Error(errorMessage)
    }

    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `Boleta_Vacacion_${request.id_solicitud}.pdf`
    document.body.appendChild(a)
    a.click()
    
    // Limpiar después de un breve delay
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(a)
    }, 100)

    console.log('✅ Boleta descargada exitosamente')
  } catch (error: any) {
    console.error('❌ Error completo al descargar boleta:', error)
    console.error('❌ Stack trace:', error.stack)
    const errorMessage = error.message || 'Error desconocido al descargar la boleta'
    alert(`Error al descargar la boleta: ${errorMessage}\n\nPor favor revisa la consola para más detalles.`)
  }
}
</script>