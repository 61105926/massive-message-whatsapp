<template>
  <!-- Header Ejecutivo Profesional -->
  <header class="bg-white border-b border-blue-200">
    <div class="max-w-7xl mx-auto px-4 py-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div
            class="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-medium text-blue-900">
              MINOIL - Análisis de Clima Laboral
            </h1>
            <p class="text-xs text-blue-600">
              Reporte Ejecutivo {{ new Date().getFullYear() }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="text-right">
            <div class="text-xs text-blue-700">
              {{
                new Date().toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              }}
            </div>
            <div class="text-xs text-blue-600">
              {{
                new Date().toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </div>
          </div>
          <div
            class="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
            <svg
              class="w-3 h-3 text-blue-600">
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Loading mejorado -->
  <div v-if="cargando" class="flex items-center justify-center py-16">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
      <h3 class="text-sm font-medium text-blue-700 mb-1">Cargando Datos</h3>
      <p class="text-xs text-blue-600">
        Obteniendo información del clima laboral...
      </p>
    </div>
  </div>

  <!-- Error mejorado -->
  <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-8">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <div
          class="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
          <svg
            class="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-red-800 mb-1">
            Error al Cargar Datos
          </h3>
          <p class="text-xs text-red-700 mb-2">{{ error }}</p>
          <button
            @click="cargarDatos"
            class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Contenido principal ejecutivo -->
  <main v-else class="max-w-7xl mx-auto px-6 py-8 space-y-8">

  <!-- Panel de Filtros Ejecutivo -->

  <!-- Header compacto -->
  <div class="border-b border-blue-200 px-4 py-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <h2 class="text-xs font-medium text-blue-700">
          Parámetros de Análisis
        </h2>
      </div>
      <div v-if="filtrosActivos" class="flex items-center space-x-2">
        <span class="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
          {{ contadorFiltros }} filtro{{ contadorFiltros !== 1 ? "s" : "" }}
        </span>
        <button
          @click="limpiarFiltros"
          class="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
          Limpiar
        </button>
      </div>
    </div>
  </div>

  <!-- Contenido compacto -->
  <div class="p-3">
    <div class="grid grid-cols-3 gap-3">
      <!-- Filtro Regional -->
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <div
            class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              class="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <label class="block text-xs font-medium text-blue-600"
            >Regional</label
          >
        </div>
        <div class="relative">
          <select
            v-model="filtroRegional"
            @change="actualizarDatos"
            class="w-full px-2 py-1 text-xs bg-white border border-blue-300 rounded focus:border-blue-500 focus:outline-none">
            <option value="">Todas las regionales</option>
            <option
              v-for="regional in regionalesDisponibles"
              :key="regional"
              :value="regional">
              {{ regional }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg
              class="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <p class="text-xs text-blue-500 flex items-center space-x-1">
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ regionalesDisponibles.length }} regionales disponibles</span>
        </p>
      </div>

      <!-- Filtro Area -->
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <div
            class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
            <svg
              class="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <label class="block text-xs font-medium text-blue-600"
            >Área de Trabajo</label
          >
        </div>
        <div class="relative">
          <select
            v-model="filtroArea"
            @change="actualizarDatos"
            class="w-full px-2 py-1 text-xs bg-white border border-blue-300 rounded focus:border-blue-500 focus:outline-none">
            <option value="">Todas las áreas</option>
            <option v-for="area in areasDisponibles" :key="area" :value="area">
              {{ area }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg
              class="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <p class="text-xs text-blue-500 flex items-center space-x-1">
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ areasDisponibles.length }} áreas disponibles</span>
        </p>
      </div>

      <!-- Filtro Pregunta -->
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <div
            class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              class="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <label class="block text-sm font-semibold text-blue-800">
            Pregunta a Analizar
            <span class="text-red-500 ml-1">*</span>
          </label>
        </div>
        <div class="relative">
          <select
            v-model="preguntaSeleccionada"
            @change="actualizarDatos"
            class="w-full px-2 py-1 text-xs bg-white border border-blue-300 rounded focus:border-blue-500 focus:outline-none">
            <option value="">Seleccionar pregunta</option>
            <option
              v-for="pregunta in preguntasOrdenadas"
              :key="pregunta.id"
              :value="pregunta.id">
              {{ pregunta.id }}. {{ pregunta.texto.substring(0, 60)
              }}{{ pregunta.texto.length > 60 ? "..." : "" }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg
              class="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <p class="text-xs text-blue-500">39 preguntas ordenadas del 1 al 39</p>
      </div>
    </div>

    <!-- Resumen de filtros -->
    <div
      v-if="filtrosActivos"
      class="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-xs font-medium text-blue-700"
            >Filtros Activos:</span
          >
          <div class="flex flex-wrap gap-2">
            <span
              v-if="filtroRegional"
              class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
              {{ filtroRegional }}
            </span>
            <span
              v-if="filtroArea"
              class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
              {{ filtroArea }}
            </span>
            <span
              v-if="preguntaSeleccionada"
              class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
              Pregunta {{ preguntaSeleccionada }}
            </span>
          </div>
        </div>
        <span class="text-xs text-blue-600"
          >{{ totalRespuestas }} respuestas</span
        >
      </div>
    </div>
  </div>

  <!-- Reporte Visual Principal -->
  <div
    v-if="preguntaSeleccionada && datosVista.length > 0"
    class="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
    <!-- Header del reporte con gradiente -->
    <div class="bg-blue-50 px-6 py-4 border-b border-blue-200">
      <div class="flex items-start space-x-4">
        <!-- Icono / Número de pregunta -->
        <div
          class="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-md">
          <span class="text-white font-semibold text-lg">{{
            preguntaSeleccionada
          }}</span>
        </div>

        <!-- Contenido principal -->
        <div class="flex-1">
          <!-- Categoría y estadísticas -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <h3
              class="text-lg sm:text-xl font-bold text-blue-800 mb-1 sm:mb-0">
              {{ preguntaActual?.categoria }}
            </h3>
            <div class="flex space-x-2 text-sm">
              <!-- Total respuestas -->
              <span
                class="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                <svg
                  class="w-4 h-4 mr-1 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                {{ totalRespuestas }} respuestas
              </span>
              <!-- Total regionales -->
              <span
                class="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                <svg
                  class="w-4 h-4 mr-1 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {{ regionalesUnicas }} regionales
              </span>
            </div>
          </div>

          <!-- Texto de la pregunta -->
          <div
            class="bg-white p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <p class="text-blue-700 text-base sm:text-lg leading-relaxed">
              {{ preguntaActual?.texto }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido del reporte -->
    <div class="p-8">
      <!-- Resumen Ejecutivo Nacional - Tabla Mejorada -->
      <div
        class="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden mb-8">
        <div
          class="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 p-8 text-white">
          <div class="text-center mb-8">
         
            <h4 class="text-2xl font-bold mb-2">
              🇧🇴 Resumen Ejecutivo Nacional
            </h4>
            <p class="text-blue-300 text-lg">
              Análisis de Resultados por Indicadores Clave
            </p>
          </div>
          <!-- Para preguntas de opciones directas (14, 36) -->
          <div
            v-if="[14, 36].includes(parseInt(preguntaSeleccionada))"
            class="grid gap-4">
            <div
              v-for="(opcion, index) in opcionesDinamicas"
              :key="opcion"
              class="bg-blue-900 bg-opacity-10 rounded-2xl p-6 backdrop-blur border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div
                    class="w-6 h-6 rounded-xl shadow-lg"
                    :style="{
                      background: `hsl(${200 + index * 40}, 70%, ${55 - index * 3}%)`,
                    }"></div>
                  <span class="text-white font-semibold text-lg">{{
                    opcion.length > 40
                      ? opcion.substring(0, 40) + "..."
                      : opcion
                  }}</span>
                </div>
                <div class="text-right">
                  <div class="text-4xl font-black text-white mb-1">
                    {{
                      datosVista.reduce((sum, r) => sum + (r[opcion] || 0), 0)
                    }}
                  </div>
                  <div class="text-sm text-blue-300 font-medium">
                    respuestas
                  </div>
                  <div class="text-xl font-bold text-yellow-300 mt-2">
                    {{
                      Math.round(
                        (datosVista.reduce(
                          (sum, r) => sum + (r[opcion] || 0),
                          0
                        ) /
                          totalRespuestas) *
                          100
                      )
                    }}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Para otras preguntas - Gráfico donut mejorado con diseño ejecutivo -->
          <div
            v-else
            class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <!-- Gráfico mejorado -->
            <div class="flex items-center justify-center">
              <div class="relative">
                <!-- SVG Donut Chart mejorado -->
                <svg width="280" height="280" class="transform -rotate-90">
                  <!-- Circulo base -->
                  <circle
                    cx="140"
                    cy="140"
                    r="110"
                    fill="transparent"
                    stroke="#374151"
                    stroke-width="30"
                    class="drop-shadow-lg"></circle>
                  <!-- Segmento positivo -->
                  <circle
                    cx="140"
                    cy="140"
                    r="110"
                    fill="transparent"
                    stroke="#10B981"
                    stroke-width="30"
                    :stroke-dasharray="`${(porcentajePositivoTotal * 691) / 100} 691`"
                    stroke-dashoffset="0"
                    class="drop-shadow-lg transition-all duration-1000"></circle>
                  <!-- Segmento negativo -->
                  <circle
                    cx="140"
                    cy="140"
                    r="110"
                    fill="transparent"
                    stroke="#EF4444"
                    stroke-width="30"
                    :stroke-dasharray="`${(porcentajeNegativoTotal * 691) / 100} 691`"
                    :stroke-dashoffset="`-${(porcentajePositivoTotal * 691) / 100}`"
                    class="drop-shadow-lg transition-all duration-1000"></circle>
                </svg>

                <!-- Centro con estadisticas mejoradas -->
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div
                    class="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur border border-white border-opacity-20">
                    <div class="space-y-3">
                      <div class="text-5xl font-black text-green-400">
                        {{ porcentajePositivoTotal }}%
                      </div>
                      <div
                        class="text-sm text-green-300 font-semibold tracking-wide uppercase">
                        Positivo
                      </div>
                    </div>
                    <div class="w-16 h-px bg-blue-400 my-4 mx-auto"></div>
                    <div class="space-y-3">
                      <div class="text-4xl font-black text-red-400">
                        {{ porcentajeNegativoTotal }}%
                      </div>
                      <div
                        class="text-sm text-red-300 font-semibold tracking-wide uppercase">
                        Negativo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Panel de métricas ejecutivas -->
            <div class="space-y-4">
              <div
                class="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur border border-white border-opacity-20">
                <div class="text-center">
                  <div class="text-6xl font-black text-blue-800 mb-2">
                    {{ totalRespuestas }}
                  </div>
                  <div
                    class="text-lg text-blue-800 font-semibold tracking-wide uppercase">
                    Total Respuestas
                  </div>
                </div>
              </div>
              <div
                class="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur border border-white border-opacity-20">
                <div class="text-center">
                  <div class="text-4xl font-black text-blue-800 mb-2">
                    {{ datosVista.length }}
                  </div>
                  <div
                    class="text-lg text-blue-800 font-semibold tracking-wide uppercase">
                    Regionales
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de Gráficos Visuales -->
        <div v-if="datosVista.length > 0" class="bg-white border-t border-blue-100">
          <div class="px-8 py-6">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-blue-900">
                Análisis Visual de Datos
              </h4>
              <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                {{ datosVista.length }} respuestas
              </span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Gráfico de Distribución por Regional -->
              <div class="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
                <h4 class="text-sm font-medium text-blue-900 mb-4 flex items-center">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Distribución por Regional
                </h4>
                <div class="h-64">
                  <Bar v-if="chartDataRegional" :data="chartDataRegional" :options="barChartOptions" />
                </div>
              </div>

              <!-- Gráfico de Distribución de Respuestas -->
              <div class="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
                <h4 class="text-sm font-medium text-blue-900 mb-4 flex items-center">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Distribución de Respuestas
                </h4>
                <div class="h-64">
                  <Doughnut v-if="chartDataRespuestas" :data="chartDataRespuestas" :options="chartOptions" />
                </div>
              </div>
            </div>

            <!-- Resumen Estadístico Mejorado -->
            <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-900">{{ totalRespuestas }}</div>
                <div class="text-sm text-blue-700">Total Respuestas</div>
              </div>
              <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-900">{{ porcentajePositivoTotal }}%</div>
                <div class="text-sm text-blue-700">Evaluación Positiva</div>
              </div>
              <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-900">{{ regionalesUnicas }}</div>
                <div class="text-sm text-blue-700">Regionales</div>
              </div>
              <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-900">{{ categoriasUnicas.length }}</div>
                <div class="text-sm text-blue-700">Categorías</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Análisis por Regional - Tabla Ejecutiva Profesional -->
        <div class="bg-blue-50 border-t border-blue-200">
          <div class="px-8 py-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-slate-600 rounded flex items-center justify-center">
                  <svg
                    class="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-blue-800">
                  Análisis por Regional
                </h4>
              </div>
              <div class="text-sm text-blue-600">
                {{ regionalesUnicas }} regionales analizadas
              </div>
            </div>

            <!-- Tabla Ejecutiva Moderna -->
            <div
              class="bg-white border border-blue-200 rounded-lg overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-blue-100 border-b border-blue-200">
                    <tr>
                      <th
                        class="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Regional
                      </th>
                      <th
                        class="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Total
                      </th>
                      <!-- Headers dinámicos según tipo de pregunta -->
                      <th
                        v-if="
                          preguntaSeleccionada >= 1 && preguntaSeleccionada <= 9
                        "
                        class="px-4 py-3 text-center text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Muy Bueno
                      </th>
                      <th
                        v-if="
                          preguntaSeleccionada >= 1 && preguntaSeleccionada <= 9
                        "
                        class="px-4 py-3 text-center text-xs font-medium text-green-700 uppercase tracking-wider">
                        Bueno
                      </th>
                      <th
                        v-if="
                          preguntaSeleccionada >= 1 && preguntaSeleccionada <= 9
                        "
                        class="px-4 py-3 text-center text-xs font-medium text-yellow-700 uppercase tracking-wider">
                        Regular
                      </th>
                      <th
                        v-if="
                          preguntaSeleccionada >= 1 && preguntaSeleccionada <= 9
                        "
                        class="px-4 py-3 text-center text-xs font-medium text-orange-700 uppercase tracking-wider">
                        Malo
                      </th>
                      <th
                        v-if="
                          preguntaSeleccionada >= 1 && preguntaSeleccionada <= 9
                        "
                        class="px-4 py-3 text-center text-xs font-medium text-red-700 uppercase tracking-wider">
                        Muy Malo
                      </th>
                      <th
                        v-else-if="
                          [10, 15, 24, 25, 31, 32, 37, 39].includes(
                            parseInt(preguntaSeleccionada)
                          )
                        "
                        class="px-4 py-3 text-center text-xs font-medium text-green-700 uppercase tracking-wider">
                        Positivas
                      </th>
                      <th
                        v-else-if="
                          [14, 36].includes(parseInt(preguntaSeleccionada))
                        "
                        v-for="opcion in opcionesDinamicas"
                        :key="opcion"
                        class="px-4 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">
                        {{
                          opcion.length > 10
                            ? opcion.substring(0, 10) + "..."
                            : opcion
                        }}
                      </th>
                      <th
                        v-else
                        class="px-4 py-3 text-center text-xs font-medium text-green-700 uppercase tracking-wider">
                        Positivas
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr
                      v-for="(dato, index) in datosVista"
                      :key="dato.regional"
                      class="hover:bg-blue-50 transition-colors">
                      <!-- Regional -->
                      <td class="px-4 py-4">
                        <div class="flex items-center space-x-2">
                          <div
                            class="w-2 h-2 rounded-full"
                            :style="{
                              backgroundColor: `hsl(${index * 30}, 60%, 50%)`,
                            }"></div>
                          <span class="text-sm font-medium text-slate-900">{{
                            dato.regional
                          }}</span>
                        </div>
                      </td>
                      <!-- Total -->
                      <td class="px-4 py-4 text-center">
                        <span class="text-sm font-semibold text-slate-800">{{
                          dato.total
                        }}</span>
                      </td>

                      <!-- Datos específicos por tipo de pregunta -->
                      <!-- Para preguntas 1-9 -->
                      <template
                        v-if="
                          preguntaSeleccionada >= 1 && preguntaSeleccionada <= 9
                        ">
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-emerald-600">
                              {{
                                Math.round((dato.muy_bueno / dato.total) * 100)
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.muy_bueno }})
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-green-600">
                              {{ Math.round((dato.bueno / dato.total) * 100) }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.bueno }})
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-yellow-600">
                              {{
                                Math.round((dato.regular / dato.total) * 100)
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.regular }})
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-orange-600">
                              {{ Math.round((dato.malo / dato.total) * 100) }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.malo }})
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-red-600">
                              {{
                                Math.round((dato.muy_malo / dato.total) * 100)
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.muy_malo }})
                            </div>
                          </div>
                        </td>
                      </template>

                      <!-- Para preguntas Si/No -->
                      <template
                        v-else-if="
                          [10, 15, 24, 25, 31, 32, 37, 39].includes(
                            parseInt(preguntaSeleccionada)
                          )
                        ">
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-green-600">
                              {{
                                Math.round((dato.positivos / dato.total) * 100)
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.positivos }})
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-red-600">
                              {{
                                Math.round((dato.negativos / dato.total) * 100)
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.negativos }})
                            </div>
                          </div>
                        </td>
                      </template>

                      <!-- Para preguntas de opciones directas (14, 36) -->
                      <template
                        v-else-if="
                          [14, 36].includes(parseInt(preguntaSeleccionada))
                        ">
                        <td
                          v-for="opcion in opcionesDinamicas"
                          :key="opcion"
                          class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-blue-700">
                              {{
                                Math.round(
                                  ((dato[opcion] || 0) / dato.total) * 100
                                )
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato[opcion] || 0 }})
                            </div>
                          </div>
                        </td>
                      </template>

                      <!-- Para preguntas generales -->
                      <template v-else>
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-green-600">
                              {{
                                Math.round((dato.positivos / dato.total) * 100)
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.positivos }})
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-yellow-600">
                              {{
                                Math.round((dato.neutros / dato.total) * 100)
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.neutros }})
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-center">
                          <div class="flex flex-col items-center space-y-1">
                            <div class="text-2xl font-black text-red-600">
                              {{
                                Math.round((dato.negativos / dato.total) * 100)
                              }}%
                            </div>
                            <div class="text-xs text-blue-600">
                              ({{ dato.negativos }})
                            </div>
                          </div>
                        </td>
                      </template>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reporte Ejecutivo de Opciones Detalladas -->
      <div
        v-if="
          [10, 15, 16, 24, 25, 31, 32, 37, 39].includes(
            parseInt(preguntaSeleccionada)
          ) &&
          (reporteAdditionalInfo.totalRespuestasNo > 0 ||
            opcionesDinamicas.length > 0)
        "
        class="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden mb-8">
        <div
          style="background: var(--color-blue-800);" class="p-8 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <h4 class="text-2xl font-bold mb-2">
                  Análisis de Opciones Detalladas
                </h4>
                <p class="text-blue-200">
                  Desglose completo de respuestas específicas
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-4xl font-black text-white mb-1">
                {{ datosFiltrados.length }}
              </div>
              <div
                class="text-sm text-blue-200 font-semibold uppercase tracking-wide">
                Total Respuestas
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="p-8 bg-blue-50">
            <h4 class="text-2xl font-bold text-blue-900 mb-6 text-center">
              Frecuencia de Opciones Específicas
            </h4>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              <div
                v-for="(
                  info, index
                ) in reporteAdditionalInfo.informacionAdicional"
                :key="index"
                class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
                <div class="flex items-center justify-between">
                  <div class="flex-1 mr-6">
                    <div
                      class="text-lg font-semibold text-blue-900 mb-2 leading-relaxed">
                      {{ info.texto }}
                    </div>
                    <div class="flex items-center space-x-4">
                      <div class="flex items-center space-x-2">
                        <div
                          class="w-20 bg-blue-200 rounded-full h-3 overflow-hidden">
                          <div
                            class="h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                            :style="{ width: info.porcentaje + '%' }"></div>
                        </div>
                        <span
                          class="text-sm font-semibold text-blue-600 min-w-[3rem]"
                          >{{ info.porcentaje }}%</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-4xl font-black text-purple-600 mb-1">
                      {{ info.total }}
                    </div>
                    <div
                      class="text-sm font-semibold text-blue-500 uppercase tracking-wide">
                      Respuestas
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Sugerencias Mejorada con Paginación -->
      <div v-if="todasLasSugerencias.length > 0" class="mt-4">
        <div class="bg-white border border-blue-200 rounded-xl shadow-sm">
          <!-- Header de la sección -->
          <div class="bg-blue-50 border-b border-blue-200 px-4 py-3 rounded-t-xl">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium" style="color: var(--color-blue-800);">
                  Sugerencias del Personal
                </h4>
              </div>
              <div class="text-right">
                <div class="text-sm" style="color: var(--color-blue-800);">
                  {{ todasLasSugerencias.length }} sugerencias
                </div>
              </div>
            </div>
          </div>

          <!-- Contenido con paginación -->
          <div class="p-8">
            <!-- Información de paginación -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-4">
                <span class="font-medium" style="color: var(--color-blue-800);">
                  Mostrando
                  {{ (sugerenciasPagina - 1) * sugerenciasPorPagina + 1 }} -
                  {{
                    Math.min(
                      sugerenciasPagina * sugerenciasPorPagina,
                      todasLasSugerencias.length
                    )
                  }}
                  de {{ todasLasSugerencias.length }} sugerencias
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm" style="color: var(--color-blue-800);">Página:</span>
                <span
                  class="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                  {{ sugerenciasPagina }} de {{ totalPaginasSugerencias }}
                </span>
              </div>
            </div>

            <!-- Grid de sugerencias -->
            <div
              class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <div
                v-for="(sugerencia, index) in sugerencias"
                :key="index"
                class="bg-white rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-lg hover:scale-105 transition-all duration-300 group">
                <div class="flex items-start space-x-4">
                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300" style="background: var(--color-blue-800);">
                    <span class="text-white font-bold text-lg">{{
                      (sugerenciasPagina - 1) * sugerenciasPorPagina + index + 1
                    }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-blue-800 leading-relaxed font-medium mb-3">
                      {{ sugerencia.texto }}
                    </p>
                    <div class="flex items-center justify-between">
                      <span
                        class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-xl border border-blue-200">
                        📍 {{ sugerencia.regional }}
                      </span>
                      <div class="flex items-center space-x-1 text-blue-500">
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"></path>
                        </svg>
                        <span class="text-xs font-medium">Pregunta 40</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Controles de paginación simplificados -->
            <div
              v-if="totalPaginasSugerencias > 1"
              class="flex items-center justify-center space-x-6">
              <button
                @click="sugerenciasPagina = Math.max(1, sugerenciasPagina - 1)"
                :disabled="sugerenciasPagina === 1"
                class="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-blue-200 text-blue-700 rounded-2xl hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                style="border-color: var(--color-blue-800); color: var(--color-blue-800);">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"></path>
                </svg>
                <span>Anterior</span>
              </button>

              <!-- Indicador de página actual -->
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium" style="color: var(--color-blue-800);">
                  Página {{ sugerenciasPagina }} de {{ totalPaginasSugerencias }}
                </span>
              </div>

              <button
                @click="
                  sugerenciasPagina = Math.min(
                    totalPaginasSugerencias,
                    sugerenciasPagina + 1
                  )
                "
                :disabled="sugerenciasPagina === totalPaginasSugerencias"
                class="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-blue-200 text-blue-700 rounded-2xl hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                style="border-color: var(--color-blue-800); color: var(--color-blue-800);">
                <span>Siguiente</span>
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado sin pregunta seleccionada -->
      <div
        v-else-if="!preguntaSeleccionada"
        class="bg-white rounded-2xl shadow-xl p-12 text-center border border-blue-200">
        <div
          class="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            class="w-12 h-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h4 class="text-xl font-bold text-blue-900 mb-4">
          Selecciona una Pregunta para Analizar
        </h4>
        <p class="text-blue-600 mb-8 max-w-md mx-auto">
          Utiliza el filtro "Pregunta a Analizar" para seleccionar una pregunta
          especifica y ver el reporte comparativo por regional con graficos
          interactivos.
        </p>
        <div
          class="flex items-center justify-center space-x-2 text-sm text-blue-500">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>39 preguntas disponibles organizadas por categoria</span>
        </div>
      </div>

      <!-- Estado sin datos -->
      <div
        v-else-if="preguntaSeleccionada && datosVista.length === 0"
        class="bg-white rounded-2xl shadow-xl p-12 text-center border border-blue-200">
        <div
          class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            class="w-12 h-12 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
        </div>
        <h4 class="text-xl font-bold text-blue-900 mb-4">
          No Hay Datos Disponibles
        </h4>
        <p class="text-blue-600 mb-6">
          No se encontraron respuestas para la pregunta
          {{ preguntaSeleccionada }} con los filtros seleccionados.
        </p>
        <button
          @click="limpiarFiltros"
          class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          Limpiar Filtros
        </button>
      </div>
    </div>
  </div>
  </main>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Estados reactivos principales
const cargando = ref(false);
const error = ref("");
const datosAPI = ref([]);
const filtroRegional = ref("");
const filtroArea = ref("");
const preguntaSeleccionada = ref("");

// Estados para paginacion de sugerencias
const sugerenciasPagina = ref(1);
const sugerenciasPorPagina = ref(9);

// Datos extraidos de la API
const regionalesDisponibles = ref([]);
const areasDisponibles = ref([]);

// Catalogo de preguntas (sin caracteres especiales)
const preguntasDisponibles = ref([
  {
    id: 1,
    categoria: "Puesto de Trabajo",
    texto: "El trabajo en mi area/unidad esta bien organizado",
  },
  {
    id: 2,
    categoria: "Puesto de Trabajo",
    texto: "Mis funciones y responsabilidades estan definidas claramente",
  },
  {
    id: 3,
    categoria: "Puesto de Trabajo",
    texto: "Recibo informacion de como desempeno mi puesto de trabajo",
  },
  {
    id: 4,
    categoria: "Ambiente de Trabajo",
    texto: "La relacion con los companeros de trabajo es buena",
  },
  {
    id: 5,
    categoria: "Ambiente de Trabajo",
    texto: "Me siento parte de un equipo de trabajo",
  },
  {
    id: 6,
    categoria: "Ambiente de Trabajo",
    texto: "Me resulta facil expresar mis opiniones en mi lugar de trabajo",
  },
  {
    id: 7,
    categoria: "Infraestructura",
    texto: "Dispongo de los materiales y recursos necesarios para mi trabajo",
  },
  {
    id: 8,
    categoria: "Infraestructura",
    texto:
      "Las condiciones de espacio, comodidad, ruido, temperatura e iluminacion son buenas",
  },
  {
    id: 9,
    categoria: "Infraestructura",
    texto: "Las areas de trabajo se conservan limpias y en orden",
  },
  {
    id: 10,
    categoria: "Comunicacion",
    texto: "En MINOIL esta claramente comunicada la filosofia de la empresa",
  },
  {
    id: 11,
    categoria: "Comunicacion",
    texto: "Me siento coparticipe de los exitos y fracasos de mi area",
  },
  {
    id: 12,
    categoria: "Comunicacion",
    texto: "Conozco el codigo etico y de conducta de la organizacion",
  },
  {
    id: 13,
    categoria: "Comunicacion",
    texto: "La comunicacion interna es permanente y planificada",
  },
  {
    id: 14,
    categoria: "Comunicacion",
    texto: "Tengo canales claros para hacer sugerencias o denuncias",
  },
  {
    id: 15,
    categoria: "Motivacion",
    texto: "Estoy motivado para realizar mi trabajo",
  },
  {
    id: 16,
    categoria: "Motivacion",
    texto: "Mi trabajo me ofrece retos y oportunidades de mejora",
  },
  {
    id: 17,
    categoria: "Motivacion",
    texto: "Se como mi trabajo contribuye a los resultados del departamento",
  },
  {
    id: 18,
    categoria: "Motivacion",
    texto:
      "Tengo la informacion necesaria para realizar mi trabajo con excelencia",
  },
  {
    id: 19,
    categoria: "Motivacion",
    texto: "Mi trabajo es reconocido y valorado",
  },
  {
    id: 20,
    categoria: "Motivacion",
    texto: "Recibo capacitacion en areas de mi interes",
  },
  {
    id: 21,
    categoria: "Autonomia",
    texto: "Me siento comprometido para alcanzar las metas establecidas",
  },
  {
    id: 22,
    categoria: "Autonomia",
    texto: "Tengo autonomia para proponer y modificar procesos de trabajo",
  },
  {
    id: 23,
    categoria: "Trabajo en Equipo",
    texto: "Solucionar problemas es mas importante que encontrar culpables",
  },
  {
    id: 24,
    categoria: "Trabajo en Equipo",
    texto: "Formo parte de un equipo que trabaja hacia una meta comun",
  },
  {
    id: 25,
    categoria: "Trabajo en Equipo",
    texto: "Hay buena coordinacion con otras areas de MINOIL",
  },
  {
    id: 26,
    categoria: "Presion",
    texto: "El estres del trabajo en mi area es manejable",
  },
  {
    id: 27,
    categoria: "Presion",
    texto: "Tengo herramientas para manejar mi estres laboral",
  },
  {
    id: 28,
    categoria: "Presion",
    texto: "Tengo mucho trabajo y poco tiempo para realizarlo",
  },
  {
    id: 29,
    categoria: "Presion",
    texto: "Siento que nunca tengo un dia libre",
  },
  {
    id: 30,
    categoria: "Liderazgo",
    texto: "Mi supervisor es justo en sus decisiones",
  },
  {
    id: 31,
    categoria: "Liderazgo",
    texto: "Mi jefe tiene las habilidades para liderar el area",
  },
  { id: 32, categoria: "Liderazgo", texto: "Mi jefe actua de manera correcta" },
  {
    id: 33,
    categoria: "Liderazgo",
    texto: "Mi superior respeta la confidencialidad de nuestras conversaciones",
  },
  {
    id: 34,
    categoria: "Liderazgo",
    texto: "Mi jefe es justo y flexible ante mis peticiones",
  },
  {
    id: 35,
    categoria: "Liderazgo",
    texto: "Puedo contar con la ayuda de mi jefe cuando la necesito",
  },
  {
    id: 36,
    categoria: "Satisfaccion General",
    texto: "Tengo motivos para seguir trabajando en MINOIL",
  },
  {
    id: 37,
    categoria: "Remuneracion",
    texto: "Me pagan lo justo por mi trabajo",
  },
  {
    id: 38,
    categoria: "Remuneracion",
    texto: "Recibo informacion sobre los componentes de mi salario",
  },
  {
    id: 39,
    categoria: "Remuneracion",
    texto: "Estoy satisfecho con los beneficios que ofrece la organizacion",
  },
]);

// Funcion de carga de datos mejorada
const cargarDatos = async () => {
  cargando.value = true;
  error.value = "";

  try {
    console.log("🔄 Iniciando carga desde API...");

    const response = await fetch("http://190.171.225.68/api/climate-reponse", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Formato de datos incorrecto - se esperaba un array");
    }

    datosAPI.value = data;

    // Extraer listas unicas
    const regionales = [
      ...new Set(data.map((item) => item.regional).filter(Boolean)),
    ].sort();
    const areas = [
      ...new Set(data.map((item) => item.area).filter(Boolean)),
    ].sort();

    regionalesDisponibles.value = regionales;
    areasDisponibles.value = areas;

    console.log("✅ Datos cargados exitosamente:");
    console.log(`  📊 ${data.length} registros totales`);
    console.log(
      `  🏢 ${regionales.length} regionales: ${regionales.join(", ")}`
    );
    console.log(`  🔧 ${areas.length} areas`);
  } catch (err) {
    const mensaje = `Error al conectar con la API: ${err.message}`;
    error.value = mensaje;
    console.error("❌", mensaje, err);

    // Limpiar datos en caso de error
    datosAPI.value = [];
    regionalesDisponibles.value = [];
    areasDisponibles.value = [];
  } finally {
    cargando.value = false;
  }
};

// Funcion para clasificar respuestas
const clasificarRespuesta = (
  respuesta,
  preguntaId = null,
  additionalInfo = null
) => {
  if (!respuesta) return "neutro";

  const texto = respuesta.toString().toLowerCase().trim();
  const preguntaIdNum = parseInt(preguntaId);

  // Preguntas 1-9 usan escala especifica de 5 estados en ingles
  if (preguntaIdNum >= 1 && preguntaIdNum <= 9) {
    if (texto.includes("very good") || texto.includes("verigood"))
      return "muy_bueno";
    if (texto.includes("good") && !texto.includes("very")) return "bueno";
    if (texto.includes("average")) return "regular";
    if (texto.includes("bad") && !texto.includes("very")) return "malo";
    if (texto.includes("very bad")) return "muy_malo";
    return "regular"; // default para preguntas 1-9
  }

  // Preguntas especiales que NO usan clasificarRespuesta
  // NOTA: Estas preguntas se procesan directamente en datosVista
  const preguntasSiNo = [10, 15, 24, 25, 31, 32, 37, 39]; // Sin 16 y sin 36
  const preguntasOpcionesDirectas = [14, 36]; // Opciones directas

  if (preguntasSiNo.includes(preguntaIdNum)) {
    console.warn(
      "⚠️ clasificarRespuesta NO debe usarse para preguntas Si/No:",
      preguntaIdNum
    );
    return "error";
  }

  if (preguntasOpcionesDirectas.includes(preguntaIdNum)) {
    console.warn(
      "⚠️ clasificarRespuesta NO debe usarse para preguntas de opciones directas:",
      preguntaIdNum
    );
    return "error";
  }

  // Para todas las demas preguntas (11-14, 16-23, 26-30, 33-35, 38) - clasificacion general
  // Respuestas claramente positivas
  const positivas = [
    "si",
    "yes",
    "excelente",
    "muy bueno",
    "bueno",
    "excellent",
    "very good",
    "good",
    "5",
    "4",
  ];
  if (positivas.some((p) => texto.includes(p))) return "positivo";

  // Respuestas claramente negativas
  const negativas = [
    "no",
    "malo",
    "muy malo",
    "poor",
    "very poor",
    "below average",
    "2",
    "1",
  ];
  if (negativas.some((n) => texto.includes(n))) return "negativo";

  // Escala numerica
  if (texto === "3" || texto.includes("regular") || texto.includes("average"))
    return "neutro";

  return "neutro";
};

// Computed properties principales
const filtrosActivos = computed(() => {
  return filtroRegional.value || filtroArea.value || preguntaSeleccionada.value;
});

const contadorFiltros = computed(() => {
  let count = 0;
  if (filtroRegional.value) count++;
  if (filtroArea.value) count++;
  if (preguntaSeleccionada.value) count++;
  return count;
});

const preguntaActual = computed(() => {
  return preguntasDisponibles.value.find(
    (p) => p.id == preguntaSeleccionada.value
  );
});

const categoriasUnicas = computed(() => {
  return [
    ...new Set(preguntasDisponibles.value.map((p) => p.categoria)),
  ].sort();
});

const preguntasOrdenadas = computed(() => {
  return preguntasDisponibles.value.sort((a, b) => a.id - b.id);
});

const preguntasPorCategoria = (categoria) => {
  return preguntasDisponibles.value
    .filter((p) => p.categoria === categoria)
    .sort((a, b) => a.id - b.id);
};

const datosFiltrados = computed(() => {
  if (!datosAPI.value.length || !preguntaSeleccionada.value) return [];

  return datosAPI.value.filter((item) => {
    // Filtrar por pregunta especifica (permitir tanto string como number)
    if (item.question_id != preguntaSeleccionada.value) return false;

    // Aplicar filtros opcionales
    if (filtroRegional.value && item.regional !== filtroRegional.value)
      return false;
    if (filtroArea.value && item.area !== filtroArea.value) return false;

    return true;
  });
});

const datosVista = computed(() => {
  if (!datosFiltrados.value.length) return [];

  const agrupados = {};
  const preguntaIdNum = parseInt(preguntaSeleccionada.value);
  const esPreguntas1a9 = preguntaIdNum >= 1 && preguntaIdNum <= 9;
  const preguntasSiNo = [10, 15, 24, 25, 31, 32, 37, 39]; // Removí 36 de aquí
  const preguntasOpcionesDirectas = [14, 36]; // Preguntas con opciones directas a, b, c, d
  const esPreguntaSiNo = preguntasSiNo.includes(preguntaIdNum);
  const esPreguntaOpcionesDirectas =
    preguntasOpcionesDirectas.includes(preguntaIdNum);

  // Primer paso: recopilar todas las opciones únicas
  let opcionesUnicas = new Set();

  // Para preguntas Si/No
  if (esPreguntaSiNo) {
    datosFiltrados.value.forEach((item) => {
      const texto = item.response_text?.toString().trim();
      if (texto === "Si" || texto === "si" || texto.toLowerCase() === "si") {
        opcionesUnicas.add("Si");
      } else if (
        texto === "No" ||
        texto === "no" ||
        texto.toLowerCase() === "no"
      ) {
        const info = item.additional_info?.toString().trim() || "";
        if (info && info !== "Sin información adicional") {
          // Si hay additional_info, usarlo
          opcionesUnicas.add(info);
        } else {
          // Si no hay additional_info, simplemente agregar "No"
          opcionesUnicas.add("No");
        }
      }
    });
  }

  // Para preguntas de opciones directas (14, 36)
  if (esPreguntaOpcionesDirectas) {
    datosFiltrados.value.forEach((item) => {
      const respuesta = item.response_text?.toString().trim();
      if (respuesta) {
        opcionesUnicas.add(respuesta);
      }
    });
  }

  // Agrupar respuestas por regional
  datosFiltrados.value.forEach((item) => {
    const regional = item.regional || "Sin Regional";

    if (!agrupados[regional]) {
      const baseStructure = {
        regional,
        total: 0,
        additionalInfoKeys: [],
      };

      if (esPreguntas1a9) {
        // Para preguntas 1-9: 5 estados especificos
        Object.assign(baseStructure, {
          muy_bueno: 0,
          bueno: 0,
          regular: 0,
          malo: 0,
          muy_malo: 0,
        });
      } else if (esPreguntaSiNo) {
        // Para preguntas Si/No: usar opciones dinámicas de additional_info
        Object.assign(baseStructure, { si: 0 });
        opcionesUnicas.forEach((opcion) => {
          if (opcion !== "Si") {
            baseStructure[opcion] = 0;
            baseStructure.additionalInfoKeys.push(opcion);
          }
        });
        // Para compatibilidad
        baseStructure.positivos = 0;
        baseStructure.negativos = 0;
        baseStructure.neutros = 0;
        // Propiedades para el desglose detallado de respuestas negativas
        baseStructure.no_leve = 0;
        baseStructure.no_moderado = 0;
        baseStructure.no_critico = 0;
        baseStructure.no_sin_detalle = 0;
      } else if (esPreguntaOpcionesDirectas) {
        // Para preguntas de opciones directas (14, 36): usar todas las opciones
        opcionesUnicas.forEach((opcion) => {
          baseStructure[opcion] = 0;
        });
        // Para compatibilidad
        baseStructure.positivos = 0;
        baseStructure.negativos = 0;
        baseStructure.neutros = 0;
      } else {
        // Para preguntas generales: 3 estados
        Object.assign(baseStructure, {
          positivos: 0,
          negativos: 0,
          neutros: 0,
        });
      }

      agrupados[regional] = baseStructure;
    }

    agrupados[regional].total++;

    if (esPreguntas1a9) {
      const tipo = clasificarRespuesta(
        item.response_text,
        item.question_id,
        item.additional_info
      );
      agrupados[regional][tipo]++;
    } else if (esPreguntaSiNo) {
      const texto = item.response_text?.toString().trim();
      if (texto === "Si" || texto === "si" || texto.toLowerCase() === "si") {
        agrupados[regional].si++;
        agrupados[regional].positivos++;
      } else if (
        texto === "No" ||
        texto === "no" ||
        texto.toLowerCase() === "no"
      ) {
        const info = item.additional_info?.toString().trim() || "";
        if (
          info &&
          info !== "Sin información adicional" &&
          agrupados[regional][info] !== undefined
        ) {
          // Si hay additional_info específico, contarlo
          agrupados[regional][info]++;
        } else if (agrupados[regional]["No"] !== undefined) {
          // Si no hay additional_info pero hay opción "No", contarlo
          agrupados[regional]["No"]++;
        }
        agrupados[regional].negativos++;
      }
    } else if (esPreguntaOpcionesDirectas) {
      const respuesta = item.response_text?.toString().trim();
      if (respuesta && agrupados[regional][respuesta] !== undefined) {
        agrupados[regional][respuesta]++;
      }
      // Para preguntas de opciones directas, todas se consideran como respuestas válidas
      agrupados[regional].positivos++;
    } else {
      const tipo = clasificarRespuesta(
        item.response_text,
        item.question_id,
        item.additional_info
      );
      agrupados[regional][tipo + "s"]++;
    }
  });

  // Convertir a array con porcentajes calculados
  return Object.values(agrupados)
    .map((regional) => {
      if (esPreguntas1a9) {
        return {
          ...regional,
          porcentajeMuyBueno:
            Math.round((regional.muy_bueno / regional.total) * 100) || 0,
          porcentajeBueno:
            Math.round((regional.bueno / regional.total) * 100) || 0,
          porcentajeRegular:
            Math.round((regional.regular / regional.total) * 100) || 0,
          porcentajeMalo:
            Math.round((regional.malo / regional.total) * 100) || 0,
          porcentajeMuyMalo:
            Math.round((regional.muy_malo / regional.total) * 100) || 0,
          // Calcular positivos y negativos combinados para compatibilidad
          positivos: regional.muy_bueno + regional.bueno,
          negativos: regional.malo + regional.muy_malo,
          neutros: regional.regular,
          porcentajePositivo:
            Math.round(
              ((regional.muy_bueno + regional.bueno) / regional.total) * 100
            ) || 0,
          porcentajeNegativo:
            Math.round(
              ((regional.malo + regional.muy_malo) / regional.total) * 100
            ) || 0,
        };
      } else if (esPreguntaSiNo) {
        return {
          ...regional,
          porcentajeSi: Math.round((regional.si / regional.total) * 100) || 0,
          porcentajeNoLeve:
            Math.round(((regional.no_leve || 0) / regional.total) * 100) || 0,
          porcentajeNoModerado:
            Math.round(((regional.no_moderado || 0) / regional.total) * 100) ||
            0,
          porcentajeNoCritico:
            Math.round(((regional.no_critico || 0) / regional.total) * 100) ||
            0,
          porcentajeNoSinDetalle:
            Math.round(
              ((regional.no_sin_detalle || 0) / regional.total) * 100
            ) || 0,
          // Calcular positivos y negativos combinados para compatibilidad
          positivos: regional.si || 0,
          negativos:
            (regional.no_leve || 0) +
            (regional.no_moderado || 0) +
            (regional.no_critico || 0) +
            (regional.no_sin_detalle || 0),
          neutros: 0,
          porcentajePositivo:
            Math.round(((regional.si || 0) / regional.total) * 100) || 0,
          porcentajeNegativo:
            Math.round(
              (((regional.no_leve || 0) +
                (regional.no_moderado || 0) +
                (regional.no_critico || 0) +
                (regional.no_sin_detalle || 0)) /
                regional.total) *
                100
            ) || 0,
        };
      } else {
        return {
          ...regional,
          porcentajePositivo:
            Math.round((regional.positivos / regional.total) * 100) || 0,
          porcentajeNegativo:
            Math.round((regional.negativos / regional.total) * 100) || 0,
          porcentajeNeutro:
            Math.round((regional.neutros / regional.total) * 100) || 0,
        };
      }
    })
    .sort((a, b) => b.total - a.total); // Ordenar por total descendente
});

// Metricas agregadas
const totalRespuestas = computed(() => datosFiltrados.value.length);
const totalPositivos = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.positivos || 0), 0)
);
const totalNegativos = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.negativos || 0), 0)
);
const totalNeutros = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.neutros || 0), 0)
);

