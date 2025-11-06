<template>
  <div class="w-full">
    <!-- Header con navegación de meses -->
    <div class="flex items-center justify-between mb-4">
      <button
        @click="navigateMonth('prev')"
        class="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>

      <h2 class="text-lg font-semibold">
        {{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}
      </h2>

      <button
        @click="navigateMonth('next')"
        class="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <!-- Leyenda -->
    <div class="flex flex-wrap gap-3 mb-4 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-green-500 rounded"></div>
        <span>Disponible</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-orange-500 rounded"></div>
        <span>Ocupado (Vacaciones)</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-red-500 rounded"></div>
        <span>Varios empleados</span>
      </div>
    </div>

    <!-- Calendario -->
    <div class="grid grid-cols-7 gap-2 mb-2">
      <div v-for="day in dayNames" :key="day" class="p-2 text-center text-xs font-medium text-gray-500">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2">
      <div v-for="(date, index) in days" :key="index" class="relative">
        <div v-if="!date" class="p-2"></div>
        <div
          v-else
          :class="getDateClasses(date)"
          class="aspect-square min-h-[60px] p-2 text-sm rounded-md border transition-colors flex flex-col items-center justify-center cursor-pointer hover:bg-accent"
        >
          <span class="font-medium mb-1">{{ date.getDate() }}</span>
          <div v-if="getVacationCount(date) > 0" class="text-xs font-semibold">
            {{ getVacationCount(date) }}
          </div>
          <div v-if="getVacationCount(date) > 0" class="text-xs mt-1">
            empleado{{ getVacationCount(date) > 1 ? 's' : '' }}
          </div>
        </div>
        
        <!-- Tooltip con lista de empleados -->
        <div
          v-if="date && getVacationsForDate(date).length > 0"
          class="absolute z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg shadow-lg p-2 w-48 left-full ml-2 top-0"
        >
          <div class="font-semibold mb-1">En vacaciones:</div>
          <div v-for="vacation in getVacationsForDate(date)" :key="vacation.id" class="py-1 border-b border-gray-700 last:border-0">
            {{ vacation.employee_name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de empleados en vacaciones este mes -->
    <div v-if="vacationsThisMonth.length > 0" class="mt-6">
      <h3 class="text-sm font-semibold mb-2">Vacaciones programadas este mes</h3>
      <div class="space-y-2">
        <div
          v-for="vacation in vacationsThisMonth"
          :key="vacation.id"
          class="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
        >
          <div>
            <div class="font-medium text-sm">{{ vacation.employee_name }}</div>
            <div class="text-xs text-gray-600">{{ formatDate(vacation.start_date) }} - {{ formatDate(vacation.end_date) }}</div>
          </div>
          <div class="text-xs font-semibold text-orange-600">
            {{ vacation.days }} día{{ vacation.days > 1 ? 's' : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Vacation {
  id: string
  employee_name: string
  start_date: string
  end_date: string
  days: number
  status: string
}

defineProps<{
  managerId?: number
}>()

const currentDate = ref(new Date())
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Datos de vacaciones (simulado, luego vendrá de API)
const allVacations = ref<Vacation[]>([])

const days = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const endDate = lastDay.getDate()
  
  const daysArray = []
  
  // Días del mes anterior
  for (let i = 0; i < startDay; i++) {
    daysArray.push(null)
  }
  
  // Días del mes actual
  for (let i = 1; i <= endDate; i++) {
    daysArray.push(new Date(year, month, i))
  }
  
  return daysArray
})

const vacationsThisMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  return allVacations.value.filter(v => {
    const startDate = new Date(v.start_date)
    const endDate = new Date(v.end_date)
    
    return (
      (startDate.getFullYear() === year && startDate.getMonth() === month) ||
      (endDate.getFullYear() === year && endDate.getMonth() === month) ||
      (startDate <= new Date(year, month, 0) && endDate >= new Date(year, month + 1, 1))
    )
  })
})

const navigateMonth = (direction: 'prev' | 'next') => {
  if (direction === 'prev') {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  } else {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }
  loadVacations()
}

const getVacationsForDate = (date: Date): Vacation[] => {
  return allVacations.value.filter(v => {
    const start = new Date(v.start_date)
    const end = new Date(v.end_date)
    return date >= start && date <= end
  })
}

const getVacationCount = (date: Date): number => {
  return getVacationsForDate(date).length
}

const getDateClasses = (date: Date): string[] => {
  const classes = []
  const count = getVacationCount(date)
  
  if (count === 0) {
    classes.push('bg-green-50', 'border-green-200', 'text-green-700')
  } else if (count === 1) {
    classes.push('bg-orange-50', 'border-orange-200', 'text-orange-700')
  } else {
    classes.push('bg-red-50', 'border-red-200', 'text-red-700')
  }
  
  // Marcar el día actual
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    classes.push('ring-2', 'ring-blue-500')
  }
  
  return classes
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const loadVacations = async () => {
  try {
    // TODO: Llamar a la API real cuando esté disponible
    // const response = await fetch(`http://190.171.225.68/api/vacaciones/calendar?month=${currentDate.value.getMonth() + 1}&year=${currentDate.value.getFullYear()}&manager_id=${props.managerId}`)
    // allVacations.value = await response.json()
    
    // Datos de ejemplo para demostración
    const currentMonth = currentDate.value.getMonth() + 1
    const currentYear = currentDate.value.getFullYear()
    
    allVacations.value = [
      {
        id: '1',
        employee_name: 'Carlos Ramírez',
        start_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
        end_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-18`,
        days: 4,
        status: 'approved'
      },
      {
        id: '2',
        employee_name: 'Lucía Fernández',
        start_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-22`,
        end_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-25`,
        days: 4,
        status: 'approved'
      },
      {
        id: '3',
        employee_name: 'Roberto Silva',
        start_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`,
        end_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-30`,
        days: 3,
        status: 'pending'
      }
    ]
  } catch (error) {
    console.error('Error al cargar vacaciones:', error)
    allVacations.value = []
  }
}

onMounted(() => {
  loadVacations()
})
</script>

