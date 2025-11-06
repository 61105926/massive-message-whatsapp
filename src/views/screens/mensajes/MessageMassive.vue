<script setup lang="ts">
    import {
        Card,
        CardHeader,
        CardTitle,
        CardDescription,
        CardContent,
        CardFooter,
    } from '@/components/ui/card'
    import {
        Checkbox
    } from '@/components/ui/checkbox'
    import {
        Button
    } from '@/components/ui/button'
    import {
        Badge
    } from '@/components/ui/badge'
    import {
        ref,
        onMounted
    } from 'vue'
    import {
        MessageSquare,
        MapPin,
        Image as ImageIcon,
        Send,
        CheckSquare,
        Square,
        Upload,
        Users,
        Pause,
        Play,
        X,
        CheckCircle,
        AlertCircle,
        Info
    } from 'lucide-vue-next'
    import { buildApiUrl, API_CONFIG } from '@/config/api'

    const regiones = ref<string[]>([])
    const seleccionados = ref < string[] > ([])
    const mensaje = ref('')
    const imagen = ref < File | null > (null)
    const previewUrl = ref < string | null > (null)
    const cargandoRegiones = ref(true)
    const enviando = ref(false)
    const conectividad = ref(true) // Estado de conectividad
    const progreso = ref({
        batchId: null,
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        percentage: 0,
        isActive: false,
        isPaused: false,
        isCancelled: false
    })
    let progressInterval: number | null = null
    
    // Sistema de notificaciones
    const notification = ref({
        show: false,
        type: 'success' as 'success' | 'error' | 'info',
        title: '',
        message: ''
    })
    
    function showNotification(type: 'success' | 'error' | 'info', title: string, message: string, duration = 5000) {
        notification.value = { show: true, type, title, message }
        setTimeout(() => {
            notification.value.show = false
        }, duration)
    }

    function toggleRegion(region: string) {
        if (seleccionados.value.includes(region)) {
            seleccionados.value = seleccionados.value.filter(r => r !== region)
        } else {
            seleccionados.value.push(region)
        }
    }

    function seleccionarTodas() {
        seleccionados.value = [...regiones.value]
    }

    function deseleccionarTodas() {
        seleccionados.value = []
    }

    async function cargarRegiones() {
        try {
            cargandoRegiones.value = true
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.REGIONALES))
            const data = await response.json()
            regiones.value = data.regionales || []
            console.log('✅ Regionales cargadas:', regiones.value)
        } catch (error) {
            console.error('❌ Error cargando regionales:', error)
            // Fallback a regionales por defecto
            regiones.value = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Tarija', 'Potosí', 'Chuquisaca', 'Beni', 'Pando']
        } finally {
            cargandoRegiones.value = false
        }
    }

    let errorCount = 0
    const MAX_ERRORS = 5

    async function verificarProgreso() {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // Timeout de 5 segundos

            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROGRESS), {
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()
            progreso.value = data

            // Resetear contador de errores si la solicitud fue exitosa
            errorCount = 0
            conectividad.value = true

            // Si ya no está activo, detener el monitoreo
            if (!data.isActive && progressInterval) {
                clearInterval(progressInterval)
                progressInterval = null
                enviando.value = false

                // Si fue cancelado, limpiar completamente el estado después de un delay
                if (data.isCancelled) {
                    setTimeout(() => {
                        progreso.value = {
                            batchId: null,
                            total: 0,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            percentage: 0,
                            isActive: false,
                            isPaused: false,
                            isCancelled: false
                        }
                    }, 3000) // Limpiar después de 3 segundos para que el usuario vea el mensaje de cancelado
                } else if (data.total > 0) {
                    // Mostrar resultado final solo si se completó normalmente
                    showNotification(
                        'success',
                        '¡Envío completado!',
                        `Total: ${data.total} | Exitosos: ${data.completed} | Fallidos: ${data.failed}`,
                        6000
                    )
                    // Limpiar estado después de la notificación
                    setTimeout(() => {
                        progreso.value = {
                            batchId: null,
                            total: 0,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            percentage: 0,
                            isActive: false,
                            isPaused: false,
                            isCancelled: false
                        }
                    }, 2000)
                }
            }
        } catch (error) {
            errorCount++
            const errorMessage = error instanceof Error ? error.message : String(error)
            console.error(`❌ Error verificando progreso (${errorCount}/${MAX_ERRORS}):`, errorMessage)

            // Si hay demasiados errores consecutivos, detener el monitoreo
            if (errorCount >= MAX_ERRORS) {
                console.error('🚨 Demasiados errores consecutivos, deteniendo monitoreo')
                conectividad.value = false
                detenerMonitoreoProgreso()
                // Mostrar mensaje al usuario sobre el problema de conectividad
                if (progreso.value.isActive) {
                    showNotification(
                        'error',
                        'Problemas de conectividad',
                        'El monitoreo se ha pausado. Verifique el estado manualmente.',
                        8000
                    )
                }
            }
        }
    }

    function iniciarMonitoreoProgreso(preservarProgreso = false) {
        if (progressInterval) {
            clearInterval(progressInterval)
        }
        enviando.value = true
        errorCount = 0 // Resetear contador de errores
        conectividad.value = true

        // Solo reiniciar el progreso si no queremos preservar el estado existente
        if (!preservarProgreso) {
            progreso.value = {
                batchId: null,
                total: 0,
                completed: 0,
                failed: 0,
                pending: 0,
                percentage: 0,
                isActive: true,
                isPaused: false,
                isCancelled: false
            }
        }

        progressInterval = setInterval(verificarProgreso, 1000) // Verificar cada segundo
    }

    function reanudarMonitoreo() {
        console.log('🔄 Reanudando monitoreo manual')
        iniciarMonitoreoProgreso(true) // Preservar el progreso actual
    }

    function detenerMonitoreoProgreso() {
        if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
        }
        enviando.value = false
    }

    async function pausarEnvio() {
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PAUSE), {
                method: 'POST'
            })
            const result = await response.json()
            console.log('✅ Envío pausado:', result.message)
        } catch (error) {
            console.error('❌ Error pausando envío:', error)
            showNotification('error', 'Error', 'No se pudo pausar el envío. Intenta nuevamente.', 5000)
        }
    }

    async function reanudarEnvio() {
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RESUME), {
                method: 'POST'
            })
            const result = await response.json()
            console.log('✅ Envío reanudado:', result.message)
        } catch (error) {
            console.error('❌ Error reanudando envío:', error)
            showNotification('error', 'Error', 'No se pudo reanudar el envío. Intenta nuevamente.', 5000)
        }
    }

    async function cancelarEnvio() {
        if (!confirm('¿Está seguro que desea cancelar el envío completo?')) {
            return
        }
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CANCEL), {
                method: 'POST'
            })
            const result = await response.json()
            console.log('✅ Envío cancelado:', result.message)
            detenerMonitoreoProgreso()
        } catch (error) {
            console.error('❌ Error cancelando envío:', error)
            showNotification('error', 'Error', 'No se pudo cancelar el envío. Intenta nuevamente.', 5000)
        }
    }

    async function limpiarEstado() {
        try {
            // Limpiar backend
            await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RESET), {
                method: 'POST'
            })

            // Limpiar frontend
            detenerMonitoreoProgreso()
            progreso.value = {
                batchId: null,
                total: 0,
                completed: 0,
                failed: 0,
                pending: 0,
                percentage: 0,
                isActive: false,
                isPaused: false,
                isCancelled: false
            }
            console.log('🧹 Estado limpiado completamente (backend + frontend)')
        } catch (error) {
            console.error('❌ Error limpiando estado:', error)
            // Limpiar frontend aunque falle el backend
            detenerMonitoreoProgreso()
            progreso.value = {
                batchId: null,
                total: 0,
                completed: 0,
                failed: 0,
                pending: 0,
                percentage: 0,
                isActive: false,
                isPaused: false,
                isCancelled: false
            }
        }
    }

    function handleFileUpload(event: Event) {
        const file = (event.target as HTMLInputElement)?.files?.[0]
        if (!file) return

        imagen.value = file
        previewUrl.value = URL.createObjectURL(file)
    }

    async function enviar() {
        if (seleccionados.value.length === 0 || !mensaje.value.trim()) {
            showNotification('error', 'Formulario incompleto', 'Debe seleccionar al menos una región y escribir un mensaje', 5000)
            return
        }

        // Mostrar notificación de confirmación ANTES de enviar
        showNotification(
            'info',
            'Iniciando campaña...',
            `Preparando envío a ${seleccionados.value.length} regional(es). Por favor espera.`,
            3000
        )

        try {
            // Iniciar monitoreo de progreso
            iniciarMonitoreoProgreso()

            const formData = new FormData()

            // Preparar mensajes como array
            const messages = [mensaje.value]
            formData.append('messages', JSON.stringify(messages))
            formData.append('regions', JSON.stringify(seleccionados.value))

            // Agregar imagen si existe
            if (imagen.value) {
                formData.append('file', imagen.value)
            }

            console.log('🚀 Enviando campaña...')
            console.log('✅ Regiones:', seleccionados.value)
            console.log('📝 Mensaje:', mensaje.value)
            console.log('🖼️ Imagen:', imagen.value?.name || 'Sin imagen')

            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.BULK_MESSAGES), {
                method: 'POST',
                body: formData
            })

            const result = await response.text()

            if (response.ok) {
                console.log('✅ Campaña iniciada exitosamente')
                showNotification(
                    'success',
                    '¡Campaña iniciada!',
                    `Campaña de mensajería iniciada para ${seleccionados.value.length} regional(es). El envío está en progreso.`,
                    5000
                )
                // NO limpiar el formulario hasta que termine el envío
            } else {
                throw new Error(result)
            }
        } catch (error) {
            console.error('❌ Error enviando campaña:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            showNotification('error', 'Error al enviar campaña', errorMessage, 6000)
            detenerMonitoreoProgreso()
        }
    }

    function formatearMensaje(texto: string) {
        if (!texto) return ''
        // Negritas *texto*
        let html = texto
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/~(.*?)~/g, '<del>$1</del>')
            // Links simples http(s)://...
            .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" class="underline text-emerald-700 hover:text-emerald-900">$1</a>'
            )
        return html
    }

    // Cargar regionales al montar el componente
    onMounted(async () => {
        cargarRegiones()

        // Verificar si hay algún proceso activo al cargar la página
        try {
            const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROGRESS))
            const data = await response.json()

            if (data.isActive) {
                progreso.value = data
                enviando.value = true
                // Iniciar monitoreo si hay un proceso activo, preservando el progreso actual
                iniciarMonitoreoProgreso(true)
            }
        } catch (error) {
            console.error('❌ Error verificando estado inicial:', error)
        }
    })