// Metricas especificas para preguntas 1-9
const totalMuyBueno = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.muy_bueno || 0), 0)
);
const totalBueno = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.bueno || 0), 0)
);
const totalRegular = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.regular || 0), 0)
);
const totalMalo = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.malo || 0), 0)
);
const totalMuyMalo = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.muy_malo || 0), 0)
);

// Metricas especificas para preguntas Si/No
// Métricas específicas para preguntas Si/No dinámicas
const totalSi = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.si || 0), 0)
);

// Para preguntas Si/No: calcular total de todas las opciones de additional_info
const totalAdditionalInfo = computed(() => {
  const preguntaIdNum = parseInt(preguntaSeleccionada.value);
  const preguntasSiNo = [10, 15, 24, 25, 31, 32, 37, 39]; // Sin 16 y sin 36

  if (!preguntasSiNo.includes(preguntaIdNum)) return 0;

  let total = 0;
  datosVista.value.forEach((regional) => {
    opcionesDinamicas.value.forEach((opcion) => {
      total += regional[opcion] || 0;
    });
  });
  return total;
});

// Totales dinámicos para gráfico nacional
const totalPositivosSiNo = computed(() => {
  const preguntaIdNum = parseInt(preguntaSeleccionada.value);
  const preguntasSiNo = [10, 15, 24, 25, 31, 32, 37, 39]; // Sin 16 y sin 36
  const preguntasOpcionesDirectas = [14, 36];

  if (preguntasSiNo.includes(preguntaIdNum)) {
    return totalSi.value; // Solo los "Si" son positivos
  }
  if (preguntasOpcionesDirectas.includes(preguntaIdNum)) {
    return totalPositivos.value; // Para opciones directas, todas son positivas
  }
  return totalPositivos.value; // Para otras preguntas, usar lógica original
});

