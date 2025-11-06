<template>
  <div class="w-full space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 shadow-lg">
      <h1 class="text-2xl md:text-3xl font-bold mb-2">Vacaciones Programadas 2026</h1>
      <p class="text-blue-100">Programa tus vacaciones y visualiza las de tus colegas</p>
    </div>

    <!-- Estadísticas y filtros -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Mis días seleccionados -->
      <div class="bg-white border rounded-lg p-4 shadow">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-700">Mis Días Seleccionados</h3>
          <Calendar class="h-5 w-5 text-blue-600" />
        </div>
        <div class="text-3xl font-bold text-blue-600">{{ mySelectedDays.length }}</div>
        <p class="text-xs text-gray-500 mt-1">días programados</p>
      </div>

      <!-- Filtro por mes -->
      <div class="bg-white border rounded-lg p-4 shadow">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Mes a Visualizar</h3>
        <select
          v-model="currentMonth"
          class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="(month, index) in monthNames" :key="index" :value="index">
            {{ month }} 2026
          </option>
        </select>
      </div>

      <!-- Filtro por área -->
      <div class="bg-white border rounded-lg p-4 shadow">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Filtrar por Área</h3>
        <select
          v-model="selectedDepartment"
          class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las áreas</option>
          <option v-for="dept in departments" :key="dept" :value="dept">
            {{ dept }}
          </option>
        </select>
      </div>
    </div>

    <!-- Calendario -->
    <div class="bg-white border rounded-lg shadow-lg overflow-hidden">
      <!-- Header del calendario con navegación -->
      <div class="bg-gray-50 border-b px-6 py-4">
        <div class="flex items-center justify-between">
          <button
            @click="previousMonth"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft class="h-4 w-4" />
            <span class="hidden md:inline">Anterior</span>
          </button>

          <h2 class="text-xl md:text-2xl font-bold text-gray-800">
            {{ monthNames[currentMonth] }} 2026
          </h2>

          <button
            @click="nextMonth"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-white hover:bg-gray-50 transition-colors"
          >
            <span class="hidden md:inline">Siguiente</span>
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="bg-gray-50 border-b px-6 py-3">
        <div class="flex flex-wrap gap-4 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Mis días seleccionados</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-orange-400 rounded"></div>
            <span>Vacaciones de colegas</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-red-200 rounded"></div>
            <span>Fines de semana</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-purple-400 rounded"></div>
            <span>Feriados</span>
          </div>
        </div>
      </div>

      <!-- Grid del calendario -->
      <div class="p-4 md:p-6">
        <!-- Nombres de los días -->
        <div class="grid grid-cols-7 gap-2 mb-2">
          <div
            v-for="day in dayNames"
            :key="day"
            class="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {{ day }}
          </div>
        </div>

        <!-- Días del mes -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="relative"
          >
            <!-- Día vacío -->
            <div v-if="!day" class="aspect-square"></div>

            <!-- Día con contenido -->
            <button
              v-else
              @click="toggleDaySelection(day)"
              :disabled="!isDaySelectable(day)"
              :class="getDayClasses(day)"
              class="w-full aspect-square p-2 rounded-lg border transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 relative group"
            >
              <!-- Número del día -->
              <div class="text-sm md:text-base font-semibold">
                {{ day.getDate() }}
              </div>

              <!-- Indicador de mis vacaciones -->
              <div v-if="isMyVacationDay(day)" class="absolute top-1 right-1">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>

              <!-- Indicador de vacaciones de colegas -->
              <div v-if="getColleaguesOnVacation(day).length > 0" class="mt-1">
                <div class="flex items-center justify-center">
                  <Users class="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                  <span class="text-xs ml-1">{{ getColleaguesOnVacation(day).length }}</span>
                </div>
              </div>

              <!-- Tooltip con información -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div class="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 whitespace-nowrap">
                  <div class="font-semibold mb-1">{{ day.getDate() }} de {{ monthNames[day.getMonth()] }}</div>

                  <div v-if="isMyVacationDay(day)" class="text-blue-300 mb-1">
                    ✓ Tu día seleccionado
                  </div>

                  <div v-if="getColleaguesOnVacation(day).length > 0" class="border-t border-gray-700 pt-1 mt-1">
                    <div class="font-semibold mb-1">Colegas de vacaciones:</div>
                    <div v-for="colleague in getColleaguesOnVacation(day).slice(0, 5)" :key="colleague.id" class="text-xs">
                      • {{ colleague.name }}
                    </div>
                    <div v-if="getColleaguesOnVacation(day).length > 5" class="text-xs text-gray-400 mt-1">
                      +{{ getColleaguesOnVacation(day).length - 5 }} más
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de selección -->
    <div v-if="mySelectedDays.length > 0" class="bg-white border rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold mb-4">Resumen de tu Programación</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Días seleccionados:</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="day in mySelectedDays.slice(0, 10)"
              :key="day.toISOString()"
              class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <Calendar class="h-3 w-3" />
              {{ formatDate(day) }}
            </span>
            <span
              v-if="mySelectedDays.length > 10"
              class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
            >
              +{{ mySelectedDays.length - 10 }} más
            </span>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Estadísticas:</h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Total de días:</span>
              <span class="font-semibold">{{ mySelectedDays.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Primer día:</span>
              <span class="font-semibold">{{ mySelectedDays.length > 0 ? formatDate(mySelectedDays[0]) : '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Último día:</span>
              <span class="font-semibold">{{ mySelectedDays.length > 0 ? formatDate(mySelectedDays[mySelectedDays.length - 1]) : '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="submitScheduledVacation"
          class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          <Send class="h-5 w-5" />
          Enviar Programación
        </button>
        <button
          @click="clearSelection"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- Lista de colegas de vacaciones -->
    <div class="bg-white border rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-semibold mb-4">
        Colegas de Vacaciones en {{ monthNames[currentMonth] }}
      </h3>

      <div v-if="filteredColleagueVacations.length === 0" class="text-center py-8 text-gray-500">
        <Users class="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No hay vacaciones programadas para este mes</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="vacation in filteredColleagueVacations"
          :key="vacation.id"
          class="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold">
              {{ vacation.name.charAt(0) }}
            </div>
            <div>
              <div class="font-semibold text-gray-800">{{ vacation.name }}</div>
              <div class="text-sm text-gray-600">{{ vacation.department }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium text-gray-700">
              {{ formatDate(vacation.startDate) }} - {{ formatDate(vacation.endDate) }}
            </div>
            <div class="text-xs text-gray-500">
              {{ calculateDaysBetween(vacation.startDate, vacation.endDate) }} días
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Calendar, Users, Send } from 'lucide-vue-next'

interface ColleagueVacation {
  id: string
  name: string
  department: string
  startDate: Date
  endDate: Date
}

const emit = defineEmits<{
  submit: [dates: Date[]]
}>()

// Estado del calendario
const currentMonth = ref(0) // Enero 2026
const selectedDepartment = ref('')
const mySelectedDays = ref<Date[]>([])

// Datos simulados de colegas
const departments = ref(['Distribución', 'Almacén', 'Logística', 'Ventas', 'Producción'])

const colleagueVacations = ref<ColleagueVacation[]>([
  {
    id: '1',
    name: 'Juan Pérez',
    department: 'Distribución',
    startDate: new Date(2026, 0, 15),
    endDate: new Date(2026, 0, 18)
  },
  {
    id: '2',
    name: 'María García',
    department: 'Almacén',
    startDate: new Date(2026, 0, 20),
    endDate: new Date(2026, 0, 25)
  },
  {
    id: '3',
    name: 'Pedro López',
    department: 'Logística',
    startDate: new Date(2026, 1, 5),
    endDate: new Date(2026, 1, 10)
  },
  {
    id: '4',
    name: 'Ana Martínez',
    department: 'Ventas',
    startDate: new Date(2026, 1, 12),
    endDate: new Date(2026, 1, 15)
  }
])

// Feriados de Bolivia 2026 (ejemplo)
const holidays = ref<Date[]>([
  new Date(2026, 0, 1),  // Año Nuevo
  new Date(2026, 0, 22), // Estado Plurinacional
  new Date(2026, 4, 1),  // Día del Trabajo
  // Agregar más feriados según sea necesario
])

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Generar días del calendario
const calendarDays = computed(() => {
  const year = 2026
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days: (Date | null)[] = []

  // Días vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  return days
})

// Filtrar vacaciones de colegas por mes y departamento
const filteredColleagueVacations = computed(() => {
  return colleagueVacations.value.filter(vacation => {
    const isInMonth = vacation.startDate.getMonth() === currentMonth.value ||
                     vacation.endDate.getMonth() === currentMonth.value

    const matchesDepartment = !selectedDepartment.value ||
                             vacation.department === selectedDepartment.value

    return isInMonth && matchesDepartment
  })
})

// Funciones de navegación
const previousMonth = () => {
  if (currentMonth.value > 0) {
    currentMonth.value--
  } else {
    currentMonth.value = 11
  }
}

const nextMonth = () => {
  if (currentMonth.value < 11) {
    currentMonth.value++
  } else {
    currentMonth.value = 0
  }
}

// Verificar si un día es seleccionable
const isDaySelectable = (day: Date): boolean => {
  // No se pueden seleccionar domingos
  if (day.getDay() === 0) return false

  // No se pueden seleccionar feriados
  if (isHoliday(day)) return false

  return true
}

// Verificar si es feriado
const isHoliday = (day: Date): boolean => {
  return holidays.value.some(holiday =>
    holiday.toDateString() === day.toDateString()
  )
}

// Verificar si es fin de semana
const isWeekend = (day: Date): boolean => {
  const dayOfWeek = day.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

// Verificar si es un día de mis vacaciones
const isMyVacationDay = (day: Date): boolean => {
  return mySelectedDays.value.some(selected =>
    selected.toDateString() === day.toDateString()
  )
}

// Obtener colegas de vacaciones en un día específico
const getColleaguesOnVacation = (day: Date) => {
  return filteredColleagueVacations.value.filter(vacation =>
    day >= vacation.startDate && day <= vacation.endDate
  )
}

// Obtener clases CSS para un día
const getDayClasses = (day: Date) => {
  const classes = []

  if (isMyVacationDay(day)) {
    classes.push('bg-blue-500 text-white border-blue-600 hover:bg-blue-600')
  } else if (isHoliday(day)) {
    classes.push('bg-purple-200 text-purple-900 border-purple-300')
  } else if (isWeekend(day)) {
    classes.push('bg-red-50 text-gray-700 border-red-200')
  } else if (getColleaguesOnVacation(day).length > 0) {
    classes.push('bg-orange-50 text-gray-800 border-orange-300')
  } else {
    classes.push('bg-white text-gray-800 border-gray-300 hover:bg-gray-50')
  }

  return classes.join(' ')
}

// Toggle selección de día
const toggleDaySelection = (day: Date) => {
  if (!isDaySelectable(day)) return

  const index = mySelectedDays.value.findIndex(selected =>
    selected.toDateString() === day.toDateString()
  )

  if (index > -1) {
    mySelectedDays.value.splice(index, 1)
  } else {
    mySelectedDays.value.push(day)
  }

  // Ordenar por fecha
  mySelectedDays.value.sort((a, b) => a.getTime() - b.getTime())
}

// Limpiar selección
const clearSelection = () => {
  mySelectedDays.value = []
}

// Enviar programación
const submitScheduledVacation = () => {
  if (mySelectedDays.value.length === 0) {
    alert('Debes seleccionar al menos un día')
    return
  }

  emit('submit', mySelectedDays.value)

  // TODO: Aquí se llamará a la API para guardar las vacaciones programadas
  console.log('Vacaciones programadas:', mySelectedDays.value)

  alert(`Se han programado ${mySelectedDays.value.length} días de vacaciones para 2026`)
}

// Formatear fecha
const formatDate = (date: Date): string => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

// Calcular días entre dos fechas
const calculateDaysBetween = (start: Date, end: Date): number => {
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays
}
</script>
