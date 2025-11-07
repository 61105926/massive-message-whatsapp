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
                  <span v-if="request.fechas && request.fechas.length > 0">
                    {{ formatDate(request.fechas[0].fecha) }} - {{ formatDate(request.fechas[request.fechas.length - 1].fecha) }}
                  </span>
                  <span v-else-if="(request as any).fechas_agrupadas && (request as any).fechas_agrupadas.length > 0">
                    {{ formatDate((request as any).fechas_agrupadas[0]) }} - {{ formatDate((request as any).fechas_agrupadas[(request as any).fechas_agrupadas.length - 1]) }}
                  </span>
                  <span v-else>N/A</span>
                </p>
              </div>
              <div>
                <p class="text-muted-foreground">Días solicitados</p>
                <p class="font-medium">
                  {{ (request.total_dias || request.fechas?.length || (request as any).fechas_agrupadas?.length || 0) }} 
                  día{{ (request.total_dias || request.fechas?.length || (request as any).fechas_agrupadas?.length || 0) > 1 ? 's' : '' }}
                </p>
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
                  request.estado === 'PENDIENTE' ? 'bg-blue-100 text-blue-800' : '',
                  request.estado === 'PREAPROBADO' || request.estado === 'PRE-APROBADO' ? 'bg-yellow-100 text-yellow-800' : '',
                  request.estado === 'APROBADO' ? 'bg-green-100 text-green-800' : '',
                  request.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ request.estado === 'PREAPROBADO' || request.estado === 'PRE-APROBADO' ? 'REVISADO' : request.estado }}
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
                  <span class="text-xs text-muted-foreground">Revisado</span>
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
              <div v-if="availableReplacements.length === 0" class="text-sm text-red-600 text-center py-2">
                ⚠️ No hay reemplazantes disponibles. No se puede aprobar sin reemplazantes.
              </div>
            </div>
            <p v-if="availableReplacements.length > 0" class="text-xs text-muted-foreground mt-2">
              {{ selectedReplacements.length > 0 ? `${selectedReplacements.length} reemplazante(s) seleccionado(s)` : 'Selección obligatoria' }}
            </p>
            <p v-if="selectedReplacements.length === 0 && availableReplacements.length > 0" class="text-xs text-red-600 mt-1">
              ⚠️ Debes seleccionar al menos un reemplazante para aprobar
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3">
            <button
              @click="confirmApproveWithReplacements"
              :disabled="isProcessing || selectedReplacements.length === 0 || availableReplacements.length === 0"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
const isPreapproving = ref(false)