const totalNegativosSiNo = computed(() => {
  const preguntaIdNum = parseInt(preguntaSeleccionada.value);
  const preguntasSiNo = [10, 15, 24, 25, 31, 32, 37, 39]; // Sin 16 y sin 36
  const preguntasOpcionesDirectas = [14, 36];

  if (preguntasSiNo.includes(preguntaIdNum)) {
    return totalAdditionalInfo.value; // Todos los additional_info son negativos
  }
  if (preguntasOpcionesDirectas.includes(preguntaIdNum)) {
    return 0; // Para opciones directas, no hay negativos
  }
  return totalNegativos.value; // Para otras preguntas, usar lógica original
});

// Métricas legacy (para compatibilidad)
const totalNoLeve = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.no_leve || 0), 0)
);
const totalNoModerado = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.no_moderado || 0), 0)
);
const totalNoCritico = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.no_critico || 0), 0)
);
const totalNoSinDetalle = computed(() =>
  datosVista.value.reduce((sum, r) => sum + (r.no_sin_detalle || 0), 0)
);

const porcentajePositivoTotal = computed(() => {
  return totalRespuestas.value > 0
    ? Math.round((totalPositivosSiNo.value / totalRespuestas.value) * 100)
    : 0;
});

const porcentajeNegativoTotal = computed(() => {
  return totalRespuestas.value > 0
    ? Math.round((totalNegativosSiNo.value / totalRespuestas.value) * 100)
    : 0;
});

