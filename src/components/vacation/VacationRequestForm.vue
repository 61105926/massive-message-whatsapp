<template>
  <Card>
    <CardHeader class="pb-3">
      <h3
        class="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
        <Calendar class="h-5 w-5" />
        Nueva Solicitud de Vacaciones
      </h3>
      <p class="text-sm text-muted-foreground">
        Sistema empresarial de gestión de vacaciones
      </p>
    </CardHeader>
    <CardContent>
      <div
        v-if="selectedDates.length === 0"
        class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
        <div class="flex">
          <AlertCircle class="h-4 w-4 text-yellow-600" />
          <p class="ml-2 text-sm text-yellow-700">
            Selecciona fechas en el calendario para continuar
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Ocultar TODO el formulario de tipo y reemplazantes si es modo programadas -->
        <div v-if="formData.type !== 'programmed'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="type" class="text-sm font-medium">
              Tipo de Vacación *
            </label>
            <select
              id="type"
              v-model="formData.type"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Selecciona el tipo</option>
              <option value="unplanned">Vacaciones a Cuenta</option>
              <option value="programmed" :disabled="!programmedEnabled">
                Vacaciones Programadas
                {{ !programmedEnabled ? "(Deshabilitadas)" : "" }}
              </option>
            </select>
            <p v-if="!programmedEnabled" class="text-xs text-orange-600 mt-1">
              <!-- ⚠️ Las vacaciones programadas están deshabilitadas por el administrador -->
            </p>
            <div
              v-if="formData.type === 'unplanned'"
              class="flex items-center gap-2">
              <!-- <span
                :class="[
                  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold',
                  unplannedCount >= maxUnplannedPerYear
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800',
                ]">
                {{ unplannedCount }}/{{ maxUnplannedPerYear }} usadas este año
              </span> -->
            </div>
          </div>

          <div v-if="formData.type !== 'programmed'" class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">
                Reemplazantes * (puedes seleccionar varios)
              </label>
              <div v-if="isLoadingRecommendations" class="flex items-center gap-1 text-xs text-blue-600">
                <Loader2 class="h-3 w-3 animate-spin" />
                Cargando recomendaciones...
              </div>
              <div v-else-if="hasLoadedRecommendations" class="flex items-center gap-1 text-xs text-green-600">
                <Sparkles class="h-3 w-3" />
                Recomendados cargados
              </div>
            </div>
            <div class="rounded-md border border-input bg-background p-3 max-h-48 overflow-y-auto space-y-2">
              <!-- Sección de recomendaciones -->
              <div v-if="recommendedReplacements.length > 0" class="space-y-2">
                <div class="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  ✨ Recomendados por el sistema
                </div>
                <div
                  v-for="person in availableReplacements.filter(p => p.isRecommended)"
                  :key="person.id"
                  class="flex items-center space-x-2 hover:bg-accent p-2 rounded bg-green-50 border border-green-200"
                >
                  <input
                    type="checkbox"
                    :id="`replacement-${person.id}`"
                    :value="person.id"
                    v-model="formData.replacements"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    :for="`replacement-${person.id}`"
                    class="flex-1 text-sm cursor-pointer flex items-center gap-2"
                  >
                    <span>{{ person.name }} - {{ person.department }}</span>
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                      <Sparkles class="h-2.5 w-2.5" />
                      Recomendado
                    </span>
                  </label>
                </div>
              </div>
              
              <!-- Sección de otros reemplazantes -->
              <div v-if="availableReplacements.filter(p => !p.isRecommended).length > 0" class="space-y-2">
                <div v-if="recommendedReplacements.length > 0" class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  Otros reemplazantes disponibles
                </div>
                <div
                  v-for="person in availableReplacements.filter(p => !p.isRecommended)"
                  :key="person.id"
                  class="flex items-center space-x-2 hover:bg-accent p-2 rounded"
                >
                  <input
                    type="checkbox"
                    :id="`replacement-${person.id}`"
                    :value="person.id"
                    v-model="formData.replacements"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    :for="`replacement-${person.id}`"
                    class="flex-1 text-sm cursor-pointer"
                  >
                    {{ person.name }} - {{ person.department }}
                  </label>
                </div>
              </div>
              <div v-if="availableReplacements.length === 0" class="text-sm text-muted-foreground text-center py-2">
                No hay reemplazantes disponibles
              </div>
            </div>
            <p v-if="formData.replacements.length > 0" class="text-xs text-muted-foreground">
              {{ formData.replacements.length }} reemplazante(s) seleccionado(s)
            </p>
          </div>
        </div>

        <!-- Campo de comentario/razón -->
        <div class="space-y-2">
          <label for="reason" class="text-sm font-medium">
            Motivo / Comentario
          </label>
          <textarea
            id="reason"
            v-model="formData.reason"
            rows="3"
            placeholder="Ej: Vacaciones familiares, viaje, descanso, etc."
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none">
          </textarea>
        </div>

        <!-- Días disponibles -->
        <div
          class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-green-900">Días Disponibles</p>
              <p class="text-xs text-green-700">
                {{ vacationTaken }} tomados de {{ vacationTotal }} totales
              </p>
            </div>
            <div class="text-2xl font-bold text-green-700">
              {{ availableVacationDays }}
            </div>
          </div>
        </div>

        <div
          v-if="selectedDates.length > 0"
          class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <div class="flex items-center gap-2 mb-2">
            <Calendar class="h-4 w-4 text-blue-600" />
            <p class="text-sm font-medium text-blue-900">
              Resumen de Solicitud
            </p>
          </div>
          <div class="space-y-1 text-sm">
            <p><strong>Días solicitados:</strong> {{ selectedDates.length }}</p>
            <p>
              <strong>Período:</strong> {{ formatDate(selectedDates[0]) }} -
              {{ formatDate(selectedDates[selectedDates.length - 1]) }}
            </p>
            <p v-if="formData.type === 'programmed'" class="text-blue-700">
              ℹ️ Las vacaciones programadas no descuentan del saldo hasta que
              las tomes efectivamente
            </p>
            <p v-if="formData.type === 'unplanned'" class="text-orange-700">
              <!-- ⚠️ Las vacaciones a cuenta descuentan inmediatamente de tu saldo -->
            </p>
            <p
              v-if="selectedDates.length > remainingDays"
              class="text-red-700 font-semibold">
              ❌ Estás solicitando más días de los disponibles ({{
                selectedDates.length
              }}
              días solicitados > {{ remainingDays }} disponibles)
            </p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="selectedDates.length === 0 || isSubmitting"
          class="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <svg v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <Send v-else class="h-4 w-4 mr-2" />
          {{ isSubmitting ? 'Enviando...' : 'Enviar Solicitud para Aprobación' }}
        </button>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Calendar, AlertCircle, Send, Sparkles, Loader2 } from "lucide-vue-next";
