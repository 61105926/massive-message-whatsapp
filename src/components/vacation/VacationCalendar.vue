<template>
  <div class="w-full max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <button
        @click="navigateMonth('prev')"
        class="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 md:h-12 md:w-12"
      >
        <ChevronLeft class="h-4 w-4 md:h-6 md:w-6" />
      </button>

      <h2 class="text-lg md:text-xl lg:text-2xl font-semibold">
        {{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}
      </h2>

      <button
        @click="navigateMonth('next')"
        class="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 md:h-12 md:w-12"
      >
        <ChevronRight class="h-4 w-4 md:h-6 md:w-6" />
      </button>
    </div>

    <div class="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
      <input
        id="auto-full-day"
        type="checkbox"
        v-model="autoFullDay"
        class="rounded border-gray-300"
      />
      <label
        for="auto-full-day"
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        📅 Marcar automáticamente como día completo
      </label>
    </div>

    <div class="flex flex-wrap gap-2 mb-4 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-green-500 rounded"></div>
        <span>Disponible</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-purple-400 rounded border-2 border-purple-600"></div>
        <span>Programada</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-red-500 rounded border-2 border-red-700"></div>
        <span>Rechazada</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-blue-500 rounded"></div>
        <span>Seleccionado</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-orange-500 rounded"></div>
        <span>Feriado</span>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 md:gap-2 mb-2">
      <div v-for="day in dayNames" :key="day" class="p-2 md:p-3 text-center text-xs md:text-sm font-medium text-gray-500">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 md:gap-2">
      <div v-for="(date, index) in days" :key="index" class="relative">
        <div v-if="!date" class="p-2 md:p-4"></div>
        <button
          v-else
          @click="handleDateClick(date)"
          :disabled="!isClickable(date)"
          :class="getDateClasses(date)"
          class="w-full aspect-square md:min-h-[60px] lg:min-h-[80px] p-2 md:p-3 text-sm md:text-base rounded-md transition-colors flex flex-col items-center justify-center relative touch-manipulation hover:scale-105 md:hover:scale-110 transform"
        >
          <span class="font-medium">{{ date.getDate() }}</span>
          <div v-if="getDateLabel(date)" class="text-xs font-semibold mt-1 hidden md:block">
            {{ getDateLabel(date) }}
          </div>
          <div v-else-if="isDateSelected(date) && getDayType(date)" class="text-xs md:text-sm mt-1">
            {{ getDayTypeEmoji(getDayType(date)) }}
          </div>
        </button>
      </div>
    </div>

    <div v-if="daySelections.length > 0" class="mt-4 p-3 bg-blue-50 rounded-lg">
      <div class="text-sm font-medium text-blue-900 mb-2">
        {{ totalDays.toFixed(1) }} día(s) seleccionado(s)
      </div>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="selection in daySelections.slice(0, 10)"
          :key="selection.date.toISOString()"
          class="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {{ selection.date.getDate() }}/{{ selection.date.getMonth() + 1 }}
          {{ getDayTypeEmoji(selection.type) }}
        </span>
        <span
          v-if="daySelections.length > 10"
          class="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          +{{ daySelections.length - 10 }} más
        </span>
      </div>
    </div>

    <!-- Day Type Modal -->
    <div
      v-if="showDayTypeModal && selectedDateForType"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeDayTypeModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-sm" @click.stop>
        <h3 class="text-lg font-semibold mb-4 text-center">
          ¿Qué tipo de día quieres el {{ selectedDateForType.getDate() }}?
        </h3>

        <div class="space-y-3">
          <button
            @click="handleDayTypeSelect('morning')"
            class="w-full h-16 text-lg flex items-center justify-center gap-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <Sun class="h-6 w-6" />
            Mañana
          </button>

          <button
            @click="handleDayTypeSelect('afternoon')"
            class="w-full h-16 text-lg flex items-center justify-center gap-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <Sunset class="h-6 w-6" />
            Tarde
          </button>

          <button
            @click="handleDayTypeSelect('full')"
            class="w-full h-16 text-lg flex items-center justify-center gap-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Clock class="h-6 w-6" />
            Todo el día
          </button>
        </div>

        <button
          @click="closeDayTypeModal"
          class="w-full mt-4 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- Modal de información de feriado -->
    <div
      v-if="showHolidayModal && selectedHolidayInfo"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="showHolidayModal = false"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-input" 
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-md bg-orange-100 flex items-center justify-center border border-orange-200">
              <Calendar class="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold leading-none tracking-tight">Feriado</h3>
              <p class="text-sm text-muted-foreground mt-1">Día no laborable</p>
            </div>
          </div>
          <button
            @click="showHolidayModal = false"
            class="text-muted-foreground hover:text-foreground rounded-md hover:bg-accent p-2 transition-colors"
            aria-label="Cerrar"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        
        <!-- Contenido -->
        <div class="space-y-4">
          <!-- Fecha -->
          <div class="p-4 bg-gray-50 rounded-lg border border-input">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Fecha</div>
            <div class="text-xl font-semibold text-foreground">
              {{ formatDate(selectedHolidayInfo.date) }}
            </div>
          </div>
          
          <!-- Nombre del feriado -->
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Se celebra</div>
            <div class="text-lg font-semibold text-foreground leading-tight">
              {{ selectedHolidayInfo.name }}
            </div>
          </div>
          
          <!-- Información adicional -->
          <div class="flex items-start gap-2 pt-2">
            <div class="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0"></div>
            <p class="text-sm text-muted-foreground leading-relaxed">
              Este día no se trabajará según el calendario oficial de Bolivia.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="mt-6 pt-4 border-t">
          <button
            @click="showHolidayModal = false"
            class="w-full rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronLeft, ChevronRight, Sun, Sunset, Clock, X, Calendar } from 'lucide-vue-next'
import { getHolidaysForEmployee, getHolidayName } from '@/data/boliviaHolidays'

interface CalendarProps {
  selectedDates: Date[]
  existingRequests: any[]
  fixedYear?: number // Año fijo para el calendario (ej: 2026)
  employeeRegional?: string // Regional del empleado para mostrar feriados departamentales
}

interface DaySelection {
  date: Date
  type: 'morning' | 'afternoon' | 'full'
}

interface PublicHoliday {
  date: string
  name: string
  type: 'national' | 'regional'
}

const props = withDefaults(defineProps<CalendarProps>(), {
  fixedYear: undefined
})

const emit = defineEmits<{
  dateSelect: [dates: Date[], daySelections: DaySelection[]]
}>()

const currentDate = ref(props.fixedYear ? new Date(props.fixedYear, 0, 1) : new Date())
const showDayTypeModal = ref(false)
const selectedDateForType = ref<Date | null>(null)
const daySelections = ref<DaySelection[]>([])
const autoFullDay = ref(true)
const publicHolidays = ref<PublicHoliday[]>([])
// Estado para el modal de información del feriado
const showHolidayModal = ref(false)
const selectedHolidayInfo = ref<{ date: Date; name: string } | null>(null)

// Función helper para calcular el total de días considerando medio día = 0.5
const calculateTotalDays = (selections: DaySelection[]): number => {
  return selections.reduce((total, selection) => {
    if (selection.type === 'full') {
      return total + 1
    }
    if (selection.type === 'morning' || selection.type === 'afternoon') {
      return total + 0.5
    }
    return total + 1 // default
  }, 0)
}

// Computed para el total de días seleccionados
const totalDays = computed(() => {
  return calculateTotalDays(daySelections.value)
})

// Cargar feriados desde datos locales
const fetchPublicHolidays = async () => {
  try {
    const year = props.fixedYear || new Date().getFullYear()
    // Obtener feriados según el regional del empleado
    const holidays = getHolidaysForEmployee(year, props.employeeRegional)
    publicHolidays.value = holidays.map(h => ({
      date: h.date,
      name: h.name,
      type: h.type
    }))
    console.log(`✅ VacationCalendar: ${publicHolidays.value.length} feriados cargados para ${year}`, {
      regional: props.employeeRegional,
      feriados: publicHolidays.value.map(h => `${h.date}: ${h.name}`)
    })
  } catch (error) {
    console.error('Error al cargar feriados:', error)
    publicHolidays.value = []
  }
}

onMounted(() => {
  fetchPublicHolidays()
})

// Recargar feriados cuando cambia el mes o el año fijo
const navigateMonth = (direction: 'prev' | 'next') => {
  const newDate = new Date(currentDate.value)
  if (direction === 'prev') {
    newDate.setMonth(currentDate.value.getMonth() - 1)
  } else {
    newDate.setMonth(currentDate.value.getMonth() + 1)
  }
  
  // Si hay un año fijo, mantener ese año
  if (props.fixedYear) {
    newDate.setFullYear(props.fixedYear)
    
    // Limitar navegación a enero-diciembre del año fijo
    const minDate = new Date(props.fixedYear, 0, 1)
    const maxDate = new Date(props.fixedYear, 11, 31)
    
    if (newDate < minDate) return
    if (newDate > maxDate) return
  }
  
  currentDate.value = newDate
  // Recargar feriados si cambió el año
  const oldYear = currentDate.value.getFullYear()
  const newYear = newDate.getFullYear()
  if (oldYear !== newYear) {
    fetchPublicHolidays()
  }
}

// Watch para recargar feriados cuando cambie el regional
watch(() => props.employeeRegional, () => {
  fetchPublicHolidays()
})

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

const days = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const daysArray = []

  for (let i = 0; i < startingDayOfWeek; i++) {
    daysArray.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(new Date(year, month, day))
  }

  return daysArray
})

