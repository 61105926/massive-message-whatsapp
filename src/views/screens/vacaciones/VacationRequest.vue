<template>
  <div class="min-h-screen bg-background pb-20">
    <!-- Sticky Header -->
    <div class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-balance">Mis Vacaciones</h1>
            <p class="text-sm text-muted-foreground">{{ currentUser.company }}</p>
          </div>
          <div class="flex items-center gap-2 relative">
            <span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              {{ currentUser.vacationBalance }} días
            </span>
            <select
              v-model="currentUser.role"
              @change="handleRoleChange"
              class="text-sm border border-input bg-background px-2 py-1 rounded-md"
            >
              <option value="employee">Empleado</option>
              <option value="boss">Jefe</option>
            </select>
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
        <Card>
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
            @submit="handleRequestSubmit"
            @cancel="() => { showForm = false; selectedDates = [] }"
          />
        </div>
      </div>

      <!-- Requests View -->
      <div v-if="activeView === 'requests'" class="space-y-4">
        <RequestsList
          :requests="requests"
          @take-vacation="handleTakeVacation"
        />
      </div>

      <!-- Boss View -->
      <div v-if="activeView === 'boss' && currentUser.role === 'boss'" class="space-y-4">
        <BossApprovalPanel
          :requests="requests"
          @request-update="handleRequestUpdate"
        />

        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold leading-none tracking-tight">Sistema de Confirmación</h3>
            <p class="text-sm text-muted-foreground">
              Confirma que los empleados tomarán sus vacaciones aprobadas (2 días antes)
            </p>
          </CardHeader>
        </Card>
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
                <span class="text-muted-foreground">Departamento</span>
                <span class="font-medium">{{ currentUser.department }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Email</span>
                <span class="font-medium text-sm">{{ currentUser.email }}</span>
              </div>
              <div class="flex justify-between py-2 border-b">
                <span class="text-muted-foreground">Rol</span>
                <span class="font-medium capitalize">{{ currentUser.role }}</span>
              </div>
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
import { ref, onMounted } from 'vue'
import { CalendarDays, Clock, CheckCircle, User } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import VacationCalendar from '@/components/vacation/VacationCalendar.vue'
import VacationRequestForm from '@/components/vacation/VacationRequestForm.vue'
import RequestsList from '@/components/vacation/RequestsList.vue'
import BossApprovalPanel from '@/components/vacation/BossApprovalPanel.vue'

// Reactive data
const selectedDates = ref<Date[]>([])
const requests = ref<any[]>([])
const showForm = ref(false)
const activeView = ref<'calendar' | 'requests' | 'profile' | 'boss'>('calendar')

const currentUser = ref({
  id: 'user-1',
  name: 'Juan Pérez',
  email: 'juan.perez@minoil.com.bo',
  department: 'Desarrollo',
  company: 'MINOIL S.A.',
  role: 'employee',
  vacationBalance: 25,
  usedDays: 5,
})

// Methods
const handleDateSelect = (dates: Date[]) => {
  selectedDates.value = dates
  if (dates.length > 0) {
    showForm.value = true
  }
}

const handleRequestSubmit = (request: any) => {
  const newRequest = {
    ...request,
    id: `REQ-${Date.now()}`,
    employeeId: currentUser.value.id,
    employeeName: currentUser.value.name,
    department: currentUser.value.department,
    company: currentUser.value.company,
    status: 'programmed',
    createdAt: new Date().toISOString(),
    impactsBalance: false,
  }
  const updatedRequests = [...requests.value, newRequest]
  requests.value = updatedRequests
  localStorage.setItem('vacation-requests', JSON.stringify(updatedRequests))
  selectedDates.value = []
  showForm.value = false
}

const handleRoleChange = () => {
  // Handle role change logic if needed
  console.log('Role changed to:', currentUser.value.role)
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

// Lifecycle
onMounted(() => {
  const savedRequests = localStorage.getItem('vacation-requests')
  if (savedRequests) {
    requests.value = JSON.parse(savedRequests)
  }
})
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

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
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