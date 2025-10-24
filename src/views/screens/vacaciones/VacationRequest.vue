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
          <p :class="[
            'text-sm font-medium',
            notification.type === 'success' ? 'text-green-900' : '',
            notification.type === 'error' ? 'text-red-900' : '',
            notification.type === 'info' ? 'text-blue-900' : ''
          ]">
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
          <div>
            <h1 class="text-xl font-bold text-balance">Mis Vacaciones</h1>
            <p class="text-sm text-muted-foreground">{{ currentUser.company }}</p>
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

    <div class="px-4 md:px-6 py-6 space-y-6 max-w-4xl mx-auto">
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
      <div v-if="activeView === 'calendar'" class="space-y-4">
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
            <h3 class="text-lg font-semibold leading-none tracking-tight">Selecciona tus fechas</h3>
            <p class="text-sm text-muted-foreground">
              Toca las fechas que quieres solicitar. Se enviarán como vacaciones programadas para aprobación del jefe.
            </p>
          </CardHeader>
          <CardContent>
            <VacationCalendar
              :selected-dates="selectedDates"
              @date-select="handleDateSelect"
              :existing-requests="requests"
            />
          </CardContent>
        </Card>

        <div v-if="showForm" class="animate-slide-up">
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
      </div>

      <!-- Requests View -->
      <div v-if="activeView === 'requests'" class="space-y-4">
        <RequestsList
          :emp-id="employeeData?.empID || currentUser.id"
          @take-vacation="handleTakeVacation"
        />
      </div>

      <!-- Boss View -->
      <div v-if="activeView === 'boss' && currentUser.role === 'boss'" class="space-y-4">
        <!-- Panel de Aprobación -->
        <BossApprovalPanel
          :manager-id="employeeData?.empID || currentUser.id"
          @request-update="handleRequestUpdate"
        />
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

        <!-- Datos completos del empleado (Debug) -->
        <Card v-if="employeeData">
          <CardHeader>
            <h3 class="text-lg font-semibold leading-none tracking-tight">Datos Completos (Debug)</h3>
            <p class="text-sm text-muted-foreground">Información recibida desde el bot de WhatsApp</p>
          </CardHeader>
          <CardContent>
            <div class="bg-muted p-4 rounded-md overflow-auto">
              <pre class="text-xs">{{ JSON.stringify(employeeData, null, 2) }}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Fixed Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-inset md:left-64">
      <div :class="`grid ${currentUser.role === 'boss' ? 'grid-cols-4' : 'grid-cols-3'} gap-1 p-2`">
        <button
          @click="activeView = 'calendar'"
          :class="[
            'h-12 flex flex-col gap-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            activeView === 'calendar'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <CalendarDays class="h-4 w-4" />
          <span class="text-xs">Calendario</span>
        </button>
        <button
          @click="activeView = 'requests'"
          :class="[
            'h-12 flex flex-col gap-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            activeView === 'requests'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <Clock class="h-4 w-4" />
          <span class="text-xs">Solicitudes</span>
        </button>
        <button
          v-if="currentUser.role === 'boss'"
          @click="activeView = 'boss'"
          :class="[
            'h-12 flex flex-col gap-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            activeView === 'boss'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <CheckCircle class="h-4 w-4" />
          <span class="text-xs">Aprobar</span>
        </button>
        <button
          @click="activeView = 'profile'"
          :class="[
            'h-12 flex flex-col gap-1 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            activeView === 'profile'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <User class="h-4 w-4" />
          <span class="text-xs">Perfil</span>
        </button>
      </div>
    </div>

    <!-- Bottom padding for fixed navigation -->
    <div class="h-20"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CalendarDays, Clock, CheckCircle, User } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import VacationCalendar from '@/components/vacation/VacationCalendar.vue'
import VacationRequestForm from '@/components/vacation/VacationRequestForm.vue'
import RequestsList from '@/components/vacation/RequestsList.vue'
import BossApprovalPanel from '@/components/vacation/BossApprovalPanel.vue'

// Router
const route = useRoute()

// Reactive data
const selectedDates = ref<Date[]>([])
const daySelections = ref<any[]>([])
const requests = ref<any[]>([])
const showForm = ref(false)
const activeView = ref<'calendar' | 'requests' | 'profile' | 'boss'>('calendar')
const employeeData = ref<any>(null)
const programmedVacationsEnabled = ref(true)
const isLoadingData = ref(false)
const isSubmittingRequest = ref(false)
const notification = ref<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({
  show: false,
  type: 'info',
  message: ''
})

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
    const apiUrl = `http://190.171.225.68/api/emp?mobile=${phoneNumber}`
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

    // 3. Actualizar datos del usuario actual con los datos recibidos
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
    }

    console.log('✅ Datos de empleado cargados correctamente')
    showNotification('success', `Bienvenido ${currentUser.value.name}! Tus datos se cargaron correctamente.`, 4000)
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

    showNotification('error', errorMessage, 8000)

    // Si es un error crítico, prevenir que el usuario continúe
    if (!employeeData.value) {
      // Mostrar mensaje en la UI explicando el problema
      activeView.value = 'profile'
    }
  } finally {
    isLoadingData.value = false
  }
}

