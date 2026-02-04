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
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="text-lg font-semibold leading-none tracking-tight">Panel de Aprobación</h3>
            <p class="text-sm text-muted-foreground">Solicitudes pendientes de aprobación</p>
          </div>
          
          <!-- Filtros -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2 border-t">
            <!-- Filtro por empleado -->
            <div class="flex-1">
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">Filtrar por empleado</label>
              <select
                v-model="selectedEmployeeFilter"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white"
              >
                <option value="">Todos los empleados</option>
                <option
                  v-for="employee in uniqueEmployees"
                  :key="employee.emp_id"
                  :value="employee.emp_id"
                >
                  {{ employee.nombre }} ({{ employee.cargo }})
                </option>
              </select>
            </div>
            
          </div>
        </div>
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
                  <span v-if="(request as any).fechas_agrupadas && (request as any).fechas_agrupadas.length > 0">
                    {{ formatDate((request as any).fechas_agrupadas[0]) }} - {{ formatDate((request as any).fechas_agrupadas[(request as any).fechas_agrupadas.length - 1]) }} ({{ calcularDiasTotales(request) }} días)
                  </span>
                  <span v-else-if="request.fechas && request.fechas.length > 0">
                    {{ formatDate(getSortedFechas(request.fechas)[0].fecha) }} - {{ formatDate(getSortedFechas(request.fechas)[getSortedFechas(request.fechas).length - 1].fecha) }} ({{ calcularDiasTotales(request) }} días)
                  </span>
                  <span v-else>N/A</span>
                </p>
                <!-- Mostrar resumen de turnos si hay medio día -->
                <p v-if="request.fechas && request.fechas.length > 0" class="text-xs text-gray-500 mt-1">
                  <span v-for="(fecha, idx) in getSortedFechas(request.fechas)" :key="idx">
                    <span v-if="fecha.turno === 'MAÑANA' || fecha.turno === 'TARDE'">
                      {{ formatDate(fecha.fecha) }} ({{ fecha.turno === 'MAÑANA' ? 'Mañana' : 'Tarde' }})<span v-if="idx < request.fechas.length - 1">, </span>
                    </span>
                  </span>
                </p>
              </div>
              <div>
                <p class="text-muted-foreground">Días solicitados</p>
                <p class="font-medium">
                  {{ calcularDiasTotales(request) }} 
                  día{{ calcularDiasTotales(request) !== 1 ? 's' : '' }}
                </p>
              </div>
              <div>
                <p class="text-muted-foreground">Tipo</p>
                <p class="font-medium">{{ getVacationType(request.tipo || 'PROGRAMADA') }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Estado</p>
                <span :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  request.estado === 'PROCESO' ? 'bg-yellow-100 text-yellow-800' : '',
                  request.estado === 'PENDIENTE' ? 'bg-blue-100 text-blue-800' : '',
                  request.estado === 'PREAPROBADO' || request.estado === 'PRE-APROBADO' ? 'bg-yellow-100 text-yellow-800' : '',
                  request.estado === 'APROBADO' ? 'bg-green-100 text-green-800' : '',
                  request.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ request.estado === 'PREAPROBADO' || request.estado === 'PRE-APROBADO' ? 'PRE-APROBADO' : request.estado }}
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

            <!-- Request Date -->
            <div class="text-xs text-muted-foreground">
              Solicitado el {{ formatDate(request.fecha_solicitud) }}
            </div>

            <!-- Timeline Visual -->
            <div class="border-t pt-4">
              <p class="text-xs font-medium text-muted-foreground mb-3">Estado del Proceso</p>
              <div class="flex items-center gap-2">
                <!-- Paso 1: Pendiente -->
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                    request.estado === 'PENDIENTE' || request.estado === 'PROCESO' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  ]">
                    <CheckCircle v-if="request.estado !== 'PENDIENTE' && request.estado !== 'PROCESO'" class="h-4 w-4" />
                    <span v-else>1</span>
                  </div>
                  <span class="text-xs text-muted-foreground">Pendiente</span>
                </div>
                
                <!-- Línea conectora -->
                <div :class="[
                  'flex-1 h-0.5',
                  request.estado === 'PREAPROBADO' || request.estado === 'PRE-APROBADO' || request.estado === 'APROBADO' || request.estado === 'RECHAZADO'
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                ]"></div>
                
                <!-- Paso 2: Preaprobado -->
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                    request.estado === 'PREAPROBADO' || request.estado === 'PRE-APROBADO' 
                      ? 'bg-yellow-500 text-white' 
                      : request.estado === 'APROBADO' || request.estado === 'RECHAZADO'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  ]">
                    <CheckCircle v-if="request.estado === 'APROBADO' || request.estado === 'RECHAZADO'" class="h-4 w-4" />
                    <span v-else-if="request.estado === 'PREAPROBADO'">2</span>
                    <span v-else>2</span>
                  </div>
                  <span class="text-xs text-muted-foreground">PRE-APROBADO</span>
                </div>
                
                <!-- Línea conectora -->
                <div :class="[
                  'flex-1 h-0.5',
                  request.estado === 'APROBADO' || request.estado === 'RECHAZADO'
                    ? 'bg-yellow-500' 
                    : 'bg-gray-200'
                ]"></div>
                
                <!-- Paso 3: Final -->
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                    request.estado === 'APROBADO' 
                      ? 'bg-green-500 text-white' 
                      : request.estado === 'RECHAZADO'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  ]">
                    <CheckCircle v-if="request.estado === 'APROBADO' || request.estado === 'RECHAZADO'" class="h-4 w-4" />
                    <span v-else>3</span>
                  </div>
                  <span class="text-xs text-muted-foreground">
                    {{ request.estado === 'APROBADO' ? 'Aprobado' : request.estado === 'RECHAZADO' ? 'Rechazado' : 'Final' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t">
              <button
                v-if="request.estado === 'PENDIENTE' || request.estado === 'PROCESO'"
                @click="handlePreapprove(request.id_solicitud)"
                :disabled="isProcessing"
                class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-yellow-500 text-white hover:bg-yellow-600 h-10 px-4 py-2"
              >
                <CheckCircle class="h-4 w-4 mr-2" />
                Preaprobar
              </button>

              <button
                v-if="request.estado === 'PREAPROBADO' || request.estado === 'PRE-APROBADO' || request.estado === 'PENDIENTE' || request.estado === 'PROCESO'"
                @click="handleApprove(request.id_solicitud)"
                :disabled="isProcessing"
                class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
              >
                <CheckCircle class="h-4 w-4 mr-2" />
                Aprobar
              </button>

              <button
                v-if="request.estado !== 'RECHAZADO'"
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
            <h3 :class="[
              'text-lg font-semibold',
              isPreapproving ? 'text-yellow-900' : 'text-green-900'
            ]">
              {{ isPreapproving ? 'Preaprobar Solicitud' : 'Aprobar Solicitud' }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ isPreapproving 
                ? 'Marca como revisado y envía notificación al empleado' 
                : 'Confirma la aprobación de esta solicitud' }}
            </p>
          </div>

          <!-- Resumen de la solicitud -->
          <div v-if="selectedRequest" :class="[
            'p-4 rounded-lg border',
            isPreapproving ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
          ]">
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
                <span class="font-semibold text-green-700">{{ calcularDiasTotales(selectedRequest) }} día{{ calcularDiasTotales(selectedRequest) !== 1 ? 's' : '' }}</span>
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
              Comentario {{ isPreapproving ? '(opcional)' : '(opcional)' }}
            </label>
            <textarea
              id="approve-comment"
              v-model="approveComment"
              rows="3"
              :placeholder="isPreapproving ? 'Ej: Solicitud revisada, pendiente de aprobación final' : 'Ej: Aprobado según disponibilidad del equipo'"
              :class="[
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none resize-none',
                isPreapproving ? 'focus:ring-2 focus:ring-yellow-500' : 'focus:ring-2 focus:ring-green-500'
              ]"
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
              :class="[
                'flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium text-white h-10 px-4 py-2 disabled:opacity-50',
                isPreapproving ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'
              ]"
            >
              <CheckCircle class="h-4 w-4 mr-2" />
              <span v-if="isProcessing">Procesando...</span>
              <span v-else-if="isPreapproving">Confirmar Preaprobación</span>
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
                <span class="font-semibold text-red-700">{{ calcularDiasTotales(selectedRequest) }} día{{ calcularDiasTotales(selectedRequest) !== 1 ? 's' : '' }}</span>
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
                <span class="font-medium text-gray-700">{{ calcularDiasTotales(selectedRequest) }} día{{ calcularDiasTotales(selectedRequest) !== 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>

          <!-- Selección de reemplazantes -->
          <div>
            <label class="text-sm font-medium mb-2 block">
              Reemplazantes * (puedes seleccionar varios)
            </label>
            
            <!-- Opción: No tiene reemplazo -->
            <div class="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="no-replacement-option"
                  v-model="hasNoReplacement"
                  @change="handleNoReplacementChange"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  for="no-replacement-option"
                  class="flex-1 text-sm cursor-pointer font-medium text-gray-700"
                >
                  No tiene reemplazo
                </label>
              </div>
            </div>
            
            <div class="rounded-md border border-input bg-background p-3 max-h-64 overflow-y-auto space-y-2" :class="{ 'opacity-50 pointer-events-none': hasNoReplacement }">
              <div
                v-for="(person, index) in availableReplacements"
                :key="`replacement-${person.id || index}-${person.name}`"
                class="flex items-center space-x-2 hover:bg-accent p-2 rounded"
              >
                <input
                  type="checkbox"
                  :id="`replacement-boss-${person.id || index}-${selectedRequestId || 'default'}`"
                  :value="String(person.id || index)"
                  v-model="selectedReplacements"
                  :disabled="hasNoReplacement"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  :for="`replacement-boss-${person.id || index}-${selectedRequestId || 'default'}`"
                  class="flex-1 text-sm cursor-pointer"
                >
                  {{ person.name }} - {{ person.department }}
                </label>
              </div>
              <div v-if="availableReplacements.length === 0 && !hasNoReplacement" class="text-sm text-red-600 text-center py-2">
                ⚠️ No hay reemplazantes disponibles. Puedes marcar "No tiene reemplazo" para continuar.
              </div>
            </div>
            <p v-if="!hasNoReplacement && selectedReplacements.length === 0" class="text-xs text-red-600 mt-2 font-medium">
              ⚠️ Debes seleccionar al menos un reemplazante o marcar "No tiene reemplazo" para poder aprobar
            </p>
            <p v-if="!hasNoReplacement && selectedReplacements.length > 0" class="text-xs text-muted-foreground mt-2">
              {{ selectedReplacements.length }} reemplazante(s) seleccionado(s)
            </p>
            <p v-if="hasNoReplacement" class="text-xs text-blue-600 mt-2 font-medium">
              ✓ Se aprobará sin reemplazantes
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3">
            <button
              @click="confirmApproveWithReplacements"
              :disabled="isProcessing || (!hasNoReplacement && selectedReplacements.length === 0)"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Aprobar
            </button>
            <button
              @click="handleCancelReplacementModal"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
    departamento?: string
    dept?: string
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
    replacements?: any[]
    departamento?: string
    dept?: string
    vacation?: {
      years?: string
    }
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
const hasNoReplacement = ref(false)
const isPreapproving = ref(false)

// Filtros
const selectedEmployeeFilter = ref<string>('')

// Cargar reemplazantes disponibles desde la API
const loadAvailableReplacements = async (empId: string) => {
  try {
    console.log('🔍 Cargando reemplazantes para empId:', empId)
    availableReplacements.value = []
    
    const allReplacements: any[] = []
    
    // 1. PRIMERO: Cargar desde /api/empleado/info que tiene los replacements en el campo replacements
    try {
      // Intentar desde el cache primero
      if (employeeCache.value[empId] && employeeCache.value[empId].replacements && Array.isArray(employeeCache.value[empId].replacements) && employeeCache.value[empId].replacements.length > 0) {
        const replacementsFromCache = employeeCache.value[empId].replacements.map((rep: any) => ({
          id: rep.id || rep.EMP_ID || rep.emp_id,
          name: rep.name || rep.NOMBRE || rep.nombre,
          department: rep.cargo || rep.CARGO || 'N/A',
          phone: rep.phone || rep.TELEFONO || '',
          isRecommended: true
        }))
        allReplacements.push(...replacementsFromCache)
        console.log('✅ Reemplazantes encontrados en cache del empleado:', replacementsFromCache.length)
      } else {
        // Si no está en cache, cargar desde API
        const empResponse = await fetch(`http://190.171.225.68:8006/api/empleado/info?emp_id=${empId}`)
        if (empResponse.ok) {
          const empData = await empResponse.json()
          
          // La API ahora devuelve directamente un array o un objeto con status
          let empleadoInfo: any = null
          
          if (Array.isArray(empData) && empData.length > 0) {
            // Nuevo formato: array directo
            empleadoInfo = empData[0]
          } else if (empData.status === 'success' && Array.isArray(empData.data) && empData.data.length > 0) {
            // Formato antiguo: objeto con status y data
            empleadoInfo = empData.data[0]
          }
          
          if (empleadoInfo) {
            // Guardar en cache con los replacements y vacation info
            employeeCache.value[empId] = {
              nombre: empleadoInfo.fullName || `Empleado #${empId}`,
              cargo: empleadoInfo.cargo || 'N/A',
              replacements: empleadoInfo.replacements || [],
              vacation: empleadoInfo.vacation || {}, // Guardar información de vacaciones (incluye years)
              fechaIngreso: empleadoInfo.fechaIngreso || empleadoInfo.FechaIngreso || empleadoInfo.fecha_ingreso || null // Guardar fecha de ingreso
            }
            
            // Si el empleado tiene reemplazantes en la respuesta, agregarlos
            if (empleadoInfo.replacements && Array.isArray(empleadoInfo.replacements) && empleadoInfo.replacements.length > 0) {
              const replacementsFromEmployee = empleadoInfo.replacements.map((rep: any) => ({
                id: rep.id || rep.EMP_ID || rep.emp_id,
                name: rep.name || rep.NOMBRE || rep.nombre,
                department: rep.cargo || rep.CARGO || 'N/A',
                phone: rep.phone || rep.TELEFONO || '',
                isRecommended: true
              }))
              allReplacements.push(...replacementsFromEmployee)
              console.log('✅ Reemplazantes encontrados en /api/empleado/info:', replacementsFromEmployee.length)
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error al cargar reemplazantes desde /api/empleado/info:', error)
    }
    
    // 2. Si aún no hay reemplazantes, intentar desde la API de recomendaciones como fallback
    if (allReplacements.length === 0) {
      try {
        const response = await fetch(`http://190.171.225.68:8006/api/recomendar-reemplazante?empId=${empId}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.reemplazantes && Array.isArray(data.reemplazantes) && data.reemplazantes.length > 0) {
            const recommended = data.reemplazantes.map((rep: any) => ({
              id: rep.REEMPLAZANTE_EMP_ID || rep.emp_id,
              name: rep.REEMPLAZANTE_NOMBRE || rep.nombre,
              department: rep.CARGO || rep.cargo || 'N/A',
              phone: rep.TELEFONO || '',
              isRecommended: true
            }))
            allReplacements.push(...recommended)
            console.log('✅ Reemplazantes recomendados cargados (fallback):', recommended.length)
          }
        }
      } catch (error) {
        console.warn('⚠️ Error al cargar reemplazantes recomendados:', error)
      }
    }
    
    // 3. Si aún no hay reemplazantes, intentar obtener empleados del mismo departamento desde las solicitudes
    if (allReplacements.length === 0) {
      try {
        // Obtener información del empleado para buscar del mismo departamento
        let empleadoInfo: any = null
        let departamento: string | null = null
        
        // Intentar desde el cache primero
        if (employeeCache.value[empId]) {
          empleadoInfo = employeeCache.value[empId]
          departamento = empleadoInfo.cargo || empleadoInfo.departamento
        } else {
          // Si no está en cache, cargar desde API
          const empResponse = await fetch(`http://190.171.225.68:8006/api/empleado/info?emp_id=${empId}`)
          if (empResponse.ok) {
            const empData = await empResponse.json()
            
            // La API ahora devuelve directamente un array o un objeto con status
            if (Array.isArray(empData) && empData.length > 0) {
              empleadoInfo = empData[0]
              departamento = empleadoInfo.dept || empleadoInfo.departamento || empleadoInfo.DEPT || empleadoInfo.cargo
            } else if (empData.status === 'success' && Array.isArray(empData.data) && empData.data.length > 0) {
              empleadoInfo = empData.data[0]
              departamento = empleadoInfo.dept || empleadoInfo.departamento || empleadoInfo.DEPT || empleadoInfo.cargo
            }
          }
        }
        
        console.log('🔍 Información del empleado:', {
          emp_id: empId,
          empleado: empleadoInfo,
          departamento: departamento
        })
        
        // Obtener otros empleados desde las solicitudes del manager (excluyendo al empleado actual)
        const otrosEmpleados = requests.value
          .filter((req: VacationRequest) => {
            const diferenteEmpleado = String(req.emp_id) !== String(empId)
            if (!diferenteEmpleado) return false
            
            // Si tenemos departamento, filtrar por mismo departamento
            if (departamento) {
              const reqEmpleado = req.empleado || employeeCache.value[req.emp_id]
              const reqDept = reqEmpleado?.cargo || reqEmpleado?.departamento || reqEmpleado?.dept
              return reqDept === departamento || reqDept === empleadoInfo?.cargo
            }
            
            // Si no hay departamento, incluir todos los demás empleados del manager
            return true
          })
          .map((req: VacationRequest) => {
            const reqEmpleado = req.empleado || employeeCache.value[req.emp_id]
            return {
              id: req.emp_id,
              name: reqEmpleado?.nombre || `Empleado #${req.emp_id}`,
              department: reqEmpleado?.cargo || reqEmpleado?.departamento || 'N/A',
              phone: '',
              isRecommended: false
            }
          })
        
        // Eliminar duplicados por ID
        const empleadosUnicos = otrosEmpleados.filter((emp, index, self) => 
          index === self.findIndex(e => e.id === emp.id)
        )
        
        if (empleadosUnicos.length > 0) {
          allReplacements.push(...empleadosUnicos)
          console.log('✅ Empleados encontrados en solicitudes del manager:', empleadosUnicos.length)
        } else {
          console.warn('⚠️ No se encontraron otros empleados en las solicitudes del manager')
        }
      } catch (empError) {
        console.warn('⚠️ Error al cargar información del empleado:', empError)
      }
    }
    
    // 4. Si aún no hay reemplazantes, intentar cargar desde reemplazantes guardados de la solicitud
    if (allReplacements.length === 0 && selectedRequest.value) {
      try {
        const requestId = String(selectedRequest.value.id_solicitud).split('_grupo_')[0]
        const empIdToUse = selectedRequest.value.emp_id || empId
        const savedResponse = await fetch(`http://190.171.225.68:8006/api/reemplazante-vacation?id_solicitud=${requestId}&emp_id=${empIdToUse}`)
        if (savedResponse.ok) {
          const savedData = await savedResponse.json()
          if (savedData.success && Array.isArray(savedData.data) && savedData.data.length > 0) {
            const saved = savedData.data.map((rep: any) => ({
              id: rep.EMP_ID || rep.emp_id,
              name: rep.NOMBRE || rep.nombre,
              department: rep.CARGO || rep.cargo || 'N/A',
              phone: rep.TELEFONO || '',
              isRecommended: false
            }))
            allReplacements.push(...saved)
            console.log('✅ Reemplazantes guardados cargados:', saved.length)
          }
        }
      } catch (savedError) {
        console.warn('⚠️ Error al cargar reemplazantes guardados:', savedError)
      }
    }
    
    // Eliminar duplicados por ID para evitar problemas con checkboxes
    const uniqueReplacements = new Map<string, any>()
    allReplacements.forEach((rep: any) => {
      const repId = String(rep.id || rep.EMP_ID || rep.emp_id || '')
      if (repId && !uniqueReplacements.has(repId)) {
        uniqueReplacements.set(repId, {
          id: repId,
          name: rep.name || rep.NOMBRE || rep.nombre || 'N/A',
          department: rep.department || rep.cargo || rep.CARGO || 'N/A',
          phone: rep.phone || rep.TELEFONO || '',
          isRecommended: rep.isRecommended || false
        })
      }
    })
    
    availableReplacements.value = Array.from(uniqueReplacements.values())
    
    if (availableReplacements.value.length === 0) {
      console.warn('⚠️ No se encontraron reemplazantes disponibles desde ninguna fuente')
    } else {
      console.log('✅ Total de reemplazantes disponibles (sin duplicados):', availableReplacements.value.length)
      console.log('📋 IDs de reemplazantes:', availableReplacements.value.map(r => r.id))
    }
  } catch (error) {
    console.error('❌ Error al cargar reemplazantes:', error)
    availableReplacements.value = []
  }
}

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
    const response = await fetch(`http://190.171.225.68:8006/api/empleado/info?emp_id=${empId}`)

    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }

    const result = await response.json()

    // La API ahora devuelve directamente un array o un objeto con status
    let employeeData: any = null
    
    if (Array.isArray(result) && result.length > 0) {
      // Nuevo formato: array directo
      employeeData = result[0]
    } else if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
      // Formato antiguo: objeto con status y data
      employeeData = result.data[0]
    } else {
      throw new Error('No se encontró información del empleado')
    }

    if (employeeData) {
      const employeeInfo = {
        nombre: employeeData.fullName || `Empleado #${empId}`,
        cargo: employeeData.cargo || 'N/A',
        replacements: employeeData.replacements || [], // Guardar también los reemplazantes
        vacation: employeeData.vacation || {}, // Guardar información de vacaciones (incluye years)
        fechaIngreso: employeeData.fechaIngreso || employeeData.FechaIngreso || employeeData.fecha_ingreso || null // Guardar fecha de ingreso
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
    const response = await fetch(`http://190.171.225.68:8006/api/vacacion-data-manager?manager=${props.managerId}`)

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

// Escuchar eventos de cambio de estado desde el calendario
const handleVacationStatusChanged = () => {
  console.log('🔄 Evento de cambio de estado recibido, recargando solicitudes...')
  fetchManagerRequests()
}

onMounted(() => {
  window.addEventListener('vacation-status-changed', handleVacationStatusChanged)
})

onUnmounted(() => {
  window.removeEventListener('vacation-status-changed', handleVacationStatusChanged)
})

// Función para agrupar fechas que están muy cerca (1-2 días)
const agruparFechasCercanas = (fechas: string[]): string[][] => {
  if (fechas.length === 0) return []
  
  const ordenadas = [...fechas].sort()
  const grupos: string[][] = []
  let grupoActual: string[] = [ordenadas[0]]
  
  for (let i = 1; i < ordenadas.length; i++) {
    const fechaActual = new Date(ordenadas[i] + 'T00:00:00')
    const fechaAnterior = new Date(ordenadas[i - 1] + 'T00:00:00')
    
    // Calcular diferencia en días
    const diferenciaMs = fechaActual.getTime() - fechaAnterior.getTime()
    const diferenciaDias = diferenciaMs / (1000 * 60 * 60 * 24)
    
    // Agrupar si están a 1-2 días de distancia
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
  
  return grupos
}

// Procesar solicitudes programadas: separar día por día, pero agrupar las que están muy cerca
const processedProgrammedRequests = computed(() => {
  const programadas = requests.value.filter(req => 
    req.tipo === 'PROGRAMADA' &&
    (req.estado === 'PROCESO' || 
     req.estado === 'PENDIENTE' || 
     req.estado === 'PREAPROBADO' || 
     req.estado === 'PRE-APROBADO')
  )
  
  const resultado: any[] = []
  
  // Agrupar por empleado y fecha de solicitud (todas las solicitudes del mismo empleado con la misma fecha_solicitud van juntas)
  const porEmpleado = new Map<string, any[]>()
  
  for (const req of programadas) {
    // Solo agrupar por emp_id y fecha_solicitud para que todas las fechas de la misma solicitud vayan juntas
    const key = `${req.emp_id}_${req.fecha_solicitud}`
    if (!porEmpleado.has(key)) {
      porEmpleado.set(key, [])
    }
    porEmpleado.get(key)!.push(req)
  }
  
  console.log('📊 Solicitudes programadas encontradas:', programadas.length)
  console.log('📊 Grupos por empleado:', porEmpleado.size)
  
  // Para cada empleado, procesar sus fechas
  for (const [, solicitudes] of porEmpleado.entries()) {
    const primera = solicitudes[0]
    
    // Obtener todas las fechas de todas las solicitudes del mismo empleado
    const todasFechas = solicitudes.flatMap(s => s.fechas.map((f: any) => f.fecha))
    const fechasUnicas = [...new Set(todasFechas)].sort()
    
    console.log('🔍 Procesando solicitudes agrupadas:', {
      emp_id: primera.emp_id,
      fecha_solicitud: primera.fecha_solicitud,
      total_solicitudes: solicitudes.length,
      todas_fechas: todasFechas,
      fechas_unicas: fechasUnicas,
      ids_solicitudes: solicitudes.map(s => s.id_solicitud)
    })
    
    // Verificar si hay fechas que están muy separadas (más de 2 días)
    // Si hay una brecha grande, podría ser que se estén mezclando solicitudes diferentes
    const fechasConBrechas: string[][] = []
    let grupoActual: string[] = [fechasUnicas[0]]
    
    for (let i = 1; i < fechasUnicas.length; i++) {
      const fechaActual = new Date(fechasUnicas[i] + 'T00:00:00')
      const fechaAnterior = new Date(fechasUnicas[i - 1] + 'T00:00:00')
      const diferenciaDias = (fechaActual.getTime() - fechaAnterior.getTime()) / (1000 * 60 * 60 * 24)
      
      if (diferenciaDias > 2) {
        // Hay una brecha grande, separar en grupos
        fechasConBrechas.push([...grupoActual])
        grupoActual = [fechasUnicas[i]]
      } else {
        grupoActual.push(fechasUnicas[i])
      }
    }
    fechasConBrechas.push(grupoActual)
    
    console.log('📅 Fechas agrupadas por brechas:', fechasConBrechas)
    
    // Agrupar fechas que están muy cerca (1-2 días) dentro de cada grupo sin brechas
    const gruposFechas: string[][] = []
    for (const grupoSinBrecha of fechasConBrechas) {
      const subGrupos = agruparFechasCercanas(grupoSinBrecha)
      gruposFechas.push(...subGrupos)
    }
    
    console.log('📅 Grupos de fechas generados:', gruposFechas)
    
    // Crear una solicitud por cada grupo de fechas cercanas
    for (let i = 0; i < gruposFechas.length; i++) {
      const grupoFechas = gruposFechas[i]
      
      // Obtener las fechas completas (con turno) para este grupo
      const fechasCompletas = solicitudes
        .flatMap(s => s.fechas)
        .filter(f => grupoFechas.includes(f.fecha))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
      
      // Asegurar que grupoFechas esté ordenado
      const grupoFechasOrdenado = [...grupoFechas].sort()
      
      console.log(`📋 Grupo ${i}:`, {
        grupo_fechas: grupoFechasOrdenado,
        fechas_completas: fechasCompletas.map(f => f.fecha),
        primera_fecha: grupoFechasOrdenado[0],
        ultima_fecha: grupoFechasOrdenado[grupoFechasOrdenado.length - 1],
        total_fechas: grupoFechasOrdenado.length
      })
      
      // Validar que grupoFechasOrdenado y fechasCompletas tengan las mismas fechas
      const fechasEnGrupo = new Set(grupoFechasOrdenado)
      const fechasEnCompletas = new Set(fechasCompletas.map(f => f.fecha))
      const fechasFaltantes = grupoFechasOrdenado.filter(f => !fechasEnCompletas.has(f))
      const fechasExtras = Array.from(fechasEnCompletas).filter(f => !fechasEnGrupo.has(f))
      
      if (fechasFaltantes.length > 0 || fechasExtras.length > 0) {
        console.warn(`⚠️ Inconsistencia en grupo ${i}:`, {
          fechas_faltantes: fechasFaltantes,
          fechas_extras: fechasExtras
        })
      }
      
      resultado.push({
        ...primera,
        id_solicitud: `${primera.id_solicitud}_grupo_${i}`,
        tipo: primera.tipo || 'PROGRAMADA', // Asegurar que el tipo se preserve
        fechas: fechasCompletas,
        total_dias: calcularDiasDeFechas(fechasCompletas),
        es_grupo: grupoFechasOrdenado.length > 1,
        fechas_agrupadas: grupoFechasOrdenado // Agregar fechas_agrupadas ordenadas para compatibilidad
      })
    }
  }
  
  return resultado
})

// Obtener empleados únicos para el filtro
const uniqueEmployees = computed(() => {
  const employeesMap = new Map<string, { emp_id: string; nombre: string; cargo: string }>()
  
  requests.value.forEach(req => {
    if (req.empleado && !employeesMap.has(req.emp_id)) {
      employeesMap.set(req.emp_id, {
        emp_id: req.emp_id,
        nombre: req.empleado.nombre,
        cargo: req.empleado.cargo
      })
    }
  })
  
  return Array.from(employeesMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
})

const pendingRequests = computed(() => {
  // Separar vacaciones programadas y no programadas
  const noProgramadas = requests.value.filter(req => 
    req.tipo !== 'PROGRAMADA' &&
    (req.estado === 'PROCESO' || 
     req.estado === 'PENDIENTE' || 
     req.estado === 'PREAPROBADO' || 
     req.estado === 'PRE-APROBADO')
  )
  
  // Para programadas, usar el procesamiento que agrupa fechas cercanas
  const programadas = processedProgrammedRequests.value
  
  // Combinar ambas listas
  let allRequests = [...noProgramadas, ...programadas]
  
  // Aplicar filtro de empleado
  if (selectedEmployeeFilter.value) {
    allRequests = allRequests.filter(req => 
      String(req.emp_id) === String(selectedEmployeeFilter.value)
    )
  }
  
  return allRequests
})

const pendingCount = computed(() => {
  return pendingRequests.value.length
})

const approvedCount = computed(() => {
  return requests.value.filter(req => 
    req.estado === 'APROBADO'
  ).length
})

const rejectedCount = computed(() => {
  return requests.value.filter(req => 
    req.estado === 'RECHAZADO'
  ).length
})

// Función para preaprobar solicitud
const handlePreapprove = (requestId: string) => {
  // Buscar en pendingRequests primero (puede tener grupos)
  const request = pendingRequests.value.find(r => String(r.id_solicitud) === String(requestId))
  if (!request) return

  selectedRequestId.value = requestId
  selectedRequest.value = request
  approveComment.value = ''
  showApproveModal.value = true
  isPreapproving.value = true
}

// Confirmar preaprobación
const confirmPreapprove = async () => {
  if (!selectedRequestId.value) return

  try {
    await updateRequestStatus(
      selectedRequestId.value,
      'PREAPROBADO',
      approveComment.value.trim() || 'Solicitud revisada y preaprobada por el jefe'
    )

    // Cerrar modal
    showApproveModal.value = false
    selectedRequestId.value = null
    selectedRequest.value = null
    approveComment.value = ''
    isPreapproving.value = false
  } catch (error) {
    console.error('Error en confirmPreapprove:', error)
  }
}

// Función para aprobar solicitud (abre modal)
const handleApprove = async (requestId: string) => {
  // Buscar en pendingRequests primero (puede tener grupos)
  const request = pendingRequests.value.find(r => String(r.id_solicitud) === String(requestId))
  if (!request) return

  selectedRequestId.value = requestId
  selectedRequest.value = request
  approveComment.value = ''
  
  // Si es una solicitud programada, mostrar modal de reemplazantes
  if (request.tipo === 'PROGRAMADA') {
    showReplacementModal.value = true
    selectedReplacements.value = [] // ✅ Limpiar selección antes de abrir modal
    hasNoReplacement.value = false // ✅ Limpiar opción "no tiene reemplazo"
    availableReplacements.value = [] // ✅ Limpiar lista de reemplazantes antes de cargar
    // Cargar los reemplazantes disponibles desde la API
    await loadAvailableReplacements(request.emp_id)
  } else {
    showApproveModal.value = true
  }
}

// Manejar cambio en "No tiene reemplazo"
const handleNoReplacementChange = () => {
  if (hasNoReplacement.value) {
    // Si se marca "no tiene reemplazo", limpiar selección de reemplazantes
    selectedReplacements.value = []
  }
}

// Manejar cancelación del modal de reemplazantes
const handleCancelReplacementModal = () => {
  showReplacementModal.value = false
  selectedReplacements.value = []
  hasNoReplacement.value = false
}

// Confirmar aprobación con reemplazantes
const confirmApproveWithReplacements = async () => {
  if (!selectedRequestId.value) return

  try {
    // Si "no tiene reemplazo" está marcado, pasar array vacío
    const replacementsToSend = hasNoReplacement.value ? [] : selectedReplacements.value
    
    await updateRequestStatus(
      selectedRequestId.value,
      'APROBADO',
      approveComment.value.trim() || '',
      replacementsToSend
    )

    // Cerrar modal y limpiar
    showReplacementModal.value = false
    selectedRequestId.value = null
    selectedRequest.value = null
    selectedReplacements.value = []
    hasNoReplacement.value = false
  } catch (error) {
    console.error('Error en confirmApproveWithReplacements:', error)
  }
}

// Confirmar aprobación
const confirmApprove = async () => {
  if (!selectedRequestId.value) return

  // Si estamos en modo preaprobación, usar confirmPreapprove
  if (isPreapproving.value) {
    await confirmPreapprove()
    return
  }

  try {
    await updateRequestStatus(
      selectedRequestId.value,
      'APROBADO',
      approveComment.value.trim() || ''
    )

    // Cerrar modal
    showApproveModal.value = false
    selectedRequestId.value = null
    selectedRequest.value = null
    approveComment.value = ''
    isPreapproving.value = false
  } catch (error) {
    console.error('Error en confirmApprove:', error)
  }
}

// Cancelar aprobación
const cancelApprove = () => {
  showApproveModal.value = false
  selectedRequestId.value = null
  selectedRequest.value = null
  approveComment.value = ''
  isPreapproving.value = false
}

// Función para rechazar solicitud (abre modal)
const handleReject = (requestId: string) => {
  // Buscar en pendingRequests primero (puede tener grupos)
  const request = pendingRequests.value.find(r => String(r.id_solicitud) === String(requestId))
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

  // Confirmación adicional de seguridad
  const request = selectedRequest.value
  if (request) {
    const employeeName = request.empleado?.nombre || `Empleado #${request.emp_id}`
    const fechasTexto = request.fechas?.map((f: any) => new Date(f.fecha).toLocaleDateString('es-ES')).join(', ') || 'N/A'
    
    const confirmar = confirm(
      `¿Estás SEGURO de que deseas RECHAZAR esta solicitud?\n\n` +
      `Empleado: ${employeeName}\n` +
      `Fechas: ${fechasTexto}\n` +
      `Motivo: ${rejectComment.value}\n\n` +
      `Esta acción no se puede deshacer.`
    )
    
    if (!confirmar) {
      return
    }
  }

  try {
    await updateRequestStatus(selectedRequestId.value, 'RECHAZADO', rejectComment.value)

    // Cerrar modal
    showRejectModal.value = false
    selectedRequestId.value = null
    selectedRequest.value = null
    rejectComment.value = ''
  } catch (error) {
    console.error('Error en confirmReject:', error)
  }
}

// Cancelar rechazo
const cancelReject = () => {
  showRejectModal.value = false
  selectedRequestId.value = null
  selectedRequest.value = null
  rejectComment.value = ''
}

// Función principal para actualizar el estado en el backend
const updateRequestStatus = async (requestId: string, estado: 'APROBADO' | 'RECHAZADO' | 'PREAPROBADO', comentario: string, reemplazantes?: string[]) => {
  console.log('🚀🚀🚀 INICIANDO updateRequestStatus 🚀🚀🚀', {
    requestId,
    estado,
    comentario,
    reemplazantes,
    isProcessing: isProcessing.value
  })
  
  if (isProcessing.value) {
    showNotification('info', 'Operación en proceso', 'Ya hay una operación en proceso. Por favor espera.')
    return
  }

  isProcessing.value = true

  try {
    console.log(`📤 Actualizando solicitud ${requestId} a ${estado}`)
    console.log(`📍 Reemplazantes:`, reemplazantes)

    // Verificar si es un grupo de fechas cercanas (id contiene "_grupo_")
    const esGrupo = String(requestId).includes('_grupo_')
    
    let solicitudesAActualizar: any[] = []
    
    if (esGrupo) {
      // Es un grupo, encontrar todas las solicitudes originales que corresponden a estas fechas
      const request = pendingRequests.value.find(r => String(r.id_solicitud) === String(requestId))
      if (!request) {
        throw new Error('Solicitud no encontrada')
      }
      
      // Obtener las fechas del grupo
      const fechasGrupo = request.fechas.map((f: any) => f.fecha)
      
      // Buscar todas las solicitudes originales que tienen estas fechas
      solicitudesAActualizar = requests.value.filter(req => 
        req.tipo === 'PROGRAMADA' &&
        req.emp_id === request.emp_id &&
        req.fecha_solicitud === request.fecha_solicitud &&
        req.fechas.some((f: any) => fechasGrupo.includes(f.fecha))
      )
      
      console.log(`📋 Grupo detectado. Actualizando ${solicitudesAActualizar.length} solicitudes originales`)
    } else {
      // No es grupo, actualizar solo esta solicitud
      const request = requests.value.find(r => String(r.id_solicitud) === String(requestId))
      if (!request) {
        throw new Error('Solicitud no encontrada')
      }
      solicitudesAActualizar = [request]
    }

    // Obtener requestData ANTES de actualizar la BD para preparar la notificación
    const requestData = esGrupo 
      ? pendingRequests.value.find(r => String(r.id_solicitud) === String(requestId))
      : requests.value.find(req => String(req.id_solicitud) === String(requestId))
    
    console.log('🔍 Buscando requestData para notificación (ANTES de actualizar BD):', {
      es_grupo: esGrupo,
      requestId,
      encontrado: !!requestData,
      requestData_tipo: requestData?.tipo,
      requestData_estado: requestData?.estado,
      requestData_emp_id: requestData?.emp_id
    })

    // 🔔 PRIMERO: ENVIAR NOTIFICACIONES DE WHATSAPP (ANTES de actualizar la BD)
    // Solo enviar notificaciones si:
    // - Es APROBADO y todas las fechas están aprobadas (no quedan pendientes)
    // - Es RECHAZADO (siempre notificar)
    // - Es PREAPROBADO (notificar al empleado que su solicitud fue revisada)

    console.log('🔔🔔🔔 VERIFICANDO SI ENVIAR NOTIFICACIÓN (ANTES DE ACTUALIZAR BD) 🔔🔔🔔', {
      tiene_requestData: !!requestData,
      estado,
      es_grupo: esGrupo,
      requestId,
      requestData_tipo: requestData?.tipo,
      requestData_estado: requestData?.estado,
      requestData_emp_id: requestData?.emp_id,
      requestData_empleado: requestData?.empleado?.nombre
    })
    
    // Log crítico para PROGRAMADA
    if (requestData?.tipo === 'PROGRAMADA' && estado === 'APROBADO') {
      console.log('🚨🚨🚨 VACACIÓN PROGRAMADA APROBADA - ENVIANDO NOTIFICACIÓN PRIMERO 🚨🚨🚨', {
        requestId,
        emp_id: requestData.emp_id,
        emp_nombre: requestData.empleado?.nombre,
        estado_original: requestData.estado,
        tiene_reemplazantes_param: reemplazantes && reemplazantes.length > 0
      })
    }

    // Variable para almacenar la promesa de notificación
    let notificacionPromise: Promise<void> | null = null

    if (requestData && (estado === 'APROBADO' || estado === 'RECHAZADO' || estado === 'PREAPROBADO')) {
      // Si es APROBADO, enviar notificación
      if (estado === 'APROBADO') {
        notificacionPromise = (async () => {
          try {
            // Verificar si esta solicitud estaba preaprobada antes de aprobar
            const estabaPreaprobada = requestData.estado === 'PREAPROBADO' || requestData.estado === 'PRE-APROBADO'
            
            console.log('🔍 Verificación de preaprobación:', {
              estabaPreaprobada,
              estado_original: requestData.estado,
              tipo: requestData.tipo
            })
            
            if (estabaPreaprobada) {
              // Si estaba preaprobada, verificar si todas las fechas preaprobadas están ahora aprobadas
              console.log('📋 Solicitud estaba preaprobada. Verificando si todas las fechas están aprobadas para enviar resumen.')
              
              const checkResponse = await fetch(`http://190.171.225.68:8006/api/vacacion-data-manager?manager=${props.managerId}`)
              if (checkResponse.ok) {
                const checkData = await checkResponse.json()
                if (checkData.success && Array.isArray(checkData.data)) {
                  // Buscar todas las solicitudes del mismo empleado
                  const solicitudesEmpleado = checkData.data.filter((req: any) => 
                    req.emp_id === requestData.emp_id && 
                    req.tipo === requestData.tipo &&
                    req.fecha_solicitud === requestData.fecha_solicitud
                  )

                  // Si es un grupo, extraer el ID base para comparar correctamente
                  const esGrupo = String(requestId).includes('_grupo_')
                  let idBaseParaComparar = requestId
                  
                  if (esGrupo) {
                    // Extraer el ID base del grupo (ej: "719_grupo_0" -> "719")
                    idBaseParaComparar = String(requestId).split('_grupo_')[0]
                    console.log('🔍 Es un grupo. ID base extraído:', idBaseParaComparar, '| ID completo:', requestId)
                    
                    // Si es grupo, obtener las fechas del grupo para verificar que todas estén aprobadas
                    const request = pendingRequests.value.find(r => String(r.id_solicitud) === String(requestId))
                    if (request && (request as any).fechas_agrupadas) {
                      const fechasGrupo = (request as any).fechas_agrupadas
                      console.log('🔍 Fechas del grupo que se están aprobando:', fechasGrupo)
                      
                      // Obtener todas las solicitudes preaprobadas del empleado con el mismo tipo y fecha_solicitud
                      const solicitudesPreaprobadas = solicitudesEmpleado.filter((req: any) => 
                        (req.estado === 'PREAPROBADO' || req.estado === 'PRE-APROBADO') &&
                        req.tipo === requestData.tipo
                      )
                      
                      // Obtener todas las fechas únicas de las solicitudes preaprobadas
                      const todasFechasPreaprobadas = new Set<string>()
                      solicitudesPreaprobadas.forEach((req: any) => {
                        if (req.fechas && Array.isArray(req.fechas)) {
                          req.fechas.forEach((f: any) => {
                            if (typeof f === 'string') {
                              todasFechasPreaprobadas.add(f)
                            } else if (f.fecha) {
                              todasFechasPreaprobadas.add(f.fecha)
                            }
                          })
                        }
                      })
                      
                      console.log('🔍 Todas las fechas preaprobadas del empleado:', Array.from(todasFechasPreaprobadas))
                      console.log('🔍 Fechas del grupo que se están aprobando:', fechasGrupo)
                      
                      // Verificar si el grupo que se está aprobando contiene TODAS las fechas preaprobadas
                      // Esto significa que cuando se apruebe este grupo, todas las fechas preaprobadas quedarán aprobadas
                      const todasFechasPreaprobadasEnGrupo = Array.from(todasFechasPreaprobadas).every((fecha: string) => 
                        fechasGrupo.includes(fecha)
                      )
                      
                      // También verificar que todas las fechas del grupo estén preaprobadas (para evitar aprobar fechas no preaprobadas)
                      const todasFechasGrupoEnPreaprobadas = fechasGrupo.every((fecha: string) => 
                        todasFechasPreaprobadas.has(fecha)
                      )
                      
                      console.log('🔍 Análisis del grupo:', {
                        todasFechasPreaprobadasEnGrupo,
                        todasFechasGrupoEnPreaprobadas,
                        fechasGrupo_count: fechasGrupo.length,
                        todasFechasPreaprobadas_count: todasFechasPreaprobadas.size
                      })
                      
                      // SIMPLIFICADO: Siempre enviar notificación cuando se aprueba un grupo
                      // El grupo que se está aprobando debe enviar su notificación, sin importar si hay otras fechas preaprobadas
                      console.log('✅✅✅ APROBANDO GRUPO - ENVIANDO NOTIFICACIÓN INMEDIATAMENTE ✅✅✅', {
                        fechasGrupo,
                        todasFechasPreaprobadas: Array.from(todasFechasPreaprobadas),
                        requestId,
                        emp_id: requestData.emp_id
                      })
                      
                      try {
                        // Usar las fechas del grupo con sus turnos reales para la notificación
                        // Obtener las fechas con turno desde las solicitudes preaprobadas que coinciden con el grupo
                        let todasFechas: string[] = []
                      
                      // Intentar obtener las fechas con turno desde las solicitudes preaprobadas
                      solicitudesPreaprobadas.forEach((req: any) => {
                        if (req.fechas && Array.isArray(req.fechas)) {
                          req.fechas.forEach((f: any) => {
                            const fechaStr = typeof f === 'string' ? f : (f.fecha || f)
                            if (fechasGrupo.includes(fechaStr)) {
                              if (typeof f === 'string') {
                                todasFechas.push(`${f} (COMPLETO)`)
                              } else {
                                const fecha = f.fecha || f
                                const turno = f.turno || f.tipo_dia || 'COMPLETO'
                                todasFechas.push(`${fecha} (${turno})`)
                              }
                            }
                          })
                        }
                      })
                      
                      // Si no se encontraron fechas con turno, usar las fechas del grupo como COMPLETO
                      if (todasFechas.length === 0) {
                        todasFechas = fechasGrupo.map((fecha: string) => `${fecha} (COMPLETO)`)
                      }
                      
                      // Eliminar duplicados
                      todasFechas = [...new Set(todasFechas)]
                      
                      console.log('📅 Fechas preparadas para notificación:', todasFechas)
                      
                      // Obtener reemplazantes
                      let reemplazantesCompletos: any[] = []
                      // PRIMERO: Intentar usar los reemplazantes pasados como parámetro
                      if (reemplazantes && reemplazantes.length > 0) {
                        console.log('📋 [GRUPO] Usando reemplazantes del parámetro:', reemplazantes)
                        try {
                          const reemplazantesInfo = await Promise.all(
                            reemplazantes.map(async (repId: string) => {
                                // Buscar en availableReplacements primero
                                const repEnCache = availableReplacements.value.find((r: any) => String(r.id) === String(repId))
                                if (repEnCache && repEnCache.phone) {
                                  return {
                                    emp_id: repEnCache.id,
                                    nombre: repEnCache.name,
                                    telefono: repEnCache.phone
                                  }
                                }
                                // Si no está en cache, obtener desde la API
                                try {
                                  const empResponse = await fetch(`http://190.171.225.68:8006/api/empleado/info?emp_id=${repId}`)
                                  if (empResponse.ok) {
                                    const empData = await empResponse.json()
                                    let empleadoInfo: any = null
                                    if (Array.isArray(empData) && empData.length > 0) {
                                      empleadoInfo = empData[0]
                                    } else if (empData.status === 'success' && Array.isArray(empData.data) && empData.data.length > 0) {
                                      empleadoInfo = empData.data[0]
                                    }
                                    if (empleadoInfo) {
                                      return {
                                        emp_id: repId,
                                        nombre: empleadoInfo.fullName || empleadoInfo.nombre || `Empleado ${repId}`,
                                        telefono: empleadoInfo.phone || empleadoInfo.TELEFONO || empleadoInfo.telefono || '77711124'
                                      }
                                    }
                                  }
                                } catch (err) {
                                  console.warn(`⚠️ Error al obtener info del reemplazante ${repId}:`, err)
                                }
                                // Fallback
                                if (repEnCache) {
                                  return {
                                    emp_id: repEnCache.id,
                                    nombre: repEnCache.name,
                                    telefono: repEnCache.phone || '77711124'
                                  }
                                }
                                return {
                                  emp_id: repId,
                                  nombre: `Empleado ${repId}`,
                                  telefono: '77711124'
                                }
                              })
                            )
                          reemplazantesCompletos = reemplazantesInfo.filter(rep => rep !== null && rep !== undefined)
                        } catch (error) {
                          console.error('❌ Error al obtener datos de reemplazantes:', error)
                        }
                      }
                      // SEGUNDO: Si no hay reemplazantes del parámetro, intentar desde requestData
                      if (reemplazantesCompletos.length === 0 && requestData.reemplazante && requestData.reemplazante.length > 0) {
                        console.log('📋 [GRUPO] Usando reemplazantes de requestData')
                        reemplazantesCompletos = requestData.reemplazante.map((rep: any) => ({
                          emp_id: rep.emp_id,
                          nombre: rep.nombre,
                          telefono: rep.telefono || '77711124'
                        }))
                      }
                      // TERCERO: Si aún no hay reemplazantes, intentar desde la API
                      if (reemplazantesCompletos.length === 0) {
                        try {
                          const reemplazanteResponse = await fetch(`http://190.171.225.68:8006/api/reemplazante-vacation?idsolicitud=${idBaseParaComparar}&emp_id=${requestData.emp_id}`)
                          if (reemplazanteResponse.ok) {
                            const reemplazanteData = await reemplazanteResponse.json()
                            if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                              console.log('📋 [GRUPO] Usando reemplazantes de la API')
                              reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                                emp_id: rep.EMP_ID,
                                nombre: rep.NOMBRE,
                                telefono: rep.TELEFONO || '77711124'
                              }))
                            }
                          }
                        } catch (apiError) {
                          console.warn('⚠️ Error al obtener reemplazantes desde API:', apiError)
                        }
                      }
                      console.log('✅ [GRUPO] Reemplazantes finales para notificación:', reemplazantesCompletos.length, reemplazantesCompletos)
                      
                      // Preparar payload para notificación
                      const notificationPayload = {
                        id_solicitud: String(idBaseParaComparar),
                        emp_id: String(requestData.emp_id),
                        emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
                        estado: 'APROBADO',
                        comentario: comentario || 'Todas tus vacaciones preaprobadas han sido aprobadas',
                        tipo: requestData.tipo || 'PROGRAMADA',
                        dias_solicitados: calcularDiasDeFechas(todasFechas),
                        fechas: todasFechas,
                        reemplazantes: reemplazantesCompletos.length > 0 ? reemplazantesCompletos.map((rep: any) => ({
                          emp_id: String(rep.emp_id),
                          nombre: rep.nombre || `Empleado ${rep.emp_id}`,
                          telefono: rep.telefono || '77711124'
                        })) : []
                      }
                      
                      // Validar payload
                      if (!notificationPayload.id_solicitud || !notificationPayload.emp_id) {
                        console.error('❌ Payload de notificación inválido (grupo):', notificationPayload)
                        throw new Error('Payload de notificación inválido: faltan campos requeridos')
                      }
                      
                      // Usar variable de entorno o localhost para desarrollo
                      const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
                      console.log('📤 [GRUPO] Enviando notificación de grupo aprobado:', {
                        url: `${BOT_URL}/api/vacation-notification`,
                        payload: JSON.stringify(notificationPayload, null, 2)
                      })
                      
                      try {
                        const notifResponse = await fetch(`${BOT_URL}/api/vacation-notification`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(notificationPayload)
                        })
                        
                        if (notifResponse.ok) {
                          const result = await notifResponse.json()
                          console.log('✅✅✅ NOTIFICACIÓN DE GRUPO ENVIADA EXITOSAMENTE ✅✅✅', result)
                        } else {
                          const errorText = await notifResponse.text()
                          console.error('❌ Error al enviar notificación de grupo:', {
                            status: notifResponse.status,
                            statusText: notifResponse.statusText,
                            error: errorText
                          })
                          throw new Error(`Error ${notifResponse.status}: ${errorText}`)
                        }
                      } catch (err: any) {
                        console.error('❌❌❌ ERROR AL ENVIAR NOTIFICACIÓN DE GRUPO ❌❌❌', {
                          error: err.message,
                          stack: err.stack,
                          payload: JSON.stringify(notificationPayload, null, 2)
                        })
                        throw err
                      }
                      
                        // Salir de la función aquí ya que enviamos la notificación
                        return
                      } catch (grupoError: any) {
                        console.error('❌❌❌ ERROR AL PROCESAR NOTIFICACIÓN DE GRUPO ❌❌❌', {
                          error: grupoError.message,
                          stack: grupoError.stack,
                          requestId,
                          emp_id: requestData?.emp_id
                        })
                        // Re-lanzar el error para que se capture arriba y se muestre al usuario
                        throw grupoError
                      }
                    }
                  }

                  // Verificar si hay alguna preaprobada que aún no esté aprobada (para solicitudes individuales)
                  const hayPreaprobadasPendientes = solicitudesEmpleado.some((req: any) => 
                    (req.estado === 'PREAPROBADO' || req.estado === 'PRE-APROBADO') &&
                    String(req.id_solicitud) !== String(idBaseParaComparar)
                  )

                  // Si no hay preaprobadas pendientes, todas están aprobadas - enviar resumen
                  if (!hayPreaprobadasPendientes) {
                    console.log('✅ Todas las fechas preaprobadas están ahora aprobadas. Enviando resumen.')

                    // Usar los datos de reemplazantes
                    let reemplazantesCompletos: any[] = []
                    // PRIMERO: Intentar usar los reemplazantes pasados como parámetro
                    if (reemplazantes && reemplazantes.length > 0) {
                      console.log('📋 [PREAPROBADO] Usando reemplazantes del parámetro:', reemplazantes)
                      try {
                        const reemplazantesInfo = await Promise.all(
                          reemplazantes.map(async (repId: string) => {
                            const repEnCache = availableReplacements.value.find((r: any) => String(r.id) === String(repId))
                            if (repEnCache && repEnCache.phone) {
                              return {
                                emp_id: repEnCache.id,
                                nombre: repEnCache.name,
                                telefono: repEnCache.phone
                              }
                            }
                            try {
                              const empResponse = await fetch(`http://190.171.225.68:8006/api/empleado/info?emp_id=${repId}`)
                              if (empResponse.ok) {
                                const empData = await empResponse.json()
                                let empleadoInfo: any = null
                                if (Array.isArray(empData) && empData.length > 0) {
                                  empleadoInfo = empData[0]
                                } else if (empData.status === 'success' && Array.isArray(empData.data) && empData.data.length > 0) {
                                  empleadoInfo = empData.data[0]
                                }
                                if (empleadoInfo) {
                                  return {
                                    emp_id: repId,
                                    nombre: empleadoInfo.fullName || empleadoInfo.nombre || `Empleado ${repId}`,
                                    telefono: empleadoInfo.phone || empleadoInfo.TELEFONO || empleadoInfo.telefono || '77711124'
                                  }
                                }
                              }
                            } catch (err) {
                              console.warn(`⚠️ Error al obtener info del reemplazante ${repId}:`, err)
                            }
                            if (repEnCache) {
                              return {
                                emp_id: repEnCache.id,
                                nombre: repEnCache.name,
                                telefono: repEnCache.phone || '77711124'
                              }
                            }
                            return {
                              emp_id: repId,
                              nombre: `Empleado ${repId}`,
                              telefono: '77711124'
                            }
                          })
                        )
                        reemplazantesCompletos = reemplazantesInfo.filter(rep => rep !== null && rep !== undefined)
                      } catch (error) {
                        console.error('❌ Error al obtener datos de reemplazantes:', error)
                      }
                    }
                    // SEGUNDO: Si no hay reemplazantes del parámetro, intentar desde requestData
                    if (reemplazantesCompletos.length === 0 && requestData.reemplazante && requestData.reemplazante.length > 0) {
                      console.log('📋 [PREAPROBADO] Usando reemplazantes de requestData')
                      reemplazantesCompletos = requestData.reemplazante.map((rep: any) => ({
                        emp_id: rep.emp_id,
                        nombre: rep.nombre,
                        telefono: rep.telefono || '77711124'
                      }))
                    }
                    // TERCERO: Si aún no hay reemplazantes, intentar desde la API
                    if (reemplazantesCompletos.length === 0) {
                      try {
                        const reemplazanteResponse = await fetch(`http://190.171.225.68:8006/api/reemplazante-vacation?idsolicitud=${requestId}&emp_id=${requestData.emp_id}`)
                        if (reemplazanteResponse.ok) {
                          const reemplazanteData = await reemplazanteResponse.json()
                          if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                            console.log('📋 [PREAPROBADO] Usando reemplazantes de la API')
                            reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                              emp_id: rep.EMP_ID,
                              nombre: rep.NOMBRE,
                              telefono: rep.TELEFONO || '77711124'
                            }))
                          }
                        }
                      } catch (apiError) {
                        console.warn('⚠️ Error al obtener reemplazantes desde API:', apiError)
                      }
                    }
                    console.log('✅ [PREAPROBADO] Reemplazantes finales para notificación:', reemplazantesCompletos.length, reemplazantesCompletos)

                    // Obtener todas las fechas aprobadas (resumen completo) con sus turnos reales
                    const todasFechas = solicitudesEmpleado
                      .filter((req: any) => req.estado === 'APROBADO')
                      .flatMap((req: any) => {
                        // Si tiene fechas con turno, usarlas; si no, usar fechas_agrupadas como COMPLETO
                        if (req.fechas && Array.isArray(req.fechas) && req.fechas.length > 0) {
                          return req.fechas.map((f: any) => `${f.fecha} (${f.turno || 'COMPLETO'})`)
                        } else if ((req as any).fechas_agrupadas) {
                          return (req as any).fechas_agrupadas.map((fecha: string) => `${fecha} (COMPLETO)`)
                        }
                        return []
                      })

                    // Extraer el id_solicitud base (sin _grupo_) para la notificación
                    const idSolicitudBase = String(requestId).split('_grupo_')[0]

                    // Preparar payload para notificación de resumen
                    const notificationPayload = {
                      id_solicitud: String(idSolicitudBase),
                      emp_id: String(requestData.emp_id),
                      emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
                      estado: 'APROBADO',
                      comentario: comentario || 'Todas tus vacaciones preaprobadas han sido aprobadas',
                      tipo: requestData.tipo || 'PROGRAMADA',
                      dias_solicitados: calcularDiasDeFechas(todasFechas),
                      fechas: todasFechas,
                      reemplazantes: reemplazantesCompletos.length > 0 ? reemplazantesCompletos.map((rep: any) => ({
                        emp_id: String(rep.emp_id),
                        nombre: rep.nombre || `Empleado ${rep.emp_id}`,
                        telefono: rep.telefono || '77711124'
                      })) : []
                    }
                    
                    // Validar payload
                    if (!notificationPayload.id_solicitud || !notificationPayload.emp_id) {
                      console.error('❌ Payload de notificación inválido (preaprobado):', notificationPayload)
                      throw new Error('Payload de notificación inválido: faltan campos requeridos')
                    }

                    // Usar variable de entorno o localhost para desarrollo
                    const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
                    console.log('📤 [PREAPROBADO] Enviando notificación de resumen:', {
                      url: `${BOT_URL}/api/vacation-notification`,
                      payload: JSON.stringify(notificationPayload, null, 2)
                    })
                    
                    try {
                      const notifResponse = await fetch(`${BOT_URL}/api/vacation-notification`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(notificationPayload)
                      })
                      
                      if (notifResponse.ok) {
                        const result = await notifResponse.json()
                        console.log('✅✅✅ RESUMEN DE APROBACIÓN ENVIADO EXITOSAMENTE ✅✅✅', result)
                      } else {
                        const errorText = await notifResponse.text()
                        console.error('❌ Error al enviar resumen de aprobación:', {
                          status: notifResponse.status,
                          statusText: notifResponse.statusText,
                          error: errorText
                        })
                        throw new Error(`Error ${notifResponse.status}: ${errorText}`)
                      }
                    } catch (err: any) {
                      console.error('❌❌❌ ERROR AL ENVIAR RESUMEN DE APROBACIÓN ❌❌❌', {
                        error: err.message,
                        stack: err.stack,
                        payload: JSON.stringify(notificationPayload, null, 2)
                      })
                      throw err
                    }
                  } else {
                    console.log('⏸️ Aún hay fechas preaprobadas pendientes. No se envía notificación todavía.')
                  }
                }
              }
            } else {
              // Si NO estaba preaprobada, enviar notificación individual inmediatamente
              console.log('✅ Aprobación directa (no preaprobada): Enviando notificación individual inmediata.', {
                requestId,
                emp_id: requestData.emp_id,
                tipo: requestData.tipo,
                es_programada: requestData.tipo === 'PROGRAMADA',
                reemplazantes_param: reemplazantes
              })
              
              // Log crítico para PROGRAMADA
              if (requestData.tipo === 'PROGRAMADA') {
                console.log('🚨🚨🚨 APROBANDO VACACIÓN PROGRAMADA - Iniciando notificación 🚨🚨🚨', {
                  requestId,
                  emp_id: requestData.emp_id,
                  tiene_reemplazantes_param: reemplazantes && reemplazantes.length > 0
                })
              }

              // Usar los reemplazantes que se pasaron como parámetro (si existen)
              let reemplazantesCompletos: any[] = []
              
              // PRIMERO: Intentar usar los reemplazantes pasados como parámetro
              if (reemplazantes && reemplazantes.length > 0) {
                console.log('📋 Usando reemplazantes del parámetro:', reemplazantes)
                // Los reemplazantes vienen como IDs, necesitamos obtener sus datos
                try {
                  // Obtener información de los reemplazantes desde availableReplacements o desde la API
                  const reemplazantesInfo = await Promise.all(
                    reemplazantes.map(async (repId: string) => {
                      // Buscar en availableReplacements primero
                      const repEnCache = availableReplacements.value.find((r: any) => String(r.id) === String(repId))
                      if (repEnCache && repEnCache.phone) {
                        console.log(`✅ Reemplazante ${repId} encontrado en cache con teléfono:`, repEnCache.phone)
                        return {
                          emp_id: repEnCache.id,
                          nombre: repEnCache.name,
                          telefono: repEnCache.phone
                        }
                      }
                      // Si no está en cache o no tiene teléfono, intentar obtener desde la API
                      try {
                        console.log(`🔍 Obteniendo datos del reemplazante ${repId} desde API...`)
                        const empResponse = await fetch(`http://190.171.225.68:8006/api/empleado/info?emp_id=${repId}`)
                        if (empResponse.ok) {
                          const empData = await empResponse.json()
                          let empleadoInfo: any = null
                          if (Array.isArray(empData) && empData.length > 0) {
                            empleadoInfo = empData[0]
                          } else if (empData.status === 'success' && Array.isArray(empData.data) && empData.data.length > 0) {
                            empleadoInfo = empData.data[0]
                          }
                          if (empleadoInfo) {
                            const telefono = empleadoInfo.phone || empleadoInfo.TELEFONO || empleadoInfo.telefono || '77711124'
                            console.log(`✅ Reemplazante ${repId} obtenido desde API - Teléfono:`, telefono)
                            return {
                              emp_id: repId,
                              nombre: empleadoInfo.fullName || empleadoInfo.nombre || `Empleado ${repId}`,
                              telefono: telefono
                            }
                          }
                        }
                      } catch (err) {
                        console.warn(`⚠️ Error al obtener info del reemplazante ${repId}:`, err)
                      }
                      // Fallback: usar datos del cache si están disponibles (aunque no tenga teléfono)
                      if (repEnCache) {
                        return {
                          emp_id: repEnCache.id,
                          nombre: repEnCache.name,
                          telefono: repEnCache.phone || '77711124'
                        }
                      }
                      // Último fallback: usar solo el ID
                      console.warn(`⚠️ Reemplazante ${repId} sin datos completos, usando fallback`)
                      return {
                        emp_id: repId,
                        nombre: `Empleado ${repId}`,
                        telefono: '77711124'
                      }
                    })
                  )
                  reemplazantesCompletos = reemplazantesInfo.filter(rep => rep !== null && rep !== undefined)
                  console.log('✅ Reemplazantes completos obtenidos:', reemplazantesCompletos.length, reemplazantesCompletos)
                } catch (error) {
                  console.error('❌ Error al obtener datos de reemplazantes:', error)
                }
              }
              
              // SEGUNDO: Si no hay reemplazantes del parámetro, intentar desde requestData
              if (reemplazantesCompletos.length === 0 && requestData.reemplazante && requestData.reemplazante.length > 0) {
                console.log('📋 Usando reemplazantes de requestData')
                reemplazantesCompletos = requestData.reemplazante.map((rep: any) => ({
                  emp_id: rep.emp_id,
                  nombre: rep.nombre,
                  telefono: rep.telefono || '77711124'
                }))
              }
              
              // TERCERO: Si aún no hay reemplazantes, intentar desde la API
              if (reemplazantesCompletos.length === 0) {
                try {
                  const reemplazanteResponse = await fetch(`http://190.171.225.68:8006/api/reemplazante-vacation?idsolicitud=${requestId}&emp_id=${requestData.emp_id}`)
                  if (reemplazanteResponse.ok) {
                    const reemplazanteData = await reemplazanteResponse.json()
                    if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                      console.log('📋 Usando reemplazantes de la API')
                      reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                        emp_id: rep.EMP_ID,
                        nombre: rep.NOMBRE,
                        telefono: rep.TELEFONO
                      }))
                    }
                  }
                } catch (apiError) {
                  console.warn('⚠️ Error al obtener reemplazantes desde API:', apiError)
                }
              }
              
              console.log('✅ Reemplazantes finales para notificación:', reemplazantesCompletos)

              // Obtener solo las fechas de esta solicitud específica (aprobación individual)
              // Si es un grupo, obtener todas las fechas del grupo
              let fechasAprobadas: string[] = []
              if (esGrupo && (requestData as any).fechas_agrupadas) {
                // Si es grupo, usar fechas con turno si están disponibles
                if (requestData.fechas && Array.isArray(requestData.fechas) && requestData.fechas.length > 0) {
                  // Usar las fechas con turno real
                  fechasAprobadas = requestData.fechas
                    .filter((f: any) => (requestData as any).fechas_agrupadas.includes(f.fecha))
                    .map((f: any) => `${f.fecha} (${f.turno || 'COMPLETO'})`)
                } else {
                  // Fallback: usar fechas_agrupadas como COMPLETO
                  fechasAprobadas = (requestData as any).fechas_agrupadas.map((fecha: string) => `${fecha} (COMPLETO)`)
                }
              } else {
                // Si no es grupo, usar las fechas normales
                fechasAprobadas = requestData.fechas.map((f: any) => `${f.fecha} (${f.turno || 'COMPLETO'})`)
              }

              // Extraer el id_solicitud base (sin _grupo_) para la notificación
              const idSolicitudBase = String(requestId).split('_grupo_')[0]

              // Preparar payload para notificaciones individuales
              const notificationPayload = {
                id_solicitud: idSolicitudBase,
                emp_id: requestData.emp_id,
                emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
                estado: 'APROBADO',
                comentario: comentario || '',
                tipo: requestData.tipo || 'PROGRAMADA',
                dias_solicitados: calcularDiasDeFechas(fechasAprobadas),
                fechas: fechasAprobadas,
                reemplazantes: reemplazantesCompletos.length > 0 ? reemplazantesCompletos.map((rep: any) => ({
                  emp_id: String(rep.emp_id),
                  nombre: rep.nombre || `Empleado ${rep.emp_id}`,
                  telefono: rep.telefono || '77711124'
                })) : []
              }
              
              // Validar que el payload tenga los datos mínimos necesarios
              if (!notificationPayload.id_solicitud || !notificationPayload.emp_id) {
                console.error('❌ Payload de notificación inválido:', notificationPayload)
                throw new Error('Payload de notificación inválido: faltan campos requeridos')
              }

              // Usar variable de entorno o localhost para desarrollo
              const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
              console.log('📤 Enviando notificación de aprobación a:', `${BOT_URL}/api/vacation-notification`)
              console.log('📦 Payload completo:', JSON.stringify(notificationPayload, null, 2))
              console.log('🔍 Tipo de vacación:', notificationPayload.tipo, '| Es PROGRAMADA:', notificationPayload.tipo === 'PROGRAMADA')
              console.log('🔍 Reemplazantes:', reemplazantesCompletos.length, '| Array:', reemplazantesCompletos)
              
              // Enviar notificación de forma asíncrona pero esperar a que se complete
              // Usar Promise.race con timeout para evitar que se quede colgado
              try {
                console.log('🚀🚀🚀 INICIANDO ENVÍO DE NOTIFICACIÓN 🚀🚀🚀', {
                  url: `${BOT_URL}/api/vacation-notification`,
                  payload_size: JSON.stringify(notificationPayload).length,
                  tiene_fechas: notificationPayload.fechas.length,
                  tiene_reemplazantes: notificationPayload.reemplazantes.length
                })
                
                const notifPromise = fetch(`${BOT_URL}/api/vacation-notification`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(notificationPayload)
                })
                
                // Timeout de 60 segundos para dar más tiempo a la notificación (WhatsApp puede tardar, especialmente con PDF)
                const timeoutPromise = new Promise<Response>((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout al enviar notificación (60s)')), 60000)
                )
                
                const notifResponse = await Promise.race([notifPromise, timeoutPromise])
                
                console.log('📡 Respuesta del servidor recibida:', {
                  status: notifResponse.status,
                  statusText: notifResponse.statusText,
                  ok: notifResponse.ok,
                  headers: Object.fromEntries(notifResponse.headers.entries())
                })
                
                if (notifResponse.ok) {
                  const notifResult = await notifResponse.json()
                  console.log('✅✅✅ NOTIFICACIÓN ENVIADA EXITOSAMENTE ✅✅✅', {
                    resultado: notifResult,
                    notificaciones_enviadas: notifResult.notificaciones_enviadas,
                    estado: notifResult.estado
                  })
                  
                  // Log específico para PROGRAMADA
                  if (notificationPayload.tipo === 'PROGRAMADA') {
                    console.log('✅✅✅ NOTIFICACIÓN PROGRAMADA ENVIADA EXITOSAMENTE ✅✅✅', {
                      id_solicitud: notificationPayload.id_solicitud,
                      emp_id: notificationPayload.emp_id,
                      emp_nombre: notificationPayload.emp_nombre,
                      fechas: notificationPayload.fechas.length,
                      reemplazantes: notificationPayload.reemplazantes.length
                    })
                  }
                } else {
                  const errorText = await notifResponse.text()
                  const errorMessage = `Error en respuesta de notificación: ${notifResponse.status} ${notifResponse.statusText} - ${errorText}`
                  console.error('❌ Error en respuesta de notificación:', {
                    status: notifResponse.status,
                    statusText: notifResponse.statusText,
                    error: errorText,
                    payload_enviado: JSON.stringify(notificationPayload, null, 2)
                  })
                  // Lanzar el error para que se capture arriba
                  throw new Error(errorMessage)
                }
              } catch (fetchError: any) {
                const errorMessage = `Error al enviar notificación: ${fetchError.message}`
                console.error('❌❌❌ ERROR AL ENVIAR NOTIFICACIÓN ❌❌❌', {
                  error: fetchError.message,
                  stack: fetchError.stack,
                  url: `${BOT_URL}/api/vacation-notification`,
                  es_programada: notificationPayload.tipo === 'PROGRAMADA',
                  payload: JSON.stringify(notificationPayload, null, 2)
                })
                
                // Log específico para PROGRAMADA
                if (notificationPayload.tipo === 'PROGRAMADA') {
                  console.error('🚨🚨🚨 ERROR AL ENVIAR NOTIFICACIÓN PROGRAMADA 🚨🚨🚨', {
                    error: fetchError.message,
                    id_solicitud: notificationPayload.id_solicitud,
                    emp_id: notificationPayload.emp_id,
                    payload_completo: JSON.stringify(notificationPayload, null, 2)
                  })
                }
                
                // Re-lanzar el error para que se capture y se muestre al usuario
                throw new Error(errorMessage)
              }
            }
          } catch (notifError: any) {
            console.error('❌❌❌ ERROR COMPLETO AL ENVIAR NOTIFICACIÓN DE APROBACIÓN ❌❌❌', {
              error: notifError.message,
              stack: notifError.stack,
              requestId,
              estado,
              tipo: requestData?.tipo,
              es_programada: requestData?.tipo === 'PROGRAMADA',
              emp_id: requestData?.emp_id,
              emp_nombre: requestData?.empleado?.nombre
            })
            
            // Log crítico para PROGRAMADA
            if (requestData?.tipo === 'PROGRAMADA') {
              console.error('🚨🚨🚨 ERROR AL ENVIAR NOTIFICACIÓN PROGRAMADA 🚨🚨🚨', {
                error: notifError.message,
                requestId,
                emp_id: requestData?.emp_id,
                emp_nombre: requestData?.empleado?.nombre
              })
            }
            
            // Mostrar notificación al usuario sobre el error
            showNotification('error', 'Notificación', `La solicitud fue aprobada pero hubo un problema al enviar la notificación: ${notifError.message}. Verifica la consola para más detalles.`)
            
            // Re-lanzar el error para que se capture arriba, pero no bloquear la aprobación
            throw notifError
          } finally {
            // Asegurar que la promesa se resuelva siempre
            console.log('🔚 Finalizando promesa de notificación')
          }
        })()
      }
      // Si es RECHAZADO, enviar notificación
      else if (estado === 'RECHAZADO') {
        notificacionPromise = (async () => {
          try {
            // Preparar payload para notificaciones de rechazo
            const notificationPayload = {
              id_solicitud: requestId,
              emp_id: requestData.emp_id,
              emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
              estado: estado,
              comentario: comentario,
              tipo: requestData.tipo,
              dias_solicitados: calcularDiasTotales(requestData),
              fechas: requestData.fechas.map((f: any) => `${f.fecha} (${f.turno})`)
            }

            // Usar variable de entorno o localhost para desarrollo
            const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
            await fetch(`${BOT_URL}/api/vacation-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(notificationPayload)
            }).catch(err => {
              console.warn('⚠️ No se pudo enviar notificación de WhatsApp:', err)
            })

            console.log('✅ Notificación de rechazo enviada')
          } catch (notifError) {
            console.warn('⚠️ Error al enviar notificación de rechazo:', notifError)
          }
        })()
      }
      // Si es PREAPROBADO, enviar notificación
      else if (estado === 'PREAPROBADO') {
        notificacionPromise = (async () => {
          try {
            // Obtener fechas de la solicitud
            let fechasPreaprobadas: string[] = []
            if (esGrupo && (requestData as any).fechas_agrupadas) {
              // Si es grupo, usar fechas con turno si están disponibles
              if (requestData.fechas && Array.isArray(requestData.fechas) && requestData.fechas.length > 0) {
                fechasPreaprobadas = requestData.fechas
                  .filter((f: any) => (requestData as any).fechas_agrupadas.includes(f.fecha))
                  .map((f: any) => `${f.fecha} (${f.turno || 'COMPLETO'})`)
              } else {
                fechasPreaprobadas = (requestData as any).fechas_agrupadas.map((fecha: string) => `${fecha} (COMPLETO)`)
              }
            } else {
              // Si no es grupo, usar las fechas normales
              fechasPreaprobadas = requestData.fechas.map((f: any) => `${f.fecha} (${f.turno || 'COMPLETO'})`)
            }

            // Extraer el id_solicitud base (sin _grupo_) para la notificación
            const idSolicitudBase = String(requestId).split('_grupo_')[0]

            // Preparar payload para notificaciones de preaprobación
            const notificationPayload = {
              id_solicitud: idSolicitudBase,
              emp_id: requestData.emp_id,
              emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
              estado: 'PREAPROBADO',
              comentario: comentario || 'Solicitud revisada y preaprobada por el jefe',
              tipo: requestData.tipo,
              dias_solicitados: calcularDiasTotales(requestData),
              fechas: fechasPreaprobadas
            }

            console.log('📱 Enviando notificación de preaprobación:', {
              emp_id: notificationPayload.emp_id,
              emp_nombre: notificationPayload.emp_nombre,
              fechas: fechasPreaprobadas.length
            })

            // Usar variable de entorno o localhost para desarrollo
            const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
            const notifResponse = await fetch(`${BOT_URL}/api/vacation-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(notificationPayload)
            })

            if (notifResponse.ok) {
              console.log('✅ Notificación de preaprobación enviada exitosamente')
            } else {
              const errorText = await notifResponse.text()
              console.error('❌ Error en respuesta de notificación de preaprobación:', {
                status: notifResponse.status,
                statusText: notifResponse.statusText,
                error: errorText
              })
            }
          } catch (notifError: any) {
            console.error('❌ Error al enviar notificación de preaprobación:', {
              error: notifError.message,
              stack: notifError.stack,
              requestId,
              emp_id: requestData?.emp_id
            })
            // Continuar aunque falle la notificación
          }
        })()
      }
    }

    // CRÍTICO: Esperar a que se complete el envío de la notificación ANTES de actualizar la BD
    if (notificacionPromise) {
      console.log('⏳⏳⏳ ESPERANDO A QUE SE COMPLETE EL ENVÍO DE NOTIFICACIÓN (ANTES DE BD)... ⏳⏳⏳')
      try {
        await notificacionPromise
        console.log('✅✅✅ PROCESO DE NOTIFICACIÓN COMPLETADO - AHORA ACTUALIZANDO BD ✅✅✅')
        
        // Esperar tiempo adicional para asegurar que el PDF se haya generado y enviado
        // Esto es especialmente importante para la generación del PDF que puede tardar
        // El handler del backend genera el PDF y lo envía, esto puede tomar 10-15 segundos
        if (estado === 'APROBADO') {
          console.log('⏳ Esperando tiempo adicional para generación y envío de PDF (10 segundos)...')
          await new Promise(resolve => setTimeout(resolve, 10000))
          console.log('✅ Tiempo adicional completado - PDF debería estar enviado')
        }
      } catch (notifWaitError: any) {
        console.error('❌❌❌ ERROR AL ESPERAR NOTIFICACIÓN ❌❌❌', {
          error: notifWaitError?.message || notifWaitError,
          stack: notifWaitError?.stack,
          tipo: estado,
          requestId
        })
        // Mostrar notificación al usuario pero no bloquear la aprobación
        showNotification('error', 'Notificación', `La solicitud fue procesada pero hubo un problema al enviar la notificación por WhatsApp. Verifica la consola para más detalles.`)
        // Esperar un poco más para dar tiempo a que se complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('⏳ Esperado 2 segundos adicionales después del error')
        // Continuar con la aprobación aunque falle la notificación
      }
    }

    // SEGUNDO: AHORA SÍ ACTUALIZAR EN LA BASE DE DATOS
    console.log('💾💾💾 ACTUALIZANDO EN BASE DE DATOS 💾💾💾')
    
    // El backend espera 'PRE-APROBADO' (con guión) en lugar de 'PREAPROBADO'
    const estadoBackend = estado === 'PREAPROBADO' ? 'PRE-APROBADO' : estado
    
    // Actualizar todas las solicitudes SIMULTÁNEAMENTE en paralelo
    console.log(`📤 Enviando ${solicitudesAActualizar.length} solicitudes simultáneamente...`)
    
    const promises = solicitudesAActualizar.map((req, index) => {
      const payload: any = {
        id_solicitud: parseInt(String(req.id_solicitud)),
        estado: estadoBackend,
        comentario: comentario || (estado === 'APROBADO' ? '' : '')
      }
      
      // ✅ Usar REEMPLAZOS_EMPIDS en lugar de reemplazantes
      if (reemplazantes && reemplazantes.length > 0) {
        payload.REEMPLAZOS_EMPIDS = reemplazantes
        console.log(`📤 Agregando REEMPLAZOS_EMPIDS para solicitud ${index + 1}:`, reemplazantes)
      }
      
      console.log(`📤 Preparando solicitud ${index + 1}/${solicitudesAActualizar.length} para id_solicitud: ${req.id_solicitud}`)
      console.log(`📦 Payload completo:`, JSON.stringify(payload, null, 2))
      
      return fetch('http://190.171.225.68:8006/api/vacaciones/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
    })
    
    // Esperar a que todas las solicitudes se completen
    const responses = await Promise.all(promises)
    
    // Verificar que todas las respuestas sean exitosas
    const response = responses[0] // Usar la primera para el flujo de notificaciones
    const todasExitosas = responses.every(r => r.ok)
    
    if (!todasExitosas) {
      const errores = responses.filter(r => !r.ok)
      const errorData = await errores[0].json().catch(() => null)
      throw new Error(errorData?.message || `Error al actualizar algunas solicitudes`)
    }

    const result = await response.json()

    if (result.status === 'success' || response.ok) {
      console.log('✅ Solicitud(es) actualizada(s) exitosamente en BD')

      // Actualizar localmente todas las solicitudes que se actualizaron
      const idsActualizados = new Set(solicitudesAActualizar.map(req => String(req.id_solicitud)))
      requests.value = requests.value.map(req => {
        if (idsActualizados.has(String(req.id_solicitud))) {
          return {
            ...req,
            estado: estado
          }
        }
        return req
      })

      // 🚀 GUARDAR EN API EXTERNA
      // Después de actualizar el estado, guardar en la API externa
      if (requestData) {
        try {
          // Solo guardar en API externa si el estado es APROBADO o RECHAZADO (no PREAPROBADO)
          if (estado === 'APROBADO' || estado === 'RECHAZADO') {
            console.log('📤 Guardando vacación en API externa...')
            
            // Obtener años de antigüedad y fecha de ingreso del empleado
            const employeeInfo = await fetchEmployeeInfo(requestData.emp_id)
            const antiguedad = (employeeInfo as any).vacation?.years || employeeCache.value[requestData.emp_id]?.vacation?.years || '1'
            // Obtener fechaIngreso desde employeeInfo o desde el cache
            const fechaIngreso = (employeeInfo as any).fechaIngreso || 
                                employeeCache.value[requestData.emp_id]?.fechaIngreso || 
                                requestData.emp_fecha_ingreso || 
                                null
            
            const vacationPayload: SaveVacationPayload = {
              emp_id: requestData.emp_id,
              emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
              manager_id: String(props.managerId || ''), // ID del manager que está aprobando
              manager_nombre: 'Manager', // TODO: Obtener nombre real del manager
              tipo: requestData.tipo,
              estado: estado as 'APROBADO' | 'RECHAZADO',
              comentario: comentario,
              fechas: requestData.fechas.map((f: any) => ({
                fecha: f.fecha,
                tipo_dia: f.turno || 'COMPLETO'
              })),
              branch: 1, // TODO: Obtener branch real
              dept: 10,    // TODO: Obtener departamento real
              antiguedad: antiguedad, // Años de antigüedad del empleado
              fechaIngreso: fechaIngreso // Fecha de ingreso del empleado
            }

            const apiResult = await saveVacationToExternalAPI(vacationPayload)
            console.log('✅ Vacación guardada exitosamente en API externa:', apiResult)
          } else {
            console.log('⏸️ Estado PREAPROBADO: No se guarda en API externa todavía')
          }
          
        } catch (apiError: any) {
          console.error('❌ Error al guardar en API externa:', apiError)
          // No fallar la operación principal si falla la API externa
          showNotification('info', 'Advertencia', 
            'La solicitud fue procesada pero hubo un problema al guardar en el sistema externo. Contacta al administrador.')
        }
      }

      // Las notificaciones ya se completaron arriba, solo mostrar mensaje de éxito
      console.log('✅ Todas las notificaciones completadas, mostrando mensaje de éxito')

      // Mostrar mensaje de éxito con toast notification
      if (estado === 'APROBADO') {
        showNotification(
          'success',
          'Solicitud Aprobada',
          'La solicitud ha sido aprobada y se envió la notificación al empleado'
        )
      } else if (estado === 'PREAPROBADO') {
        // Verificar si se envió notificación o no
        const checkResponse = await fetch(`http://190.171.225.68:8006/api/vacacion-data-manager?manager=${props.managerId}`)
        let todasPreaprobadas = false
        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          if (checkData.success && Array.isArray(checkData.data)) {
            const solicitudesEmpleado = checkData.data.filter((req: any) => 
              req.emp_id === requestData.emp_id && 
              req.tipo === requestData.tipo &&
              req.fecha_solicitud === requestData.fecha_solicitud
            )
            todasPreaprobadas = !solicitudesEmpleado.some((req: any) => 
              req.estado === 'PENDIENTE' || 
              req.estado === 'PROCESO'
            )
          }
        }
        
        if (todasPreaprobadas) {
          showNotification(
            'success',
            'Solicitud Preaprobada',
            'Todas las fechas han sido preaprobadas y se envió la notificación al empleado'
          )
        } else {
          showNotification(
            'success',
            'Solicitud Preaprobada',
            'La fecha ha sido preaprobada. Se enviará notificación cuando todas las fechas estén preaprobadas.'
          )
        }
      } else {
        showNotification(
          'success',
          'Solicitud Rechazada',
          `La solicitud ha sido rechazada. Motivo: ${comentario}`
        )
      }

      // CRÍTICO: Las notificaciones ya se completaron arriba (await notificacionPromise)
      // Ya esperamos 10 segundos adicionales arriba para el PDF, así que aquí solo esperamos un poco más
      // para asegurar que todo se haya enviado completamente antes de recargar
      if (estado === 'APROBADO') {
        console.log('⏳ Esperando tiempo final antes de recargar (2 segundos más)...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('✅ Tiempo final completado, ahora sí recargando...')
      }
      
      // Ahora podemos recargar las solicitudes de forma segura
      // Hacer la recarga de forma asíncrona para no bloquear la UI
      console.log('🔄 Recargando solicitudes después de que las notificaciones se completaron...')
      
      // Recargar solicitudes para actualizar la lista y el calendario
      // Esto se hace DESPUÉS de que se completen las notificaciones
      // Usar setTimeout para hacer la recarga de forma asíncrona y no bloquear
      setTimeout(async () => {
        try {
          await fetchManagerRequests()
          console.log('✅ Solicitudes recargadas después de completar notificaciones')
        } catch (reloadError) {
          console.warn('⚠️ Error al recargar solicitudes (no crítico):', reloadError)
        }
      }, 500) // Pequeño delay para asegurar que todo se haya procesado
      
      // Emitir evento para actualizar el calendario en tiempo real
      const event = new CustomEvent('vacation-status-changed', {
        detail: { 
          action: estado.toLowerCase(),
          id_solicitud: String(requestId).split('_grupo_')[0],
          emp_id: requestData?.emp_id
        }
      })
      window.dispatchEvent(event)
      console.log('📢 Evento vacation-status-changed emitido para actualizar calendario')
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

// Función helper para calcular días de un array de fechas con turno
const calcularDiasDeFechas = (fechas: any[]): number => {
  if (!fechas || !Array.isArray(fechas) || fechas.length === 0) return 0
  
  return fechas.reduce((total: number, fecha: any) => {
    // Si la fecha es un string (formato "YYYY-MM-DD (TURNO)"), extraer el turno
    if (typeof fecha === 'string') {
      if (fecha.includes(' (')) {
        const partes = fecha.split(' (')
        const turno = partes[1]?.replace(')', '').trim() || 'COMPLETO'
        if (turno === 'MAÑANA' || turno === 'TARDE') {
          return total + 0.5
        }
        return total + 1
      }
      // Si es solo una fecha sin turno, asumir día completo
      return total + 1
    }
    
    // Si es un objeto con turno
    const turno = fecha.turno || fecha.tipo_dia || 'COMPLETO'
    if (turno === 'MAÑANA' || turno === 'TARDE') {
      return total + 0.5
    }
    return total + 1
  }, 0)
}

// Función para calcular el total de días considerando medio día = 0.5
const calcularDiasTotales = (request: any): number => {
  // Si tiene fechas con turno, calcular sumando 0.5 para MAÑANA/TARDE y 1 para COMPLETO
  if (request.fechas && Array.isArray(request.fechas) && request.fechas.length > 0) {
    return calcularDiasDeFechas(request.fechas)
  }
  
  // Si tiene fechas_agrupadas, intentar calcular desde fechas con turno si están disponibles
  if ((request as any).fechas_agrupadas && Array.isArray((request as any).fechas_agrupadas)) {
    // Si tiene fechas con turno, calcular desde ahí
    if (request.fechas && Array.isArray(request.fechas) && request.fechas.length > 0) {
      return calcularDiasDeFechas(request.fechas)
    }
    // Fallback: contar fechas_agrupadas como días completos (no ideal pero mejor que nada)
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

// Función auxiliar para ordenar fechas correctamente
const getSortedFechas = (fechas: any[]) => {
  return [...fechas].sort((a, b) => a.fecha.localeCompare(b.fecha))
}
</script>