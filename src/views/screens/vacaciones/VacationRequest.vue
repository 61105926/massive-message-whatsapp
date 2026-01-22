<template>
  <div class="min-h-screen bg-background pb-20">
    <!-- Notification Toast -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
  

      <div
        v-if="notification.show"
        :class="[
          'fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] rounded-lg shadow-lg p-4 flex items-start gap-3',
          notification.type === 'success' ? 'bg-green-50 border-2 border-green-500' : '',
          notification.type === 'error' ? 'bg-red-50 border-2 border-red-500' : '',
          notification.type === 'info' ? 'bg-blue-50 border-2 border-blue-500' : ''
        ]"
      >
        <div class="flex-shrink-0">
          <svg v-if="notification.type === 'success'" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-if="notification.type === 'error'" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-if="notification.type === 'info'" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <h4
            :class="[
              'font-semibold text-sm mb-1',
              notification.type === 'success' ? 'text-green-900' : '',
              notification.type === 'error' ? 'text-red-900' : '',
              notification.type === 'info' ? 'text-blue-900' : ''
            ]"
          >
            {{ notification.title }}
          </h4>
          <p
            :class="[
              'text-sm',
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
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition>

    <!-- Modal de Confirmación -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        @click.self="showConfirmModal = false"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
          <!-- Header -->
          <div class="bg-green-600 p-6 text-white">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold">Confirmar Envío</h3>
                <p class="text-green-100 text-sm mt-1">¿Estás seguro de enviar tu solicitud?</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <div class="space-y-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 mb-2">Resumen de tu solicitud:</p>
                    <div class="space-y-1 text-sm text-gray-600">
                      <div class="flex justify-between">
                        <span>Días seleccionados:</span>
                        <span class="font-semibold text-gray-900">{{ totalSelectedDays.toFixed(1) }} / {{ currentUser.vacationBalance }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Tipo:</span>
                        <span class="font-semibold text-gray-900">Vacaciones Programadas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p class="text-sm text-amber-800">
                  <strong>⚠️ Importante:</strong> Una vez enviada, tu solicitud será revisada por tu jefe directo.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
            <button
              @click="showConfirmModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmSubmitProgrammed"
              class="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
            >
              Sí, Enviar Solicitud
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Loading Overlay -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSubmittingRequest"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
          <div class="flex flex-col items-center space-y-4">
            <svg class="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div class="text-center">
              <h3 class="text-lg font-semibold text-gray-900">Enviando solicitud...</h3>
              <p class="text-sm text-gray-600 mt-1">Por favor espera, no cierres esta ventana</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Sticky Header -->
    <div class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h1 class="text-xl font-bold text-balance">Mis Vacaciones</h1>
            <div class="flex items-center gap-3">
              <p class="text-sm text-muted-foreground">{{ currentUser.company }}</p>
              <span v-if="appVersion" class="text-[10px] text-muted-foreground/60 font-mono">
                v{{ appVersion.substring(0, 8) }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 relative">
            <span v-if="isLoadingData" class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground">
              <svg class="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </span>
            <span v-else class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              {{ currentUser.vacationBalance }} días
            </span>
            <!-- <select
              v-model="currentUser.role"
              @change="handleRoleChange"
              class="text-sm border border-input bg-background px-2 py-1 rounded-md"
            >
              <option value="employee">Empleado</option>
              <option value="boss">Jefe</option>
            </select> -->
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 md:px-6 py-6 space-y-6 w-full">
      <!-- Navigation Buttons -->
      <div :class="`grid ${currentUser.role === 'boss' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`">
        <button
          @click="activeView = 'calendar'"
          :class="[
            'h-14 flex flex-col gap-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            activeView === 'calendar'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <CalendarDays class="h-5 w-5" />
          <span class="text-sm">Solicitar</span>
        </button>
        <button
          @click="activeView = 'requests'"
          :class="[
            'h-14 flex flex-col gap-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            activeView === 'requests'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <Clock class="h-5 w-5" />
          <span class="text-sm">Historial</span>
        </button>
        <button
          v-if="currentUser.role === 'boss'"
          @click="activeView = 'boss'"
          :class="[
            'h-14 flex flex-col gap-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            activeView === 'boss'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <CheckCircle class="h-5 w-5" />
          <span class="text-sm">Aprobar</span>
        </button>
      </div>

      <!-- Calendar View -->
      <div v-if="activeView === 'calendar'" class="space-y-4 pb-20">
        <!-- Vista: Solicitar -->
        <div class="space-y-4">
          <!-- Loading State -->
          <Card v-if="isLoadingData">
            <CardContent class="py-12">
              <div class="flex flex-col items-center justify-center text-center space-y-4">
                <svg class="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div>
                  <h3 class="text-lg font-semibold">Cargando tus datos...</h3>
                  <p class="text-sm text-muted-foreground">Por favor espera un momento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Calendar Content -->
          <Card v-else>
            <CardHeader class="pb-3">
              <h3 class="text-lg font-semibold leading-none tracking-tight">
                {{ programmedVacationsEnabled ? 'Vacaciones Programadas 2026' : 'Selecciona tus fechas' }}
              </h3>
              <p class="text-sm text-muted-foreground">
                <span v-if="programmedVacationsEnabled">
                  <span v-if="vacationRange">
                    Debes seleccionar entre {{ vacationRange.minimo.toFixed(1) }} y {{ vacationRange.maximo.toFixed(1) }} días dentro del año 2026.
                  </span>
                  <span v-else>
                    Debes seleccionar exactamente {{ currentUser.vacationBalance }} días dentro del año 2026.
                  </span>
                </span>
                <span v-else>
                  Toca las fechas que quieres solicitar. Se enviarán como vacaciones programadas para aprobación del jefe.
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <VacationCalendar
                :selected-dates="selectedDates"
                @date-select="handleDateSelect"
                :existing-requests="requests"
                :fixed-year="programmedVacationsEnabled ? 2026 : undefined"
                :employee-regional="employeeData?.regional || employeeData?.REGIONAL || null"
              />
              <div v-if="programmedVacationsEnabled" class="mt-4 flex items-center justify-between text-sm border-t pt-4">
                <div>
                  <span class="font-medium">Seleccionados:</span>
                  <span :class="isWithinVacationRange ? 'text-green-600 font-semibold ml-2' : 'text-gray-700 ml-2'">
                    {{ totalSelectedDays.toFixed(1) }}
                    <span v-if="vacationRange">
                      / Rango: {{ vacationRange.minimo.toFixed(1) }} - {{ vacationRange.maximo.toFixed(1) }} días
                    </span>
                    <span v-else>
                      / {{ currentUser.vacationBalance }}
                    </span>
                  </span>
                </div>
              </div>

              <!-- Mostrar rango de vacaciones calculado -->
              <div v-if="vacationRange" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 class="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Rango de Vacaciones Permitido
                </h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-blue-700 font-medium">Mínimo:</span>
                    <span class="ml-2 text-blue-900 font-semibold">{{ vacationRange.minimo.toFixed(1) }} días</span>
                  </div>
                  <div>
                    <span class="text-blue-700 font-medium">Máximo:</span>
                    <span class="ml-2 text-blue-900 font-semibold">{{ vacationRange.maximo.toFixed(1) }} días</span>
                  </div>
                  <div v-if="vacationRange.duodecima > 0" class="col-span-2 text-xs text-blue-600 mt-1">
                    Duodécima: {{ vacationRange.duodecima.toFixed(1) }} días | 
                    Saldo acumulado: {{ vacationRange.saldoAcumulado }} días
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Mostrar formulario solo si NO está en modo programadas -->
          <div v-if="showForm && !programmedVacationsEnabled" class="animate-slide-up">
            <VacationRequestForm
              :selected-dates="selectedDates"
              :available-vacation-days="currentUser.vacationBalance"
              :vacation-total="currentUser.vacationTotal"
              :vacation-taken="currentUser.usedDays"
              :employee-replacements="employeeData?.replacements || []"
              :programmed-enabled="programmedVacationsEnabled"
              :is-submitting="isSubmittingRequest"
              :emp-id="employeeData?.empID || currentUser.id"
              @submit="handleRequestSubmit"
              @validation-error="handleValidationError"
              @cancel="() => { showForm = false; selectedDates = []; daySelections = [] }"
            />
          </div>

          <!-- Si está en modo programadas, mostrar solo botón de envío -->
          <!-- Verificar si ya tiene vacaciones programadas -->
          <div v-if="programmedVacationsEnabled && hasExistingProgrammedVacations" class="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 class="font-semibold text-yellow-900 mb-1">Ya programaste tus vacaciones</h4>
                <p class="text-sm text-yellow-700">
                  Solo puedes programar tus vacaciones una vez por año. Si necesitas modificar tus fechas programadas, contacta a RRHH o a tu jefe directo.
                </p>
              </div>
            </div>
          </div>
          <div v-else-if="programmedVacationsEnabled && selectedDates.length > 0" class="mt-4">
            <Card>
              <CardContent class="pt-6">
                <div class="flex items-center justify-between">
                  <div class="text-sm">
                    <span class="font-medium">Seleccionados:</span>
                    <span :class="isWithinVacationRange ? 'text-green-600 font-semibold ml-2' : 'text-orange-600 ml-2'">
                      {{ totalSelectedDays.toFixed(1) }}
                      <span v-if="vacationRange">
                        / Rango: {{ vacationRange.minimo.toFixed(1) }} - {{ vacationRange.maximo.toFixed(1) }} días
                      </span>
                      <span v-else>
                        / {{ currentUser.vacationBalance }}
                      </span>
                    </span>
                    <p v-if="vacationRange && !isWithinVacationRange" class="text-xs text-orange-600 mt-1">
                      <span v-if="totalSelectedDays < vacationRange.minimo">
                        Debes seleccionar al menos {{ vacationRange.minimo.toFixed(1) }} días
                      </span>
                      <span v-else-if="totalSelectedDays > vacationRange.maximo">
                        No puedes seleccionar más de {{ vacationRange.maximo.toFixed(1) }} días
                      </span>
                    </p>
                    <p v-else-if="!vacationRange && totalSelectedDays !== currentUser.vacationBalance" class="text-xs text-orange-600 mt-1">
                      Debes seleccionar exactamente {{ currentUser.vacationBalance }} días
                    </p>
                  </div>
                  <button
                    @click="showConfirmModal = true"
                    :disabled="!isWithinVacationRange || isSubmittingRequest"
                    class="px-6 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar Programación
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <!-- Banner de desarrollador con efecto WhatsApp -->
          <Transition name="whatsapp-badge">
            <div v-if="showDeveloperBadge" class="mt-8">
              <div 
                :class="{ 'whatsapp-badge-exit': badgeAnimated }"
                class="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200/50 rounded-xl p-4 shadow-lg relative overflow-hidden whatsapp-badge-container"
              >
                <!-- Efecto de ondas de WhatsApp -->
                <div class="absolute inset-0 pointer-events-none overflow-hidden">
                  <div class="whatsapp-wave whatsapp-wave-1"></div>
                  <div class="whatsapp-wave whatsapp-wave-2"></div>
                  <div class="whatsapp-wave whatsapp-wave-3"></div>
                </div>
                
                <div class="flex items-center justify-between gap-4 relative z-10">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 flex items-center justify-center shadow-lg ring-2 ring-green-300/50 whatsapp-icon-pulse">
                        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-gray-600 font-medium">Desarrollado por</p>
                      <a 
                        href="https://wa.me/61105926" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-sm font-bold text-green-700 hover:text-green-800 transition-colors inline-flex items-center gap-1.5 group whatsapp-number"
                      >
                        <span class="transition-all duration-300">61105926</span>
                        <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <button
                    @click="showDeveloperBadge = false"
                    class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-white/50"
                    aria-label="Cerrar"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Transition>

        </div>

        <!-- Vista: Programadas - Eliminada, ya no es necesaria -->
      </div>

      <!-- Requests View -->
      <div v-if="activeView === 'requests'" class="space-y-4 pb-20">
        <RequestsList
          :emp-id="employeeData?.empID || currentUser.id"
          :employee-replacements="employeeData?.replacements || []"
          @take-vacation="handleTakeVacation"
        />
        
        <!-- Banner de desarrollador -->
        <div v-if="showDeveloperBadge" class="mt-8">
          <div class="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200/50 rounded-xl p-4 shadow-sm">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md ring-2 ring-white/50">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-600 font-medium">Desarrollado por</p>
                  <a 
                    href="https://wa.me/61105926" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-sm font-bold text-green-700 hover:text-green-800 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span>61105926</span>
                    <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              <button
                @click="showDeveloperBadge = false"
                class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-white/50"
                aria-label="Cerrar"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Boss View -->
      <div v-if="activeView === 'boss' && currentUser.role === 'boss'" class="space-y-4 pb-20">
        <!-- Vista de Calendario con Timeline -->
        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold leading-none tracking-tight">Calendario de Vacaciones</h3>
            <p class="text-sm text-muted-foreground">
              Visualiza y gestiona las vacaciones de tu equipo en un calendario mensual o diario.
            </p>
          </CardHeader>
          <CardContent>
            <BossCalendarView :manager-id="employeeData?.empID || currentUser.id" />
          </CardContent>
        </Card>

        <!-- Panel de Aprobación -->
        <BossApprovalPanel
          :manager-id="employeeData?.empID || currentUser.id"
          @request-update="handleRequestUpdate"
        />
        
        <!-- Banner de desarrollador -->
        <div v-if="showDeveloperBadge" class="mt-8">
          <div class="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200/50 rounded-xl p-4 shadow-sm">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md ring-2 ring-white/50">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-600 font-medium">Desarrollado por</p>
                  <a 
                    href="https://wa.me/61105926" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-sm font-bold text-green-700 hover:text-green-800 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span>61105926</span>
                    <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              <button
                @click="showDeveloperBadge = false"
                class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-white/50"
                aria-label="Cerrar"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile View -->
      <div v-if="activeView === 'profile'" class="space-y-4">
        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold leading-none tracking-tight">Mi Perfil</h3>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-3">
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Nombre</span>
                <span class="font-medium">{{ currentUser.name }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">ID Empleado</span>
                <span class="font-medium">{{ currentUser.id }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Cargo</span>
                <span class="font-medium">{{ currentUser.department }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Regional</span>
                <span class="font-medium">{{ employeeData?.regional || 'N/A' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Email</span>
                <span class="font-medium text-sm">{{ currentUser.email }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Días Totales</span>
                <span class="font-medium">{{ currentUser.vacationTotal }} días</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Días Tomados</span>
                <span class="font-medium text-orange-600">{{ currentUser.usedDays }} días</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Días Disponibles</span>
                <span class="font-medium text-green-600">{{ currentUser.vacationBalance }} días</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Jefe Directo -->
        <Card v-if="employeeData?.manager">
          <CardHeader>
            <h3 class="text-lg font-semibold leading-none tracking-tight">Jefe Directo</h3>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Nombre</span>
                <span class="font-medium">{{ employeeData.manager.name }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Teléfono</span>
                <span class="font-medium">{{ employeeData.manager.phone }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Reemplazantes -->
        <Card v-if="employeeData?.replacements && employeeData.replacements.length > 0">
          <CardHeader>
            <h3 class="text-lg font-semibold leading-none tracking-tight">Mis Reemplazantes</h3>
            <p class="text-sm text-muted-foreground">Personas que pueden reemplazarme durante mis vacaciones</p>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="(replacement, index) in employeeData.replacements"
                :key="index"
                class="p-3 bg-muted rounded-lg"
              >
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-semibold">{{ replacement.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ replacement.cargo }}</p>
                  </div>
                  <span class="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                   
                  </span>
                </div>
                <div class="text-sm text-muted-foreground">
                  📱 {{ replacement.phone }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Fixed Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-inset z-50 lg:left-64">
      <div :class="`grid ${currentUser.role === 'boss' ? 'grid-cols-4' : 'grid-cols-3'} gap-1 p-2 max-w-full`">
        <button
          @click="activeView = 'calendar'"
          :class="[
            'h-12 sm:h-14 flex flex-col gap-1 items-center justify-center rounded-md text-xs sm:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-0',
            activeView === 'calendar'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <CalendarDays class="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span class="text-xs truncate w-full text-center px-1">Calendario</span>
        </button>
        <button
          @click="activeView = 'requests'"
          :class="[
            'h-12 sm:h-14 flex flex-col gap-1 items-center justify-center rounded-md text-xs sm:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-0',
            activeView === 'requests'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <Clock class="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span class="text-xs truncate w-full text-center px-1">Solicitudes</span>
        </button>
        <button
          v-if="currentUser.role === 'boss'"
          @click="activeView = 'boss'"
          :class="[
            'h-12 sm:h-14 flex flex-col gap-1 items-center justify-center rounded-md text-xs sm:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-0',
            activeView === 'boss'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <CheckCircle class="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span class="text-xs truncate w-full text-center px-1">Aprobar</span>
        </button>
        <button
          @click="activeView = 'profile'"
          :class="[
            'h-12 sm:h-14 flex flex-col gap-1 items-center justify-center rounded-md text-xs sm:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-0',
            activeView === 'profile'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <User class="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span class="text-xs truncate w-full text-center px-1">Perfil</span>
        </button>
      </div>
    </div>

    <!-- Bottom padding for fixed navigation -->
    <div class="h-20"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { CalendarDays, Clock, CheckCircle, User } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import VacationCalendar from '@/components/vacation/VacationCalendar.vue'
import VacationRequestForm from '@/components/vacation/VacationRequestForm.vue'
import RequestsList from '@/components/vacation/RequestsList.vue'
import BossApprovalPanel from '@/components/vacation/BossApprovalPanel.vue'
import BossCalendarView from '@/components/vacation/BossCalendarView.vue'
import { calcularRangoVacaciones, type VacationRangeOutput } from '@/utils/vacationRange'

// Router
const route = useRoute()

// Versión de la aplicación
const appVersion = ref<string | null>(null)

// Reactive data
const selectedDates = ref<Date[]>([])
const daySelections = ref<any[]>([])

// Función helper para calcular el total de días considerando medio día = 0.5
const calculateTotalDays = (selections: any[]): number => {
  return selections.reduce((total, selection) => {
    if (selection.type === 'full' || selection.turno === 'COMPLETO' || !selection.type) {
      return total + 1
    }
    if (selection.type === 'morning' || selection.turno === 'MAÑANA') {
      return total + 0.5
    }
    if (selection.type === 'afternoon' || selection.turno === 'TARDE') {
      return total + 0.5
    }
    return total + 1 // default
  }, 0)
}

// Computed para el total de días seleccionados
const totalSelectedDays = computed(() => {
  return calculateTotalDays(daySelections.value)
})

// Computed para verificar si los días seleccionados están dentro del rango permitido
const isWithinVacationRange = computed(() => {
  if (!vacationRange.value) {
    // Si no hay rango calculado, usar la validación anterior
    return totalSelectedDays.value === currentUser.value.vacationBalance
  }
  // Verificar que esté entre el mínimo y el máximo
  const dentroDelRango = totalSelectedDays.value >= vacationRange.value.minimo && 
                         totalSelectedDays.value <= vacationRange.value.maximo
  
  // Log para depuración
  if (import.meta.env.DEV) {
    console.log('🔍 Validación de rango:', {
      totalSelectedDays: totalSelectedDays.value,
      minimo: vacationRange.value.minimo,
      maximo: vacationRange.value.maximo,
      dentroDelRango
    })
  }
  
  return dentroDelRango
})

const requests = ref<any[]>([])
const showForm = ref(false)
const activeView = ref<'calendar' | 'requests' | 'profile' | 'boss'>('calendar')
const employeeData = ref<any>(null)
const programmedVacationsEnabled = ref(true)
const isLoadingData = ref(false)
const isSubmittingRequest = ref(false)
const vacationRange = ref<VacationRangeOutput | null>(null)
const notification = ref<{ show: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

// Modal de confirmación
const showConfirmModal = ref(false)

// Computed: Verificar si ya tiene vacaciones programadas
const hasExistingProgrammedVacations = computed(() => {
  if (!requests.value || requests.value.length === 0) {
    return false
  }
  
  return requests.value.some((req: any) => {
    // Verificar si tiene vacaciones programadas en cualquier estado (excepto rechazadas)
    return req.tipo === 'PROGRAMADA' && 
           req.estado !== 'RECHAZADO' && 
           req.estado !== 'rejected'
  })
})

// Badge de desarrollador (se muestra por defecto, se puede cerrar)
const showDeveloperBadge = ref(true)
const badgeAnimated = ref(false)

// Auto-ocultar el badge después de 10 segundos con animación bonita
const autoHideBadge = () => {
  setTimeout(() => {
    if (showDeveloperBadge.value) {
      badgeAnimated.value = true
      // Ocultar después de la animación
      setTimeout(() => {
        showDeveloperBadge.value = false
      }, 1000) // 1 segundo para la animación de salida
    }
  }, 10000) // 10 segundos de visibilidad
}

const currentUser = ref({
  id: 'user-1',
  name: 'Juan Pérez',
  email: 'juan.perez@minoil.com.bo',
  department: 'Desarrollo',
  company: 'MINOIL S.A.',
  role: 'employee',
  vacationBalance: 25,
  usedDays: 5,
  vacationTotal: 25,
})

// Decodificar teléfono y consultar API
const fetchEmployeeData = async (base64Data: string) => {
  // Prevenir múltiples llamadas simultáneas
  if (isLoadingData.value) {
    console.warn('⚠️ Ya hay una carga de datos en proceso, ignorando llamada duplicada')
    return
  }
  
  isLoadingData.value = true
  try {
    // 1. Decodificar el teléfono de base64
    let phoneNumber: string
    try {
      phoneNumber = atob(base64Data)
      console.log('📱 Teléfono decodificado:', phoneNumber)
    } catch (decodeError) {
      throw new Error('El código recibido no es válido. Por favor solicita un nuevo enlace desde WhatsApp.')
    }

    if (!phoneNumber || phoneNumber.length < 7) {
      throw new Error('El número de teléfono decodificado no es válido.')
    }

    // 2. Consultar API con el teléfono
    const apiUrl = `http://190.171.225.68:8006/api/emp?mobile=${phoneNumber}`
    console.log('🔍 Consultando API:', apiUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos timeout

    const response = await fetch(apiUrl, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No se encontraron datos para tu número de teléfono. Contacta a RRHH.')
      } else if (response.status === 500) {
        throw new Error('Error en el servidor. Por favor intenta más tarde o contacta a TI.')
      } else {
        throw new Error(`Error al consultar tus datos (${response.status}). Contacta a soporte.`)
      }
    }

    let parsedData = await response.json()
    console.log('📦 Datos recibidos de la API:', parsedData)

    // Si viene como array, tomar el primer elemento
    if (Array.isArray(parsedData)) {
      if (parsedData.length === 0) {
        throw new Error('No se encontraron datos de empleado para tu teléfono. Contacta a RRHH.')
      }
      parsedData = parsedData[0]
    }

    // Validar que los datos esenciales existen
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Los datos recibidos no son válidos. Contacta a soporte.')
    }

    if (!parsedData.empID && !parsedData.id) {
      throw new Error('No se encontró tu ID de empleado. Contacta a RRHH.')
    }

    employeeData.value = parsedData

    // 3. Cargar solicitudes de vacaciones del empleado después de obtener sus datos
    if (parsedData.empID) {
      await fetchEmployeeVacationRequests(parsedData.empID)
    }

    // 4. Actualizar datos del usuario actual con los datos recibidos
    if (parsedData) {
      // Priorizar datos de vacation object si existen
      const vacationTotal = parsedData.vacation?.total
        ? parseFloat(parsedData.vacation.total)
        : (parsedData.vacation_days ? parseInt(parsedData.vacation_days) : 25)

      const vacationTaken = parsedData.vacation?.taken
        ? parseFloat(parsedData.vacation.taken)
        : (parsedData.usedDays || parsedData.diasUsados || 0)

      const vacationAvailable = parsedData.vacation?.available
        ? parseFloat(parsedData.vacation.available)
        : (vacationTotal - vacationTaken)

      // Detectar automáticamente si es jefe (tiene replacements de tipo SUBORDINADO)
      const hasSubordinates = parsedData.replacements &&
                             Array.isArray(parsedData.replacements) &&
                             parsedData.replacements.some((r: any) => r.type === 'SUBORDINADO')

      console.log('🔍 Detectando rol del usuario:', {
        hasReplacements: !!parsedData.replacements,
        replacementsCount: parsedData.replacements?.length || 0,
        hasSubordinates: hasSubordinates,
        isManager: hasSubordinates,
        empID: parsedData.empID
      })

      currentUser.value = {
        ...currentUser.value,
        id: parsedData.id || parsedData.empID || currentUser.value.id,
        name: parsedData.fullName || parsedData.name || currentUser.value.name,
        email: parsedData.email || `${parsedData.phone}@minoil.com.bo`,
        department: parsedData.cargo || parsedData.department || currentUser.value.department,
        company: parsedData.company || 'MINOIL S.A.',
        role: hasSubordinates ? 'boss' : 'employee', // Detectar automáticamente el rol
        vacationBalance: vacationAvailable, // Usar días disponibles
        usedDays: vacationTaken,
        vacationTotal: vacationTotal, // Agregar total para referencia
      }

      // Calcular rango de vacaciones según las reglas de la empresa
      // Usar employeeData.value que ya tiene todos los datos cargados
      calcularRangoVacacionesEmpleado(employeeData.value || parsedData, vacationAvailable)
    }

    console.log('✅ Datos de empleado cargados correctamente')
    showNotification('success', 'Bienvenido', `${currentUser.value.name}! Tus datos se cargaron correctamente.`, 4000)
  } catch (error: any) {
    console.error('❌ Error al cargar datos de empleado:', error)

    // Mensajes de error específicos
    let errorMessage = 'Error al cargar tus datos. '

    if (error.name === 'AbortError') {
      errorMessage += 'La consulta tardó demasiado tiempo. Verifica tu conexión a internet.'
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage += 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    } else {
      errorMessage += error.message || 'Por favor intenta nuevamente o contacta a soporte.'
    }

    showNotification('error', 'Error al cargar datos', errorMessage, 8000)

    // Si es un error crítico, prevenir que el usuario continúe
    if (!employeeData.value) {
      // Mostrar mensaje en la UI explicando el problema
      activeView.value = 'profile'
    }
  } finally {
    isLoadingData.value = false
  }
}

// Función para calcular el rango de vacaciones del empleado
const calcularRangoVacacionesEmpleado = (parsedData: any, saldoDisponible: number) => {
  try {
    // Log mínimo para depuración (sin imprimir objetos completos)
    console.log('📊 Calculando rango de vacaciones para empleado:', parsedData.empID || parsedData.id)

    // Obtener fecha de ingreso (buscar en múltiples campos posibles)
    // También buscar en employeeData.value por si los datos están ahí
    const fechaIngreso = parsedData.fechaIngreso || 
                        parsedData.FechaIngreso || 
                        parsedData.fecha_ingreso || 
                        parsedData.FECHA_INGRESO ||
                        parsedData.fecha_ingreso_empleado ||
                        parsedData.fecha_ingreso_emp ||
                        employeeData.value?.fechaIngreso ||
                        employeeData.value?.FechaIngreso ||
                        employeeData.value?.fecha_ingreso ||
                        employeeData.value?.FECHA_INGRESO ||
                        null

    // Si no se encuentra, mostrar información de depuración
    if (!fechaIngreso || fechaIngreso === '' || fechaIngreso === 'null' || fechaIngreso === 'undefined') {
      if (import.meta.env.DEV) {
        console.warn('⚠️ No se encontró fecha de ingreso. Campos disponibles:', {
          parsedDataKeys: Object.keys(parsedData).filter(k => 
            k.toLowerCase().includes('fecha') || k.toLowerCase().includes('ingreso')
          ),
          employeeDataKeys: employeeData.value ? Object.keys(employeeData.value).filter(k => 
            k.toLowerCase().includes('fecha') || k.toLowerCase().includes('ingreso')
          ) : [],
          fechaIngresoRaw: parsedData.fechaIngreso,
          fechaIngresoEmployeeData: employeeData.value?.fechaIngreso
        })
      }
      console.warn('⚠️ No se encontró fecha de ingreso, no se puede calcular el rango de vacaciones')
      return
    }

    // Formatear fecha de ingreso a YYYY-MM-DD
    // Manejar diferentes formatos: "2023-07-04 00:00:00.0000000", "2023-07-04", etc.
    let fechaIngresoFormateada: string
    try {
      // Limpiar la fecha: remover espacios extra y tomar solo la parte de la fecha
      let fechaLimpia = String(fechaIngreso).trim()
      
      // Si tiene formato con hora (ej: "2023-07-04 00:00:00.0000000"), tomar solo la parte de la fecha
      if (fechaLimpia.includes(' ')) {
        fechaLimpia = fechaLimpia.split(' ')[0]
      }
      
      // Si tiene formato con T (ISO), tomar solo la parte de la fecha
      if (fechaLimpia.includes('T')) {
        fechaLimpia = fechaLimpia.split('T')[0]
      }
      
      // Validar formato YYYY-MM-DD
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
      if (fechaRegex.test(fechaLimpia)) {
        fechaIngresoFormateada = fechaLimpia
      } else {
        // Intentar parsear con Date si no coincide con el formato esperado
        const fechaParsed = new Date(fechaLimpia)
        if (isNaN(fechaParsed.getTime())) {
          console.warn('⚠️ Fecha de ingreso inválida:', fechaIngreso)
          return
        }
        fechaIngresoFormateada = fechaParsed.toISOString().split('T')[0]
      }
    } catch (error) {
      console.warn('⚠️ Error al parsear fecha de ingreso:', error, 'Fecha original:', fechaIngreso)
      return
    }

    // Obtener fecha actual
    const fechaActual = new Date().toISOString().split('T')[0]

    // Obtener saldo acumulado
    // El saldo acumulado puede venir en diferentes campos:
    // Buscar en múltiples campos posibles de la API
    const saldoAcumuladoRaw = parsedData.saldoAcumulado || 
                              parsedData.saldo_acumulado ||
                              parsedData.saldoAcumuladoEmpleado ||
                              parsedData.saldo_acumulado_empleado ||
                              parsedData.vacation?.saldo_acumulado ||
                              parsedData.vacation?.saldoAcumulado ||
                              parsedData.saldo ||
                              parsedData.saldo_anterior ||
                              parsedData.saldoAnterior ||
                              parsedData.saldo_inicial ||
                              parsedData.saldoInicial
    
    const vacationTotal = parsedData.vacation?.total ? parseFloat(parsedData.vacation.total) : 0
    const vacationTaken = parsedData.vacation?.taken ? parseFloat(parsedData.vacation.taken) : 0
    const vacationAvailable = saldoDisponible || 0
    
    let saldoAcumulado: number
    if (saldoAcumuladoRaw !== undefined && saldoAcumuladoRaw !== null && saldoAcumuladoRaw !== '') {
      saldoAcumulado = parseFloat(String(saldoAcumuladoRaw))
      console.log('✅ Saldo acumulado encontrado en campo específico:', saldoAcumulado)
    } else {
      // Si no hay campo específico, calcular el saldo acumulado
      // El saldo acumulado es el total de días que tenía al inicio de la gestión actual
      // antes de tomar días de vacaciones. Esto incluye días acumulados de gestiones anteriores
      // más los días de la gestión actual.
      // 
      // Si available = 11, total = 30, taken = 19:
      // - available = total - taken = 30 - 19 = 11 ✓ (coincide)
      // 
      // Pero el saldo acumulado podría ser diferente. Si el usuario dice que debería ser 20,
      // entonces tal vez el cálculo es: saldo acumulado = available + taken - diasPorGestion
      // O tal vez viene de un campo específico de la API que no estamos leyendo.
      // 
      // Por ahora, vamos a intentar calcularlo como: total - taken + X
      // donde X podría ser días acumulados de gestiones anteriores.
      // 
      // Alternativa: Si el usuario quiere que sea 20, y tenemos total=30, taken=19, available=11,
      // entonces: saldo acumulado = 20 podría ser el total de días que tenía ANTES de esta gestión.
      // 
      // Vamos a usar una lógica: si available + taken = total, entonces el saldo acumulado
      // podría ser el available (días disponibles actuales) más algún ajuste.
      // 
      // Pero según las reglas, el saldo acumulado es el que se usa para calcular mínimo y máximo.
      // Si el usuario dice que debería ser 20, entonces tal vez:
      // - El saldo acumulado es un campo que viene de la API y representa días de gestiones anteriores
      // - O se calcula de manera diferente
      
      // TEMPORAL: Intentar calcular el saldo acumulado de manera alternativa
      // Si el usuario dice que debería ser 20 y tenemos available=11, total=30, taken=19,
      // entonces tal vez el saldo acumulado es: available + (total - available - taken)
      // O tal vez es simplemente un campo que viene de la API con otro nombre
      
      // Por ahora, vamos a usar una lógica alternativa:
      // Si available + taken < total, entonces hay días acumulados de gestiones anteriores
      // saldo acumulado = available + (total - available - taken) = available + días_acumulados_anteriores
      // Pero esto no funciona si available + taken = total
      
      // Otra posibilidad: el saldo acumulado es el total de días que tenía ANTES de tomar los días de esta gestión
      // Si tiene 30 días por gestión y ha tomado 19, pero el saldo acumulado es 20,
      // entonces tal vez tenía 20 días acumulados + 30 días de esta gestión = 50 días totales
      // y ha tomado 19, quedando 31 disponibles... pero eso no coincide con available=11
      
      // INTENTO DE CALCULAR EL SALDO ACUMULADO CORRECTO
      // El usuario indica que debería ser 20, no 11 (available)
      // 
      // Posibilidades:
      // 1. El saldo acumulado viene en un campo específico de la API (no encontrado aún)
      // 2. El saldo acumulado se calcula de manera diferente
      // 
      // Si available=11, total=30, taken=19:
      // - available = total - taken = 30 - 19 = 11 ✓
      // 
      // Si el saldo acumulado debería ser 20:
      // - Podría ser: total - taken + días_acumulados_anteriores
      // - O podría ser un campo específico de la API
      // 
      // Por ahora, vamos a intentar usar el total como saldo acumulado si es razonable
      // O usar una fórmula alternativa basada en los datos disponibles
      
      // OPCIÓN 1: Usar total como saldo acumulado (si tiene sentido)
      // Pero esto no tiene sentido porque el total son los días por gestión, no el acumulado
      
      // OPCIÓN 2: Calcular como: available + (total - available - taken)
      // Esto daría: 11 + (30 - 11 - 19) = 11 + 0 = 11 (no funciona)
      
      // OPCIÓN 3: El saldo acumulado podría ser el total de días que tenía ANTES de esta gestión
      // Si el usuario quiere que sea 20, tal vez es un campo específico que no estamos leyendo
      
      // TEMPORAL: Intentar calcular el saldo acumulado de manera alternativa
      // Si el usuario necesita que sea 20 y tenemos available=11, total=30, taken=19,
      // tal vez el saldo acumulado es el total menos los días tomados de esta gestión específica,
      // más días acumulados de gestiones anteriores.
      // 
      // Por ahora, vamos a intentar usar el total como referencia si es razonable,
      // o calcular de otra manera según los datos disponibles.
      
      // Si el usuario indica que debería ser 20, y tenemos estos datos:
      // - available = 11 (días disponibles actuales)
      // - total = 30 (días por gestión)
      // - taken = 19 (días tomados)
      // 
      // El saldo acumulado podría ser:
      // - Un campo específico de la API (no encontrado aún)
      // - Calculado como: total - taken + días_acumulados_anteriores
      // 
      // Por ahora usar available como fallback
      saldoAcumulado = vacationAvailable
      
      // Si el usuario necesita un valor específico (ej: 20), debe indicar:
      // 1. El nombre del campo en la API que contiene ese valor, O
      // 2. Cómo se calcula ese valor a partir de los campos disponibles
      
      // Log mínimo solo en desarrollo (sin imprimir objetos completos)
      if (import.meta.env.DEV) {
        const camposRelevantes = Object.keys(parsedData).filter(k => 
          k.toLowerCase().includes('saldo') || 
          k.toLowerCase().includes('acumulado') ||
          k.toLowerCase().includes('balance')
        )
        console.warn('⚠️ Saldo acumulado no encontrado. Usando available:', {
          available: vacationAvailable,
          total: vacationTotal,
          taken: vacationTaken,
          camposRelevantes: camposRelevantes
          // NO imprimir parsedData completo para evitar errores 429
        })
      }
    }

    // Obtener días por gestión (15, 20 o 30)
    // Si está disponible en los datos, usarlo; si no, la función lo calculará según antigüedad
    const diasPorGestionRaw = parsedData.diasPorGestion || 
                              parsedData.dias_por_gestion || 
                              parsedData.diasPorGestionEmpleado ||
                              parsedData.vacation_days ||
                              parsedData.vacation?.total ||
                              null // No usar valor por defecto, dejar que la función lo calcule

    // Asegurar que sea 15, 20 o 30 si está disponible
    let diasPorGestion: 15 | 20 | 30 | undefined = undefined
    if (diasPorGestionRaw !== null && diasPorGestionRaw !== undefined) {
      const diasNum = parseInt(String(diasPorGestionRaw))
      if (diasNum === 20) {
        diasPorGestion = 20
      } else if (diasNum === 30) {
        diasPorGestion = 30
      } else if (diasNum === 15) {
        diasPorGestion = 15
      }
      // Si no es ninguno de estos valores, dejar undefined para que la función lo calcule
    }

    // Calcular el rango de vacaciones
    // Si diasPorGestion no está disponible, la función lo calculará según antigüedad:
    // 1 a 5 años: 15 días
    // 5 a 10 años: 20 días
    // Más de 10 años: 30 días
    const rango = calcularRangoVacaciones({
      fechaIngreso: fechaIngresoFormateada,
      fechaActual: fechaActual,
      saldoAcumulado: saldoAcumulado,
      ...(diasPorGestion !== undefined && { diasPorGestion }) // Solo incluir si está definido
    })

    vacationRange.value = rango

    console.log('📊 Rango de vacaciones calculado:', rango)
  } catch (error) {
    console.error('❌ Error al calcular rango de vacaciones:', error)
  }
}

// Notification helper
const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string, duration = 5000) => {
  notification.value = { show: true, type, title, message }
  setTimeout(() => {
    notification.value.show = false
  }, duration)
}

// Handle validation errors from VacationRequestForm
const handleValidationError = (message: string) => {
  showNotification('error', 'Error de validación', message, 5000)
}

// Función para confirmar y enviar programación
const confirmSubmitProgrammed = () => {
  showConfirmModal.value = false
  handleRequestSubmit({ type: 'programmed' })
}

// Methods
const handleDateSelect = (dates: Date[], selections: any[]) => {
  selectedDates.value = dates
  daySelections.value = selections
  console.log('📅 Fechas seleccionadas:', dates)
  console.log('🔄 Selecciones con turnos:', selections)
  if (dates.length > 0) {
    showForm.value = true
  }
}

const handleRequestSubmit = async (request: any) => {
  // Validaciones previas
  if (isSubmittingRequest.value) {
    showNotification('info', 'Solicitud en proceso', 'Ya hay una solicitud en proceso. Por favor espera.', 3000)
    return
  }

  // Validar datos del empleado
  if (!employeeData.value) {
    showNotification('error', 'Datos no disponibles', 'No se han cargado tus datos de empleado. Por favor recarga la página.', 5000)
    return
  }

  // Validar manager
  if (!employeeData.value?.manager?.id_manager) {
    showNotification('error', 'Jefe no encontrado', 'No se encontró tu jefe directo. Contacta a RRHH.', 5000)
    return
  }

  // Validar fechas seleccionadas
  if (!selectedDates.value || selectedDates.value.length === 0) {
    showNotification('error', 'Fechas requeridas', 'Debes seleccionar al menos una fecha.', 3000)
    return
  }

  // Validar que haya selecciones de días con turnos
  if (!daySelections.value || daySelections.value.length === 0) {
    showNotification('error', 'Selecciones inválidas', 'No se detectaron selecciones de días válidas.', 3000)
    return
  }

  // Validar tipo de vacación (solo si no es programadas)
  if (request.type !== 'programmed' && !request.type) {
    showNotification('error', 'Tipo requerido', 'Debes seleccionar el tipo de vacación.', 3000)
    return
  }

  // VALIDACIÓN ESPECIAL: Si es vacaciones programadas, verificar que no haya programado antes
  if (request.type === 'programmed') {
    const hasProgrammedVacations = requests.value.some((req: any) => {
      // Verificar si tiene vacaciones programadas en cualquier estado (excepto rechazadas)
      return req.tipo === 'PROGRAMADA' && 
             req.estado !== 'RECHAZADO' && 
             req.estado !== 'rejected'
    })

    if (hasProgrammedVacations) {
      showNotification(
        'error', 
        'Ya programaste tus vacaciones', 
        'Solo puedes programar tus vacaciones una vez por año. Si necesitas modificar tus fechas, contacta a RRHH o a tu jefe directo.', 
        8000
      )
      return
    }
  }

  // Validar reemplazantes SOLO si NO es programadas
  if (request.type !== 'programmed' && (!request.replacements || request.replacements.length === 0)) {
    showNotification('error', 'Reemplazante requerido', 'Debes seleccionar al menos un reemplazante.', 3000)
    return
  }

  // Validar rango de vacaciones según las reglas de la empresa
  const totalDays = calculateTotalDays(daySelections.value)
  if (vacationRange.value) {
    if (totalDays < vacationRange.value.minimo) {
      showNotification(
        'error',
        'Días insuficientes',
        `Debes solicitar al menos ${vacationRange.value.minimo.toFixed(1)} días según las reglas de la empresa.`,
        6000
      )
      return
    }
    if (totalDays > vacationRange.value.maximo) {
      showNotification(
        'error',
        'Días excedidos',
        `No puedes solicitar más de ${vacationRange.value.maximo.toFixed(1)} días según las reglas de la empresa.`,
        6000
      )
      return
    }
  }

  // Mostrar notificación de confirmación ANTES de enviar
  const vacationType = request.type === 'programmed' ? 'programadas' : 'a cuenta'
  showNotification(
    'info',
    'Enviando solicitud...',
    `Procesando solicitud de ${totalDays.toFixed(1)} día(s) de vacaciones ${vacationType}. Por favor espera.`,
    4000
  )
  
  // Cerrar modal de confirmación antes de enviar
  showConfirmModal.value = false

  isSubmittingRequest.value = true

  try {
    // 1. Preparar datos según el formato de la API
    // Encontrar los reemplazantes seleccionados (solo si no es programadas)
    let selectedReplacements: any[] = []
    
    if (request.type !== 'programmed') {
      selectedReplacements = employeeData.value?.replacements?.filter(
        (r: any) => request.replacements.includes(r.id)
      ) || []

      if (selectedReplacements.length === 0) {
        throw new Error('Los reemplazantes seleccionados no son válidos.')
      }
    }

    console.log('📤 Preparando solicitud de vacaciones...')

    // Si es vacaciones programadas, enviar UNA solicitud por fecha
    if (request.type === 'programmed') {
      console.log('📅 Enviando vacaciones programadas - una solicitud por fecha (en paralelo)')
      
      // Preparar todas las solicitudes
      const solicitudes = daySelections.value.map(selection => {
        let turno = 'COMPLETO'
        if (selection.type === 'morning') turno = 'MAÑANA'
        else if (selection.type === 'afternoon') turno = 'TARDE'

        const fechaStr = selection.date.toISOString().split('T')[0]
        
        const payload = {
          emp_id: employeeData.value?.empID || currentUser.value.id,
          tipo: 'PROGRAMADA',
          comentario: request.reason || `Vacación programada para ${fechaStr}`,
          manager_id: employeeData.value?.manager?.id_manager,
          antiguedad: employeeData.value?.vacation?.years || '1',
          detalle: [{
            fecha: fechaStr,
            turno: turno,
            observacion: null
          }],
          reemplazantes: []
        }

        return { fechaStr, payload }
      })

      console.log(`📦 Preparando ${solicitudes.length} solicitudes para enviar con throttling`)

      // Función helper para enviar una solicitud con reintentos
      const enviarSolicitudConReintentos = async ({ fechaStr, payload }: { fechaStr: string, payload: any }, maxReintentos = 3): Promise<{ fechaStr: string, success: boolean, result?: any }> => {
        let intento = 0
        
        while (intento < maxReintentos) {
          try {
            const controller = new AbortController()
            // Timeout de 60 segundos para cada solicitud
            const timeoutId = setTimeout(() => controller.abort(), 60000)

            // 1️⃣ PRIMERO: Enviar a Laravel para guardar en BD
            console.log(`🌐 [${fechaStr}] Enviando a Laravel para guardar en BD... (intento ${intento + 1}/${maxReintentos})`)
            const laravelUrl = 'http://190.171.225.68:8006/api/store-vacation'
            
            const laravelResponse = await fetch(laravelUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
              signal: controller.signal
            }).catch((fetchError: any) => {
              console.error(`❌ [${fechaStr}] Error de red al conectar con Laravel:`, fetchError)
              if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
                throw { 
                  fechaStr, 
                  error: new Error(`No se pudo conectar al servidor Laravel. Verifica que el servidor esté corriendo en ${laravelUrl}`), 
                  tipo: 'network_error',
                  originalError: fetchError.message
                }
              }
              throw { fechaStr, error: fetchError, tipo: 'network_error' }
            })

            if (!laravelResponse.ok) {
              // Si es error 429 (Too Many Requests), esperar y reintentar
              if (laravelResponse.status === 429) {
                const retryAfter = parseInt(laravelResponse.headers.get('Retry-After') || '5')
                const delay = Math.min(retryAfter * 1000, (intento + 1) * 2000) // Máximo 2s por intento
                
                console.warn(`⚠️ [${fechaStr}] Error 429 - Esperando ${delay}ms antes de reintentar...`)
                
                if (intento < maxReintentos - 1) {
                  await new Promise(resolve => setTimeout(resolve, delay))
                  intento++
                  continue // Reintentar
                } else {
                  // Último intento falló
                  let errorData: any = {}
                  try {
                    errorData = await laravelResponse.json()
                  } catch (e) {
                    errorData = { message: `Error HTTP 429: Too Many Requests` }
                  }
                  const errorMessage = errorData.message || `Error HTTP 429: Too Many Requests para ${fechaStr}`
                  throw { fechaStr, error: new Error(errorMessage), tipo: 'http_error', status: 429 }
                }
              } else {
                // Otro error HTTP, no reintentar
                let errorData: any = {}
                try {
                  errorData = await laravelResponse.json()
                } catch (e) {
                  errorData = { message: `Error HTTP ${laravelResponse.status}: ${laravelResponse.statusText}` }
                }
                const errorMessage = errorData.message || `Error al guardar solicitud en BD para ${fechaStr} (${laravelResponse.status})`
                console.error(`❌ [${fechaStr}] Error HTTP de Laravel:`, errorMessage)
                throw { fechaStr, error: new Error(errorMessage), tipo: 'http_error', status: laravelResponse.status }
              }
            }

            const laravelResult = await laravelResponse.json().catch(() => ({}))
            console.log(`✅ [${fechaStr}] Solicitud guardada en BD:`, laravelResult)

            // 2️⃣ SEGUNDO: Enviar notificación al bot de WhatsApp (no bloquea si falla)
            try {
              const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'
              const botUrl = `${BOT_URL}/api/store-vacation`
              
              console.log(`📱 [${fechaStr}] Enviando notificación de WhatsApp...`)
              await fetch(botUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal
              })
              console.log(`✅ [${fechaStr}] Notificación de WhatsApp enviada`)
            } catch (botError: any) {
              console.warn(`⚠️ [${fechaStr}] No se pudo enviar notificación de WhatsApp:`, botError)
              // No fallar la operación si las notificaciones fallan
            }

            clearTimeout(timeoutId)
            return { fechaStr, success: true, result: laravelResult }
          } catch (error: any) {
            console.error(`❌ Error al enviar solicitud para ${fechaStr} (intento ${intento + 1}):`, error)
            
            // Si es un error de aborto, dar más información
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
              throw { fechaStr, error: new Error(`Timeout: El servidor tardó demasiado en responder para ${fechaStr}`), tipo: 'timeout' }
            }
            
            // Si ya tiene fechaStr y no es 429, lanzar error inmediatamente
            if (error.fechaStr && error.status !== 429) {
              throw error
            }
            
            // Si es 429 y aún hay reintentos disponibles, continuar el loop
            if (error.status === 429 && intento < maxReintentos - 1) {
              intento++
              continue
            }
            
            // Si no es 429 o se agotaron los reintentos, lanzar error
            throw { fechaStr, error, tipo: 'unknown' }
          }
        }
        
        // Si llegamos aquí, todos los reintentos fallaron
        throw { fechaStr, error: new Error(`Error después de ${maxReintentos} intentos`), tipo: 'max_retries_exceeded' }
      }

      // Enviar solicitudes en lotes con delay entre lotes para evitar rate limiting
      const TAMANO_LOTE = 5 // Enviar 5 solicitudes a la vez
      const DELAY_ENTRE_LOTES = 500 // 500ms entre lotes
      const DELAY_ENTRE_SOLICITUDES = 100 // 100ms entre solicitudes dentro del mismo lote
      
      const resultados: PromiseSettledResult<any>[] = []
      
      for (let i = 0; i < solicitudes.length; i += TAMANO_LOTE) {
        const lote = solicitudes.slice(i, i + TAMANO_LOTE)
        const indiceLote = Math.floor(i / TAMANO_LOTE) + 1
        const totalLotes = Math.ceil(solicitudes.length / TAMANO_LOTE)
        
        console.log(`📦 Enviando lote ${indiceLote}/${totalLotes} (${lote.length} solicitudes)`)
        
        // Enviar solicitudes del lote con pequeño delay entre cada una
        const promesasLote = lote.map(async (solicitud, index) => {
          if (index > 0) {
            // Esperar un pequeño delay antes de enviar la siguiente solicitud del mismo lote
            await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_SOLICITUDES))
          }
          return enviarSolicitudConReintentos(solicitud)
        })
        
        // Esperar a que todas las solicitudes del lote se completen
        const resultadosLote = await Promise.allSettled(promesasLote)
        resultados.push(...resultadosLote)
        
        // Esperar antes de enviar el siguiente lote (excepto si es el último)
        if (i + TAMANO_LOTE < solicitudes.length) {
          console.log(`⏳ Esperando ${DELAY_ENTRE_LOTES}ms antes del siguiente lote...`)
          await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_LOTES))
        }
      }
      
      // Separar éxitos y errores
      const exitosos = resultados.filter(r => r.status === 'fulfilled')
      const errores = resultados.filter(r => r.status === 'rejected')
      
      console.log(`📊 Resultados: ${exitosos.length} exitosos, ${errores.length} con errores`)
      
      // Si hay errores, mostrar información detallada
      if (errores.length > 0) {
        const detallesErrores = errores.map(e => {
          if (e.status === 'rejected') {
            const reason = e.reason
            const fechaStr = reason?.fechaStr || 'fecha desconocida'
            const mensaje = reason?.error?.message || reason?.message || 'Error desconocido'
            console.error(`❌ Error en ${fechaStr}:`, mensaje)
            return `${fechaStr} (${mensaje})`
          }
        }).filter(Boolean)
        
        // Si todas fallaron, lanzar error
        if (errores.length === solicitudes.length) {
          throw new Error(`Todas las solicitudes fallaron. Errores: ${detallesErrores.join('; ')}`)
        }
        
        // Si algunas fallaron, mostrar advertencia pero continuar
        console.warn(`⚠️ ${errores.length} solicitud(es) fallaron:`, detallesErrores)
        showNotification(
          'info',
          'Algunas solicitudes fallaron',
          `${exitosos.length} solicitud(es) enviada(s) exitosamente, pero ${errores.length} fallaron. Revisa la consola para más detalles.`,
          10000
        )
      }
      
      if (exitosos.length > 0) {
        console.log(`✅ ${exitosos.length} solicitud(es) fueron enviadas exitosamente`)
        
        // Recargar solicitudes del empleado para actualizar el calendario
        if (employeeData.value?.empID) {
          await fetchEmployeeVacationRequests(employeeData.value.empID)
        }
        
        // Mostrar notificación de éxito solo si hay éxitos
        if (errores.length === 0) {
          // Todas fueron exitosas
          showNotification(
            'success', 
            '¡Solicitudes enviadas exitosamente!', 
            `${exitosos.length} solicitud(es) de vacaciones programadas enviada(s). Tu jefe recibirá la notificación para revisarlas.`, 
            8000
          )
        } else {
          // Algunas fueron exitosas, ya se mostró la advertencia arriba
          console.log(`✅ ${exitosos.length} solicitud(es) exitosas, ${errores.length} fallaron`)
        }
      }
      
      // Resetear formulario
      showForm.value = false
      selectedDates.value = []
      daySelections.value = []
      
      isSubmittingRequest.value = false
      
      // Cerrar modal si está abierto
      showConfirmModal.value = false
      
      return
    }

    // Calcular días totales considerando medio día = 0.5
    const calcularDiasTotales = (selections: any[]): number => {
      return selections.reduce((total, selection) => {
        if (selection.type === 'full' || !selection.type) {
          return total + 1
        }
        if (selection.type === 'morning' || selection.type === 'afternoon') {
          return total + 0.5
        }
        return total + 1
      }, 0)
    }
    
    const diasTotales = calcularDiasTotales(daySelections.value)
    
    // Si NO es programadas, enviar todo junto (comportamiento anterior)
    const payload = {
      emp_id: employeeData.value?.empID || currentUser.value.id,
      tipo: 'A_CUENTA',
      comentario: request.reason || 'Solicitud de vacaciones',
      manager_id: employeeData.value?.manager?.id_manager,
      antiguedad: employeeData.value?.vacation?.years || '1',
      total_dias: diasTotales.toString(), // Agregar total_dias calculado

      // Detalle de días - usar daySelections para enviar cada fecha con su turno
      detalle: daySelections.value.map((selection: any) => {
        let turno = 'COMPLETO'
        if (selection.type === 'morning') turno = 'MAÑANA'
        else if (selection.type === 'afternoon') turno = 'TARDE'

        return {
          fecha: selection.date.toISOString().split('T')[0], // Formato: YYYY-MM-DD
          turno: turno,
          observacion: null
        }
      }),

      // Reemplazantes
      reemplazantes: selectedReplacements.map((rep: any) => ({
        emp_id: rep.id,
        nombre: rep.name,
        cargo: rep.cargo,
        telefono: rep.phone,
        tipo: rep.type
      }))
    }

    console.log('📤 Enviando solicitud a la API:', payload)

    // 2. Enviar a la API con timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

    // 1️⃣ PRIMERO: Enviar a Laravel para guardar en BD
    const response = await fetch('http://190.171.225.68:8006/api/store-vacation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // Manejar errores de red o servidor
    if (!response.ok) {
      let errorMessage = `Error del servidor (${response.status})`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // Si no se puede parsear el JSON, usar el status text
        errorMessage = `${errorMessage}: ${response.statusText}`
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()

    if (result.status === 'success') {
      console.log('✅ Solicitud creada exitosamente en BD:', result.solicitud_id)

      // 2️⃣ SEGUNDO: Enviar notificación al bot de WhatsApp
      try {
        // Usa VITE_BACKEND_URL del .env (localhost:3005 en dev, 190.171.225.68:8006:3005 en prod)
        const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'

        await fetch(`${BOT_URL}/api/store-vacation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })
        console.log('✅ Notificación de WhatsApp enviada al jefe')
      } catch (botError) {
        console.warn('⚠️ No se pudo enviar notificación de WhatsApp:', botError)
        // No fallar la operación si las notificaciones fallan
      }

      // Recargar solicitudes del empleado para actualizar el calendario
      if (employeeData.value?.empID) {
        await fetchEmployeeVacationRequests(employeeData.value.empID)
      }

      // 3. Guardar en localStorage para el historial local
      const newRequest = {
        ...request,
        id: `REQ-${result.solicitud_id}`,
        solicitud_id: result.solicitud_id,
        employeeId: currentUser.value.id,
        employeeName: currentUser.value.name,
        department: currentUser.value.department,
        company: currentUser.value.company,
        status: 'pending',
        createdAt: new Date().toISOString(),
        impactsBalance: false,
      }

      const updatedRequests = [...requests.value, newRequest]
      requests.value = updatedRequests
      localStorage.setItem('vacation-requests', JSON.stringify(updatedRequests))

      // 4. Limpiar formulario
      selectedDates.value = []
      daySelections.value = []
      showForm.value = false

      // 5. Mostrar mensaje de éxito con detalles
      showNotification(
        'success',
        '¡Solicitud enviada exitosamente!',
        `ID: ${result.solicitud_id}. Tu jefe recibirá la notificación por WhatsApp para revisarla.`,
        8000
      )

      // Cerrar modal si está abierto
      showConfirmModal.value = false

      // Cambiar a la vista de solicitudes después de 2 segundos
      setTimeout(() => {
        activeView.value = 'requests'
      }, 2000)
    } else {
      throw new Error(result.message || 'Error al crear la solicitud')
    }
  } catch (error: any) {
    console.error('❌ Error al enviar solicitud:', error)

    // Mensajes de error específicos según el tipo
    let userMessage = 'Error al enviar la solicitud. '

    if (error.name === 'AbortError') {
      userMessage += 'La solicitud tardó demasiado tiempo. Verifica tu conexión a internet e intenta nuevamente.'
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      userMessage += 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    } else if (error.message.includes('500')) {
      userMessage += 'Error interno del servidor. Por favor contacta al equipo de TI.'
    } else if (error.message.includes('400')) {
      userMessage += 'Datos inválidos. Verifica que todos los campos estén correctos.'
    } else if (error.message.includes('404')) {
      userMessage += 'El servicio de vacaciones no está disponible. Contacta a TI.'
    } else {
      userMessage += error.message || 'Por favor intenta nuevamente o contacta a soporte.'
    }

    showNotification('error', 'Error al enviar solicitud', userMessage, 8000)
  } finally {
    isSubmittingRequest.value = false
  }
}


const handleTakeVacation = async (data: string | { requestId: string, replacements: string[] }) => {
  try {
    const requestId = typeof data === 'string' ? data : data.requestId
    const replacements = typeof data === 'object' ? data.replacements : []
    
    console.log('📍 Tomar vacaciones - Request ID:', requestId)
    console.log('📍 Tomar vacaciones - Reemplazantes:', replacements)
    
    // Aquí deberías llamar a la API para activar la solicitud de vacaciones programadas
    // Por ahora, solo mostramos una notificación
    showNotification('success', 'Vacaciones activadas', `Con ${replacements.length} reemplazante(s) seleccionado(s)`, 5000)
    
    // TODO: Llamar a la API real aquí
    // const response = await fetch(`http://localhost:3005/api/take-vacation`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     requestId, 
    //     replacements,
    //     empId: employeeData.value?.empID || currentUser.value.id
    //   })
    // })
  } catch (error) {
    console.error('Error taking vacation:', error)
    showNotification('error', 'Error al activar', 'Error al activar las vacaciones. Intenta nuevamente.', 5000)
  }
}

const handleRequestUpdate = (updatedRequests: any[]) => {
  requests.value = updatedRequests
  localStorage.setItem('vacation-requests', JSON.stringify(updatedRequests))
}

// Cargar configuración desde el backend
const loadVacationConfig = async () => {
  try {
    const response = await fetch('http://localhost:3005/vacation-config')
    const result = await response.json()

    if (result.success && result.data) {
      programmedVacationsEnabled.value = result.data.programmedVacationsEnabled
      console.log('✅ VacationRequest - Configuración cargada desde backend:', result.data)
    }
  } catch (error) {
    console.error('❌ VacationRequest - Error al cargar configuración:', error)
    // Valor por defecto en caso de error
    programmedVacationsEnabled.value = true
  }
}

// Cargar versión de la aplicación
const loadAppVersion = async () => {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      appVersion.value = data.version
    }
  } catch (error) {
    console.warn('No se pudo cargar la versión:', error)
  }
}

// Lifecycle
onMounted(async () => {
  // Cargar versión
  loadAppVersion()
  
  // Cargar configuración desde backend SIEMPRE (sin bypass)
  await loadVacationConfig()
  
  // Auto-ocultar el badge después de 10 segundos
  autoHideBadge()

  // Si viene desde el bot, cargar datos del empleado
  const dataParam = route.query.data as string
  const tabParam = route.query.tab as string
  
  console.log('🔍 DEBUG - Parámetros de URL:', {
    dataParam,
    tabParam,
    fullQuery: route.query,
    fullPath: route.fullPath
  })
  
  if (dataParam) {
    console.log('✅ Viene del bot')
    console.log('📱 Parámetro data recibido:', dataParam)
    console.log('📋 Parámetro tab recibido:', tabParam)
    console.log('⚙️ programmedVacationsEnabled:', programmedVacationsEnabled.value)
    // Llamar a la nueva función que consulta la API
    await fetchEmployeeData(dataParam)
    
    // Después de cargar los datos, verificar si hay un tab específico solicitado
    if (tabParam) {
      console.log('🎯 Cambiando al tab solicitado:', tabParam)
      // Usar setTimeout para asegurar que se ejecute después de que el componente esté completamente montado
      setTimeout(() => {
        switch (tabParam.toLowerCase()) {
          case 'aprobar':
          case 'boss':
            if (currentUser.value.role === 'boss') {
              activeView.value = 'boss'
              console.log('✅ Cambiado al tab de aprobación')
            } else {
              console.log('⚠️ Usuario no es jefe, manteniendo tab por defecto')
            }
            break
          case 'historial':
          case 'requests':
            activeView.value = 'requests'
            console.log('✅ Cambiado al tab de historial')
            break
          case 'solicitar':
          case 'calendar':
            activeView.value = 'calendar'
            console.log('✅ Cambiado al tab de solicitar')
            break
          default:
            console.log('⚠️ Tab no reconocido:', tabParam)
        }
      }, 100) // Pequeño delay para asegurar que el componente esté montado
    } else {
      console.log('⚠️ No hay parámetro tab, usando vista por defecto')
      // Si no hay tab específico, usar la vista por defecto basada en el rol
      if (currentUser.value.role === 'boss') {
        activeView.value = 'boss'
        console.log('✅ Usuario es jefe, cambiando a vista de aprobación por defecto')
      } else {
        activeView.value = 'calendar'
        console.log('✅ Usuario es empleado, cambiando a vista de solicitar por defecto')
      }
    }
  }

  // Cargar solicitudes guardadas desde localStorage (fallback)
  const savedRequests = localStorage.getItem('vacation-requests')
  if (savedRequests) {
    requests.value = JSON.parse(savedRequests)
  }

  // Cargar solicitudes del empleado desde la API si tenemos empID
  if (employeeData.value?.empID) {
    await fetchEmployeeVacationRequests(employeeData.value.empID)
  } else if (currentUser.value.id && currentUser.value.id !== 'user-1') {
    // Si no es el usuario por defecto, intentar cargar
    await fetchEmployeeVacationRequests(currentUser.value.id)
  }
})

// Función para cargar las solicitudes de vacaciones del empleado desde la API
const fetchEmployeeVacationRequests = async (empId: string) => {
  try {
    console.log('📡 Cargando solicitudes de vacaciones del empleado:', empId)
    const url = `http://190.171.225.68:8006/api/vacacion-data-empleado?emp_id=${empId}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn('⚠️ Error al cargar solicitudes del empleado:', response.status)
      return
    }

    const data = await response.json()
    
    if (data.success && Array.isArray(data.data)) {
      // Formatear las solicitudes para que el calendario las entienda
      const formattedRequests = data.data.map((req: any) => {
        // Si tiene fechas array, asegurarse de que esté en el formato correcto
        let fechas: any[] = []
        if (req.fechas && Array.isArray(req.fechas)) {
          fechas = req.fechas.map((f: any) => {
            if (typeof f === 'string') {
              return { fecha: f, turno: 'COMPLETO' }
            }
            return f
          })
        } else if (req.fechas_agrupadas && Array.isArray(req.fechas_agrupadas)) {
          fechas = req.fechas_agrupadas.map((f: string) => ({
            fecha: f,
            turno: 'COMPLETO'
          }))
        }
        
        return {
          ...req,
          fechas: fechas,
          tipo: req.tipo || 'A_CUENTA',
          estado: req.estado || 'PROCESO'
        }
      })
      
      requests.value = formattedRequests
      console.log('✅ Solicitudes del empleado cargadas:', formattedRequests.length)
      console.log('📋 Solicitudes:', formattedRequests)
      
      // También actualizar localStorage como respaldo
      localStorage.setItem('vacation-requests', JSON.stringify(formattedRequests))
    }
  } catch (error) {
    console.error('❌ Error al cargar solicitudes del empleado:', error)
  }
}

// Watch para el parámetro tab de la URL
watch(() => route.query.tab, async (newTab) => {
  console.log('🔍 DEBUG - Watch detectó cambio en tab:', newTab)
  if (newTab && typeof newTab === 'string') {
    console.log('🎯 Parámetro tab detectado desde watch:', newTab)
    // Usar nextTick para asegurar que el DOM esté actualizado
    await nextTick()
    setTimeout(() => {
      switch (newTab.toLowerCase()) {
        case 'aprobar':
        case 'boss':
          if (currentUser.value.role === 'boss') {
            activeView.value = 'boss'
            console.log('✅ Cambiado al tab de aprobación desde watch')
          } else {
            console.log('⚠️ Usuario no es jefe, manteniendo tab por defecto')
          }
          break
        case 'historial':
        case 'requests':
          activeView.value = 'requests'
          console.log('✅ Cambiado al tab de historial desde watch')
          break
        case 'solicitar':
        case 'calendar':
          activeView.value = 'calendar'
          console.log('✅ Cambiado al tab de solicitar desde watch')
          break
        default:
          console.log('⚠️ Tab no reconocido desde watch:', newTab)
      }
    }, 50) // Pequeño delay adicional
  } else {
    console.log('⚠️ No hay parámetro tab en watch, usando vista por defecto')
    // Si no hay tab específico, usar la vista por defecto basada en el rol
    await nextTick()
    setTimeout(() => {
      if (currentUser.value.role === 'boss') {
        activeView.value = 'boss'
        console.log('✅ Usuario es jefe, cambiando a vista de aprobación por defecto desde watch')
      } else {
        activeView.value = 'calendar'
        console.log('✅ Usuario es empleado, cambiando a vista de solicitar por defecto desde watch')
      }
    }, 50)
  }
}, { immediate: true })
</script>

<style>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Efectos de WhatsApp */
@keyframes whatsapp-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
}

@keyframes whatsapp-wave {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

@keyframes whatsapp-badge-enter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes whatsapp-badge-exit {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
}

.whatsapp-icon-pulse {
  animation: whatsapp-pulse 2s ease-in-out infinite;
}

.whatsapp-wave {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0) 70%);
  pointer-events: none;
}

.whatsapp-wave-1 {
  animation: whatsapp-wave 2s ease-out infinite;
}

.whatsapp-wave-2 {
  animation: whatsapp-wave 2s ease-out infinite 0.5s;
}

.whatsapp-wave-3 {
  animation: whatsapp-wave 2s ease-out infinite 1s;
}

.whatsapp-badge-container {
  transition: all 0.3s ease;
}

.whatsapp-badge-exit {
  animation: whatsapp-badge-exit 1s ease-out forwards;
}

.whatsapp-number {
  position: relative;
}

.whatsapp-number:hover span {
  color: #059669;
  transform: scale(1.05);
}

/* Transición para el badge completo */
.whatsapp-badge-enter-active {
  animation: whatsapp-badge-enter 0.5s ease-out;
}

.whatsapp-badge-leave-active {
  animation: whatsapp-badge-exit 1s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* CSS Variables for theme support */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.bg-background { background-color: hsl(var(--background)); }
.text-foreground { color: hsl(var(--foreground)); }
.bg-card { background-color: hsl(var(--card)); }
.text-card-foreground { color: hsl(var(--card-foreground)); }
.bg-primary { background-color: hsl(var(--primary)); }
.text-primary-foreground { color: hsl(var(--primary-foreground)); }
.bg-secondary { background-color: hsl(var(--secondary)); }
.text-secondary-foreground { color: hsl(var(--secondary-foreground)); }
.text-muted-foreground { color: hsl(var(--muted-foreground)); }
.bg-accent { background-color: hsl(var(--accent)); }
.text-accent-foreground { color: hsl(var(--accent-foreground)); }
.border-input { border-color: hsl(var(--input)); }
.hover\:bg-primary\/90:hover { background-color: hsl(var(--primary) / 0.9); }
.hover\:bg-accent:hover { background-color: hsl(var(--accent)); }
.hover\:text-accent-foreground:hover { color: hsl(var(--accent-foreground)); }
.hover\:bg-secondary\/80:hover { background-color: hsl(var(--secondary) / 0.8); }
</style>