const getDateStatus = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const dayOfWeek = date.getDay()

  // Domingo no es seleccionable
  if (dayOfWeek === 0) return 'sunday'

  // Solo se puede seleccionar con 24 hrs de antelación (a partir de mañana)
  if (date < tomorrow) return 'past'

  // Verificar si es feriado
  const dateString = date.toISOString().split('T')[0]
  const isHoliday = publicHolidays.value.some(holiday => holiday.date === dateString)
  if (isHoliday) return 'holiday'

  // Verificar solicitudes existentes
  const dateRequest = props.existingRequests.find((request) => {
    // Si la solicitud tiene fechas array, verificar cada fecha
    if (request.fechas && Array.isArray(request.fechas)) {
      return request.fechas.some((f: any) => {
        const fechaStr = typeof f === 'string' ? f : (f.fecha || f)
        // Normalizar formato de fecha (YYYY-MM-DD)
        const normalizedDateStr = fechaStr.split('T')[0]
        return normalizedDateStr === dateString
      })
    }
    // Si tiene fechas_agrupadas (formato alternativo)
    if (request.fechas_agrupadas && Array.isArray(request.fechas_agrupadas)) {
      return request.fechas_agrupadas.some((f: string) => {
        const normalizedDateStr = f.split('T')[0]
        return normalizedDateStr === dateString
      })
    }
    // Si tiene startDate y endDate (formato antiguo)
    if (request.startDate && request.endDate) {
      const startDate = new Date(request.startDate)
      const endDate = new Date(request.endDate)
      return date >= startDate && date <= endDate
    }
    return false
  })

  if (dateRequest) {
    // Si está rechazada, mostrar como rechazada
    if (dateRequest.estado === 'RECHAZADO' || dateRequest.estado === 'rejected') {
      return 'rejected'
    }
    // Si es programada, mostrar como programada
    if (dateRequest.tipo === 'PROGRAMADA' || dateRequest.tipo === 'programmed') {
      return 'programmed'
    }
    // Para otros tipos aprobados/preaprobados, no mostrar nada (disponible)
    // Solo mostrar rechazadas y programadas
    return 'available'
  }

  // Todos los demás días (incluyendo sábados) son disponibles
  return 'available'
}

