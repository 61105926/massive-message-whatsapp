<template>
  <div class="w-full space-y-4">
    <!-- Header con navegación y filtros -->
    <div class="bg-white border rounded-lg p-4">
      <!-- Fila 1: Navegación y Vista -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <button
            @click="navigateMonth('prev')"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft class="h-4 w-4" />
            <span>Anterior</span>
          </button>
          <h2 class="text-xl font-bold">
            {{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}
          </h2>
          <button
            @click="navigateMonth('next')"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <span>Siguiente</span>
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
        
        <!-- Botones de vista mensual/diaria -->
        <div class="flex gap-2">
          <button
            @click="viewMode = 'month'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 hover:bg-gray-200'
            ]"
          >
            Mensual
          </button>
      
        </div>
      </div>
      
      <!-- Fila 2: Filtro por Área y Leyenda -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Filtrar por Área:</label>
          <select
            v-model="selectedDepartment"
            @change="filterEmployees"
            class="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Todas las Áreas</option>
            <option
              v-for="dept in departments"
              :key="dept"
              :value="dept"
            >
              {{ dept }}
            </option>
          </select>
          <span class="text-sm text-gray-600">
            {{ filteredEmployees.length }} empleado{{ filteredEmployees.length !== 1 ? 's' : '' }}
          </span>
        </div>
        
        <!-- Leyenda de estados mejorada -->
        <div class="flex items-center gap-3 text-xs flex-wrap">
          <span class="text-gray-600 font-medium">Estados:</span>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-indigo-500 border border-blue-300"></div>
              <span class="text-gray-700">Pendiente</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-yellow-400/60"></div>
              <span class="text-gray-700">Revisado</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-emerald-600 ring-2 ring-green-300/50"></div>
              <span class="text-gray-700">Aprobado</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-rose-600 ring-2 ring-red-300/50"></div>
              <span class="text-gray-700">Rechazado</span>
            </div>
          </div>
          <div class="flex items-center gap-1 ml-2">
            <div class="w-4 h-4 rounded bg-purple-500/40 border border-purple-400"></div>
            <span class="text-gray-700">Feriado</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Mensual -->
    <div v-if="viewMode === 'month'" class="bg-white border rounded-lg overflow-hidden shadow-lg w-full">
      <!-- Indicador de scroll horizontal arriba -->
      <div 
        ref="scrollIndicator" 
        class="overflow-x-auto bg-gray-100 border-b" 
        style="height: 20px; display: flex; align-items: center; cursor: ew-resize;"
        @scroll="handleIndicatorScroll"
      >
        <div class="flex-shrink-0" :style="{ width: `${daysInMonth * 65}px`, height: '100%', background: 'linear-gradient(to right, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)' }"></div>
      </div>
      
      <div 
        ref="calendarScroll" 
        class="overflow-auto" 
        style="height: calc(75vh - 20px); max-height: 580px;" 
        @scroll="handleCalendarScroll"
      >
        <div class="w-max min-w-full">
          <!-- Headers - Sticky -->
          <div class="grid border-b sticky top-0 z-20" :style="{ gridTemplateColumns: `195px repeat(${daysInMonth}, 65px)` }">
            <div class="border-r bg-gradient-to-b from-gray-900 to-gray-800 text-white text-center flex items-center justify-center h-[70px] sticky left-0 z-30">
              <h3 class="font-bold text-xs">Empleados</h3>
            </div>
            <div
              v-for="(day, index) in days"
              :key="index"
              class="border-r border-gray-600 text-center flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white"
              :class="{
                'bg-red-900/20': day && isWeekend(day),
                'bg-purple-900/40': day && isHoliday(day),
                'bg-gray-800': day && !isWeekend(day) && !isHoliday(day)
              }"
              style="height: 70px;"
            >
              <div class="w-full">
                <div class="font-bold text-white text-base mb-0.5">{{ day ? day.getDate() : '' }}</div>
                <div class="text-[10px] text-gray-300 font-medium">{{ day ? dayNames[day.getDay()] : '' }}</div>
                <div v-if="day && isHoliday(day)" class="text-[8px] text-purple-200 font-semibold mt-0.5">FERIADO</div>
                <div v-if="day && isToday(day)" class="w-4 h-1 bg-blue-500 rounded-full mx-auto mt-1"></div>
              </div>
            </div>
          </div>

          <!-- Filas de empleados -->
          <div
            v-for="employee in filteredEmployees"
            :key="employee.emp_id"
            class="grid border-b relative transition-all group hover:bg-gray-50/50"
            :style="{ gridTemplateColumns: `195px repeat(${daysInMonth}, 65px)`, height: '70px' }"
          >
            <!-- Celda de empleado -->
            <div class="border-r bg-gradient-to-b from-gray-50 to-white hover:bg-gray-100 cursor-pointer transition-colors flex items-center sticky left-0 z-10"
                 :class="{ 'bg-blue-50': selectedEmployee?.emp_id === employee.emp_id }"
                 @click="selectedEmployee = employee">
              <div class="flex flex-col items-start justify-center gap-0.5 px-2 py-1 w-full">
                <div class="flex items-center gap-2 w-full">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {{ employee.name.charAt(0) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-xs truncate">{{ employee.name }}</div>
                    <div class="text-[10px] text-gray-600 truncate">{{ employee.department }}</div>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-1 w-full flex-wrap">
                  <span class="inline-flex items-center rounded-full px-1 py-0.5 font-bold text-[9px]" :class="(employee.vacationBalance ?? 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ (employee.vacationBalance ?? 0) > 0 ? (employee.vacationBalance ?? 0) + 'd' : '0d' }}
                  </span>
                  <span v-if="employee.usagePercentage" class="inline-flex items-center rounded-full px-1 py-0.5 font-bold text-[9px]" :class="employee.usagePercentage >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'">
                    {{ employee.usagePercentage }}%
                  </span>
                  <span v-if="employee.daysRemaining !== undefined" class="inline-flex items-center text-[9px] text-gray-500 font-medium">
                    {{ employee.daysRemaining > 0 ? `${employee.daysRemaining}d rest.` : 'Sin días' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Celdas de días -->
            <div
              v-for="(day, dayIndex) in days"
              :key="dayIndex"
              class="border-r relative transition-colors cursor-pointer hover:bg-blue-50/40"
              :class="{
                'bg-red-50/30': day && isWeekend(day),
                'bg-purple-50/40': day && isHoliday(day),
                'bg-white': day && !isWeekend(day) && !isHoliday(day)
              }"
              @click="openVacationModal(employee.emp_id, day)"
            >
              <!-- Indicador de día de hoy -->
              <div v-if="day && isToday(day)" class="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 z-10"></div>
              
              <!-- Bloque de vacación -->
              <div
                v-if="day && hasVacation(employee.emp_id, day)"
                class="absolute inset-0 flex items-center justify-center p-1.5"
              >
                <div
                  class="w-full rounded-md transition-all duration-200 shadow-md hover:shadow-xl border-2 border-white/50 hover:border-white/90 hover:scale-[1.03] transform cursor-pointer relative group"
                  :class="getVacationBlockClasses(employee.emp_id, day)"
                  :title="getVacationTooltip(employee.emp_id, day)"
                  @click.stop="showVacationContextMenu(employee.emp_id, day)"
                >
                  <!-- Indicador de acción rápida en hover -->
                  <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                      <svg class="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div class="px-2 py-1.5 text-white text-[8px] font-bold text-center leading-tight">
                    <div class="truncate font-bold drop-shadow">{{ employee.name.split(' ')[0] }}</div>
                    <div class="text-[7px] font-semibold opacity-100 mt-0.5 flex items-center justify-center gap-1">
                      <span>{{ getVacationStatusShort(employee.emp_id, day) }}</span>
                      <span v-if="getVacationStatus(employee.emp_id, day) === 'preapproved'" class="text-[6px] opacity-90">✓</span>
                    </div>
                  </div>
                  
                  <!-- Menú contextual mejorado con preaprobación -->
                  <div
                    v-if="contextMenu.show && contextMenu.emp_id === employee.emp_id && contextMenu.date?.toDateString() === day.toDateString()"
                    class="absolute z-50 mt-1 w-56 bg-white rounded-lg shadow-xl border-2 border-gray-200 py-2 overflow-hidden"
                    @click.stop
                  >
                    <!-- Header del menú -->
                    <div class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <div class="text-xs font-semibold text-gray-700">Acciones Rápidas</div>
                      <div class="text-[10px] text-gray-500 mt-0.5">{{ formatDate(day.toISOString()) }}</div>
                    </div>
                    
                    <!-- Acciones principales -->
                    <div class="py-1">
                      <button
                        v-if="getVacationStatus(employee.emp_id, day) === 'pending'"
                        @click="preapproveVacationDay(employee.emp_id, day)"
                        class="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-2 transition-colors group"
                      >
                        <div class="w-8 h-8 rounded-full bg-yellow-100 group-hover:bg-yellow-200 flex items-center justify-center flex-shrink-0">
                          <span class="text-yellow-600 font-bold">✓</span>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold">Preaprobar</div>
                          <div class="text-xs text-gray-500">Marcar como revisado</div>
                        </div>
                      </button>
                      
                      <button
                        v-if="getVacationStatus(employee.emp_id, day) !== 'rejected'"
                        @click="rejectVacationDay(employee.emp_id, day)"
                        class="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors group"
                      >
                        <div class="w-8 h-8 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center flex-shrink-0">
                          <span class="text-red-600 font-bold">✗</span>
                        </div>
                        <div class="flex-1">
                          <div class="font-semibold">Rechazar</div>
                          <div class="text-xs text-gray-500">Rechazar solicitud</div>
                        </div>
                      </button>
                    </div>
                    
                    <div class="border-t my-1"></div>
                    
                    <!-- Acciones adicionales -->
                    <div class="py-1">
                      <button
                        @click="preapproveVacationYear(employee.emp_id)"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-2 transition-colors"
                      >
                        <span class="text-yellow-600">📅</span>
                        <span>Preaprobar todo el año</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Indicador de celda vacía (para programar vacaciones) -->
              <div v-else-if="day" class="absolute inset-0 flex flex-col items-center justify-center">
                <!-- Indicador de feriado -->
                <div v-if="isHoliday(day)" class="text-[8px] font-bold text-purple-600 mb-1">FERIADO</div>
                <div class="opacity-0 group-hover:opacity-20 text-2xl text-blue-400">+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Diaria -->
    <div v-if="viewMode === 'day'" class="space-y-4">
      <!-- Selector de fecha -->
      <div class="bg-white border rounded-lg p-4">
        <input
          v-model="selectedDate"
          type="date"
          class="px-4 py-2 border rounded-md"
        />
      </div>

      <!-- Lista de vacaciones del día -->
      <div class="space-y-2">
        <div
          v-for="vacation in getDayVacations()"
          :key="vacation.id"
          class="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {{ vacation.employee_name.charAt(0) }}
              </div>
              <div>
                <div class="font-medium">{{ vacation.employee_name }}</div>
                <div class="text-sm text-gray-600">{{ vacation.department }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">
                {{ formatDate(vacation.start_date) }} - {{ formatDate(vacation.end_date) }}
              </span>
              <button
                @click="approveVacation(vacation.id)"
                class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
              >
                Aprobar
              </button>
              <button
                @click="rejectVacation(vacation.id)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Rechazar
              </button>
              <button
                @click="openSuggestModal(vacation)"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                Acciones
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Progreso para Preaprobación -->
    <div
      v-if="showProgressModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"
      @click.self="false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-semibold mb-4">Preaprobando Vacaciones</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">{{ progressInfo.message }}</span>
              <span class="text-gray-600 font-medium">{{ progressInfo.current }} / {{ progressInfo.total }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                class="bg-blue-600 h-full rounded-full transition-all duration-300"
                :style="{ width: `${(progressInfo.current / progressInfo.total) * 100}%` }"
              ></div>
            </div>
          </div>
          <p class="text-sm text-gray-500 text-center">
            Por favor espera, esto puede tomar unos momentos...
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de acciones de vacación -->
    <div
      v-if="showSuggestModal && currentVacation"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showSuggestModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl" @click.stop>
        <h3 class="text-xl font-bold mb-4">Acciones de Vacación</h3>
        
        <!-- Información de la vacación -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {{ currentVacation.employee_name.charAt(0) }}
            </div>
            <div>
              <div class="font-semibold text-lg">{{ currentVacation.employee_name }}</div>
              <div class="text-sm text-gray-600">{{ currentVacation.department }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-600 mb-1">Fecha Inicio</div>
              <div class="font-semibold">{{ formatDate(currentVacation.start_date) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-600 mb-1">Fecha Fin</div>
              <div class="font-semibold">{{ formatDate(currentVacation.end_date) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-600 mb-1">Estado</div>
              <div class="font-semibold" :class="{
                'text-blue-600': currentVacation.status === 'pending',
                'text-yellow-600': currentVacation.status === 'preapproved',
                'text-green-600': currentVacation.status === 'approved',
                'text-red-600': currentVacation.status === 'rejected'
              }">
                {{ currentVacation.status === 'pending' ? '⏳ Pendiente' : 
                   currentVacation.status === 'preapproved' ? '✓ Revisado' : 
                   currentVacation.status === 'approved' ? '✓ Aprobado' : 
                   '✗ Rechazado' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones rápidas mejoradas -->
        <div class="space-y-2 mb-4">
          <div class="grid grid-cols-2 gap-2">
            <button
              v-if="currentVacation.status === 'pending'"
              @click="preapproveVacationFromModal(currentVacation)"
              class="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>Preaprobar</span>
            </button>
            <button
              v-if="currentVacation.status !== 'rejected'"
              @click="rejectVacation(currentVacation.id)"
              class="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <span>✗</span>
              <span>Rechazar</span>
            </button>
            <button
              @click="showSuggestModal = false"
              class="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cerrar
            </button>
          </div>
          
          <!-- Timeline visual en el modal -->
          <div class="flex items-center gap-2 pt-2 border-t">
            <div class="flex items-center gap-1 text-xs">
              <div :class="[
                'w-4 h-4 rounded-full flex items-center justify-center text-[8px]',
                currentVacation.status !== 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
              ]">
                <span v-if="currentVacation.status !== 'pending'">✓</span>
                <span v-else>1</span>
              </div>
              <span class="text-gray-600">Pendiente</span>
            </div>
            <div class="flex-1 h-0.5" :class="currentVacation.status === 'preapproved' || currentVacation.status === 'approved' || currentVacation.status === 'rejected' ? 'bg-blue-500' : 'bg-gray-300'"></div>
            <div class="flex items-center gap-1 text-xs">
              <div :class="[
                'w-4 h-4 rounded-full flex items-center justify-center text-[8px]',
                currentVacation.status === 'preapproved' || currentVacation.status === 'approved' || currentVacation.status === 'rejected' ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'
              ]">
                <span v-if="currentVacation.status === 'approved' || currentVacation.status === 'rejected'">✓</span>
                <span v-else-if="currentVacation.status === 'preapproved'">2</span>
                <span v-else>2</span>
              </div>
              <span class="text-gray-600">Revisado</span>
            </div>
            <div class="flex-1 h-0.5" :class="currentVacation.status === 'approved' || currentVacation.status === 'rejected' ? 'bg-yellow-500' : 'bg-gray-300'"></div>
            <div class="flex items-center gap-1 text-xs">
              <div :class="[
                'w-4 h-4 rounded-full flex items-center justify-center text-[8px]',
                currentVacation.status === 'approved' ? 'bg-green-500 text-white' : 
                currentVacation.status === 'rejected' ? 'bg-red-500 text-white' : 
                'bg-gray-300 text-gray-600'
              ]">
                <span v-if="currentVacation.status === 'approved' || currentVacation.status === 'rejected'">✓</span>
                <span v-else>3</span>
              </div>
              <span class="text-gray-600">
                {{ currentVacation.status === 'approved' ? 'Aprobado' : currentVacation.status === 'rejected' ? 'Rechazado' : 'Final' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Sugerencia de fecha alternativa -->
        <div class="border-t pt-4">
          <h4 class="text-sm font-semibold mb-3">Confirmar</h4>
          <div class="space-y-3">
            <p class="text-sm text-gray-700">
              ¿Deseas sugerirle <span class="font-medium">{{ formatDayMonth(currentVacation.start_date) }}</span> a {{ currentVacation.employee_name }}?
            </p>
            <div class="flex gap-3">
              <button
                @click="sendSuggestion"
                class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
              >
                Sugerir
              </button>
              <button
                @click="showSuggestModal = false"
                class="px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de creación de vacaciones -->
    <div
      v-if="showCreateModal && selectedEmployeeForVacation"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showCreateModal = false"
    >
      <div class="bg-white rounded-lg p-4 max-w-md w-full mx-4 shadow-2xl" @click.stop>
        <!-- Header compacto -->
        <div class="flex items-center gap-2 mb-4 pb-3 border-b">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {{ selectedEmployeeForVacation.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm truncate">{{ selectedEmployeeForVacation.name }}</div>
            <div class="text-xs text-gray-600">{{ selectedEmployeeForVacation.department }}</div>
          </div>
        </div>

        <!-- Formulario compacto -->
        <div class="space-y-3">
          <!-- Mensaje con fecha y empleado -->
          <p class="text-sm text-gray-700">
            ¿Deseas sugerirle <span class="font-medium">{{ formatDayMonth(newVacationStartDate) }}</span> a {{ selectedEmployeeForVacation?.name }}?
          </p>
          
          <div class="flex gap-2 pt-2">
            <button
              @click="submitVacationForm"
              class="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Sugerencias -->
    <div
      v-if="showSuggestionModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="showSuggestionModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl"
        @click.stop
      >
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-purple-900">Sugerir Fechas Alternativas</h3>
            <p class="text-sm text-gray-600 mt-1">Selecciona fechas alternativas para esta solicitud</p>
          </div>

          <!-- Fechas actuales -->
          <div v-if="suggestionData.currentVacations && suggestionData.currentVacations.length > 0" class="p-4 bg-red-50 rounded-lg border border-red-200">
            <p class="text-sm font-medium text-red-900 mb-2">Fechas actuales:</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="vac in suggestionData.currentVacations"
                :key="vac.start_date"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                {{ formatDateOnly(vac.start_date) }}
              </span>
            </div>
          </div>

          <!-- Calendario de selección de fechas alternativas -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <label class="text-sm font-medium mb-2 block">Selecciona fechas alternativas:</label>
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div v-for="day in ['D', 'L', 'M', 'X', 'J', 'V', 'S']" :key="day" class="text-center text-xs font-medium text-gray-600">
                {{ day }}
              </div>
            </div>
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="(alternateDate, idx) in suggestionData.alternateDates"
                :key="idx"
                @click="toggleAlternateDate(alternateDate)"
                :disabled="isHoliday(alternateDate) || alternateDate.getDay() === 0"
                class="aspect-square flex items-center justify-center text-xs rounded hover:bg-blue-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                :class="isAlternateDateSelected(alternateDate) ? 'bg-blue-600 text-white' : isHoliday(alternateDate) ? 'bg-purple-100 border border-purple-300 text-purple-700' : 'bg-white border border-gray-200 text-gray-700'"
              >
                {{ alternateDate.getDate() }}
              </button>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3">
            <button
              @click="confirmSuggestion"
              :disabled="selectedAlternateDates.length === 0"
              class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              Enviar Sugerencia
            </button>
            <button
              @click="showSuggestionModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Employee {
  emp_id: string
  name: string
  department: string
  vacationBalance?: number
  usagePercentage?: number
  daysRemaining?: number
  totalDays?: number
}

interface Vacation {
  id: string
  emp_id: string
  employee_name: string
  department: string
  start_date: string
  end_date: string
  status: 'pending' | 'preapproved' | 'approved' | 'rejected'
}

const props = defineProps<{
  managerId?: number
}>()

// Log del managerId recibido
console.log('🏢 BossCalendarView - Props recibidas:', props)
console.log('🏢 BossCalendarView - managerId:', props.managerId)

const currentDate = ref(new Date(2026, 0, 1)) // Iniciar en enero 2026
const selectedEmployee = ref<Employee | null>(null)
const viewMode = ref<'month' | 'day'>('month')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showSuggestModal = ref(false)
const currentVacation = ref<Vacation | null>(null)
const selectedDepartment = ref('')
const departments = ref<string[]>([])
const calendarScroll = ref<HTMLElement | null>(null)
const scrollIndicator = ref<HTMLElement | null>(null)
const isScrollingIndicator = ref(false)
const isScrollingCalendar = ref(false)
const showCreateModal = ref(false)
const selectedEmployeeForVacation = ref<Employee | null>(null)
const selectedDateForVacation = ref<Date | null>(null)
const newVacationStartDate = ref('')
const newVacationEndDate = ref('')
const newVacationNote = ref('')
const showProgressModal = ref(false)
const progressInfo = ref({
  current: 0,
  total: 0,
  message: ''
})

// Menú contextual para vacaciones
const contextMenu = ref({
  show: false,
  emp_id: '',
  date: null as Date | null
})

// Modal de sugerencias
const showSuggestionModal = ref(false)
const suggestionData = ref({
  emp_id: '',
  currentVacations: [] as Vacation[],
  alternateDates: [] as Date[],
  originalDates: [] as string[]
})
const selectedAlternateDates = ref<Date[]>([])

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const teamEmployees = ref<Employee[]>([])
const vacations = ref<Vacation[]>([])
const publicHolidays = ref<{ date: string; name: string }[]>([])

const days = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const lastDay = new Date(year, month + 1, 0)
  const endDate = lastDay.getDate()
  
  const daysArray = []
  
  // Generar solo los días del mes desde el día 1
  for (let i = 1; i <= endDate; i++) {
    daysArray.push(new Date(year, month, i))
  }
  
  return daysArray
})

const daysInMonth = computed(() => {
  return days.value.length
})

const filteredEmployees = computed(() => {
  if (!selectedDepartment.value) {
    return teamEmployees.value
  }
  return teamEmployees.value.filter(emp => emp.department === selectedDepartment.value)
})

const navigateMonth = (direction: 'prev' | 'next') => {
  if (direction === 'prev') {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  } else {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }
  fetchHolidays() // Recargar feriados al cambiar de mes
  loadData()
}

const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const isHoliday = (date: Date): boolean => {
  if (!date) return false
  const dateStr = date.toISOString().split('T')[0]
  return publicHolidays.value.some(h => h.date === dateStr)
}

const hasVacation = (empId: string, date: Date): boolean => {
  const dateStr = date.toISOString().split('T')[0] // Formato YYYY-MM-DD
  
  const found = vacations.value.some(v => {
    const vStart = v.start_date
    const vEnd = v.end_date
    const match = dateStr === vStart || dateStr === vEnd
    return v.emp_id === empId && match
  })
  
  // Debug logging
  if (found && vacations.value.length > 0) {
    console.log(`✓ Vacación encontrada para ${empId} en ${dateStr}`)
  }
  
  return found
}

const getVacationTooltip = (empId: string, date: Date): string => {
  const dateStr = date.toISOString().split('T')[0]
  const vacation = vacations.value.find(v => {
    const match = dateStr === v.start_date || dateStr === v.end_date
    return v.emp_id === empId && match
  })
  
  if (!vacation) return ''
  
  const statusText = vacation.status === 'pending' ? 'Pendiente' :
                     vacation.status === 'preapproved' ? 'Revisado/Preaprobado' :
                     vacation.status === 'approved' ? 'Aprobado' :
                     vacation.status === 'rejected' ? 'Rechazado' : 'Desconocido'
  
  return `${vacation.employee_name}\n${formatDate(vacation.start_date)}\nEstado: ${statusText}\nClic para acciones`
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getVacationBlockClasses = (empId: string, date: Date): string => {
  const dateStr = date.toISOString().split('T')[0]
  const vacation = vacations.value.find(v => {
    const match = dateStr === v.start_date || dateStr === v.end_date
    return v.emp_id === empId && match
  })
  
  if (!vacation) return ''
  
  const classes = []
  
  // Colores por estado con mejores gradientes
  if (vacation.status === 'approved') {
    classes.push('bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700')
    classes.push('min-h-[50px]')
    classes.push('ring-2 ring-green-300/50')
  } else if (vacation.status === 'preapproved') {
    classes.push('bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600')
    classes.push('min-h-[48px]')
    classes.push('ring-2 ring-yellow-300/50')
    classes.push('border-2 border-yellow-400/60')
  } else if (vacation.status === 'pending') {
    classes.push('bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600')
    classes.push('min-h-[45px]')
    classes.push('ring-2 ring-blue-300/50')
  } else if (vacation.status === 'rejected') {
    classes.push('bg-gradient-to-br from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700')
    classes.push('min-h-[40px]')
    classes.push('ring-2 ring-red-300/50')
  } else {
    classes.push('bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700')
    classes.push('min-h-[50px]')
  }
  
  return classes.join(' ')
}

const getVacationStatusShort = (empId: string, date: Date): string => {
  const dateStr = date.toISOString().split('T')[0]
  const vacation = vacations.value.find(v => {
    const match = dateStr === v.start_date || dateStr === v.end_date
    return v.emp_id === empId && match
  })
  
  if (!vacation) return ''
  
  if (vacation.status === 'approved') return '✓ OK'
  if (vacation.status === 'preapproved') return '✓ REV'
  if (vacation.status === 'pending') return '⏳ PEN'
  if (vacation.status === 'rejected') return '✗ REC'
  return ''
}

const getVacationStatus = (empId: string, date: Date): string => {
  const dateStr = date.toISOString().split('T')[0]
  const vacation = vacations.value.find(v => {
    const match = dateStr === v.start_date || dateStr === v.end_date
    return v.emp_id === empId && match
  })
  
  return vacation?.status || 'pending'
}

const getDayVacations = (): Vacation[] => {
  return vacations.value.filter(v => {
    const date = new Date(selectedDate.value)
    return date >= new Date(v.start_date) && date <= new Date(v.end_date)
  })
}

const openVacationModal = (empId: string, date: Date) => {
  // No permitir sugerir días feriados
  if (isHoliday(date)) {
    alert('No se pueden sugerir vacaciones en días feriados.')
    return
  }
  
  const vacation = vacations.value.find(v => 
    v.emp_id === empId && 
    date >= new Date(v.start_date) && 
    date <= new Date(v.end_date)
  )
  
  if (vacation) {
    // Si hay vacación, mostrar modal de acciones
    currentVacation.value = vacation
    showSuggestModal.value = true
  } else {
    // Si no hay vacación, mostrar modal de creación
    const employee = teamEmployees.value.find(emp => emp.emp_id === empId)
    selectedEmployeeForVacation.value = employee || null
    selectedDateForVacation.value = date
    
    // Prellenar fechas
    const dateStr = date.toISOString().split('T')[0]
    newVacationStartDate.value = dateStr
    newVacationEndDate.value = dateStr
    
    showCreateModal.value = true
  }
}

const approveVacation = async (vacationId: string) => {
  try {
    // TODO: Llamar a API para aprobar
    console.log('Aprobar vacación:', vacationId)
    loadData()
  } catch (error) {
    console.error('Error al aprobar vacación:', error)
  }
}

const rejectVacation = async (vacationId: string) => {
  try {
    // TODO: Llamar a API para rechazar
    console.log('Rechazar vacación:', vacationId)
    loadData()
  } catch (error) {
    console.error('Error al rechazar vacación:', error)
  }
}

const openSuggestModal = (vacation: Vacation) => {
  currentVacation.value = vacation
  showSuggestModal.value = true
}

const sendSuggestion = async () => {
  try {
    // TODO: Enviar sugerencia a API
    console.log('Enviar sugerencia:', {
      vacationId: currentVacation.value?.id,
      start: currentVacation.value?.start_date,
      end: currentVacation.value?.end_date
    })
    showSuggestModal.value = false
  } catch (error) {
    console.error('Error al enviar sugerencia:', error)
  }
}

// Funciones del menú contextual
const showVacationContextMenu = (empId: string, date: Date) => {
  contextMenu.value = {
    show: true,
    emp_id: empId,
    date: date
  }
}

// Función para preaprobar vacación desde el calendario
const preapproveVacationDay = async (empId: string, date: Date) => {
  try {
    const dateStr = date.toISOString().split('T')[0]
    const vacation = vacations.value.find(v => v.emp_id === empId && v.start_date === dateStr)
    
    if (vacation) {
      console.log('✓ Preaprobando vacación:', vacation)
      
      // Extraer el id_solicitud del id de la vacación (formato: id_solicitud_fecha)
      const id_solicitud = vacation.id.split('_')[0]
      
      // Llamar a la API para actualizar en la base de datos
      // El backend ahora acepta 'PRE-APROBADO' (con guión)
      const response = await fetch('http://190.171.225.68/api/vacaciones/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_solicitud: parseInt(id_solicitud),
          estado: 'PRE-APROBADO', // Estado válido en el backend
          comentario: `Solicitud revisada y preaprobada: ${dateStr}`
        })
      })
      
      if (response.ok) {
        // Cambiar estado a preaprobado en el array local
        vacation.status = 'preapproved'
        console.log('✅ Vacación preaprobada en la base de datos')
        console.log('⏸️ No se envía notificación. Se enviará cuando todas las fechas estén aprobadas.')
      } else {
        console.error('❌ Error al preaprobar en la API')
      }
      
      contextMenu.value.show = false
    }
  } catch (error) {
    console.error('Error al preaprobar vacación:', error)
  }
}

// Función no utilizada - comentada para evitar error de TypeScript
/*
const approveVacationDay = async (empId: string, date: Date) => {
  try {
    const dateStr = date.toISOString().split('T')[0]
    const vacation = vacations.value.find(v => v.emp_id === empId && v.start_date === dateStr)
    
    if (vacation) {
      console.log('✓ Aprobando vacación:', vacation)
      
      // Extraer el id_solicitud del id de la vacación (formato: id_solicitud_fecha)
      const id_solicitud = vacation.id.split('_')[0]
      
      // Obtener datos completos de la solicitud para la notificación
      const employee = teamEmployees.value.find(e => e.emp_id === empId)
      const employeeName = employee?.name || vacation.employee_name
      
      // Llamar a la API para actualizar en la base de datos
      const response = await fetch('http://190.171.225.68/api/vacaciones/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_solicitud: parseInt(id_solicitud),
          estado: 'APROBADO',
          comentario: `Fecha aprobada: ${dateStr}`
        })
      })
      
      if (response.ok) {
        // Guardar el estado original antes de cambiarlo
        const estadoOriginal = vacation.status
        
        // Cambiar estado a aprobado en el array local
        vacation.status = 'approved'
        console.log('✅ Vacación aprobada en la base de datos')
        
        // Verificar si estaba preaprobada para enviar resumen o individual
        const estabaPreaprobada = estadoOriginal === 'preapproved'
        
        if (estabaPreaprobada) {
          // Si estaba preaprobada, verificar si todas las fechas preaprobadas están ahora aprobadas
          console.log('📋 Vacación estaba preaprobada. Verificando si todas las fechas están aprobadas para enviar resumen.')
          
          try {
            const checkResponse = await fetch(`http://190.171.225.68/api/vacacion-data-manager?manager=${props.managerId}`)
            if (checkResponse.ok) {
              const checkData = await checkResponse.json()
              if (checkData.success && Array.isArray(checkData.data)) {
                // Buscar todas las solicitudes del mismo empleado con el mismo id_solicitud
                const solicitudesEmpleado = checkData.data.filter((req: any) => 
                  req.emp_id === empId && 
                  req.tipo === 'PROGRAMADA' &&
                  String(req.id_solicitud) === id_solicitud
                )

                // Verificar si hay alguna preaprobada que aún no esté aprobada
                const hayPreaprobadasPendientes = solicitudesEmpleado.some((req: any) => 
                  req.estado === 'PREAPROBADO' || req.estado === 'PRE-APROBADO'
                )

                // Si no hay preaprobadas pendientes, todas están aprobadas - enviar resumen
                if (!hayPreaprobadasPendientes) {
                  console.log('✅ Todas las fechas preaprobadas están ahora aprobadas. Enviando resumen.')

                  // Obtener reemplazantes
                  let reemplazantesCompletos = []
                  try {
                    const reemplazanteResponse = await fetch(`http://190.171.225.68/api/reemplazante-vacation?idsolicitud=${id_solicitud}`)
                    if (reemplazanteResponse.ok) {
                      const reemplazanteData = await reemplazanteResponse.json()
                      if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                        reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                          emp_id: rep.EMP_ID,
                          nombre: rep.NOMBRE,
                          telefono: rep.TELEFONO
                        }))
                      }
                    }
                  } catch (apiError) {
                    console.warn('⚠️ Error al obtener reemplazantes:', apiError)
                  }

                  // Obtener todas las fechas aprobadas (resumen completo)
                  const todasFechas = solicitudesEmpleado
                    .filter((req: any) => req.estado === 'APROBADO')
                    .flatMap((req: any) => req.fechas.map((f: any) => `${f.fecha} (${f.turno})`))

                  const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'
                  await fetch(`${BOT_URL}/api/vacation-notification`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      id_solicitud: id_solicitud,
                      emp_id: empId,
                      emp_nombre: employeeName,
                      estado: 'APROBADO',
                      comentario: `Todas tus vacaciones preaprobadas han sido aprobadas`,
                      tipo: 'PROGRAMADA',
                      dias_solicitados: todasFechas.length,
                      fechas: todasFechas,
                      reemplazantes: reemplazantesCompletos
                    })
                  }).catch(err => {
                    console.warn('⚠️ No se pudo enviar notificación de WhatsApp:', err)
                  })
                  
                  console.log('✅ Resumen de aprobación enviado')
                } else {
                  console.log('⏸️ Aún hay fechas preaprobadas pendientes. No se envía notificación todavía.')
                }
              }
            }
          } catch (checkError) {
            console.warn('⚠️ Error al verificar estado de solicitudes:', checkError)
          }
        } else {
          // Si NO estaba preaprobada, enviar notificación individual inmediatamente
          console.log('✅ Aprobación directa desde calendario: Enviando notificación individual inmediata.')
          
          try {
            // Obtener reemplazantes
            let reemplazantesCompletos = []
            try {
              const reemplazanteResponse = await fetch(`http://190.171.225.68/api/reemplazante-vacation?idsolicitud=${id_solicitud}`)
              if (reemplazanteResponse.ok) {
                const reemplazanteData = await reemplazanteResponse.json()
                if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                  reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                    emp_id: rep.EMP_ID,
                    nombre: rep.NOMBRE,
                    telefono: rep.TELEFONO
                  }))
                }
              }
            } catch (apiError) {
              console.warn('⚠️ Error al obtener reemplazantes:', apiError)
            }

            const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'
            await fetch(`${BOT_URL}/api/vacation-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id_solicitud: id_solicitud,
                emp_id: empId,
                emp_nombre: employeeName,
                estado: 'APROBADO',
                comentario: `Fecha aprobada: ${dateStr}`,
                tipo: 'PROGRAMADA',
                dias_solicitados: 1,
                fechas: [`${dateStr} (COMPLETO)`],
                reemplazantes: reemplazantesCompletos
              })
            }).catch(err => {
              console.warn('⚠️ No se pudo enviar notificación de WhatsApp:', err)
            })
            
            console.log('✅ Notificación de aprobación individual enviada')
          } catch (notifError) {
            console.warn('⚠️ Error al enviar notificación de aprobación:', notifError)
          }
        }
      } else {
        console.error('❌ Error al aprobar en la API')
      }
      
      contextMenu.value.show = false
    }
  } catch (error) {
    console.error('Error al aprobar vacación:', error)
  }
}
*/

// Función para preaprobar desde el modal
const preapproveVacationFromModal = async (vacation: Vacation) => {
  try {
    const dateStr = vacation.start_date
    const id_solicitud = vacation.id.split('_')[0]
    
    // El backend ahora acepta 'PRE-APROBADO' (con guión)
    const response = await fetch('http://190.171.225.68/api/vacaciones/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_solicitud: parseInt(id_solicitud),
        estado: 'PRE-APROBADO', // Estado válido en el backend
        comentario: `Solicitud revisada y preaprobada: ${dateStr}`
      })
    })
    
    if (response.ok) {
      vacation.status = 'preapproved'
      console.log('✅ Vacación preaprobada desde modal')
      
      // Enviar notificación
      try {
        const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
        await fetch(`${BOT_URL}/api/vacation-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_solicitud: id_solicitud,
            emp_id: vacation.emp_id,
            emp_nombre: vacation.employee_name,
            estado: 'PREAPROBADO',
            comentario: `Solicitud revisada y preaprobada para ${dateStr}`,
            tipo: 'PROGRAMADA',
            dias_solicitados: 1,
            fechas: [dateStr]
          })
        })
      } catch (notifError) {
        console.warn('⚠️ Error al enviar notificación:', notifError)
      }
      
      showSuggestModal.value = false
    }
  } catch (error) {
    console.error('Error al preaprobar desde modal:', error)
  }
}

const rejectVacationDay = async (empId: string, date: Date) => {
  try {
    const dateStr = date.toISOString().split('T')[0]
    const vacation = vacations.value.find(v => v.emp_id === empId && v.start_date === dateStr)
    
    if (vacation) {
      // Pedir confirmación antes de rechazar
      const employee = teamEmployees.value.find(e => e.emp_id === empId)
      const employeeName = employee?.name || vacation.employee_name || `Empleado #${empId}`
      const fechaFormateada = new Date(dateStr).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      
      const confirmar = confirm(
        `¿Estás seguro de que deseas RECHAZAR la solicitud de vacaciones?\n\n` +
        `Empleado: ${employeeName}\n` +
        `Fecha: ${fechaFormateada}\n\n` +
        `Esta acción no se puede deshacer.`
      )
      
      if (!confirmar) {
        contextMenu.value.show = false
        return
      }
      
      console.log('✗ Rechazando vacación:', vacation)
      
      // Extraer el id_solicitud del id de la vacación (formato: id_solicitud_fecha)
      const id_solicitud = vacation.id.split('_')[0]
      
      // Llamar a la API para actualizar en la base de datos
      const response = await fetch('http://190.171.225.68/api/vacaciones/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_solicitud: parseInt(id_solicitud),
          estado: 'RECHAZADO',
          comentario: `Fecha rechazada: ${dateStr}`
        })
      })
      
      if (response.ok) {
        // Cambiar estado a rechazado en el array local
        vacation.status = 'rejected'
        console.log('✅ Vacación rechazada en la base de datos')
        
        // Disparar evento para actualizar el Panel de Aprobación
        const event = new CustomEvent('vacation-status-changed', {
          detail: { 
            action: 'rejected',
            id_solicitud: id_solicitud,
            emp_id: empId
          }
        })
        window.dispatchEvent(event)
      } else {
        console.error('❌ Error al rechazar en la API')
        alert('Error al rechazar la solicitud. Por favor intenta nuevamente.')
      }
      
      contextMenu.value.show = false
    }
  } catch (error) {
    console.error('Error al rechazar vacación:', error)
    alert('Error al rechazar la solicitud. Por favor intenta nuevamente.')
  }
}

// Función para preaprobar todo el año (excepto rechazadas)
const preapproveVacationYear = async (empId: string) => {
  try {
    const year = currentDate.value.getFullYear()
    
    console.log(`📅 ===== INICIANDO PREAPROBACIÓN =====`)
    console.log(`📅 Empleado: ${empId}`)
    console.log(`📅 Año: ${year}`)
    console.log(`📅 Total de vacaciones cargadas: ${vacations.value.length}`)
    console.log(`📅 Vacaciones del empleado:`, vacations.value.filter(v => v.emp_id === empId))
    
    // Obtener todas las vacaciones del empleado en el año (excepto rechazadas)
    const yearVacations = vacations.value.filter(v => {
      if (v.emp_id !== empId) return false
      const vacDate = new Date(v.start_date)
      const isSameYear = vacDate.getFullYear() === year
      const isNotRejected = v.status !== 'rejected'
      return isSameYear && isNotRejected
    })
    
    console.log(`📅 Vacaciones del año ${year} (sin rechazadas): ${yearVacations.length}`)
    console.log(`📅 Detalle de vacaciones:`, yearVacations.map(v => ({
      id: v.id,
      fecha: v.start_date,
      status: v.status,
      emp_id: v.emp_id
    })))
    
    if (yearVacations.length === 0) {
      alert('No hay vacaciones para este empleado en el año seleccionado.')
      contextMenu.value.show = false
      return
    }
    
    // Obtener id_solicitud únicos del año (solo las que están pendientes)
    const pendingVacations = yearVacations.filter(v => v.status === 'pending')
    console.log(`📅 Vacaciones pendientes: ${pendingVacations.length}`)
    console.log(`📅 IDs de vacaciones pendientes:`, pendingVacations.map(v => v.id))
    
    if (pendingVacations.length === 0) {
      alert('No hay solicitudes pendientes para preaprobar. Todas las solicitudes ya fueron procesadas.')
      contextMenu.value.show = false
      return
    }
    
    // Extraer id_solicitud únicos
    const requestIdsRaw = pendingVacations.map(v => {
      const parts = v.id.split('_')
      console.log(`📅 ID de vacación: ${v.id} -> partes:`, parts)
      return parts[0]
    })
    
    console.log(`📅 IDs raw extraídos:`, requestIdsRaw)
    const uniqueRequestIds = [...new Set(requestIdsRaw)]
    console.log(`📅 IDs únicos a preaprobar:`, uniqueRequestIds)
    
    // Validar que todos los IDs sean números válidos
    const validRequestIds = uniqueRequestIds.filter(id => {
      const numId = parseInt(id)
      const isValid = !isNaN(numId) && numId > 0
      if (!isValid) {
        console.error(`❌ ID inválido encontrado: "${id}" (parseInt result: ${numId})`)
      }
      return isValid
    })
    
    console.log(`📅 IDs válidos después de validación:`, validRequestIds)
    
    if (validRequestIds.length === 0) {
      alert('No se encontraron IDs de solicitud válidos. Verifica la consola para más detalles.')
      contextMenu.value.show = false
      showProgressModal.value = false
      return
    }
    
    // Obtener datos del empleado para notificación
    const employee = teamEmployees.value.find(e => e.emp_id === empId)
    const employeeName = employee?.name || `Empleado #${empId}`
    console.log(`📅 Nombre del empleado: ${employeeName}`)
    
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    const successfulRequestIdsSet = new Set<string>() // Rastrear IDs exitosos
    
    // Mostrar modal de progreso
    showProgressModal.value = true
    progressInfo.value = {
      current: 0,
      total: validRequestIds.length,
      message: 'Iniciando preaprobación...'
    }
    
    // Preaprobar cada solicitud en la base de datos
    for (let i = 0; i < validRequestIds.length; i++) {
      const id_solicitud = validRequestIds[i]
      try {
        const numId = parseInt(id_solicitud)
        console.log(`📤 ===== Preaprobando solicitud ${numId} (${id_solicitud}) =====`)
        
        // Actualizar progreso
        progressInfo.value = {
          current: i + 1,
          total: validRequestIds.length,
          message: `Preaprobando solicitud ${numId}... (${i + 1}/${validRequestIds.length})`
        }
        
        // El backend ahora acepta 'PRE-APROBADO' (con guión)
        const payload = {
          id_solicitud: numId,
          estado: 'PRE-APROBADO', // Estado válido en el backend
          comentario: `Año completo preaprobado: ${year}`
        }
        
        console.log(`📤 Payload:`, payload)
        console.log(`📤 URL: http://190.171.225.68/api/vacaciones/state`)
        
        const response = await fetch('http://190.171.225.68/api/vacaciones/state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })
        
        console.log(`📤 Response status: ${response.status}`)
        console.log(`📤 Response ok: ${response.ok}`)
        
        if (response.ok) {
          const result = await response.json()
          console.log(`✅ Solicitud ${numId} preaprobada exitosamente (estado PRE-APROBADO en backend):`, result)
          successCount++
          successfulRequestIdsSet.add(id_solicitud) // Marcar como exitoso
          // NO enviar notificación individual aquí - se enviará un resumen consolidado al final
        } else {
          const errorText = await response.text()
          const errorMsg = `Error ${response.status}: ${errorText}`
          console.error(`❌ Error al preaprobar solicitud ${numId}:`, errorMsg)
          errors.push(`Solicitud ${numId}: ${errorMsg}`)
          errorCount++
        }
      } catch (requestError) {
        const errorMsg = requestError instanceof Error ? requestError.message : String(requestError)
        console.error(`❌ Excepción al preaprobar solicitud ${id_solicitud}:`, requestError)
        errors.push(`Solicitud ${id_solicitud}: ${errorMsg}`)
        errorCount++
      }
    }
    
    console.log(`📅 ===== RESUMEN DE PREAPROBACIÓN =====`)
    console.log(`✅ Exitosas: ${successCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    if (errors.length > 0) {
      console.error(`📋 Detalles de errores:`, errors)
    }
    
    // Actualizar el estado local de las vacaciones preaprobadas exitosamente
    for (const id_solicitud of successfulRequestIdsSet) {
      const solicitudVacations = pendingVacations.filter(v => v.id.startsWith(`${id_solicitud}_`))
      solicitudVacations.forEach(v => {
        if (v.status === 'pending') {
          v.status = 'preapproved'
        }
      })
    }
    
    contextMenu.value.show = false
    
    // Cerrar modal de progreso
    showProgressModal.value = false
    
    if (successCount > 0) {
      // Enviar un solo mensaje consolidado con todas las fechas preaprobadas
      try {
        console.log('📱 Enviando mensaje consolidado de preaprobación...')
        
        // Obtener todas las fechas de todas las solicitudes preaprobadas exitosamente
        const todasFechas: string[] = []
        for (const id_solicitud of successfulRequestIdsSet) {
          const solicitudVacations = pendingVacations.filter(v => v.id.startsWith(`${id_solicitud}_`))
          const fechas = solicitudVacations.map(v => v.start_date)
          todasFechas.push(...fechas)
        }
        
        // Ordenar fechas y eliminar duplicados
        const fechasUnicas = [...new Set(todasFechas)].sort()
        
        console.log(`📱 Total de fechas preaprobadas: ${fechasUnicas.length}`)
        console.log(`📱 Fechas:`, fechasUnicas)
        
        // Obtener reemplazantes (usar la primera solicitud como referencia)
        let reemplazantesCompletos: any[] = []
        if (successfulRequestIdsSet.size > 0) {
          const primeraSolicitudId = Array.from(successfulRequestIdsSet)[0]
          try {
            const reemplazanteResponse = await fetch(`http://190.171.225.68/api/reemplazante-vacation?idsolicitud=${primeraSolicitudId}`)
            if (reemplazanteResponse.ok) {
              const reemplazanteData = await reemplazanteResponse.json()
              if (reemplazanteData.success && reemplazanteData.data && reemplazanteData.data.length > 0) {
                reemplazantesCompletos = reemplazanteData.data.map((rep: any) => ({
                  emp_id: rep.EMP_ID,
                  nombre: rep.NOMBRE,
                  telefono: rep.TELEFONO
                }))
              }
            }
          } catch (apiError) {
            console.warn('⚠️ Error al obtener reemplazantes:', apiError)
          }
        }
        
        const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://190.171.225.68:3005'
        const notifPayload = {
          id_solicitud: Array.from(successfulRequestIdsSet)[0], // Usar el primer ID como referencia
          emp_id: empId,
          emp_nombre: employeeName,
          estado: 'PREAPROBADO',
          comentario: `Todas tus solicitudes de vacaciones del año ${year} han sido preaprobadas`,
          tipo: 'PROGRAMADA',
          dias_solicitados: fechasUnicas.length,
          fechas: fechasUnicas.map(f => `${f} (COMPLETO)`),
          reemplazantes: reemplazantesCompletos
        }
        
        console.log(`📱 Payload consolidado:`, notifPayload)
        
        const notifResponse = await fetch(`${BOT_URL}/api/vacation-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notifPayload)
        })
        
        if (notifResponse.ok) {
          console.log(`✅ Mensaje consolidado de preaprobación enviado exitosamente`)
        } else {
          const notifErrorText = await notifResponse.text()
          console.warn(`⚠️ Error al enviar mensaje consolidado:`, notifResponse.status, notifErrorText)
        }
      } catch (notifError) {
        console.warn('⚠️ Excepción al enviar mensaje consolidado:', notifError)
      }
      
      const message = `✅ ${successCount} solicitud(es) preaprobada(s) exitosamente para el año ${year}${errorCount > 0 ? `\n\n⚠️ ${errorCount} solicitud(es) con errores:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}` : ''}`
      alert(message)
    } else {
      const message = `❌ No se pudo preaprobar ninguna solicitud.\n\nErrores:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}\n\nRevisa la consola (F12) para más detalles.`
      alert(message)
      return // No recargar si no hubo éxitos
    }
    
    // Guardar los IDs de vacaciones que fueron preaprobadas antes de recargar
    const preapprovedVacationIds = new Set<string>()
    for (const id_solicitud of successfulRequestIdsSet) {
      const solicitudVacations = pendingVacations.filter(v => v.id.startsWith(`${id_solicitud}_`))
      solicitudVacations.forEach(v => {
        preapprovedVacationIds.add(v.id)
      })
    }
    
    // Recargar datos para reflejar cambios
    await loadData()
    
    // Después de recargar, si hay vacaciones que fueron preaprobadas exitosamente,
    // asegurarnos de que se muestren como preapproved (amarillo) incluso si el backend devuelve PROCESO
    for (const vacationId of preapprovedVacationIds) {
      const vacation = vacations.value.find(v => v.id === vacationId)
      if (vacation && vacation.status === 'pending') {
        vacation.status = 'preapproved'
        console.log(`🔄 Corrigiendo estado de ${vacationId} a preapproved (fue preaprobado exitosamente)`)
      }
    }
  } catch (error) {
    console.error('❌ Error general al preaprobar año:', error)
    showProgressModal.value = false
    alert(`Error al preaprobar las vacaciones: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nRevisa la consola (F12) para más detalles.`)
    contextMenu.value.show = false
  }
}

// Función no utilizada - comentada para evitar error de TypeScript
/*
const suggestVacationMonth = async (empId: string, date: Date) => {
  try {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // Obtener todas las vacaciones del empleado en ese mes
    const monthVacations = vacations.value.filter(v => {
      if (v.emp_id !== empId) return false
      const vacDate = new Date(v.start_date)
      return vacDate.getFullYear() === year && vacDate.getMonth() === month
    })
    
    console.log('💡 Sugiriendo alternativas para:', empId, `Mes: ${monthNames[month]} ${year}`, monthVacations.length, 'fechas')
    
    // Preparar datos para el modal
    suggestionData.value = {
      emp_id: empId,
      currentVacations: monthVacations,
      alternateDates: [], // Se llenará con fechas disponibles en el mes
      originalDates: monthVacations.map(v => v.start_date)
    }
    
    // Generar fechas disponibles para sugerir (excluyendo feriados y domingos)
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    const dates: Date[] = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // No incluir domingos ni feriados
      if (d.getDay() !== 0 && !isHoliday(d)) {
        dates.push(new Date(d))
      }
    }
    suggestionData.value.alternateDates = dates
    
    selectedAlternateDates.value = []
    showSuggestionModal.value = true
    
    contextMenu.value.show = false
  } catch (error) {
    console.error('Error al sugerir:', error)
  }
}
*/

const toggleAlternateDate = (date: Date) => {
  const index = selectedAlternateDates.value.findIndex(d => d.toDateString() === date.toDateString())
  if (index >= 0) {
    selectedAlternateDates.value.splice(index, 1)
  } else {
    selectedAlternateDates.value.push(date)
  }
}

const isAlternateDateSelected = (date: Date): boolean => {
  return selectedAlternateDates.value.some(d => d.toDateString() === date.toDateString())
}

const formatDateOnly = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const confirmSuggestion = async () => {
  try {
    if (selectedAlternateDates.value.length === 0) {
      return
    }
    
    const suggestedDates = selectedAlternateDates.value.map(d => d.toISOString().split('T')[0])
    
    console.log('💡 Enviando sugerencia con fechas alternativas:', suggestedDates)
    console.log('💡 Empleado:', suggestionData.value.emp_id)
    console.log('💡 Fechas originales:', suggestionData.value.originalDates)
    
    // Crear solicitudes de sugerencia para cada fecha alternativo
    for (const dateStr of suggestedDates) {
      const payload = {
        emp_id: suggestionData.value.emp_id,
        tipo: 'PROGRAMADA',
        comentario: `Sugerencia de fechas alternativas para ${dateStr}`,
        manager_id: props.managerId,
        antiguedad: '1',
        detalle: [{
          fecha: dateStr,
          turno: 'COMPLETO',
          observacion: 'Fecha sugerida como alternativa'
        }],
        reemplazantes: []
      }

      console.log(`💡 Enviando sugerencia para ${dateStr}:`, payload)

      const response = await fetch('http://190.171.225.68/api/store-vacation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Error al enviar sugerencia para ${dateStr}`)
      }

      console.log(`✅ Sugerencia enviada para ${dateStr}`)
    }
    
    console.log('✅ Todas las sugerencias enviadas exitosamente')
    showSuggestionModal.value = false
    selectedAlternateDates.value = []
    
    // Recargar datos para mostrar las sugerencias
    await loadData()
  } catch (error) {
    console.error('Error al enviar sugerencia:', error)
    alert('Error al enviar la sugerencia. Intenta nuevamente.')
  }
}

