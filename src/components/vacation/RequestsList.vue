<template>
  <div class="space-y-4">
    <Card>
      <CardHeader>
        <h3 class="text-lg font-semibold leading-none tracking-tight">Historial de Solicitudes</h3>
        <p class="text-sm text-muted-foreground">Todas tus solicitudes de vacaciones</p>
      </CardHeader>
    </Card>

    <div v-if="requests.length === 0" class="text-center py-8">
      <Calendar class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p class="text-muted-foreground">No tienes solicitudes de vacaciones aún</p>
    </div>

    <div v-else class="space-y-3">
      <Card v-for="request in sortedRequests" :key="request.id">
        <CardContent class="pt-6">
          <div class="flex items-start justify-between">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
                    getStatusBadgeClass(request.status)
                  ]"
                >
                  {{ getStatusText(request.status) }}
                </span>
                <span class="text-sm text-muted-foreground">
                  {{ request.totalDays }} día{{ request.totalDays > 1 ? 's' : '' }}
                </span>
              </div>

              <div class="space-y-1">
                <p class="text-sm">
                  <strong>Período:</strong>
                  {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
                </p>
                <p class="text-sm">
                  <strong>Tipo:</strong> {{ getVacationType(request.type) }}
                </p>
                <p v-if="request.reason" class="text-sm text-muted-foreground">
                  {{ request.reason }}
                </p>
              </div>

              <div class="text-xs text-muted-foreground">
                Solicitado el {{ formatDate(request.createdAt) }}
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <button
                v-if="request.status === 'programmed'"
                @click="$emit('takeVacation', request.id)"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              >
                <CheckCircle class="h-4 w-4 mr-1" />
                Tomar
              </button>

              <button
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <Eye class="h-4 w-4 mr-1" />
                Ver
              </button>
            </div>
          </div>

          <!-- Workflow Status for pending requests -->
          <div v-if="request.workflow && request.status === 'pending'" class="mt-4 p-3 bg-gray-50 rounded-lg">
            <div class="text-sm font-medium mb-2">Estado del proceso</div>
            <div class="flex items-center space-x-2">
              <div
                v-for="(step, index) in request.workflow.steps"
                :key="step.name"
                class="flex items-center"
              >
                <div
                  :class="[
                    'w-3 h-3 rounded-full border-2',
                    step.status === 'completed' ? 'bg-green-500 border-green-500' :
                    step.status === 'pending' ? 'bg-yellow-500 border-yellow-500' :
                    'bg-gray-300 border-gray-300'
                  ]"
                ></div>
                <span class="ml-1 text-xs text-muted-foreground">
                  {{ getStepName(step.name) }}
                </span>
                <div v-if="index < request.workflow.steps.length - 1" class="w-4 h-px bg-gray-300 mx-2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, CheckCircle, Eye } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'

interface Props {
  requests: any[]
}

const props = defineProps<Props>()
defineEmits<{
  takeVacation: [requestId: string]
}>()

const sortedRequests = computed(() => {
  return [...props.requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'programmed':
      return 'bg-blue-100 text-blue-800'
    case 'vacation_account':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'approved':
      return 'Aprobado'
    case 'rejected':
      return 'Rechazado'
    case 'programmed':
      return 'Programado'
    case 'vacation_account':
      return 'En Cuenta'
    default:
      return 'Desconocido'
  }
}

const getVacationType = (type: string) => {
  switch (type) {
    case 'programmed':
      return 'Vacaciones Programadas'
    case 'unplanned':
      return 'Vacaciones a Cuenta'
    case 'personal':
      return 'Día Personal'
    case 'sick':
      return 'Enfermedad'
    case 'emergency':
      return 'Emergencia Familiar'
    case 'compensatory':
      return 'Compensatorio'
    default:
      return type
  }
}

const getStepName = (stepName: string) => {
  switch (stepName) {
    case 'manager_review':
      return 'Jefe'
    case 'hr_approval':
      return 'RRHH'
    case 'sap_integration':
      return 'SAP'
    default:
      return stepName
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}
</script>