const isDateSelected = (date: Date) => {
  return daySelections.value.some((sel) => sel.date.toDateString() === date.toDateString())
}

const isClickable = (date: Date) => {
  const status = getDateStatus(date)
  // Los feriados son clickeables para mostrar información, pero no seleccionables
  return status !== 'past' && status !== 'rejected' && status !== 'programmed' && status !== 'sunday'
}

const getDateClasses = (date: Date) => {
  const status = getDateStatus(date)
  const isSelected = isDateSelected(date)

  return [
    {
      'bg-green-100 text-green-800 hover:bg-green-200': status === 'available' && !isSelected,
      'bg-blue-500 text-white': isSelected,
      'bg-red-200 text-red-900 cursor-not-allowed border-2 border-red-500': status === 'rejected',
      'bg-purple-100 text-purple-800 cursor-not-allowed border-2 border-purple-400': status === 'programmed',
      'bg-gray-100 text-gray-400 cursor-not-allowed': status === 'past',
      'bg-gray-200 text-gray-500 cursor-not-allowed': status === 'sunday',
      'bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200': status === 'holiday',
    }
  ]
}

const getDateLabel = (date: Date) => {
  const status = getDateStatus(date)
  if (status === 'rejected') return 'Rechazada'
  if (status === 'programmed') return 'Programada'
  return ''
}