// Obtener opciones dinámicas para preguntas especiales
const opcionesDinamicas = computed(() => {
  const preguntaIdNum = parseInt(preguntaSeleccionada.value);
  const preguntasSiNo = [10, 15, 24, 25, 31, 32, 37, 39]; // Sin 16 y sin 36
  const preguntasOpcionesDirectas = [14, 36];

  if (!datosFiltrados.value.length) return [];

  const opciones = new Set();

  // Para preguntas Si/No
  if (preguntasSiNo.includes(preguntaIdNum)) {
    datosFiltrados.value.forEach((item) => {
      const texto = item.response_text?.toString().trim();
      if (texto === "No" || texto === "no" || texto.toLowerCase() === "no") {
        const info = item.additional_info?.toString().trim() || "";
        if (info && info !== "Sin información adicional") {
          opciones.add(info);
        } else {
          opciones.add("No");
        }
      }
    });
  }

  // Para preguntas de opciones directas (14, 36)
  if (preguntasOpcionesDirectas.includes(preguntaIdNum)) {
    datosFiltrados.value.forEach((item) => {
      const respuesta = item.response_text?.toString().trim();
      if (respuesta) {
        opciones.add(respuesta);
      }
    });
  }

  return Array.from(opciones).sort();
});

// Sugerencias del personal (pregunta 40)
const todasLasSugerencias = computed(() => {
  const sugerenciasData = datosAPI.value.filter(
    (item) =>
      item.question_id === "40" &&
      item.additional_info &&
      item.additional_info.trim() &&
      item.additional_info !== "null" &&
      item.additional_info.length > 10
  );

  return sugerenciasData.map((item) => ({
    texto: item.additional_info.trim(),
    regional: item.regional || "Sin regional",
  }));
});