// Cerrar menú contextual al hacer clic fuera
const setupContextMenuListener = () => {
  window.addEventListener('click', () => {
    contextMenu.value.show = false
  })
}

const formatDayMonth = (dateString?: string) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  const monthNamesEs = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${d.getDate()} de ${monthNamesEs[d.getMonth()]}`
}

const filterEmployees = () => {
  // La función filteredEmployees es computada, no necesita lógica adicional
  console.log('Filtrar empleados por departamento:', selectedDepartment.value)
}

const handleCalendarScroll = (event: Event) => {
  if (isScrollingIndicator.value) return
  const target = event.target as HTMLElement
  if (scrollIndicator.value && target.scrollLeft !== undefined) {
    isScrollingCalendar.value = true
    scrollIndicator.value.scrollLeft = target.scrollLeft
    setTimeout(() => {
      isScrollingCalendar.value = false
    }, 10)
  }
}

const handleIndicatorScroll = (event: Event) => {
  if (isScrollingCalendar.value) return
  const target = event.target as HTMLElement
  if (calendarScroll.value && target.scrollLeft !== undefined) {
    isScrollingIndicator.value = true
    calendarScroll.value.scrollLeft = target.scrollLeft
    setTimeout(() => {
      isScrollingIndicator.value = false
    }, 10)
  }
}

const submitVacationForm = () => {
  // Ejecutar directamente sin modal de confirmación
  createVacation()
}

const createVacation = async () => {
  try {
    if (!selectedEmployeeForVacation.value) {
      return
    }
    
    console.log('📝 Creando vacación:', {
      employee: selectedEmployeeForVacation.value,
      start_date: newVacationStartDate.value,
      end_date: newVacationEndDate.value,
      note: newVacationNote.value
    })
    
    // Convertir fechas a formato YYYY-MM-DD
    const startDate = newVacationStartDate.value || ''
    const endDate = newVacationEndDate.value || startDate
    
    const payload = {
      emp_id: selectedEmployeeForVacation.value.emp_id,
      tipo: 'PROGRAMADA',
      comentario: newVacationNote.value || `Vacación programada del ${startDate} al ${endDate}`,
      manager_id: props.managerId,
      antiguedad: '1',
      detalle: [{
        fecha: startDate,
        turno: 'COMPLETO',
        observacion: null
      }],
      reemplazantes: []
    }

    console.log('📤 Payload para crear vacación:', payload)

    const response = await fetch('http://190.171.225.68/api/store-vacation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Error al crear vacación: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Vacación creada exitosamente:', result)
    
    // Cerrar modal de creación y recargar datos
    showCreateModal.value = false
    newVacationStartDate.value = ''
    newVacationEndDate.value = ''
    newVacationNote.value = ''
    selectedEmployeeForVacation.value = null
    await loadData()
  } catch (error) {
    console.error('❌ Error al crear vacación:', error)
    alert('Error al crear la vacación. Intenta nuevamente.')
    showCreateModal.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

// Cargar feriados de Bolivia
const fetchHolidays = async () => {
  try {
    const year = currentDate.value.getFullYear()
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BO`)
    if (response.ok) {
      const holidays = await response.json()
      publicHolidays.value = holidays.map((h: any) => ({
        date: h.date,
        name: h.localName
      }))
      console.log(`✅ ${publicHolidays.value.length} feriados cargados para ${year}`)
    }
  } catch (error) {
    console.error('Error al cargar feriados:', error)
  }
}