import Card from "@/components/ui/Card.vue";
import CardHeader from "@/components/ui/CardHeader.vue";
import CardContent from "@/components/ui/CardContent.vue";
import { getReemplazantesRecomendados, type ReemplazanteRecomendado } from "@/services/recommendationAPI";

interface Props {
  selectedDates: Date[];
  availableVacationDays?: number;
  employeeReplacements?: any[];
  programmedEnabled?: boolean;
  vacationTotal?: number;
  vacationTaken?: number;
  isSubmitting?: boolean;
  empId?: string; // ID del empleado para obtener recomendaciones
}

const props = withDefaults(defineProps<Props>(), {
  availableVacationDays: 25,
  employeeReplacements: () => [],
  programmedEnabled: true,
  vacationTotal: 25,
  vacationTaken: 0,
  isSubmitting: false,
});

// Debug: Ver el valor del prop
console.log(
  "🔍 VacationRequestForm - programmedEnabled:",
  props.programmedEnabled
);

const emit = defineEmits<{
  submit: [request: any];
  cancel: [];
  validationError: [message: string];
}>();

const formData = ref({
  type: "",
  reason: "",
  replacements: [] as string[],
  isUnplanned: false,
});

// Estado para recomendaciones
const isLoadingRecommendations = ref(false);
const recommendedReplacements = ref<ReemplazanteRecomendado[]>([]);
const hasLoadedRecommendations = ref(false);

// Función para cargar recomendaciones automáticas
const loadRecommendations = async () => {
  if (!props.empId || isLoadingRecommendations.value) return;
  
  isLoadingRecommendations.value = true;
  
  try {
    console.log('🔍 Cargando recomendaciones para empId:', props.empId);
    
    const response = await getReemplazantesRecomendados(props.empId);
    recommendedReplacements.value = response.reemplazantes || [];
    
    // Pre-seleccionar automáticamente los reemplazantes recomendados
    if (recommendedReplacements.value.length > 0) {
      const recommendedIds = recommendedReplacements.value.map(rec => rec.REEMPLAZANTE_EMP_ID);
      // Solo agregar las recomendaciones, no sobrescribir las selecciones existentes
      formData.value.replacements = [...new Set([...formData.value.replacements, ...recommendedIds])];
      
      console.log('✅ Recomendaciones cargadas y pre-seleccionadas:', {
        total: recommendedReplacements.value.length,
        recommendedIds: recommendedIds,
        currentSelections: formData.value.replacements
      });
    }
    
    hasLoadedRecommendations.value = true;
    
  } catch (error: any) {
    console.error('❌ Error al cargar recomendaciones:', error);
    emit('validationError', 'No se pudieron cargar las recomendaciones de reemplazantes');
  } finally {
    isLoadingRecommendations.value = false;
  }
};