// Sugerencias paginadas
const sugerencias = computed(() => {
  const inicio = (sugerenciasPagina.value - 1) * sugerenciasPorPagina.value;
  const fin = inicio + sugerenciasPorPagina.value;
  return todasLasSugerencias.value.slice(inicio, fin);
});

// Total de páginas para sugerencias
const totalPaginasSugerencias = computed(() => {
  return Math.ceil(
    todasLasSugerencias.value.length / sugerenciasPorPagina.value
  );
});

// Configuración de color único para toda la aplicación
const primaryColor = '#1e40af'; // Azul corporativo
const primaryColorLight = '#3b82f6';
const primaryColorDark = '#1d4ed8';
const backgroundColor = 'rgba(30, 64, 175, 0.1)';

// Datos para gráfico de barras - Distribución por Regional
const chartDataRegional = computed(() => {
  if (!datosFiltrados.value.length) return null;
  
  const regionalesData = {};
  datosFiltrados.value.forEach(item => {
    const regional = item.regional || 'Sin Regional';
    regionalesData[regional] = (regionalesData[regional] || 0) + 1;
  });

  return {
    labels: Object.keys(regionalesData),
    datasets: [{
      label: 'Respuestas por Regional',
      data: Object.values(regionalesData),
      backgroundColor: primaryColor,
      borderColor: primaryColorDark,
      borderWidth: 1
    }]
  };
});

