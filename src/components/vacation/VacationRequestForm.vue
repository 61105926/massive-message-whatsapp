<template>
  <Card>
    <CardHeader class="pb-3">
      <h3 class="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
        <Calendar class="h-5 w-5" />
        Nueva Solicitud de Vacaciones
      </h3>
      <p class="text-sm text-muted-foreground">Sistema empresarial de gestión de vacaciones</p>
    </CardHeader>
    <CardContent>
      <div v-if="selectedDates.length === 0" class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
        <div class="flex">
          <AlertCircle class="h-4 w-4 text-yellow-600" />
          <p class="ml-2 text-sm text-yellow-700">Selecciona fechas en el calendario para continuar</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="type" class="text-sm font-medium">
              Tipo de Vacación *
            </label>
            <select
              id="type"
              v-model="formData.type"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecciona el tipo</option>
              <option value="programmed">Vacaciones Programadas</option>
              <option value="unplanned">Vacaciones a Cuenta</option>
            </select>
            <div v-if="formData.type === 'unplanned'" class="flex items-center gap-2">
              <span
                :class="[
                  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold',
                  unplannedCount >= maxUnplannedPerYear
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ unplannedCount }}/{{ maxUnplannedPerYear }} usadas este año
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <label for="replacement" class="text-sm font-medium">
              Reemplazante *
            </label>
            <select
              id="replacement"
              v-model="formData.replacement"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecciona tu reemplazante</option>
              <option
                v-for="person in availableReplacements"
                :key="person.id"
                :value="person.id"
              >
                {{ person.name }} - {{ person.department }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="selectedDates.length > 0" class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <div class="flex items-center gap-2 mb-2">
            <Calendar class="h-4 w-4 text-blue-600" />
            <p class="text-sm font-medium text-blue-900">Resumen de Solicitud</p>
          </div>
          <div class="space-y-1 text-sm">
            <p>
              <strong>Días solicitados:</strong> {{ selectedDates.length }}
            </p>
            <p>
              <strong>Período:</strong> {{ formatDate(selectedDates[0]) }} - {{ formatDate(selectedDates[selectedDates.length - 1]) }}
            </p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="selectedDates.length === 0"
          class="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Send class="h-4 w-4 mr-2" />
          Enviar Solicitud para Aprobación
        </button>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, AlertCircle, Send } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'

interface Props {
  selectedDates: Date[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [request: any]
  cancel: []
}>()

const formData = ref({
  type: '',
  reason: '',
  replacement: '',
  isUnplanned: false,
})

const availableReplacements = ref([
  { id: '1', name: 'María González', department: 'Ventas' },
  { id: '2', name: 'Carlos Rodríguez', department: 'Marketing' },
  { id: '3', name: 'Ana López', department: 'Administración' },
])

const unplannedCount = ref(0)
const maxUnplannedPerYear = 2

onMounted(() => {
  const currentYear = new Date().getFullYear()
  const storedRequests = JSON.parse(localStorage.getItem('vacationRequests') || '[]')
  const unplannedThisYear = storedRequests.filter(
    (req: any) => req.isUnplanned && new Date(req.createdAt).getFullYear() === currentYear,
  ).length
  unplannedCount.value = unplannedThisYear
})

const handleSubmit = () => {
  if (props.selectedDates.length === 0) {
    alert('Por favor selecciona al menos una fecha')
    return
  }

  if (!formData.value.type || !formData.value.replacement) {
    alert('Por favor completa todos los campos obligatorios')
    return
  }

  if (formData.value.isUnplanned && unplannedCount.value >= maxUnplannedPerYear) {
    alert(`Has alcanzado el límite de ${maxUnplannedPerYear} vacaciones no programadas por año`)
    return
  }

  const sortedDates = [...props.selectedDates].sort((a, b) => a.getTime() - b.getTime())

  const request = {
    ...formData.value,
    startDate: sortedDates[0].toISOString(),
    endDate: sortedDates[sortedDates.length - 1].toISOString(),
    dates: props.selectedDates.map((date) => date.toISOString()),
    totalDays: props.selectedDates.length,
    status: 'pending',
    createdAt: new Date().toISOString(),
    workflow: {
      currentStep: 'manager_review',
      steps: [
        { name: 'manager_review', status: 'pending', assignee: 'manager' },
        { name: 'hr_approval', status: 'waiting', assignee: 'hr' },
        { name: 'sap_integration', status: 'waiting', assignee: 'system' },
      ],
    },
  }

  emit('submit', request)

  formData.value = {
    type: '',
    reason: '',
    replacement: '',
    isUnplanned: false,
  }
}

const formatDate = (date: Date) => {
  if (!date) return ''
  return date.toLocaleDateString('es-ES')
}
</script>