const loadData = async () => {
  try {
    // Cargar feriados primero
    await fetchHolidays()
    
    console.log('📡 BossCalendarView - Cargando datos')
    console.log('📡 Props.managerId:', props.managerId)
    console.log('📡 Tipo de props.managerId:', typeof props.managerId)
    
    if (!props.managerId) {
      console.warn('⚠️ No hay managerId, usando datos de ejemplo')
      throw new Error('No managerId')
    }
    
    // Cargar dependientes del manager desde la API de solicitudes
    try {
      console.log('📡 Llamando API de vacaciones del manager con managerId:', props.managerId)
      const response = await fetch(`http://190.171.225.68/api/vacacion-data-manager?manager=${props.managerId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Respuesta de solicitudes del manager:', data)
        
        if (data.success && Array.isArray(data.data)) {
          // Extraer empleados únicos de las solicitudes
          const uniqueEmployees = new Map<string, any>()
          
          for (const solicitud of data.data) {
            if (!uniqueEmployees.has(solicitud.emp_id)) {
              // Intentar cargar info del empleado
              let nombre = `Empleado #${solicitud.emp_id}`
              let cargo = 'N/A'
              
              try {
                const empInfoResponse = await fetch(`http://190.171.225.68/api/empleado/info?emp_id=${solicitud.emp_id}`)
                if (empInfoResponse.ok) {
                  const empInfoData = await empInfoResponse.json()
                  
                  // La API ahora devuelve directamente un array o un objeto con status
                  let empleadoInfo: any = null
                  
                  if (Array.isArray(empInfoData) && empInfoData.length > 0) {
                    // Nuevo formato: array directo
                    empleadoInfo = empInfoData[0]
                  } else if (empInfoData.status === 'success' && Array.isArray(empInfoData.data) && empInfoData.data.length > 0) {
                    // Formato antiguo: objeto con status y data
                    empleadoInfo = empInfoData.data[0]
                  }
                  
                  if (empleadoInfo) {
                    nombre = empleadoInfo.fullName || nombre
                    cargo = empleadoInfo.cargo || cargo
                    
                    // También cargar información de vacaciones si está disponible
                    if (empleadoInfo.vacation) {
                      const vacationInfo = empleadoInfo.vacation
                      const available = parseFloat(vacationInfo.available || '0')
                      const total = parseFloat(vacationInfo.total || '0')
                      const taken = parseFloat(vacationInfo.taken || '0')
                      
                      uniqueEmployees.set(solicitud.emp_id, {
                        emp_id: solicitud.emp_id,
                        name: nombre,
                        department: cargo,
                        vacationBalance: available,
                        totalDays: total,
                        usagePercentage: total > 0 ? Math.round((taken / total) * 100) : 0,
                        daysRemaining: available
                      })
                      continue // Ya se agregó al map, continuar con el siguiente
                    }
                  }
                }
              } catch (err) {
                console.error('Error al cargar info del empleado:', err)
              }
              
              uniqueEmployees.set(solicitud.emp_id, {
                emp_id: solicitud.emp_id,
                name: nombre,
                department: cargo,
                vacationBalance: 0,
                totalDays: 0,
                usagePercentage: 0,
                daysRemaining: 0
              })
            }
          }
          
          teamEmployees.value = Array.from(uniqueEmployees.values())
          console.log('✅ BossCalendarView - Empleados extraídos de solicitudes:', teamEmployees.value.length)
          
          // Convertir solicitudes a vacaciones
          const nuevasVacaciones: Vacation[] = []
          
          for (const solicitud of data.data) {
            if (solicitud.tipo === 'PROGRAMADA') {
              // Obtener el nombre del empleado desde el map
              const empleado = uniqueEmployees.get(solicitud.emp_id)
              const nombre = empleado?.name || `Empleado #${solicitud.emp_id}`
              const departamento = empleado?.department || 'N/A'
              
              // Determinar el estado (incluyendo PRE-APROBADO)
              // PROCESO y PENDIENTE son ambos estados pendientes (azul)
              // PRE-APROBADO (con guión) y PREAPROBADO (sin guión) son estados revisado/preaprobado (amarillo)
              let status: 'pending' | 'preapproved' | 'approved' | 'rejected' = 'pending'
              if (solicitud.estado === 'APROBADO') {
                status = 'approved'
              } else if (solicitud.estado === 'PREAPROBADO' || solicitud.estado === 'PRE-APROBADO') {
                // Ambas variantes (con y sin guión) se mapean a preapproved
                status = 'preapproved'
              } else if (solicitud.estado === 'RECHAZADO') {
                status = 'rejected'
              } else if (solicitud.estado === 'PROCESO' || solicitud.estado === 'PENDIENTE') {
                status = 'pending'
              }
              
              console.log(`📅 Procesando solicitud ${solicitud.id_solicitud} para ${nombre} (${solicitud.estado}) con ${solicitud.fechas.length} fechas`)
              
              for (const fecha of solicitud.fechas) {
                nuevasVacaciones.push({
                  id: `${solicitud.id_solicitud}_${fecha.fecha}`,
                  emp_id: solicitud.emp_id,
                  employee_name: nombre,
                  department: departamento,
                  start_date: fecha.fecha,
                  end_date: fecha.fecha,
                  status: status
                })
              }
            }
          }
          
          console.log('📅 Vacaciones generadas para el calendario:', nuevasVacaciones.length)
          
          vacations.value = nuevasVacaciones // Reemplazar vacaciones anteriores
          console.log('✅ BossCalendarView - Vacaciones cargadas:', nuevasVacaciones.length)
          
          // Debug: mostrar las vacaciones generadas
          nuevasVacaciones.forEach((vac, idx) => {
            if (idx < 5) { // Solo mostrar las primeras 5
              console.log(`📅 Vacación ${idx + 1}:`, {
                emp_id: vac.emp_id,
                employee_name: vac.employee_name,
                date: vac.start_date,
                status: vac.status
              })
            }
          })
        } else {
          console.warn('⚠️ No se encontraron datos en la respuesta:', data)
          throw new Error('No hay datos en la respuesta')
        }
      } else {
        console.error('❌ Respuesta no OK:', response.status, response.statusText)
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (err) {
      console.error('❌ Error al cargar datos del manager:', err)
      // Datos de ejemplo como fallback
      teamEmployees.value = [
      { emp_id: '1', name: 'Juan Pérez', department: 'Distribución', vacationBalance: 15, totalDays: 25, usagePercentage: 40, daysRemaining: 10 },
      { emp_id: '2', name: 'María García', department: 'Almacén', vacationBalance: 0, totalDays: 20, usagePercentage: 100, daysRemaining: 0 },
      { emp_id: '3', name: 'Pedro López', department: 'Logística', vacationBalance: 5, totalDays: 20, usagePercentage: 75, daysRemaining: 5 },
      { emp_id: '4', name: 'Ana Martínez', department: 'Ventas', vacationBalance: 22, totalDays: 30, usagePercentage: 27, daysRemaining: 8 },
      { emp_id: '5', name: 'Luis Sánchez', department: 'Producción', vacationBalance: 16, totalDays: 25, usagePercentage: 36, daysRemaining: 9 },
      { emp_id: '6', name: 'Carmen Torres', department: 'Administración', vacationBalance: 19, totalDays: 25, usagePercentage: 24, daysRemaining: 6 },
      { emp_id: '7', name: 'Roberto Silva', department: 'Contabilidad', vacationBalance: 12, totalDays: 20, usagePercentage: 40, daysRemaining: 8 },
      { emp_id: '8', name: 'Laura Morales', department: 'Recursos Humanos', vacationBalance: 18, totalDays: 25, usagePercentage: 28, daysRemaining: 7 },
      { emp_id: '9', name: 'Carlos Ramírez', department: 'Sistemas', vacationBalance: 8, totalDays: 20, usagePercentage: 60, daysRemaining: 12 },
      { emp_id: '10', name: 'Patricia González', department: 'Marketing', vacationBalance: 20, totalDays: 25, usagePercentage: 20, daysRemaining: 5 },
      { emp_id: '11', name: 'Fernando Herrera', department: 'Compras', vacationBalance: 10, totalDays: 20, usagePercentage: 50, daysRemaining: 10 },
      { emp_id: '12', name: 'Sandra Vega', department: 'Ventas', vacationBalance: 15, totalDays: 25, usagePercentage: 40, daysRemaining: 10 },
      { emp_id: '13', name: 'Miguel Ángel', department: 'Distribución', vacationBalance: 3, totalDays: 20, usagePercentage: 85, daysRemaining: 17 },
      { emp_id: '14', name: 'Andrea Cárdenas', department: 'Almacén', vacationBalance: 25, totalDays: 30, usagePercentage: 17, daysRemaining: 5 },
      { emp_id: '15', name: 'Jorge Méndez', department: 'Logística', vacationBalance: 14, totalDays: 20, usagePercentage: 30, daysRemaining: 6 },
      { emp_id: '16', name: 'Lucía Fernández', department: 'Producción', vacationBalance: 11, totalDays: 20, usagePercentage: 45, daysRemaining: 9 },
      { emp_id: '17', name: 'Ricardo Pacheco', department: 'Seguridad', vacationBalance: 22, totalDays: 25, usagePercentage: 12, daysRemaining: 3 },
      { emp_id: '18', name: 'Estela Romero', department: 'Limpieza', vacationBalance: 19, totalDays: 25, usagePercentage: 24, daysRemaining: 6 },
      { emp_id: '19', name: 'Mario Castillo', department: 'Mantenimiento', vacationBalance: 6, totalDays: 20, usagePercentage: 70, daysRemaining: 14 },
      { emp_id: '20', name: 'Diana Flores', department: 'Atención al Cliente', vacationBalance: 17, totalDays: 25, usagePercentage: 32, daysRemaining: 8 }
    ]
    
    // Datos de vacaciones de ejemplo para el mes actual
    const currentMonth = currentDate.value.getMonth() + 1
    const currentYear = currentDate.value.getFullYear()
    
    vacations.value = [
      {
        id: '1',
        emp_id: '1',
        employee_name: 'Juan Pérez',
        department: 'Distribución',
        start_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-27`,
        end_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-29`,
        status: 'pending'
      },
      {
        id: '2',
        emp_id: '2',
        employee_name: 'María García',
        department: 'Almacén',
        start_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`,
        end_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
        status: 'approved'
      },
      {
        id: '3',
        emp_id: '3',
        employee_name: 'Pedro López',
        department: 'Logística',
        start_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
        end_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-08`,
        status: 'approved'
      }
    ]
    }
    
    // Extraer departamentos únicos para el filtro
    departments.value = Array.from(new Set(teamEmployees.value.map(emp => emp.department))).sort()
    
  } catch (error) {
    console.error('❌ Error al cargar datos en loadData:', error)
    // Datos de ejemplo como fallback
    teamEmployees.value = [
      { emp_id: '1', name: 'Juan Pérez', department: 'Distribución', vacationBalance: 15, totalDays: 25, usagePercentage: 40, daysRemaining: 10 }
    ]
    departments.value = ['Distribución']
  }
}