// Combinar recomendaciones con reemplazantes regulares del empleado
const availableReplacements = computed(() => {
  const replacements: any[] = [];
  
  // 1. Agregar recomendaciones primero (si las hay)
  if (recommendedReplacements.value.length > 0) {
    const recommended = recommendedReplacements.value.map((rec) => ({
      id: rec.REEMPLAZANTE_EMP_ID,
      name: rec.REEMPLAZANTE_NOMBRE,
      department: rec.CARGO,
      phone: rec.TELEFONO,
      type: rec.TIPO,
      empID: rec.REEMPLAZANTE_EMP_ID,
      isRecommended: true,
    }));
    replacements.push(...recommended);
  }
  
  // 2. Agregar reemplazantes regulares del empleado (evitando duplicados)
  if (props.employeeReplacements && props.employeeReplacements.length > 0) {
    const regularReplacements = props.employeeReplacements
      .filter((rep: any) => {
        // Evitar duplicados con las recomendaciones
        const repId = rep.id || String(rep.empID || '');
        return !recommendedReplacements.value.some(rec => rec.REEMPLAZANTE_EMP_ID === repId);
      })
      .map((rep: any) => ({
        id: rep.id || String(rep.empID || ''),
        name: rep.name,
        department: rep.cargo,
        phone: rep.phone,
        type: rep.type,
        empID: rep.id || rep.empID,
        isRecommended: false,
      }));
    replacements.push(...regularReplacements);
  }
  
  // 3. Si no hay ninguno, usar valores por defecto
  if (replacements.length === 0) {
    return [
      {
        id: "1",
        name: "María González",
        department: "Ventas",
        phone: "",
        type: "",
        empID: "1",
        isRecommended: false,
      },
      {
        id: "2",
        name: "Carlos Rodríguez",
        department: "Marketing",
        phone: "",
        type: "",
        empID: "2",
        isRecommended: false,
      },
      {
        id: "3",
        name: "Ana López",
        department: "Administración",
        phone: "",
        type: "",
        empID: "3",
        isRecommended: false,
      },
    ];
  }
  
  return replacements;
});

const unplannedCount = ref(0);
const maxUnplannedPerYear = 2;

// Días disponibles restantes (usar prop directamente, viene del API)
const remainingDays = computed(() => {
  return props.availableVacationDays;
});

onMounted(() => {
  const currentYear = new Date().getFullYear();
  const storedRequests = JSON.parse(
    localStorage.getItem("vacationRequests") || "[]"
  );
  const unplannedThisYear = storedRequests.filter(
    (req: any) =>
      req.isUnplanned && new Date(req.createdAt).getFullYear() === currentYear
  ).length;
  unplannedCount.value = unplannedThisYear;
  
  // Cargar recomendaciones automáticamente si hay empId
  if (props.empId) {
    loadRecommendations();
  }
});

const handleSubmit = () => {
  if (props.selectedDates.length === 0) {
    emit("validationError", "Por favor selecciona al menos una fecha");
    return;
  }

  // Solo validar reemplazantes si NO es vacaciones programadas
  if (formData.value.type !== 'programmed') {
    if (!formData.value.type || formData.value.replacements.length === 0) {
      emit("validationError", "Por favor completa todos los campos obligatorios (tipo de vacación y al menos un reemplazante)");
      return;
    }
  }

  // Validar días disponibles para AMBOS tipos de vacaciones
  if (props.selectedDates.length > remainingDays.value) {
    const tipoVacacion =
      formData.value.type === "programmed" ? "programadas" : "a cuenta";
    emit("validationError",
      `No tienes suficientes días disponibles. Tienes ${remainingDays.value} días disponibles y estás solicitando ${props.selectedDates.length} días para vacaciones ${tipoVacacion}.`
    );
    return;
  }

  if (
    formData.value.isUnplanned &&
    unplannedCount.value >= maxUnplannedPerYear
  ) {
    emit("validationError",
      `Has alcanzado el límite de ${maxUnplannedPerYear} vacaciones no programadas por año`
    );
    return;
  }

  const sortedDates = [...props.selectedDates].sort(
    (a, b) => a.getTime() - b.getTime()
  );

  const request = {
    ...formData.value,
    startDate: sortedDates[0].toISOString(),
    endDate: sortedDates[sortedDates.length - 1].toISOString(),
    dates: props.selectedDates.map((date) => date.toISOString()),
    totalDays: props.selectedDates.length,
    status: "pending",
    createdAt: new Date().toISOString(),
    workflow: {
      currentStep: "manager_review",
      steps: [
        { name: "manager_review", status: "pending", assignee: "manager" },
        { name: "hr_approval", status: "waiting", assignee: "hr" },
        { name: "sap_integration", status: "waiting", assignee: "system" },
      ],
    },
  };

  emit("submit", request);

  formData.value = {
    type: "",
    reason: "",
    replacements: [],
    isUnplanned: false,
  };
};

const formatDate = (date: Date) => {
  if (!date) return "";
  return date.toLocaleDateString("es-ES");
};
</script>