// Datos para gráfico circular - Distribución de Respuestas
const chartDataRespuestas = computed(() => {
  const preguntaIdNum = parseInt(preguntaSeleccionada.value);
  
  if (preguntaIdNum >= 1 && preguntaIdNum <= 9) {
    return {
      labels: ['Muy Bueno', 'Bueno', 'Regular', 'Malo', 'Muy Malo'],
      datasets: [{
        data: [
          totalMuyBueno.value,
          totalBueno.value,
          totalRegular.value,
          totalMalo.value,
          totalMuyMalo.value
        ],
        backgroundColor: [
          '#1e40af',
          '#3b82f6',
          '#60a5fa',
          '#93c5fd',
          '#dbeafe'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  } else {
    return {
      labels: ['Positivos', 'Negativos'],
      datasets: [{
        data: [totalPositivosSiNo.value, totalNegativosSiNo.value],
        backgroundColor: [primaryColor, '#ef4444'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  }
});

// Opciones para los gráficos
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        color: '#374151'
      }
    },
    tooltip: {
      backgroundColor: primaryColorDark,
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: primaryColor,
      borderWidth: 1
    }
  }
};

const barChartOptions = {
  ...chartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(30, 64, 175, 0.1)'
      },
      ticks: {
        color: '#6b7280'
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#6b7280'
      }
    }
  }
};

// Computed para regionales únicas
const regionalesUnicas = computed(() => {
  if (!datosFiltrados.value.length) return 0;
  const regionales = new Set();
  datosFiltrados.value.forEach(item => {
    if (item.regional) {
      regionales.add(item.regional);
    }
  });
  return regionales.size;
});

// Reporte de additional_info para preguntas Si/No
const reporteAdditionalInfo = computed(() => {
  const preguntaIdNum = parseInt(preguntaSeleccionada.value);
  const preguntasSiNo = [10, 15, 24, 25, 31, 32, 37, 39]; // Sin 16 y sin 36

  if (!preguntasSiNo.includes(preguntaIdNum) || !datosFiltrados.value.length) {
    return {
      totalRespuestasNo: 0,
      informacionAdicional: [],
      detallesPorRegional: {},
    };
  }

  const respuestasNo = datosFiltrados.value.filter(
    (item) =>
      item.response_text &&
      item.response_text.toString().toLowerCase().includes("no")
  );

  const conteoInfo = {};
  const detallesPorRegional = {};

  respuestasNo.forEach((item) => {
    const regional = item.regional || "Sin Regional";
    const info = item.additional_info || "Sin información adicional";

    // Contar globalmente
    if (!conteoInfo[info]) {
      conteoInfo[info] = 0;
    }
    conteoInfo[info]++;

    // Agrupar por regional
    if (!detallesPorRegional[regional]) {
      detallesPorRegional[regional] = {};
    }
    if (!detallesPorRegional[regional][info]) {
      detallesPorRegional[regional][info] = 0;
    }
    detallesPorRegional[regional][info]++;
  });

  // Convertir a array ordenado por frecuencia
  const infoOrdenada = Object.entries(conteoInfo)
    .map(([info, count]) => ({
      texto: info,
      total: count,
      porcentaje: Math.round((count / respuestasNo.length) * 100) || 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalRespuestasNo: respuestasNo.length,
    informacionAdicional: infoOrdenada,
    detallesPorRegional,
  };
});

// Funciones de accion
const actualizarDatos = () => {
  // Los computed properties se actualizan automaticamente
  console.log("🔄 Filtros actualizados");
};

const limpiarFiltros = () => {
  filtroRegional.value = "";
  filtroArea.value = "";
  preguntaSeleccionada.value = "";
  console.log("🧹 Filtros limpiados");
};

const exportarReporte = () => {
  const reporte = {
    metadata: {
      fecha: new Date().toLocaleString("es-ES"),
      filtros: {
        regional: filtroRegional.value || "Todas",
        area: filtroArea.value || "Todas",
        pregunta: preguntaSeleccionada.value || "Ninguna",
      },
      pregunta: preguntaActual.value,
    },
    resumen: {
      totalRespuestas: totalRespuestas.value,
      porcentajePositivo: porcentajePositivoTotal.value,
      porcentajeNegativo: porcentajeNegativoTotal.value,
      regionalesAnalizadas: datosVista.value.length,
    },
    datos: datosVista.value,
  };

  const blob = new Blob([JSON.stringify(reporte, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clima-laboral-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log("📥 Reporte exportado");
};

const exportarPregunta = () => {
  exportarReporte();
};

const exportarReporteAdditionalInfo = () => {
  if (!reporteAdditionalInfo.value.totalRespuestasNo) {
    console.log("No hay datos de additional_info para exportar");
    return;
  }

  const reporte = {
    metadata: {
      fecha: new Date().toLocaleString("es-ES"),
      pregunta: {
        id: preguntaSeleccionada.value,
        texto: preguntaActual.value?.texto,
        categoria: preguntaActual.value?.categoria,
      },
      filtros: {
        regional: filtroRegional.value || "Todas",
        area: filtroArea.value || "Todas",
      },
    },
    resumenGlobal: {
      totalRespuestasNo: reporteAdditionalInfo.value.totalRespuestasNo,
      opcionesDiferentes:
        reporteAdditionalInfo.value.informacionAdicional.length,
    },
    frecuenciaOpciones: reporteAdditionalInfo.value.informacionAdicional,
    detallesPorRegional: reporteAdditionalInfo.value.detallesPorRegional,
  };

  const blob = new Blob([JSON.stringify(reporte, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `additional-info-pregunta-${preguntaSeleccionada.value}-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log("📥 Reporte de additional_info exportado");
};

// Inicializacion
onMounted(() => {
  console.log("🚀 Componente iniciado");
  cargarDatos();
});
</script>