// Notification helper
const showNotification = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
  notification.value = { show: true, type, message }
  setTimeout(() => {
    notification.value.show = false
  }, duration)
}

// Handle validation errors from VacationRequestForm
const handleValidationError = (message: string) => {
  showNotification('error', message, 5000)
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
    showNotification('info', 'Ya hay una solicitud en proceso. Por favor espera.', 3000)
    return
  }

  // Validar datos del empleado
  if (!employeeData.value) {
    showNotification('error', 'No se han cargado tus datos de empleado. Por favor recarga la página.', 5000)
    return
  }

  // Validar manager
  if (!employeeData.value?.manager?.id_manager) {
    showNotification('error', 'No se encontró tu jefe directo. Contacta a RRHH.', 5000)
    return
  }

  // Validar fechas seleccionadas
  if (!selectedDates.value || selectedDates.value.length === 0) {
    showNotification('error', 'Debes seleccionar al menos una fecha.', 3000)
    return
  }

  // Validar que haya selecciones de días con turnos
  if (!daySelections.value || daySelections.value.length === 0) {
    showNotification('error', 'No se detectaron selecciones de días válidas.', 3000)
    return
  }

  // Validar tipo de vacación
  if (!request.type) {
    showNotification('error', 'Debes seleccionar el tipo de vacación.', 3000)
    return
  }

  // Validar reemplazantes (ahora es un array)
  if (!request.replacements || request.replacements.length === 0) {
    showNotification('error', 'Debes seleccionar al menos un reemplazante.', 3000)
    return
  }

  isSubmittingRequest.value = true

  try {
    // 1. Preparar datos según el formato de la API
    // Encontrar los reemplazantes seleccionados
    const selectedReplacements = employeeData.value?.replacements?.filter(
      (r: any) => request.replacements.includes(r.id)
    ) || []

    if (selectedReplacements.length === 0) {
      throw new Error('Los reemplazantes seleccionados no son válidos.')
    }

    // Preparar payload para la API
    const payload = {
      emp_id: employeeData.value?.empID || currentUser.value.id,
      tipo: request.type === 'programmed' ? 'PROGRAMADA' : 'A_CUENTA',
      comentario: request.reason || 'Solicitud de vacaciones',
      manager_id: employeeData.value?.manager?.id_manager,
      antiguedad: employeeData.value?.vacation?.years || '1',

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

      // Reemplazantes - ahora soporta múltiples
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
    const response = await fetch('http://190.171.225.68/api/store-vacation', {
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
        // Usa VITE_BACKEND_URL del .env (localhost:3005 en dev, 190.171.225.68:3005 en prod)
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
        `¡Solicitud enviada exitosamente! ID: ${result.solicitud_id}. Tu jefe recibirá la notificación para aprobarla.`,
        7000
      )

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

    showNotification('error', userMessage, 8000)
  } finally {
    isSubmittingRequest.value = false
  }
}


const handleTakeVacation = async (requestId: string) => {
  try {
    // Update local state
    const updatedRequests = requests.value.map((req) =>
      req.id === requestId
        ? { ...req, status: 'vacation_account', impactsBalance: true, takenAt: new Date().toISOString() }
        : req,
    )
    requests.value = updatedRequests
    localStorage.setItem('vacation-requests', JSON.stringify(updatedRequests))

    // Update user balance
    const request = requests.value.find((r) => r.id === requestId)
    if (request) {
      currentUser.value.usedDays = currentUser.value.usedDays + request.totalDays
      currentUser.value.vacationBalance = currentUser.value.vacationBalance - request.totalDays
    }
  } catch (error) {
    console.error('Error taking vacation:', error)
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

// Lifecycle
onMounted(async () => {
  // Cargar configuración desde backend SIEMPRE (sin bypass)
  await loadVacationConfig()

  // Si viene desde el bot, cargar datos del empleado
  const dataParam = route.query.data as string
  const tabParam = route.query.tab as string
  
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
    }
  }

  // Cargar solicitudes guardadas
  const savedRequests = localStorage.getItem('vacation-requests')
  if (savedRequests) {
    requests.value = JSON.parse(savedRequests)
  }
})

// Watch para el parámetro tab de la URL
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    console.log('🎯 Parámetro tab detectado:', newTab)
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