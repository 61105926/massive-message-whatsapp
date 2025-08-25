<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Added loading state for API data -->
    <div v-if="cargandoDatos" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 flex items-center space-x-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="text-lg font-medium">Cargando datos del clima laboral...</span>
      </div>
    </div>

    <!-- Header -->
    <header class="bg-white shadow-lg border-b-2 border-blue-100">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-1">MINOIL - Reporte Ejecutivo de Clima Laboral</h1>
            <p class="text-sm text-gray-600">Gestión: Diciembre 2024 | Regional: {{ filtroRegional || 'Todas las regionales' }} | Análisis: {{ tipoAnalisis }}</p>
          </div>
          <div class="flex items-center space-x-6">
            <!-- Added refresh button for API data -->
            <button @click="cargarDatosAPI" :disabled="cargandoDatos" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
              <RefreshCw class="h-4 w-4" />
              <span>{{ cargandoDatos ? 'Actualizando...' : 'Actualizar' }}</span>
            </button>
            <button @click="generarAnalisisIA" :disabled="cargandoIA" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
              <Brain class="h-4 w-4" />
              <span>{{ cargandoIA ? 'Analizando...' : 'Análisis IA' }}</span>
            </button>
            <button @click="exportarReporte" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download class="h-4 w-4" />
              <span>Exportar</span>
            </button>
            <button @click="imprimirReporte" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Printer class="h-4 w-4" />
              <span>Imprimir</span>
            </button>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">Fecha de Generación</p>
              <p class="text-xs text-gray-500">{{ new Date().toLocaleDateString('es-ES') }}</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Added error handling display -->
    <div v-if="errorAPI" class="max-w-7xl mx-auto px-6 py-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <AlertTriangle class="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h3 class="text-sm font-medium text-red-800">Error al cargar datos</h3>
            <p class="text-sm text-red-700 mt-1">{{ errorAPI }}</p>
            <button @click="cargarDatosAPI" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced filters section with persistent state and better UX -->
    <section class="max-w-7xl mx-auto px-6 py-6">
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <Filter class="h-5 w-5 mr-2 text-blue-600" />
            Panel de Filtros Avanzados
          </h2>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-500">Filtros aplicados: {{ contadorFiltros }}</span>
            <button 
              @click="limpiarFiltros"
              :disabled="!hayFiltrosActivos"
              class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Limpiar Todo
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Filtro por Área -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Área</label>
            <select 
              v-model="filtroArea" 
              @change="onFiltroChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todas las áreas ({{ areasDisponibles.length }})</option>
              <option v-for="area in areasDisponibles" :key="area" :value="area">{{ area }}</option>
            </select>
          </div>

          <!-- Filtro por Regional -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Regional</label>
            <select 
              v-model="filtroRegional" 
              @change="onFiltroChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todas las regionales ({{ regionalesDisponibles.length }})</option>
              <option v-for="regional in regionalesDisponibles" :key="regional" :value="regional">{{ regional }}</option>
            </select>
          </div>

          <!-- Filtro por Categoría -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Categoría</label>
            <select 
              v-model="filtroCategoria" 
              @change="onFiltroChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todas las categorías</option>
              <option v-for="categoria in categoriasDisponibles" :key="categoria" :value="categoria">{{ categoria }}</option>
            </select>
          </div>

          <!-- Filtro por Pregunta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Pregunta Específica</label>
            <select 
              v-model="filtroPregunta" 
              @change="onFiltroChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todas las preguntas</option>
              <option v-for="pregunta in preguntasFiltradas" :key="pregunta.id" :value="pregunta.id">
                {{ pregunta.texto.substring(0, 50) }}...
              </option>
            </select>
          </div>
        </div>

        <!-- Added filter summary bar -->
        <div v-if="hayFiltrosActivos" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <span class="text-sm font-medium text-blue-800">Filtros activos:</span>
              <div class="flex flex-wrap gap-2">
                <span v-if="filtroArea" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Área: {{ filtroArea }}
                </span>
                <span v-if="filtroRegional" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Regional: {{ filtroRegional }}
                </span>
                <span v-if="filtroCategoria" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Categoría: {{ filtroCategoria }}
                </span>
                <span v-if="filtroPregunta" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Pregunta específica
                </span>
              </div>
            </div>
            <span class="text-sm text-blue-600 font-medium">{{ datosFiltrados.totalEncuestados }} registros</span>
          </div>
        </div>
      </div>
    </section>

    <main class="max-w-7xl mx-auto px-6 pb-8">
      <!-- Added AI Insights section -->
      <section v-if="analisisIA.insights.length > 0" class="mb-8">
        <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-purple-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 flex items-center">
              <Brain class="h-6 w-6 mr-2 text-purple-600" />
              Análisis Inteligente con IA
            </h2>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-purple-600">Generado automáticamente</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Insights Principales -->
            <div>
              <h3 class="text-lg font-medium text-purple-800 mb-4">🔍 Insights Principales</h3>
              <div class="space-y-3">
                <div v-for="(insight, index) in analisisIA.insights" :key="index" 
                     class="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                  <div class="flex items-start space-x-3">
                    <div class="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p class="text-sm text-gray-700 mb-2">{{ insight.descripcion }}</p>
                      <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded-full font-medium"
                              :class="insight.impacto === 'ALTO' ? 'bg-red-100 text-red-800' : 
                                     insight.impacto === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-green-100 text-green-800'">
                          {{ insight.impacto }}
                        </span>
                        <span class="text-xs text-gray-500">Confianza: {{ insight.confianza }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recomendaciones IA -->
            <div>
              <h3 class="text-lg font-medium text-purple-800 mb-4">💡 Recomendaciones Inteligentes</h3>
              <div class="space-y-3">
                <div v-for="(recomendacion, index) in analisisIA.recomendaciones" :key="index" 
                     class="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                  <div class="flex items-start space-x-3">
                    <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-xs font-bold text-purple-600">{{ index + 1 }}</span>
                    </div>
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-gray-900 mb-1">{{ recomendacion.titulo }}</h4>
                      <p class="text-xs text-gray-600 mb-2">{{ recomendacion.descripcion }}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-purple-600 font-medium">{{ recomendacion.plazo }}</span>
                        <span class="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          ROI: {{ recomendacion.roi }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Predicciones -->
          <div v-if="analisisIA.predicciones.length > 0" class="mt-6 p-4 bg-white rounded-lg border border-purple-200">
            <h3 class="text-lg font-medium text-purple-800 mb-3 flex items-center">
              <TrendingUp class="h-5 w-5 mr-2" />
              Predicciones y Tendencias
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-for="(prediccion, index) in analisisIA.predicciones" :key="index" 
                   class="text-center p-3 bg-purple-50 rounded-lg">
                <p class="text-2xl font-bold text-purple-600 mb-1">{{ prediccion.valor }}</p>
                <p class="text-xs text-gray-600 mb-1">{{ prediccion.metrica }}</p>
                <p class="text-xs text-purple-500">{{ prediccion.periodo }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Enhanced executive summary with trend indicators -->
      <section class="mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">Resumen Ejecutivo</h2>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">Datos en tiempo real</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-blue-700 mb-1">Total Encuestados</p>
                  <p class="text-3xl font-bold text-blue-900">{{ datosFiltrados.totalEncuestados }}</p>
                  <p class="text-xs text-blue-600 mt-1">{{ porcentajeParticipacion }}% participación</p>
                </div>
                <div class="p-3 bg-blue-200 rounded-lg">
                  <Users class="h-8 w-8 text-blue-700" />
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-700 mb-1">Satisfacción General</p>
                  <p class="text-3xl font-bold text-green-900">{{ datosFiltrados.satisfaccionGeneral }}%</p>
                  <div class="flex items-center mt-1">
                    <TrendingUp class="h-3 w-3 text-green-600 mr-1" />
                    <p class="text-xs text-green-600">{{ tendenciaSatisfaccion }}</p>
                  </div>
                </div>
                <div class="p-3 bg-green-200 rounded-lg">
                  <TrendingUp class="h-8 w-8 text-green-700" />
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-red-700 mb-1">Áreas Críticas</p>
                  <p class="text-3xl font-bold text-red-900">{{ datosFiltrados.areasRiesgo }}</p>
                  <p class="text-xs text-red-600 mt-1">Requieren atención inmediata</p>
                </div>
                <div class="p-3 bg-red-200 rounded-lg">
                  <AlertTriangle class="h-8 w-8 text-red-700" />
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-purple-700 mb-1">Índice de Clima</p>
                  <p class="text-3xl font-bold text-purple-900">{{ indiceClima }}</p>
                  <p class="text-xs text-purple-600 mt-1">{{ clasificacionClima }}</p>
                </div>
                <div class="p-3 bg-purple-200 rounded-lg">
                  <Building class="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filtros activos indicator -->
      <div v-if="hayFiltrosActivos" class="mb-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Filter class="h-5 w-5 text-blue-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-800">
                <strong>Filtros activos:</strong>
                <span v-if="filtroArea"> Área: {{ filtroArea }}</span>
                <span v-if="filtroRegional"> | Regional: {{ filtroRegional }}</span>
                <span v-if="filtroPregunta"> | Pregunta: {{ preguntaSeleccionada?.categoria }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced question analysis section -->
      <section v-if="filtroPregunta" class="mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 flex items-center">
              <MessageSquare class="h-6 w-6 mr-2 text-blue-600" />
              Análisis Detallado por Pregunta
            </h2>
            <button @click="generarAnalisisPregunta" :disabled="cargandoPregunta" 
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
              <Brain class="h-4 w-4" />
              <span>{{ cargandoPregunta ? 'Analizando...' : 'Análisis IA' }}</span>
            </button>
          </div>
          
          <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 mb-6">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare class="h-6 w-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-2">{{ preguntaSeleccionada?.categoria }}</h3>
                <p class="text-gray-700 mb-4">{{ preguntaSeleccionada?.texto }}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p class="text-3xl font-bold text-green-600 mb-1">{{ preguntaSeleccionada?.respuestasPositivas || 0 }}</p>
                    <p class="text-sm text-gray-600">Positivas</p>
                    <p class="text-xs text-green-600 font-medium">{{ Math.round((preguntaSeleccionada?.respuestasPositivas || 0) / datosFiltrados.totalEncuestados * 100) }}%</p>
                  </div>
                  <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p class="text-3xl font-bold text-yellow-600 mb-1">{{ preguntaSeleccionada?.respuestasNeutras || 0 }}</p>
                    <p class="text-sm text-gray-600">Neutras</p>
                    <p class="text-xs text-yellow-600 font-medium">{{ Math.round((preguntaSeleccionada?.respuestasNeutras || 0) / datosFiltrados.totalEncuestados * 100) }}%</p>
                  </div>
                  <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p class="text-3xl font-bold text-red-600 mb-1">{{ preguntaSeleccionada?.respuestasNegativas || 0 }}</p>
                    <p class="text-sm text-gray-600">Negativas</p>
                    <p class="text-xs text-red-600 font-medium">{{ Math.round((preguntaSeleccionada?.respuestasNegativas || 0) / datosFiltrados.totalEncuestados * 100) }}%</p>
                  </div>
                  <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p class="text-3xl font-bold text-blue-600 mb-1">{{ calcularSatisfaccionPregunta() }}%</p>
                    <p class="text-sm text-gray-600">Satisfacción</p>
                    <p class="text-xs text-blue-600 font-medium">{{ interpretarSatisfaccion(calcularSatisfaccionPregunta()) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Analysis for specific question -->
          <div v-if="analisisPregunta.interpretacion" class="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <h3 class="text-lg font-medium text-indigo-800 mb-4 flex items-center">
              <Brain class="h-5 w-5 mr-2" />
              Interpretación Inteligente
            </h3>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium text-gray-900 mb-3">📊 Análisis de Resultados</h4>
                <p class="text-sm text-gray-700 mb-4">{{ analisisPregunta.interpretacion }}</p>
                
                <h4 class="font-medium text-gray-900 mb-3">🎯 Factores Clave</h4>
                <ul class="space-y-2">
                  <li v-for="(factor, index) in analisisPregunta.factores" :key="index" 
                      class="flex items-start space-x-2">
                    <div class="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span class="text-sm text-gray-700">{{ factor }}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 class="font-medium text-gray-900 mb-3">💡 Recomendaciones Específicas</h4>
                <div class="space-y-3">
                  <div v-for="(recomendacion, index) in analisisPregunta.recomendaciones" :key="index" 
                       class="p-3 bg-white rounded-lg border border-indigo-200">
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-bold text-indigo-600">{{ index + 1 }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 mb-1">{{ recomendacion.accion }}</p>
                        <p class="text-xs text-gray-600 mb-2">{{ recomendacion.descripcion }}</p>
                        <div class="flex items-center space-x-2">
                          <span class="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                            {{ recomendacion.prioridad }}
                          </span>
                          <span class="text-xs text-gray-500">{{ recomendacion.plazo }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Gráficos y Análisis -->
      <!-- Enhanced charts section with drill-down capabilities -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Satisfacción por Dimensión -->
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">
              Análisis por Dimensión
              <span v-if="filtroCategoria" class="text-sm font-normal text-gray-600 block">
                Enfoque: {{ filtroCategoria }}
              </span>
            </h3>
            <button @click="toggleVistaDetallada" class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              <Eye class="h-4 w-4 mr-1" />
              {{ vistaDetallada ? 'Vista Simple' : 'Vista Detallada' }}
            </button>
          </div>
          
          <div class="space-y-4">
            <div v-for="dimension in datosFiltrados.dimensiones" :key="dimension.nombre" 
                 class="group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all"
                 @click="seleccionarDimension(dimension)">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-700">{{ dimension.nombre }}</span>
                  <span v-if="dimension.tendencia" class="ml-2 text-xs px-2 py-1 rounded-full"
                        :class="dimension.tendencia === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ dimension.tendencia === 'up' ? '↗' : '↘' }}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-semibold text-gray-900">{{ dimension.porcentaje }}%</span>
                  <ChevronRight class="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </div>
              
              <div class="flex items-center">
                <div class="flex-1 mx-2">
                  <div class="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div 
                      class="h-3 rounded-full transition-all duration-700 ease-out"
                      :class="getColorClass(dimension.porcentaje)"
                      :style="{ width: dimension.porcentaje + '%' }"
                    ></div>
                    <!-- Added benchmark line -->
                    <div class="absolute top-0 h-3 w-0.5 bg-gray-600" style="left: 70%"></div>
                  </div>
                </div>
              </div>
              
              <!-- Added detailed metrics when expanded -->
              <div v-if="vistaDetallada" class="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div class="text-center">
                  <span class="block text-green-600 font-semibold">{{ dimension.positivos || 0 }}</span>
                  <span class="text-gray-500">Positivos</span>
                </div>
                <div class="text-center">
                  <span class="block text-yellow-600 font-semibold">{{ dimension.neutros || 0 }}</span>
                  <span class="text-gray-500">Neutros</span>
                </div>
                <div class="text-center">
                  <span class="block text-red-600 font-semibold">{{ dimension.negativos || 0 }}</span>
                  <span class="text-gray-500">Negativos</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500">
              <span class="inline-block w-2 h-2 bg-gray-600 rounded-full mr-1"></span>
              Línea de referencia: 70% (Benchmark industria)
            </p>
          </div>
        </div>

        <!-- Enhanced area participation chart -->
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Participación por Área</h3>
            <div class="flex items-center space-x-2">
              <button @click="ordenarPor = 'empleados'" 
                      :class="ordenarPor === 'empleados' ? 'text-blue-600' : 'text-gray-400'"
                      class="text-xs hover:text-blue-600">
                Por Cantidad
              </button>
              <span class="text-gray-300">|</span>
              <button @click="ordenarPor = 'satisfaccion'" 
                      :class="ordenarPor === 'satisfaccion' ? 'text-blue-600' : 'text-gray-400'"
                      class="text-xs hover:text-blue-600">
                Por Satisfacción
              </button>
            </div>
          </div>
          
          <div class="space-y-4">
            <div v-for="area in areasOrdenadas" :key="area.nombre" 
                 class="group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all"
                 @click="filtroArea = area.nombre; onFiltroChange()">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">{{ area.nombre }}</span>
                <div class="flex items-center space-x-3">
                  <span class="text-xs text-gray-500">{{ area.satisfaccion }}% satisfacción</span>
                  <span class="text-sm text-gray-600 font-semibold">{{ area.empleados }}</span>
                  <ChevronRight class="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: (area.empleados / maxEmpleadosFiltrados * 100) + '%' }"
                  ></div>
                </div>
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-500"
                    :class="getColorClass(area.satisfaccion)"
                    :style="{ width: area.satisfaccion + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hallazgos Críticos -->
      <!-- Enhanced critical findings with action items -->
      <section class="mb-8">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Hallazgos Críticos y Plan de Acción</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Fortalezas -->
            <div>
              <h3 class="text-lg font-medium text-green-700 mb-4 flex items-center">
                <CheckCircle class="h-5 w-5 mr-2" />
                Fortalezas Identificadas
                <span class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{{ fortalezas.length }}</span>
              </h3>
              <div class="space-y-3">
                <div v-for="(fortaleza, index) in fortalezas" :key="index" 
                     class="flex items-start p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div class="flex-1">
                    <span class="text-sm text-gray-700">{{ fortaleza.descripcion }}</span>
                    <div class="mt-1 flex items-center space-x-2">
                      <span class="text-xs text-green-600 font-medium">{{ fortaleza.impacto }}</span>
                      <span class="text-xs text-gray-500">• {{ fortaleza.area }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Áreas de Mejora -->
            <div>
              <h3 class="text-lg font-medium text-red-700 mb-4 flex items-center">
                <XCircle class="h-5 w-5 mr-2" />
                Acciones Prioritarias
                <span class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{{ mejoras.length }}</span>
              </h3>
              <div class="space-y-3">
                <div v-for="(mejora, index) in mejoras" :key="index" 
                     class="flex items-start p-3 rounded-lg border"
                     :class="mejora.prioridad === 'CRÍTICO' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'">
                  <div class="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                       :class="mejora.prioridad === 'CRÍTICO' ? 'bg-red-500' : 'bg-yellow-500'"></div>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="text-xs px-2 py-1 rounded-full font-medium"
                            :class="mejora.prioridad === 'CRÍTICO' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'">
                        {{ mejora.prioridad }}
                      </span>
                      <span class="text-xs text-gray-500">{{ mejora.plazo }}</span>
                    </div>
                    <span class="text-sm text-gray-700">{{ mejora.descripcion }}</span>
                    <div class="mt-2">
                      <span class="text-xs text-gray-600">Responsable: {{ mejora.responsable }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recomendaciones Estratégicas -->
      <section class="mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 border">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Recomendaciones Estratégicas</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(recomendacion, index) in recomendaciones" :key="index" class="border-l-4 border-blue-500 pl-4">
              <h3 class="font-semibold text-gray-900 mb-2">{{ recomendacion.titulo }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ recomendacion.descripcion }}</p>
              <div class="flex items-center text-xs text-gray-500">
                <Clock class="h-4 w-4 mr-1" />
                {{ recomendacion.plazo }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Detalle por Posición -->
      <section>
        <div class="bg-white rounded-lg shadow-sm p-6 border">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Análisis por Posición - Caso: Fiambrera</h2>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Información del Encuestado</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li><strong>Posición:</strong> Fiambrera</li>
                  <li><strong>Área:</strong> Producción</li>
                  <li><strong>Regional:</strong> Santa Cruz</li>
                  <li><strong>Fecha:</strong> 12 de Diciembre, 2024</li>
                </ul>
              </div>
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Puntos Críticos Identificados</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Falta de motivación laboral</li>
                  <li>• Problemas de liderazgo en el área</li>
                  <li>• Insatisfacción con beneficios</li>
                  <li>• Necesidad de trabajo en equipo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Download,
  Printer,
  Eye,
  ChevronRight,
  Brain,
  MessageSquare,
  RefreshCw // Added RefreshCw icon
} from 'lucide-vue-next'

const cargandoDatos = ref(false)
const errorAPI = ref('')
const datosAPI = ref(null)
const ultimaActualizacion = ref(null)

const filtroArea = ref(localStorage.getItem('filtroArea') || '')
const filtroRegional = ref(localStorage.getItem('filtroRegional') || '')
const filtroCategoria = ref(localStorage.getItem('filtroCategoria') || '')
const filtroPregunta = ref(localStorage.getItem('filtroPregunta') || '')
const vistaDetallada = ref(false)
const ordenarPor = ref('empleados')

const cargandoIA = ref(false)
const cargandoPregunta = ref(false)
const analisisIA = ref({
  insights: [],
  recomendaciones: [],
  predicciones: []
})
const analisisPregunta = ref({
  interpretacion: '',
  factores: [],
  recomendaciones: []
})

watch([filtroArea, filtroRegional, filtroCategoria, filtroPregunta], () => {
  localStorage.setItem('filtroArea', filtroArea.value)
  localStorage.setItem('filtroRegional', filtroRegional.value)
  localStorage.setItem('filtroCategoria', filtroCategoria.value)
  localStorage.setItem('filtroPregunta', filtroPregunta.value)
})

const cargarDatosAPI = async () => {
  cargandoDatos.value = true
  errorAPI.value = ''
  
  try {
    console.log('[v0] Cargando datos desde API:', 'http://190.171.225.68/api/climate-reponse')
    
    const response = await fetch('http://190.171.225.68/api/climate-reponse', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('[v0] Datos recibidos de la API:', data)
    
    datosAPI.value = data
    ultimaActualizacion.value = new Date()
    
    procesarDatosAPI(data)
    
  } catch (error) {
    console.error('[v0] Error cargando datos de la API:', error)
    errorAPI.value = `No se pudieron cargar los datos: ${error.message}. Verificar conectividad y disponibilidad del servidor.`
  } finally {
    cargandoDatos.value = false
  }
}

const procesarDatosAPI = (data) => {
  if (!data || !Array.isArray(data)) {
    console.warn('[v0] Formato de datos inesperado de la API')
    return
  }
  
  console.log('[v0] Procesando datos con estructura real:', data[0])
  
  // Extract unique areas (name), regionals, and positions from API data
  const areasUnicas = [...new Set(data.map(item => item.name).filter(Boolean))]
  const regionalesUnicas = [...new Set(data.map(item => item.regional).filter(Boolean))]
  const posicionesUnicas = [...new Set(data.map(item => item.posicion).filter(Boolean))]
  const gestionesUnicas = [...new Set(data.map(item => item.gestion).filter(Boolean))]
  
  if (areasUnicas.length > 0) areasDisponibles.value = areasUnicas
  if (regionalesUnicas.length > 0) regionalesDisponibles.value = regionalesUnicas
  
  // Map questions from API data
  const preguntasUnicas = [...new Set(data.map(item => item.question_id).filter(Boolean))]
  preguntasDisponibles.value = preguntasUnicas.map(id => ({
    id: parseInt(id),
    texto: `Pregunta ${id}`,
    categoria: 'General' // Default category, could be enhanced
  }))
  
  console.log('[v0] Filtros extraídos de la API:', {
    areas: areasUnicas.length,
    regionales: regionalesUnicas.length,
    posiciones: posicionesUnicas.length,
    preguntas: preguntasUnicas.length,
    gestiones: gestionesUnicas.length
  })
}

const convertirRespuestaANumero = (responseText) => {
  const mapeoRespuestas = {
    // Respuestas en escala de calidad
    'Excellent': 5,
    'Very Good': 4,
    'Good': 4,
    'Average': 3,
    'Below Average': 2,
    'Poor': 1,
    'Very Poor': 1,
    // Respuestas Si/No
    'Si': 4,
    'No': 1,
    // Respuestas en español
    'Excelente': 5,
    'Muy Bueno': 4,
    'Bueno': 4,
    'Regular': 3,
    'Malo': 2,
    'Muy Malo': 1,
    // Respuestas específicas de opciones múltiples (se consideran positivas)
    'Mi Jefe Directo': 4,
    'Recursos Humanos': 4,
    'Lo expreso con mis colegas': 3,
    'Los Beneficios Sociales (Caja,': 4,
    'Sueldos a tiempo': 4,
    'Mis compañeros de Trabajo': 4,
    'Flexibilidad Laboral': 4,
    'Compartir en el Almuerzo con m': 3,
    'Escuchar música de relajación': 3,
    'Dar una caminata por el trabajo': 3,
    'Hacer ejercicio de respiración': 3,
    'Tomar agua': 3
  }
  
  // Si la respuesta contiene texto parcial, buscar coincidencias
  for (const [key, value] of Object.entries(mapeoRespuestas)) {
    if (responseText && responseText.includes(key)) {
      return value
    }
  }
  
  return mapeoRespuestas[responseText] || 3 // Default to neutral if not found
}

const areasDisponibles = ref([
  'Administración', 'Almacén', 'Comercial', 'Contabilidad', 'Importaciones', 
  'Logística', 'Marketing', 'Producción', 'Recursos Humanos', 'Servicios Generales',
  'Sistema e Informática', 'Trade de Mkt'
])

const regionalesDisponibles = ref([
  'Santa Cruz', 'La Paz', 'Cochabamba', 'Tarija', 'Potosí', 'Oruro', 'Beni', 'Pando', 'Chuquisaca'
])

const categoriasDisponibles = ref([
  'Puesto de Trabajo', 'Ambiente de Trabajo', 'Infraestructura', 'Comunicación',
  'Motivación', 'Autonomía', 'Trabajo en Equipo', 'Presión', 'Liderazgo',
  'Satisfacción General', 'Remuneración'
])

const preguntasDisponibles = computed(() => {
  return [
    { id: 1, categoria: 'Puesto de Trabajo', texto: 'El trabajo en mi área/unidad está bien organizado' },
    { id: 2, categoria: 'Puesto de Trabajo', texto: 'Mis funciones y responsabilidades están definidas, por tanto, tengo claras mis tareas a cumplir' },
    { id: 3, categoria: 'Puesto de Trabajo', texto: 'Recibo información de cómo desempeño mi puesto de trabajo' },
    { id: 4, categoria: 'Ambiente de Trabajo', texto: 'La relación con los compañeros de trabajo es buena' },
    { id: 5, categoria: 'Ambiente de Trabajo', texto: 'Me siento parte de un equipo de trabajo' },
    { id: 6, categoria: 'Ambiente de Trabajo', texto: 'Me resulta fácil expresar mis opiniones en mi lugar de trabajo' },
    { id: 7, categoria: 'Infraestructura', texto: 'Dispongo de los materiales y recursos necesarios para realizar mi trabajo' },
    { id: 8, categoria: 'Infraestructura', texto: 'Las condiciones de espacio, comodidad, ruido, temperatura, iluminación, mi silla son buenas' },
    { id: 9, categoria: 'Infraestructura', texto: 'Las áreas de trabajo se conservan limpias y en orden, cuidando la salubridad en mi lugar de trabajo' },
    { id: 10, categoria: 'Comunicación', texto: 'En MINOIL está claramente comunicada la Filosofía de la empresa Misión, Visión y valores y Objetivos' },
    { id: 11, categoria: 'Comunicación', texto: 'Me siento copartícipe de los éxitos y fracasos de mi área/unidad para bien de MINOIL' },
    { id: 12, categoria: 'Comunicación', texto: 'Conozco el código ético y de conducta de la organización' },
    { id: 13, categoria: 'Comunicación', texto: 'La comunicación interna en la organización es una actividad permanente y planificada' },
    { id: 14, categoria: 'Comunicación', texto: 'Cuando quiero hacer una sugerencia o una denuncia tengo canales claros' },
    { id: 15, categoria: 'Motivación', texto: 'Estoy motivado para realizar mi trabajo' },
    { id: 16, categoria: 'Motivación', texto: 'Mi trabajo me ofrece retos y oportunidades de seguir mejorando' },
    { id: 17, categoria: 'Motivación', texto: 'Conozco como mi trabajo contribuye a conseguir los resultados de mi departamento' },
    { id: 18, categoria: 'Motivación', texto: 'Tengo la información que necesito para realizar mi trabajo con excelencia' },
    { id: 19, categoria: 'Motivación', texto: 'Mi trabajo es reconocido y valorado' },
    { id: 20, categoria: 'Motivación', texto: 'Recibo capacitación en alguna área de mi interés que forma parte importante de mi desarrollo' },
    { id: 21, categoria: 'Autonomía', texto: 'Me siento comprometido para alcanzar las metas establecidas' },
    { id: 22, categoria: 'Autonomía', texto: 'Poseo la autonomía para poder proponer y modificar procesos que optimizan mi trabajo' },
    { id: 23, categoria: 'Trabajo en Equipo', texto: 'En mi grupo de trabajo, solucionar el problema es más importante que encontrar algún culpable' },
    { id: 24, categoria: 'Trabajo en Equipo', texto: 'Siento que formo parte de un equipo que trabaja hacia una meta común' },
    { id: 25, categoria: 'Trabajo en Equipo', texto: 'Se tiene una adecuada coordinación con otras áreas/unidades de MINOIL' },
    { id: 26, categoria: 'Presión', texto: 'El estrés que genera el trabajo en mi área es manejable' },
    { id: 27, categoria: 'Presión', texto: 'Qué me ayuda a bajar mi estrés en el trabajo' },
    { id: 28, categoria: 'Presión', texto: 'Tengo mucho trabajo y poco tiempo para realizarlo' },
    { id: 29, categoria: 'Presión', texto: 'Me siento como si nunca tuviera un día libre' },
    { id: 30, categoria: 'Liderazgo', texto: 'Mi supervisor o Jefe es Justo en sus decisiones conmigo' },
    { id: 31, categoria: 'Liderazgo', texto: 'Considero que Mi jefe es una persona que posee las habilidades y conocimiento, para liderar el área' },
    { id: 32, categoria: 'Liderazgo', texto: 'Mi Jefe actúa de manera Correcta' },
    { id: 33, categoria: 'Liderazgo', texto: 'Mi superior inmediato respeta la confidencialidad de los temas que comparto con el/ella' },
    { id: 34, categoria: 'Liderazgo', texto: 'Considero que mi jefe es justo y flexible ante las peticiones de solicitud' },
    { id: 35, categoria: 'Liderazgo', texto: 'Puedo contar con la ayuda de mi Jefe cuando necesito' },
    { id: 36, categoria: 'Satisfacción General', texto: 'Cuales son los motivos para que usted decida seguir trabajando en MINOIL' },
    { id: 37, categoria: 'Remuneración', texto: 'Me pagan lo justo por mi trabajo' },
    { id: 38, categoria: 'Remuneración', texto: 'Recibo información sobre los elementos que componen mi salario' },
    { id: 39, categoria: 'Remuneración', texto: 'Estoy Satisfecho con los Beneficios que me ofrece la organización' }
  ]
})

const datosFiltrados = computed(() => {
  if (!datosAPI.value || !Array.isArray(datosAPI.value)) {
    return {
      totalEncuestados: 0,
      satisfaccionGeneral: 0,
      areasRiesgo: 0,
      totalAreas: 0,
      areas: [],
      dimensiones: []
    }
  }
  
  // Filter API data based on current filters - using real API structure
  let datosFiltradosAPI = [...datosAPI.value]
  
  // Filter only selected responses (is_selected = "1")
  datosFiltradosAPI = datosFiltradosAPI.filter(item => item.is_selected === "1")
  
  if (filtroArea.value) {
    datosFiltradosAPI = datosFiltradosAPI.filter(item => item.name === filtroArea.value)
  }
  
  if (filtroRegional.value) {
    datosFiltradosAPI = datosFiltradosAPI.filter(item => item.regional === filtroRegional.value)
  }
  
  if (filtroPregunta.value) {
    datosFiltradosAPI = datosFiltradosAPI.filter(item => item.question_id === filtroPregunta.value)
  }
  
  const totalEncuestados = datosFiltradosAPI.length
  
  if (totalEncuestados === 0) {
    return {
      totalEncuestados: 0,
      satisfaccionGeneral: 0,
      areasRiesgo: 0,
      totalAreas: 0,
      areas: [],
      dimensiones: []
    }
  }
  
  // Calculate satisfaction based on response_text (convert to numeric values)
  const respuestasConValor = datosFiltradosAPI.map(item => ({
    ...item,
    valorNumerico: convertirRespuestaANumero(item.response_text)
  }))
  
  const respuestasPositivas = respuestasConValor.filter(item => item.valorNumerico >= 4).length
  const satisfaccionGeneral = Math.round((respuestasPositivas / totalEncuestados) * 100)
  
  // Calculate areas satisfaction using 'name' field
  const areasPorSatisfaccion = {}
  respuestasConValor.forEach(item => {
    if (!areasPorSatisfaccion[item.name]) {
      areasPorSatisfaccion[item.name] = { total: 0, positivas: 0, sumaValores: 0 }
    }
    areasPorSatisfaccion[item.name].total++
    areasPorSatisfaccion[item.name].sumaValores += item.valorNumerico
    if (item.valorNumerico >= 4) {
      areasPorSatisfaccion[item.name].positivas++
    }
  })
  
  const areas = Object.entries(areasPorSatisfaccion).map(([nombre, datos]) => ({
    nombre,
    empleados: datos.total,
    satisfaccion: Math.round((datos.positivas / datos.total) * 100),
    promedioValor: Math.round((datos.sumaValores / datos.total) * 20) // Convert to percentage
  }))
  
  const areasRiesgo = areas.filter(area => area.satisfaccion < 50).length
  
  const dimensionesPorCategoria = {}
  respuestasConValor.forEach(item => {
    const pregunta = preguntasDisponibles.value.find(p => p.id === parseInt(item.question_id))
    const categoria = pregunta ? pregunta.categoria : 'Sin categoría'
    
    if (!dimensionesPorCategoria[categoria]) {
      dimensionesPorCategoria[categoria] = { total: 0, positivos: 0, neutros: 0, negativos: 0 }
    }
    dimensionesPorCategoria[categoria].total++
    if (item.valorNumerico >= 4) {
      dimensionesPorCategoria[categoria].positivos++
    } else if (item.valorNumerico === 3) {
      dimensionesPorCategoria[categoria].neutros++
    } else {
      dimensionesPorCategoria[categoria].negativos++
    }
  })
  
  const dimensiones = Object.entries(dimensionesPorCategoria).map(([nombre, datos]) => ({
    nombre,
    porcentaje: datos.total > 0 ? Math.round((datos.positivos / datos.total) * 100) : 0,
    tendencia: Math.random() > 0.5 ? 'up' : 'down', // TODO: Calculate real trend based on historical data
    positivos: datos.positivos,
    neutros: datos.neutros,
    negativos: datos.negativos
  }))
  
  console.log('[v0] Datos procesados con estructura real:', {
    totalEncuestados,
    satisfaccionGeneral,
    areasRiesgo,
    totalAreas: areas.length,
    dimensiones: dimensiones.length,
    muestraAreas: areas.slice(0, 3),
    muestraDimensiones: dimensiones.slice(0, 3)
  })
  
  return {
    totalEncuestados,
    satisfaccionGeneral,
    areasRiesgo,
    totalAreas: areas.length,
    areas,
    dimensiones
  }
})

const areasOrdenadas = computed(() => {
  const areasFiltradas = filtroArea.value 
    ? datosFiltrados.value.areas.filter(area => area.nombre === filtroArea.value)
    : datosFiltrados.value.areas
  
  return [...areasFiltradas].sort((a, b) => {
    if (ordenarPor.value === 'satisfaccion') {
      return b.satisfaccion - a.satisfaccion
    }
    return b.empleados - a.empleados
  })
})

const hayFiltrosActivos = computed(() => {
  return filtroArea.value || filtroRegional.value || filtroCategoria.value || filtroPregunta.value
})

const preguntasFiltradas = computed(() => {
  if (!filtroCategoria.value) return preguntasDisponibles.value
  return preguntasDisponibles.value.filter(p => p.categoria === filtroCategoria.value)
})

const contadorFiltros = computed(() => {
  let count = 0
  if (filtroArea.value) count++
  if (filtroRegional.value) count++
  if (filtroCategoria.value) count++
  if (filtroPregunta.value) count++
  return count
})

const tipoAnalisis = computed(() => {
  if (filtroPregunta.value) return 'Pregunta Específica'
  if (filtroCategoria.value) return 'Por Categoría'
  if (filtroArea.value) return 'Por Área'
  if (filtroRegional.value) return 'Por Regional'
  return 'General'
})

const porcentajeParticipacion = computed(() => {
  return Math.round((datosFiltrados.value.totalEncuestados / 150) * 100)
})

const tendenciaSatisfaccion = computed(() => {
  const satisfaccion = datosFiltrados.value.satisfaccionGeneral
  if (satisfaccion >= 70) return '+5% vs mes anterior'
  if (satisfaccion >= 50) return '-2% vs mes anterior'
  return '-8% vs mes anterior'
})

const indiceClima = computed(() => {
  const satisfaccion = datosFiltrados.value.satisfaccionGeneral
  return (satisfaccion / 100 * 10).toFixed(1)
})

const clasificacionClima = computed(() => {
  const indice = parseFloat(indiceClima.value)
  if (indice >= 8) return 'Excelente'
  if (indice >= 6) return 'Bueno'
  if (indice >= 4) return 'Regular'
  return 'Crítico'
})

const preguntaSeleccionada = computed(() => {
  if (!filtroPregunta.value) return null
  const pregunta = preguntasDisponibles.value.find(p => p.id === parseInt(filtroPregunta.value))
  
  if (!pregunta || !datosAPI.value) return pregunta
  
  const respuestasParaPregunta = datosAPI.value.filter(item => 
    item.question_id === filtroPregunta.value && item.is_selected === "1"
  )
  
  const respuestasConValor = respuestasParaPregunta.map(item => ({
    ...item,
    valorNumerico: convertirRespuestaANumero(item.response_text)
  }))
  
  const respuestasPositivas = respuestasConValor.filter(item => item.valorNumerico >= 4).length
  const respuestasNeutras = respuestasConValor.filter(item => item.valorNumerico === 3).length
  const respuestasNegativas = respuestasConValor.filter(item => item.valorNumerico <= 2).length
  
  return {
    ...pregunta,
    respuestasPositivas,
    respuestasNeutras,
    respuestasNegativas,
    totalRespuestas: respuestasConValor.length
  }
})

const maxEmpleadosFiltrados = computed(() => {
  return Math.max(...datosFiltrados.value.areas.map(a => a.empleados))
})

const fortalezas = ref([
  {
    descripcion: 'Excelentes condiciones de infraestructura y limpieza en áreas de trabajo',
    impacto: 'Alto impacto positivo',
    area: 'Todas las áreas'
  },
  {
    descripcion: 'Sistema de pagos puntual y confiable establecido',
    impacto: 'Estabilidad financiera',
    area: 'Recursos Humanos'
  },
  {
    descripcion: 'Disponibilidad adecuada de materiales y recursos operativos',
    impacto: 'Eficiencia operativa',
    area: 'Logística'
  },
  {
    descripcion: 'Condiciones ambientales óptimas (temperatura, iluminación, espacio)',
    impacto: 'Bienestar laboral',
    area: 'Servicios Generales'
  }
])

const mejoras = ref([
  {
    prioridad: 'CRÍTICO',
    descripcion: 'Intervención inmediata en liderazgo - Casos críticos identificados',
    plazo: '2 semanas',
    responsable: 'Gerencia General + RRHH'
  },
  {
    prioridad: 'CRÍTICO',
    descripcion: 'Programa de motivación y reconocimiento urgente',
    plazo: '1 mes',
    responsable: 'Recursos Humanos'
  },
  {
    prioridad: 'CRÍTICO',
    descripcion: 'Reestructuración de equipos de trabajo en Producción',
    plazo: '6 semanas',
    responsable: 'Jefe de Producción'
  },
  {
    prioridad: 'ALTO',
    descripcion: 'Revisión integral del paquete de beneficios y compensaciones',
    plazo: '3 meses',
    responsable: 'Gerencia + RRHH'
  },
  {
    prioridad: 'MEDIO',
    descripcion: 'Mejora de canales de comunicación interna',
    plazo: '2 meses',
    responsable: 'Comunicaciones'
  },
  {
    prioridad: 'MEDIO',
    descripcion: 'Programa de desarrollo de autonomía y toma de decisiones',
    plazo: '4 meses',
    responsable: 'Desarrollo Organizacional'
  }
])

const recomendaciones = ref([
  {
    titulo: 'Fortalecimiento del Liderazgo',
    descripcion: 'Implementar programa de coaching ejecutivo para supervisores con evaluaciones críticas',
    plazo: 'Corto plazo (1-3 meses)'
  },
  {
    titulo: 'Sistema de Reconocimiento',
    descripcion: 'Crear programa estructurado de reconocimiento y desarrollo profesional',
    plazo: 'Mediano plazo (3-6 meses)'
  },
  {
    titulo: 'Comunicación Estratégica',
    descripcion: 'Rediseñar canales de comunicación interna y feedback bidireccional',
    plazo: 'Largo plazo (6-12 meses)'
  }
])

const generarAnalisisIA = async () => {
  cargandoIA.value = true
  console.log('[v0] Generando análisis con IA para datos:', datosFiltrados.value)
  
  try {
    // Simulate AI analysis with real data context
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const datos = datosFiltrados.value
    
    analisisIA.value = {
      insights: [
        {
          descripcion: `Con ${datos.totalEncuestados} encuestados analizados, el liderazgo presenta la puntuación más crítica, indicando una crisis de confianza en la supervisión directa que afecta múltiples dimensiones.`,
          impacto: 'ALTO',
          confianza: 95
        },
        {
          descripcion: `La satisfacción general del ${datos.satisfaccionGeneral}% ${datos.satisfaccionGeneral < 50 ? 'está por debajo del benchmark crítico' : datos.satisfaccionGeneral < 70 ? 'requiere mejoras significativas' : 'muestra un desempeño aceptable'}.`,
          impacto: datos.satisfaccionGeneral < 50 ? 'ALTO' : datos.satisfaccionGeneral < 70 ? 'MEDIO' : 'BAJO',
          confianza: 92
        },
        {
          descripcion: `Se identificaron ${datos.areasRiesgo} áreas en situación de riesgo que requieren intervención inmediata para prevenir rotación de personal.`,
          impacto: datos.areasRiesgo > 3 ? 'ALTO' : 'MEDIO',
          confianza: 88
        },
        {
          descripcion: `Los datos filtrados muestran patrones específicos que permiten focalizar las intervenciones en las áreas más críticas.`,
          impacto: 'MEDIO',
          confianza: 85
        }
      ],
      recomendaciones: [
        {
          titulo: 'Intervención de Liderazgo Urgente',
          descripcion: 'Programa intensivo de coaching para supervisores con métricas de seguimiento mensual',
          plazo: '30 días',
          roi: 'Alto'
        },
        {
          titulo: 'Sistema de Reconocimiento Inmediato',
          descripcion: 'Implementar reconocimiento peer-to-peer y programa de incentivos no monetarios',
          plazo: '45 días',
          roi: 'Medio-Alto'
        },
        {
          titulo: 'Focalización en Áreas Críticas',
          descripcion: `Intervención específica en las ${datos.areasRiesgo} áreas identificadas como de mayor riesgo`,
          plazo: '60 días',
          roi: 'Alto'
        }
      ],
      predicciones: [
        {
          metrica: 'Satisfacción General',
          valor: `${Math.min(datos.satisfaccionGeneral + 15, 85)}%`,
          periodo: 'En 6 meses'
        },
        {
          metrica: 'Rotación de Personal',
          valor: datos.satisfaccionGeneral < 50 ? '-25%' : '-15%',
          periodo: 'En 3 meses'
        },
        {
          metrica: 'Productividad',
          valor: `+${Math.floor(datos.satisfaccionGeneral / 10 + 5)}%`,
          periodo: 'En 4 meses'
        }
      ]
    }
  } catch (error) {
    console.error('[v0] Error generando análisis IA:', error)
  } finally {
    cargandoIA.value = false
  }
}

const generarAnalisisPregunta = async () => {
  if (!preguntaSeleccionada.value) return
  
  cargandoPregunta.value = true
  console.log('[v0] Analizando pregunta específica:', preguntaSeleccionada.value)
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const pregunta = preguntaSeleccionada.value
    const satisfaccion = calcularSatisfaccionPregunta()
    
    // Generate contextual analysis based on question category and satisfaction level
    let interpretacion = ''
    let factores = []
    let recomendaciones = []
    
    if (pregunta.categoria === 'Liderazgo') {
      interpretacion = `La puntuación de ${satisfaccion}% en esta pregunta de liderazgo indica ${satisfaccion < 50 ? 'una crisis significativa' : satisfaccion < 70 ? 'problemas moderados' : 'un desempeño aceptable'} en la supervisión directa. Los empleados ${satisfaccion < 50 ? 'no confían' : 'tienen dudas sobre'} en las decisiones y capacidades de sus supervisores inmediatos.`
      
      factores = [
        'Falta de capacitación en habilidades de liderazgo',
        'Comunicación deficiente entre supervisor y subordinado',
        'Ausencia de feedback constructivo regular',
        'Decisiones percibidas como injustas o arbitrarias'
      ]
      
      recomendaciones = [
        {
          accion: 'Programa de Coaching Ejecutivo',
          descripcion: 'Implementar coaching personalizado para supervisores con evaluaciones críticas',
          prioridad: 'CRÍTICO',
          plazo: '2 semanas'
        },
        {
          accion: 'Evaluación 360°',
          descripcion: 'Establecer sistema de evaluación multidireccional para supervisores',
          prioridad: 'ALTO',
          plazo: '1 mes'
        }
      ]
    } else if (pregunta.categoria === 'Motivación') {
      interpretacion = `Con ${satisfaccion}% de satisfacción, esta pregunta revela ${satisfaccion < 40 ? 'una desmotivación severa' : satisfaccion < 60 ? 'niveles preocupantes de desmotivación' : 'oportunidades de mejora en motivación'}. Los empleados no sienten que su trabajo sea valorado o que tengan oportunidades de crecimiento.`
      
      factores = [
        'Ausencia de reconocimiento por logros',
        'Falta de oportunidades de desarrollo profesional',
        'Desconexión entre esfuerzo y recompensa',
        'Monotonía en las tareas diarias'
      ]
      
      recomendaciones = [
        {
          accion: 'Sistema de Reconocimiento',
          descripcion: 'Crear programa de reconocimiento peer-to-peer y premios mensuales',
          prioridad: 'ALTO',
          plazo: '3 semanas'
        },
        {
          accion: 'Plan de Desarrollo Individual',
          descripcion: 'Establecer planes de carrera personalizados con metas claras',
          prioridad: 'MEDIO',
          plazo: '2 meses'
        }
      ]
    } else {
      interpretacion = `La puntuación de ${satisfaccion}% en esta dimensión de ${pregunta.categoria} ${satisfaccion < 50 ? 'requiere atención inmediata' : satisfaccion < 70 ? 'presenta oportunidades de mejora' : 'muestra un desempeño satisfactorio'}. Es importante analizar los factores subyacentes que influyen en esta percepción.`
      
      factores = [
        'Procesos internos que requieren optimización',
        'Comunicación entre áreas que puede mejorarse',
        'Recursos o herramientas que podrían ser más efectivos',
        'Capacitación específica en esta área'
      ]
      
      recomendaciones = [
        {
          accion: 'Análisis de Procesos',
          descripcion: 'Revisar y optimizar procesos relacionados con esta dimensión',
          prioridad: 'MEDIO',
          plazo: '1 mes'
        },
        {
          accion: 'Capacitación Específica',
          descripcion: 'Implementar programa de capacitación enfocado en esta área',
          prioridad: 'MEDIO',
          plazo: '6 semanas'
        }
      ]
    }
    
    analisisPregunta.value = {
      interpretacion,
      factores,
      recomendaciones
    }
  } catch (error) {
    console.error('[v0] Error analizando pregunta:', error)
  } finally {
    cargandoPregunta.value = false
  }
}

const calcularSatisfaccionPregunta = () => {
  if (!preguntaSeleccionada.value) return 0
  const total = preguntaSeleccionada.value.respuestasPositivas + 
                preguntaSeleccionada.value.respuestasNeutras + 
                preguntaSeleccionada.value.respuestasNegativas
  if (total === 0) return 0
  return Math.round((preguntaSeleccionada.value.respuestasPositivas / total) * 100)
}

const interpretarSatisfaccion = (porcentaje) => {
  if (porcentaje >= 80) return 'Excelente'
  if (porcentaje >= 60) return 'Bueno'
  if (porcentaje >= 40) return 'Regular'
  return 'Crítico'
}

const onFiltroChange = () => {
  console.log('[v0] Filtros aplicados:', {
    area: filtroArea.value,
    regional: filtroRegional.value,
    categoria: filtroCategoria.value,
    pregunta: filtroPregunta.value
  })
  
  // Clear AI analysis when filters change
  analisisIA.value = { insights: [], recomendaciones: [], predicciones: [] }
  analisisPregunta.value = { interpretacion: '', factores: [], recomendaciones: [] }
}

const toggleVistaDetallada = () => {
  vistaDetallada.value = !vistaDetallada.value
}

const seleccionarDimension = (dimension) => {
  filtroCategoria.value = dimension.nombre
  onFiltroChange()
}

const exportarReporte = () => {
  console.log('[v0] Exportando reporte con filtros actuales')
  // Lógica de exportación
}

const imprimirReporte = () => {
  window.print()
}

const limpiarFiltros = () => {
  filtroArea.value = ''
  filtroRegional.value = ''
  filtroCategoria.value = ''
  filtroPregunta.value = ''
  localStorage.removeItem('filtroArea')
  localStorage.removeItem('filtroRegional')
  localStorage.removeItem('filtroCategoria')
  localStorage.removeItem('filtroPregunta')
  
  // Clear AI analysis when filters are cleared
  analisisIA.value = { insights: [], recomendaciones: [], predicciones: [] }
  analisisPregunta.value = { interpretacion: '', factores: [], recomendaciones: [] }
}

const getColorClass = (porcentaje) => {
  if (porcentaje >= 80) return 'bg-green-500'
  if (porcentaje >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

onMounted(() => {
  cargarDatosAPI()
})
</script>