</script>

<template>
    <div class="min-h-screen">
        <!-- Toast Notification -->
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
                    'fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[9999] rounded-lg shadow-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-5',
                    notification.type === 'success' ? 'bg-green-50 border-2 border-green-500' : '',
                    notification.type === 'error' ? 'bg-red-50 border-2 border-red-500' : '',
                    notification.type === 'info' ? 'bg-blue-50 border-2 border-blue-500' : ''
                ]"
            >
                <div class="flex-shrink-0">
                    <CheckCircle v-if="notification.type === 'success'" class="h-6 w-6 text-green-600" />
                    <AlertCircle v-else-if="notification.type === 'error'" class="h-6 w-6 text-red-600" />
                    <Info v-else class="h-6 w-6 text-blue-600" />
                </div>
                <div class="flex-1">
                    <h4
                        :class="[
                            'font-semibold text-sm mb-1',
                            notification.type === 'success' ? 'text-green-900' : '',
                            notification.type === 'error' ? 'text-red-900' : '',
                            notification.type === 'info' ? 'text-blue-900' : ''
                        ]"
                    >
                        {{ notification.title }}
                    </h4>
                    <p
                        :class="[
                            'text-sm',
                            notification.type === 'success' ? 'text-green-700' : '',
                            notification.type === 'error' ? 'text-red-700' : '',
                            notification.type === 'info' ? 'text-blue-700' : ''
                        ]"
                    >
                        {{ notification.message }}
                    </p>
                </div>
                <button
                    @click="notification.show = false"
                    class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X class="h-5 w-5" />
                </button>
            </div>
        </transition>

        <!-- Corporate Header -->
        <div class="bg-white border-b-4 border-yellow-400 shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div class="flex items-center">
                        <div class="mr-4">
                            <div class="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                                <MessageSquare class="w-6 h-6 text-yellow-400" />
                            </div>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-blue-900">Módulo de Comunicaciones</h1>
                            <p class="text-gray-600 mt-1">Mensajería masiva WhatsApp - MINOIL S.A.</p>
                        </div>
                    </div>
                    <router-link
                        to="/admin/dashboard"
                        class="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                    >
                        ← Volver al Dashboard
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <!-- Description Section -->
            <div class="bg-white border-l-4 border-blue-900 rounded-lg shadow-lg p-6 mb-8">
                <h2 class="text-lg font-bold text-blue-900 mb-2">
                    Sistema de Comunicaciones Corporativas
                </h2>
                <p class="text-gray-600">
                    Plataforma empresarial para el envío de mensajes masivos a múltiples regionales de manera
                        eficiente y profesional.
                    </p>
                </div>

            <Card class="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader class="pb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Users class="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <CardTitle class="text-xl text-slate-900">
                                Configuración de Campaña
                            </CardTitle>
                            <CardDescription class="text-slate-500">
                                Configure los destinatarios, contenido y adjuntos para su campaña
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent class="space-y-8">
                    <!-- Selección de Regiones -->
                    <div class="space-y-6">
                        <!-- Encabezado -->
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <!-- Título -->
                            <div class="flex items-center gap-2 flex-wrap">
                                <MapPin class="w-5 h-5 text-slate-500" />
                                <h3 class="text-lg font-semibold text-slate-900">
                                    Regionales de Destino
                                </h3>
                                <Badge variant="secondary">
                                    {{ seleccionados . length }} seleccionadas
                                </Badge>
                            </div>

                            <!-- Botones -->
                            <div class="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" @click="seleccionarTodas"
                                    class="text-slate-600 border-slate-200 hover:bg-slate-50">
                                    <CheckSquare class="w-4 h-4 mr-1" />
                                    Todas
                                </Button>
                                <Button variant="outline" size="sm" @click="deseleccionarTodas"
                                    class="text-slate-600 border-slate-200 hover:bg-slate-50">
                                    <Square class="w-4 h-4 mr-1" />
                                    Ninguna
                                </Button>
                            </div>
                        </div>

                        <!-- Grid de regiones -->
                        <div v-if="cargandoRegiones" class="text-center py-8">
                            <p class="text-slate-500">Cargando regionales...</p>
                        </div>
                        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="region in regiones" :key="region" class="group relative">
                                <div :class="[
                                    'flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer',
                                    seleccionados.includes(region) ?
                                    'border-emerald-200 bg-emerald-50 shadow-sm' :
                                    'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                ]"
                                    @click="toggleRegion(region)">
                                    <Checkbox :id="region" :model-value="seleccionados.includes(region)"
                                        @update:model-value="() => toggleRegion(region)"
                                        class="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                                    <label :for="region"
                                        class="text-sm font-medium text-slate-700 cursor-pointer flex-1">
                                        {{ region }}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Adjunto de Imagen -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Columna Izquierda: Vista previa tipo WhatsApp -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <MessageSquare class="w-6 h-6 text-slate-500" />
                                Vista previa del mensaje para cliente final
                            </h3>

                            <div class="p-4 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-4">
                                <!-- Imagen dentro de burbuja -->
                                <div v-if="previewUrl"
                                    class="rounded-xl overflow-hidden border border-slate-200 shadow">
                                    <img :src="previewUrl" alt="Imagen del mensaje"
                                        class="w-full object-contain" />
                                </div>

                                <!-- Texto dentro de burbuja tipo WhatsApp -->
                                <div class="bg-emerald-50 text-emerald-900 p-4 rounded-2xl whitespace-pre-wrap break-words text-sm font-sans shadow-inner"
                                    v-html="formatearMensaje(mensaje)">
                                </div>
                            </div>
                        </div>

                        <!-- Columna Derecha: Imagen + texto -->
                        <div class="space-y-8">
                            <!-- Imagen -->
                            <div class="space-y-4">
                                <h3 class="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                    <ImageIcon class="w-5 h-5 text-slate-500" />
                                    Imagen Adjunta
                                </h3>

                                <Badge variant="outline" v-if="imagen">{{ imagen . name }}</Badge>

                                <div class="relative">
                                    <input type="file" accept="image/*" @change="handleFileUpload"
                                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        id="file-upload" />
                                    <div
                                        class="border-2 border-dashed border-slate-300 rounded-xl p-2 text-center hover:border-slate-400 transition-colors bg-slate-50/50">
                                        <Upload class="w-8 h-8 text-slate-400 mx-auto mb-1" />
                                        <p class="text-sm font-medium text-slate-600 mb-1">Haga clic para subir una
                                            imagen</p>
                                        <p class="text-xs text-slate-500">PNG, JPG, GIF hasta 10MB</p>
                                    </div>
                                </div>


                            </div>

                            <!-- Texto -->
                            <div class="space-y-4">
                                <h3 class="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                    <MessageSquare class="w-5 h-5 text-slate-500" />
                                    Contenido del Mensaje
                                </h3>

                                <div class="relative">
                                    <textarea v-model="mensaje" rows="6"
                                        class="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-sm placeholder-slate-400 resize-none bg-white"
                                        placeholder="Redacte aquí el mensaje que será enviado a las regionales seleccionadas..." />
                                    <div class="absolute bottom-3 right-3 text-xs text-slate-400">
                                        {{ mensaje . length }} caracteres
                                    </div>
                                </div>

                                <div class="bg-slate-50 rounded-lg p-3">
                                    <p class="text-xs text-slate-600 mb-1 font-medium">💡 Formato de WhatsApp
                                        disponible:</p>
                                    <p class="text-xs text-slate-500">
                                        *Texto en negrita* • _Texto en cursiva_ • ~Texto tachado~ • ```Código``` •
                                        Emojis y enlaces
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>


                </CardContent>

                <!-- Progress Bar Section -->
                <div v-if="enviando || progreso.isActive" class="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <h4 class="text-sm font-medium text-slate-700">
                                📤 Enviando mensajes...
                            </h4>
                            <span class="text-sm text-slate-500">
                                {{ progreso.completed }} / {{ progreso.total }}
                            </span>
                        </div>

                        <!-- Progress Bar -->
                        <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                            <div
                                class="bg-emerald-500 h-3 rounded-full transition-all duration-300 ease-out"
                                :style="{ width: `${progreso.percentage}%` }"
                            ></div>
                        </div>

                        <!-- Progress Stats -->
                        <div class="flex justify-between text-xs text-slate-600">
                            <div class="flex gap-4">
                                <span class="flex items-center gap-1">
                                    <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    Exitosos: {{ progreso.completed }}
                                </span>
                                <span class="flex items-center gap-1" v-if="progreso.failed > 0">
                                    <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                                    Fallidos: {{ progreso.failed }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <span class="w-2 h-2 bg-slate-400 rounded-full"></span>
                                    Pendientes: {{ progreso.pending }}
                                </span>
                            </div>
                            <span>{{ progreso.percentage }}%</span>
                        </div>

                        <!-- Control Buttons -->
                        <div class="flex justify-center gap-3 pt-3 border-t border-slate-200">
                            <Button
                                v-if="!progreso.isPaused && progreso.isActive && !progreso.isCancelled"
                                @click="pausarEnvio"
                                size="sm"
                                variant="outline"
                                class="text-amber-600 border-amber-200 hover:bg-amber-50">
                                <Pause class="w-4 h-4 mr-2" />
                                Pausar
                            </Button>
                            <Button
                                v-if="progreso.isPaused && progreso.isActive && !progreso.isCancelled"
                                @click="reanudarEnvio"
                                size="sm"
                                variant="outline"
                                class="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                <Play class="w-4 h-4 mr-2" />
                                Reanudar
                            </Button>
                            <Button
                                v-if="progreso.isActive && !progreso.isCancelled"
                                @click="cancelarEnvio"
                                size="sm"
                                variant="outline"
                                class="text-red-600 border-red-200 hover:bg-red-50">
                                <X class="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                        </div>

                        <!-- Status Messages -->
                        <div v-if="progreso.isPaused" class="text-center text-sm text-amber-600 font-medium">
                            ⏸️ Envío pausado
                        </div>
                        <div v-if="progreso.isCancelled" class="text-center space-y-2">
                            <div class="text-sm text-red-600 font-medium">
                                ❌ Envío cancelado
                            </div>
                            <Button
                                @click="limpiarEstado"
                                size="sm"
                                variant="outline"
                                class="text-slate-600 border-slate-200 hover:bg-slate-50">
                                🧹 Limpiar Estado
                            </Button>
                        </div>

                        <!-- Indicador de Conectividad -->
                        <div v-if="!conectividad && progreso.isActive" class="text-center space-y-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div class="text-sm text-amber-700 font-medium">
                                ⚠️ Problemas de conectividad
                            </div>
                            <div class="text-xs text-amber-600">
                                El monitoreo se pausó debido a errores de red
                            </div>
                            <Button
                                @click="reanudarMonitoreo"
                                size="sm"
                                variant="outline"
                                class="text-amber-600 border-amber-200 hover:bg-amber-100">
                                🔄 Reanudar Monitoreo
                            </Button>
                        </div>
                    </div>
                </div>

                <CardFooter
                    class="bg-slate-50/50 rounded-b-lg border-t border-slate-100 flex justify-between items-center py-6">
                    <div class="flex items-center gap-4">
                        <div class="text-sm text-slate-600">
                            <span class="font-medium">{{ seleccionados . length }}</span> regionales seleccionadas
                        </div>
                        <div class="text-sm text-slate-600">
                            <span class="font-medium">{{ mensaje . length }}</span> caracteres
                        </div>
                    </div>

                    <Button @click="enviar" :disabled="seleccionados.length === 0 || !mensaje.trim() || enviando"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send v-if="!enviando" class="w-4 h-4 mr-2" />
                        <div v-else class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {{ enviando ? 'Enviando...' : 'Enviar Campaña' }}
                    </Button>
                </CardFooter>
            </Card>

            <!-- Footer Info -->
            <div class="text-center mt-8">
                <p class="text-xs text-slate-500">
                    Sistema de mensajería corporativa • Todos los envíos son registrados y auditables
                </p>
            </div>
        </div>
    </div>

</template>
