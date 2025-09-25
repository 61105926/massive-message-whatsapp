<template>
  <div class="space-y-4">
    <Card>
      <CardHeader>
        <h3 class="text-lg font-semibold leading-none tracking-tight">Panel de Aprobación</h3>
        <p class="text-sm text-muted-foreground">Solicitudes pendientes de aprobación</p>
      </CardHeader>
    </Card>

    <div v-if="pendingRequests.length === 0" class="text-center py-8">
      <CheckCircle class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p class="text-muted-foreground">No hay solicitudes pendientes</p>
    </div>

    <div v-else class="space-y-4">
      <Card v-for="request in pendingRequests" :key="request.id">
        <CardContent class="pt-6">
          <div class="space-y-4">
            <!-- Employee Info -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="font-medium">{{ request.employeeName }}</p>
                <p class="text-sm text-muted-foreground">{{ request.department }}</p>
              </div>
            </div>

            <!-- Request Details -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Período</p>
                <p class="font-medium">
                  {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
                </p>
              </div>
              <div>
                <p class="text-muted-foreground">Días solicitados</p>
                <p class="font-medium">{{ request.totalDays }} día{{ request.totalDays > 1 ? 's' : '' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Tipo</p>
                <p class="font-medium">{{ getVacationType(request.type) }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Reemplazante</p>
                <p class="font-medium">{{ getReplacementName(request.replacement) }}</p>
              </div>
            </div>

            <!-- Reason -->
            <div v-if="request.reason">
              <p class="text-muted-foreground text-sm mb-1">Motivo</p>
              <p class="text-sm bg-gray-50 p-2 rounded">{{ request.reason }}</p>
            </div>

            <!-- Request Date -->
            <div class="text-xs text-muted-foreground">
              Solicitado el {{ formatDate(request.createdAt) }}
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t">
              <button
                @click="handleApproval(request.id, 'approved')"
                class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
              >
                <CheckCircle class="h-4 w-4 mr-2" />
                Aprobar
              </button>

              <button
                @click="handleApproval(request.id, 'rejected')"
                class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
              >
                <X class="h-4 w-4 mr-2" />
                Rechazar
              </button>

              <button
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <MessageSquare class="h-4 w-4 mr-2" />
                Comentar
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle, User, X, MessageSquare } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'

interface Props {
  requests: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  requestUpdate: [requests: any[]]
}>()

const pendingRequests = computed(() => {
  return props.requests.filter(req => req.status === 'pending')
})

const pendingCount = computed(() => {
  return props.requests.filter(req => req.status === 'pending').length
})

const approvedCount = computed(() => {
  return props.requests.filter(req => req.status === 'approved').length
})

const rejectedCount = computed(() => {
  return props.requests.filter(req => req.status === 'rejected').length
})

const availableReplacements = [
  { id: '1', name: 'María González', department: 'Ventas' },
  { id: '2', name: 'Carlos Rodríguez', department: 'Marketing' },
  { id: '3', name: 'Ana López', department: 'Administración' },
]

const handleApproval = (requestId: string, status: 'approved' | 'rejected') => {
  const updatedRequests = props.requests.map(req => {
    if (req.id === requestId) {
      return {
        ...req,
        status: status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'boss',
        workflow: status === 'approved' ? {
          ...req.workflow,
          currentStep: 'hr_approval',
          steps: req.workflow.steps.map((step: any) => {
            if (step.name === 'manager_review') {
              return { ...step, status: 'completed' }
            }
            if (step.name === 'hr_approval') {
              return { ...step, status: 'pending' }
            }
            return step
          })
        } : req.workflow
      }
    }
    return req
  })

  emit('requestUpdate', updatedRequests)
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

const getReplacementName = (replacementId: string) => {
  const replacement = availableReplacements.find(r => r.id === replacementId)
  return replacement ? replacement.name : 'No especificado'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}
</script>