// Cargar reemplazantes disponibles desde la API
const loadAvailableReplacements = async (empId: string) => {
  try {
    console.log('🔍 Cargando reemplazantes para empId:', empId)
    
    const response = await fetch(`http://190.171.225.68/api/recomendar-reemplazante?empId=${empId}`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.reemplazantes && Array.isArray(data.reemplazantes)) {
        availableReplacements.value = data.reemplazantes.map((rep: any) => ({
          id: rep.REEMPLAZANTE_EMP_ID || rep.emp_id,
          name: rep.REEMPLAZANTE_NOMBRE || rep.nombre,
          department: rep.CARGO || rep.cargo || 'N/A'
        }))
        console.log('✅ Reemplazantes cargados para el jefe:', availableReplacements.value.length)
      } else {
        availableReplacements.value = []
        console.warn('⚠️ No se encontraron reemplazantes en la respuesta')
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
  
  // Agrupar por empleado y fecha de solicitud
  const porEmpleado = new Map<string, any[]>()
  
  for (const req of programadas) {
    const key = `${req.emp_id}_${req.fecha_solicitud}`
    if (!porEmpleado.has(key)) {
      porEmpleado.set(key, [])
    }
    porEmpleado.get(key)!.push(req)
  }
  
  // Para cada empleado, procesar sus fechas
  for (const [key, solicitudes] of porEmpleado.entries()) {
    const primera = solicitudes[0]
    
    // Obtener todas las fechas de todas las solicitudes del mismo empleado
    const todasFechas = solicitudes.flatMap(s => s.fechas.map(f => f.fecha))
    const fechasUnicas = [...new Set(todasFechas)].sort()
    
    // Agrupar fechas que están muy cerca (1-2 días)
    const gruposFechas = agruparFechasCercanas(fechasUnicas)
    
    // Crear una solicitud por cada grupo de fechas cercanas
    for (let i = 0; i < gruposFechas.length; i++) {
      const grupoFechas = gruposFechas[i]
      
      // Obtener las fechas completas (con turno) para este grupo
      const fechasCompletas = solicitudes
        .flatMap(s => s.fechas)
        .filter(f => grupoFechas.includes(f.fecha))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
      
      resultado.push({
        ...primera,
        id_solicitud: `${primera.id_solicitud}_grupo_${i}`,
        fechas: fechasCompletas,
        total_dias: grupoFechas.length,
        es_grupo: grupoFechas.length > 1
      })
    }
  }
  
  return resultado
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
  return [...noProgramadas, ...programadas]
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
    selectedReplacements.value = []
    // Cargar los reemplazantes disponibles desde la API
    await loadAvailableReplacements(request.emp_id)
  } else {
    showApproveModal.value = true
  }
}

// Confirmar aprobación con reemplazantes
const confirmApproveWithReplacements = async () => {
  if (!selectedRequestId.value) return

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
      approveComment.value.trim() || 'Aprobado por el jefe'
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

    // El backend espera 'PRE-APROBADO' (con guión) en lugar de 'PREAPROBADO'
    const estadoBackend = estado === 'PREAPROBADO' ? 'PRE-APROBADO' : estado
    
    // Actualizar cada solicitud
    const actualizaciones = solicitudesAActualizar.map(req => {
      const payload: any = {
        id_solicitud: parseInt(String(req.id_solicitud)),
        estado: estadoBackend,
        comentario: comentario || (estado === 'APROBADO' ? 'Aprobado por el jefe' : '')
      }
      
      if (reemplazantes && reemplazantes.length > 0) {
        payload.reemplazantes = reemplazantes
      }
      
      return fetch('http://190.171.225.68/api/vacaciones/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
    })
    
    const responses = await Promise.all(actualizaciones)
    
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
      console.log('✅ Solicitud(es) actualizada(s) exitosamente')

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
      // Usar la primera solicitud actualizada como referencia
      const requestData = esGrupo 
        ? pendingRequests.value.find(r => String(r.id_solicitud) === String(requestId))
        : requests.value.find(req => String(req.id_solicitud) === String(requestId))
      
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
      // Solo enviar notificaciones si:
      // - Es APROBADO y todas las fechas están aprobadas (no quedan pendientes)
      // - Es RECHAZADO (siempre notificar)
      // - NO enviar si es PREAPROBADO (se enviará cuando todas estén aprobadas)

      if (requestData) {
        // Si es PREAPROBADO, verificar si todas las fechas están preaprobadas
        if (estado === 'PREAPROBADO') {
          try {
            // Verificar si hay otras solicitudes del mismo empleado que estén pendientes
            // Recargar las solicitudes para verificar el estado actual
            const checkResponse = await fetch(`http://190.171.225.68/api/vacacion-data-manager?manager=${props.managerId}`)
            if (checkResponse.ok) {
              const checkData = await checkResponse.json()
              if (checkData.success && Array.isArray(checkData.data)) {
                // Buscar todas las solicitudes del mismo empleado
                const solicitudesEmpleado = checkData.data.filter((req: any) => 
                  req.emp_id === requestData.emp_id && 
                  req.tipo === requestData.tipo &&
                  req.fecha_solicitud === requestData.fecha_solicitud
                )

                // Verificar si hay alguna pendiente (no preaprobada ni aprobada)
                const hayPendientes = solicitudesEmpleado.some((req: any) => 
                  req.estado === 'PENDIENTE' || 
                  req.estado === 'PROCESO'
                )

                // Si hay pendientes, NO enviar notificación todavía
                if (hayPendientes) {
                  console.log('⏸️ Preaprobación parcial: Aún hay fechas pendientes. No se envía notificación todavía.')
                } else {
                  // Todas las fechas están preaprobadas (o aprobadas), enviar notificación
                  console.log('✅ Todas las fechas están preaprobadas. Enviando notificación de confirmación.')

                  // Usar los datos de reemplazantes que ya vienen en requestData
                  let reemplazantesCompletos = []
                  
                  if (requestData.reemplazante && requestData.reemplazante.length > 0) {
                    reemplazantesCompletos = requestData.reemplazante.map((rep: any) => ({
                      emp_id: rep.emp_id,
                      nombre: rep.nombre,
                      telefono: rep.telefono || '77711124'
                    }))
                  } else {
                    try {
                      const reemplazanteResponse = await fetch(`http://190.171.225.68/api/reemplazante-vacation?idsolicitud=${requestId}`)
                      if (reemplazanteResponse.ok) {
                        const reemplazanteData = await reemplazanteResponse.json()
                        if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                          reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                            emp_id: rep.EMP_ID,
                            nombre: rep.NOMBRE,
                            telefono: rep.TELEFONO
                          }))
                        }
                      }
                    } catch (apiError) {
                      console.warn('⚠️ Error al obtener reemplazantes:', apiError)
                      reemplazantesCompletos = [
                        {
                          emp_id: '493',
                          nombre: 'Charvel Santiago',
                          telefono: '78003551'
                        }
                      ]
                    }
                  }

                  // Obtener todas las fechas preaprobadas de todas las solicitudes del empleado
                  const todasFechas = solicitudesEmpleado
                    .filter((req: any) => req.estado === 'PREAPROBADO' || req.estado === 'PRE-APROBADO' || req.estado === 'APROBADO')
                    .flatMap((req: any) => req.fechas.map((f: any) => `${f.fecha} (${f.turno})`))

                  // Preparar payload para notificaciones
                  const notificationPayload = {
                    id_solicitud: requestId,
                    emp_id: requestData.emp_id,
                    emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
                    estado: 'PREAPROBADO',
                    comentario: comentario || 'Todas tus fechas han sido preaprobadas',
                    tipo: requestData.tipo,
                    dias_solicitados: todasFechas.length,
                    fechas: todasFechas,
                    reemplazantes: reemplazantesCompletos.map((rep: any) => ({
                      emp_id: rep.emp_id,
                      nombre: rep.nombre,
                      telefono: rep.telefono
                    }))
                  }

                  const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'
                  await fetch(`${BOT_URL}/api/vacation-notification`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(notificationPayload)
                  }).catch(err => {
                    console.warn('⚠️ No se pudo enviar notificación de WhatsApp:', err)
                  })

                  console.log('✅ Notificación de preaprobación completa enviada')
                }
              }
            }
          } catch (notifError) {
            console.warn('⚠️ Error al verificar y enviar notificaciones de preaprobación:', notifError)
          }
        } 
        // Si es RECHAZADO, siempre notificar
        else if (estado === 'RECHAZADO') {
          try {
            // Preparar payload para notificaciones de rechazo
            const notificationPayload = {
              id_solicitud: requestId,
              emp_id: requestData.emp_id,
              emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
              estado: estado,
              comentario: comentario,
              tipo: requestData.tipo,
              dias_solicitados: parseInt(requestData.total_dias),
              fechas: requestData.fechas.map((f: any) => `${f.fecha} (${f.turno})`)
            }

            const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'
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
        }
        // Si es APROBADO, verificar si estaba preaprobada para enviar resumen o individual
        else if (estado === 'APROBADO') {
          try {
            // Verificar si esta solicitud estaba preaprobada antes de aprobar
            const estabaPreaprobada = requestData.estado === 'PREAPROBADO' || requestData.estado === 'PRE-APROBADO'
            
            if (estabaPreaprobada) {
              // Si estaba preaprobada, verificar si todas las fechas preaprobadas están ahora aprobadas
              console.log('📋 Solicitud estaba preaprobada. Verificando si todas las fechas están aprobadas para enviar resumen.')
              
              const checkResponse = await fetch(`http://190.171.225.68/api/vacacion-data-manager?manager=${props.managerId}`)
              if (checkResponse.ok) {
                const checkData = await checkResponse.json()
                if (checkData.success && Array.isArray(checkData.data)) {
                  // Buscar todas las solicitudes del mismo empleado
                  const solicitudesEmpleado = checkData.data.filter((req: any) => 
                    req.emp_id === requestData.emp_id && 
                    req.tipo === requestData.tipo &&
                    req.fecha_solicitud === requestData.fecha_solicitud
                  )

                  // Verificar si hay alguna preaprobada que aún no esté aprobada
                  const hayPreaprobadasPendientes = solicitudesEmpleado.some((req: any) => 
                    (req.estado === 'PREAPROBADO' || req.estado === 'PRE-APROBADO') &&
                    req.id_solicitud !== requestId
                  )

                  // Si no hay preaprobadas pendientes, todas están aprobadas - enviar resumen
                  if (!hayPreaprobadasPendientes) {
                    console.log('✅ Todas las fechas preaprobadas están ahora aprobadas. Enviando resumen.')

                    // Usar los datos de reemplazantes
                    let reemplazantesCompletos = []
                    
                    if (requestData.reemplazante && requestData.reemplazante.length > 0) {
                      reemplazantesCompletos = requestData.reemplazante.map((rep: any) => ({
                        emp_id: rep.emp_id,
                        nombre: rep.nombre,
                        telefono: rep.telefono || '77711124'
                      }))
                    } else {
                      try {
                        const reemplazanteResponse = await fetch(`http://190.171.225.68/api/reemplazante-vacation?idsolicitud=${requestId}`)
                        if (reemplazanteResponse.ok) {
                          const reemplazanteData = await reemplazanteResponse.json()
                          if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                            reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                              emp_id: rep.EMP_ID,
                              nombre: rep.NOMBRE,
                              telefono: rep.TELEFONO
                            }))
                          }
                        }
                      } catch (apiError) {
                        console.warn('⚠️ Error al obtener reemplazantes:', apiError)
                        reemplazantesCompletos = [
                          {
                            emp_id: '493',
                            nombre: 'Charvel Santiago',
                            telefono: '78003551'
                          }
                        ]
                      }
                    }

                    // Obtener todas las fechas aprobadas (resumen completo)
                    const todasFechas = solicitudesEmpleado
                      .filter((req: any) => req.estado === 'APROBADO')
                      .flatMap((req: any) => req.fechas.map((f: any) => `${f.fecha} (${f.turno})`))

                    // Preparar payload para notificación de resumen
                    const notificationPayload = {
                      id_solicitud: requestId,
                      emp_id: requestData.emp_id,
                      emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
                      estado: 'APROBADO',
                      comentario: comentario || 'Todas tus vacaciones preaprobadas han sido aprobadas',
                      tipo: requestData.tipo,
                      dias_solicitados: todasFechas.length,
                      fechas: todasFechas,
                      reemplazantes: reemplazantesCompletos.map((rep: any) => ({
                        emp_id: rep.emp_id,
                        nombre: rep.nombre,
                        telefono: rep.telefono
                      }))
                    }

                    const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'
                    await fetch(`${BOT_URL}/api/vacation-notification`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(notificationPayload)
                    }).catch(err => {
                      console.warn('⚠️ No se pudo enviar notificación de WhatsApp:', err)
                    })

                    console.log('✅ Resumen de aprobación enviado')
                  } else {
                    console.log('⏸️ Aún hay fechas preaprobadas pendientes. No se envía notificación todavía.')
                  }
                }
              }
            } else {
              // Si NO estaba preaprobada, enviar notificación individual inmediatamente
              console.log('✅ Aprobación directa (no preaprobada): Enviando notificación individual inmediata.')

              // Usar los datos de reemplazantes que ya vienen en requestData
              let reemplazantesCompletos = []
              
              if (requestData.reemplazante && requestData.reemplazante.length > 0) {
                reemplazantesCompletos = requestData.reemplazante.map((rep: any) => ({
                  emp_id: rep.emp_id,
                  nombre: rep.nombre,
                  telefono: rep.telefono || '77711124'
                }))
              } else {
                try {
                  const reemplazanteResponse = await fetch(`http://190.171.225.68/api/reemplazante-vacation?idsolicitud=${requestId}`)
                  if (reemplazanteResponse.ok) {
                    const reemplazanteData = await reemplazanteResponse.json()
                    if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                      reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                        emp_id: rep.EMP_ID,
                        nombre: rep.NOMBRE,
                        telefono: rep.TELEFONO
                      }))
                    }
                  }
                } catch (apiError) {
                  console.warn('⚠️ Error al obtener reemplazantes:', apiError)
                  reemplazantesCompletos = [
                    {
                      emp_id: '493',
                      nombre: 'Charvel Santiago',
                      telefono: '78003551'
                    }
                  ]
                }
              }

              // Obtener solo las fechas de esta solicitud específica (aprobación individual)
              const fechasAprobadas = requestData.fechas.map((f: any) => `${f.fecha} (${f.turno})`)

              // Preparar payload para notificaciones individuales
              const notificationPayload = {
                id_solicitud: requestId,
                emp_id: requestData.emp_id,
                emp_nombre: requestData.empleado?.nombre || `Empleado ${requestData.emp_id}`,
                estado: 'APROBADO',
                comentario: comentario,
                tipo: requestData.tipo,
                dias_solicitados: fechasAprobadas.length,
                fechas: fechasAprobadas,
                reemplazantes: reemplazantesCompletos.map((rep: any) => ({
                  emp_id: rep.emp_id,
                  nombre: rep.nombre,
                  telefono: rep.telefono
                }))
              }

              const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'
              await fetch(`${BOT_URL}/api/vacation-notification`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationPayload)
              }).catch(err => {
                console.warn('⚠️ No se pudo enviar notificación de WhatsApp:', err)
              })

              console.log('✅ Notificación de aprobación individual enviada')
            }
          } catch (notifError) {
            console.warn('⚠️ Error al enviar notificación de aprobación:', notifError)
            // Continuar aunque fallen las notificaciones
          }
        }
      }

      // Mostrar mensaje de éxito con toast notification
      if (estado === 'APROBADO') {
        showNotification(
          'success',
          'Solicitud Aprobada',
          'La solicitud ha sido aprobada y se envió la notificación al empleado'
        )
      } else if (estado === 'PREAPROBADO') {
        // Verificar si se envió notificación o no
        const checkResponse = await fetch(`http://190.171.225.68/api/vacacion-data-manager?manager=${props.managerId}`)
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