const getDayType = (date: Date) => {
  const selection = daySelections.value.find((sel) => sel.date.toDateString() === date.toDateString())
  return selection?.type
}

const getDayTypeEmoji = (type: string | undefined) => {
  if (type === 'morning') return '🌅'
  if (type === 'afternoon') return '🌇'
  if (type === 'full') return '📅'
  return ''
}

const handleDateClick = (date: Date) => {
  const status = getDateStatus(date)
  
  // Si es feriado, mostrar información del feriado
  if (status === 'holiday') {
    const dateString = date.toISOString().split('T')[0]
    const holidayName = getHolidayName(dateString, props.employeeRegional)
    console.log('🔍 Click en feriado:', { dateString, holidayName, status, regional: props.employeeRegional })
    if (holidayName) {
      selectedHolidayInfo.value = { date, name: holidayName }
      showHolidayModal.value = true
      console.log('✅ Modal de feriado abierto:', { date: dateString, name: holidayName })
    } else {
      console.warn('⚠️ No se encontró nombre del feriado para:', dateString, 'con regional:', props.employeeRegional)
    }
    return
  }
  
  if (status === 'past' || status === 'rejected' || status === 'programmed' || status === 'sunday') return

  const existingSelection = daySelections.value.find((sel) => sel.date.toDateString() === date.toDateString())

  if (existingSelection) {
    // Remove existing selection
    daySelections.value = daySelections.value.filter((sel) => sel.date.toDateString() !== date.toDateString())
    const newDates = props.selectedDates.filter((d) => d.toDateString() !== date.toDateString())
    emit('dateSelect', newDates, daySelections.value)
  } else {
    if (autoFullDay.value) {
      // Automatically select as full day
      const newSelection: DaySelection = {
        date: date,
        type: 'full',
      }
      daySelections.value = [...daySelections.value, newSelection]
      const newDates = [...props.selectedDates, date].sort((a, b) => a.getTime() - b.getTime())
      emit('dateSelect', newDates, daySelections.value)
    } else {
      // Show modal to select day type
      selectedDateForType.value = date
      showDayTypeModal.value = true
    }
  }
}

const formatDate = (date: Date): string => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const handleDayTypeSelect = (type: 'morning' | 'afternoon' | 'full') => {
  if (!selectedDateForType.value) return

  const newSelection: DaySelection = {
    date: selectedDateForType.value,
    type: type,
  }

  daySelections.value = [...daySelections.value, newSelection]
  const newDates = [...props.selectedDates, selectedDateForType.value].sort((a, b) => a.getTime() - b.getTime())
  emit('dateSelect', newDates, daySelections.value)
  closeDayTypeModal()
}

const closeDayTypeModal = () => {
  showDayTypeModal.value = false
  selectedDateForType.value = null
}

</script>