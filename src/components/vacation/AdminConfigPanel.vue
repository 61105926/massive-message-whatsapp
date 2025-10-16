<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold leading-none tracking-tight">Configuración del Sistema</h3>
          <p class="text-sm text-muted-foreground mt-1">
            Controla la funcionalidad de vacaciones programadas
          </p>
        </div>
        <span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary/10 text-primary">
          Admin
        </span>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Estado actual -->
      <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div class="flex items-center gap-3">
          <div :class="[
            'w-10 h-10 rounded-full flex items-center justify-center',
            config.programmedVacationsEnabled
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          ]">
            <CalendarCheck v-if="config.programmedVacationsEnabled" class="h-5 w-5" />
            <CalendarX v-else class="h-5 w-5" />
          </div>
          <div>
            <p class="font-semibold">Vacaciones Programadas</p>
            <p class="text-sm text-muted-foreground">
              {{ config.programmedVacationsEnabled ? 'Habilitadas' : 'Deshabilitadas' }}
            </p>
          </div>
        </div>

        <!-- Toggle Switch -->
        <button
          @click="toggleConfig"
          :disabled="isLoading"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            config.programmedVacationsEnabled ? 'bg-primary' : 'bg-gray-300',
            isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              config.programmedVacationsEnabled ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
        </button>
      </div>

      <!-- Información adicional -->
      <div class="space-y-2 text-sm">
        <div class="flex justify-between py-2 border-b">
          <span class="text-muted-foreground">Última actualización</span>
          <span class="font-medium">{{ formatDate(config.lastUpdated) }}</span>
        </div>
        <div v-if="config.updatedBy" class="flex justify-between py-2 border-b">
          <span class="text-muted-foreground">Actualizado por</span>
          <span class="font-medium">{{ config.updatedBy }}</span>
        </div>
      </div>

      <!-- Descripción del comportamiento -->
      <div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div class="flex gap-2">
          <Info class="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div class="text-xs text-blue-900">
            <p class="font-semibold mb-1">¿Qué hace esta configuración?</p>
            <p v-if="config.programmedVacationsEnabled">
              Los empleados <strong>pueden solicitar</strong> vacaciones programadas que requieren aprobación del jefe.
            </p>
            <p v-else>
              Los empleados <strong>solo pueden tomar</strong> vacaciones de cuenta inmediata sin necesidad de aprobación.
            </p>
          </div>
        </div>
      </div>

      <!-- Botón de recarga manual -->
      <button
        @click="loadConfig"
        :disabled="isLoading"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors disabled:opacity-50"
      >
        <RefreshCw :class="['h-4 w-4', isLoading && 'animate-spin']" />
        {{ isLoading ? 'Cargando...' : 'Recargar Configuración' }}
      </button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CalendarCheck, CalendarX, Info, RefreshCw } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'

interface VacationConfig {
  programmedVacationsEnabled: boolean
  lastUpdated: string
  updatedBy?: string
}

const emit = defineEmits<{
  configChanged: [enabled: boolean]
}>()

const config = ref<VacationConfig>({
  programmedVacationsEnabled: true,
  lastUpdated: new Date().toISOString()
})

const isLoading = ref(false)

const loadConfig = async () => {
  isLoading.value = true
  try {
    const response = await fetch('http://localhost:3005/vacation-config')
    const result = await response.json()

    if (result.success && result.data) {
      config.value = result.data
      console.log('✅ Configuración cargada:', result.data)
    } else {
      throw new Error('Error al cargar configuración')
    }
  } catch (error) {
    console.error('❌ Error al cargar configuración:', error)
    alert('Error al cargar la configuración del sistema')
  } finally {
    isLoading.value = false
  }
}

const toggleConfig = async () => {
  if (isLoading.value) return

  const confirmMessage = config.value.programmedVacationsEnabled
    ? '¿Deseas DESHABILITAR las vacaciones programadas?\n\nLos usuarios solo podrán tomar vacaciones de cuenta inmediata.'
    : '¿Deseas HABILITAR las vacaciones programadas?\n\nLos usuarios podrán solicitar vacaciones que requieren aprobación.'

  if (!confirm(confirmMessage)) {
    return
  }

  isLoading.value = true
  try {
    const response = await fetch('http://localhost:3005/vacation-config/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        updatedBy: 'admin' // Puedes cambiar esto por el usuario actual
      })
    })

    const result = await response.json()

    if (result.success && result.data) {
      config.value = result.data
      emit('configChanged', config.value.programmedVacationsEnabled)
      console.log('✅ Configuración actualizada:', result.data)

      // Mostrar mensaje de éxito
      alert(result.message || 'Configuración actualizada correctamente')
    } else {
      throw new Error('Error al actualizar configuración')
    }
  } catch (error) {
    console.error('❌ Error al cambiar configuración:', error)
    alert('Error al cambiar la configuración. Por favor intenta nuevamente.')
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Fecha no disponible'
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