onMounted(() => {
  loadData()
  setupContextMenuListener()
  
  // Escuchar evento de solicitudes cargadas desde BossApprovalPanel
  window.addEventListener('vacations-loaded', (event: any) => {
    const requests = event.detail.requests || []
    console.log('📅 BossCalendarView - Solicitudes recibidas:', requests)
    
    // Filtrar solicitudes programadas (pendientes, preaprobadas, aprobadas - no rechazadas)
    const programadas = requests.filter((req: any) => {
      const esProgramada = req.tipo === 'PROGRAMADA'
      const estadoValido = req.estado === 'PROCESO' || req.estado === 'PENDIENTE' || 
                          req.estado === 'PREAPROBADO' || req.estado === 'APROBADO'
      console.log(`🔍 Solicitud ${req.id_solicitud}: tipo=${req.tipo}, estado=${req.estado}, esProgramada=${esProgramada}, estadoValido=${estadoValido}`)
      return esProgramada && estadoValido
    })
    
    console.log('📋 Solicitudes programadas en proceso:', programadas)
    
    // Convertir cada solicitud en vacaciones (una por cada fecha)
    const nuevasVacaciones: Vacation[] = []
    
    for (const req of programadas) {
      // Crear una vacación por cada fecha en la solicitud
      for (const fecha of req.fechas) {
        nuevasVacaciones.push({
          id: `${req.id_solicitud}_${fecha.fecha}`,
          emp_id: req.emp_id,
          employee_name: req.empleado?.nombre || `Empleado #${req.emp_id}`,
          department: req.empleado?.cargo || 'N/A',
          start_date: fecha.fecha,
          end_date: fecha.fecha, // Mismo día para cada fecha
          status: req.estado === 'APROBADO' ? 'approved' as const :
                  req.estado === 'PREAPROBADO' || req.estado === 'PRE-APROBADO' ? 'preapproved' as const :
                  req.estado === 'RECHAZADO' ? 'rejected' as const :
                  'pending' as const // PROCESO y PENDIENTE son ambos pending
        })
      }
    }
    
    console.log('📅 Nueva vacaciones generadas:', nuevasVacaciones.length)
    
    // Agregar al array de vacaciones
    vacations.value = [...vacations.value, ...nuevasVacaciones]
    console.log('📅 BossCalendarView - Vacaciones totales:', vacations.value.length)
  })
  
  // Escuchar evento de cambio de estado de vacación para recargar datos
  window.addEventListener('vacation-status-changed', async (event: any) => {
    console.log('📢 BossCalendarView - Evento vacation-status-changed recibido:', event.detail)
    // Recargar todos los datos del calendario
    await loadData()
  })
})
</script>

