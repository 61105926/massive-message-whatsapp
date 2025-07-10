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
        ref
    } from 'vue'
    import {
        MessageSquare,
        MapPin,
        Image as ImageIcon,
        Send,
        CheckSquare,
        Square,
        Upload,
        Users
    } from 'lucide-vue-next'

    const regiones = [
        'La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro',
        'Tarija', 'Potosí', 'Chuquisaca', 'Beni', 'Pando'
    ]

    const seleccionados = ref < string[] > ([])
    const mensaje = ref('')
    const imagen = ref < File | null > (null)
    const previewUrl = ref < string | null > (null)

    function toggleRegion(region: string) {
        if (seleccionados.value.includes(region)) {
            seleccionados.value = seleccionados.value.filter(r => r !== region)
        } else {
            seleccionados.value.push(region)
        }
    }

    function seleccionarTodas() {
        seleccionados.value = [...regiones]
    }

    function deseleccionarTodas() {
        seleccionados.value = []
    }

    function handleFileUpload(event: Event) {
        const file = (event.target as HTMLInputElement)?.files?.[0]
        if (!file) return

        imagen.value = file
        previewUrl.value = URL.createObjectURL(file)
    }

    function enviar() {
        console.log('✅ Enviando a:', seleccionados.value)
        console.log('📝 Mensaje:', mensaje.value)
        console.log('🖼️ Imagen:', imagen.value?.name)
        // Aquí podrías llamar una API, n8n o lo que desees
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
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-1 px-1">
        <div class=" mx-auto">
            <!-- Header Section -->
            <div
                class="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left max-w-4xl mx-auto py-1">
                <!-- Ícono / Logo -->
                <div class="flex-shrink-0">
                    <div class="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-emerald-100 rounded-2xl">
                        <MessageSquare class="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                    </div>
                </div>

                <!-- Título y descripción -->
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                        Mensajería Masiva WhatsApp
                    </h1>
                    <p class="text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
                        Plataforma corporativa para el envío de mensajes masivos a múltiples regionales de manera
                        eficiente y profesional.
                    </p>
                </div>
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
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <DeviceMobile class="w-6 h-6 text-slate-500" />
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

                    <Button @click="enviar" :disabled="seleccionados.length === 0 || !mensaje.trim()"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send class="w-4 h-4 mr-2" />
                        Enviar Campaña
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
