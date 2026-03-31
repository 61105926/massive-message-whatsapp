<template>
  <div class="w-full space-y-4">
    <!-- Toast Notification -->
    <div
      v-if="notification.show"
      :class="[
        'fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] rounded-lg shadow-xl p-4 transition-all duration-300 animate-in slide-in-from-top-5',
        notification.type === 'success' ? 'bg-green-50 border-2 border-green-500' : '',
        notification.type === 'error' ? 'bg-red-50 border-2 border-red-500' : '',
        notification.type === 'warning' ? 'bg-yellow-50 border-2 border-yellow-500' : '',
        notification.type === 'info' ? 'bg-blue-50 border-2 border-blue-500' : ''
      ]"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5 text-green-600" />
          <AlertCircle v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-600" />
          <AlertCircle v-else-if="notification.type === 'warning'" class="h-5 w-5 text-yellow-600" />
          <AlertCircle v-else class="h-5 w-5 text-blue-600" />
        </div>
        <div class="flex-1">
          <h4
            :class="[
              'font-semibold text-sm',
              notification.type === 'success' ? 'text-green-900' : '',
              notification.type === 'error' ? 'text-red-900' : '',
              notification.type === 'warning' ? 'text-yellow-900' : '',
              notification.type === 'info' ? 'text-blue-900' : ''
            ]"
          >
            {{ notification.title }}
          </h4>
          <p
            :class="[
              'text-sm mt-1 whitespace-pre-line',
              notification.type === 'success' ? 'text-green-700' : '',
              notification.type === 'error' ? 'text-red-700' : '',
              notification.type === 'warning' ? 'text-yellow-700' : '',
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
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

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
              <span class="text-gray-700">Pre-Aprobado</span>
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
    <div v-if="viewMode === 'month'" class="bg-white border rounded-lg overflow-hidden shadow-lg w-full relative">
      <!-- Botones de navegación horizontal -->
      <button
        @click="scrollCalendarHorizontal('left')"
        class="absolute left-2 top-2 z-30 bg-white/90 hover:bg-white border border-gray-300 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
        :class="{ 'opacity-50 cursor-not-allowed': !canScrollLeft }"
        :disabled="!canScrollLeft"
        title="Desplazar izquierda"
      >
        <ChevronLeft class="h-4 w-4 text-gray-700" />
      </button>
      <button
        @click="scrollCalendarHorizontal('right')"
        class="absolute right-2 top-2 z-30 bg-white/90 hover:bg-white border border-gray-300 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
        :class="{ 'opacity-50 cursor-not-allowed': !canScrollRight }"
        :disabled="!canScrollRight"
        title="Desplazar derecha"
      >
        <ChevronRight class="h-4 w-4 text-gray-700" />
      </button>
      
      <div 
        ref="calendarScroll" 
        class="overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500" 
        style="height: calc(75vh); max-height: 600px; scroll-behavior: smooth; overscroll-behavior-x: contain;"
        @scroll="handleCalendarScroll"
      >
        <div class="w-max min-w-full" :style="{ width: `${195 + (daysInMonth * 65)}px` }">
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
                'bg-gray-800': day && !isWeekend(day) && !isHoliday(day),
                'cursor-pointer': day && isHoliday(day)
              }"
              style="height: 70px;"
              @click="day && isHoliday(day) && showHolidayInfo(day)"
            >
              <div class="w-full">
                <div class="font-bold text-white text-base mb-0.5">{{ day ? day.getDate() : '' }}</div>
                <div class="text-[10px] text-gray-300 font-medium">{{ day ? dayNames[day.getDay()] : '' }}</div>
                <div v-if="day && isHoliday(day)" class="text-[8px] text-purple-200 font-semibold mt-0.5 cursor-pointer hover:text-purple-100">FERIADO</div>
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
                  <span class="inline-flex items-center rounded-full px-1 py-0.5 font-bold text-[9px]" :class="getTotalDaysWithDuodecima(employee.emp_id) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ getTotalDaysWithDuodecima(employee.emp_id) > 0 ? getTotalDaysWithDuodecima(employee.emp_id).toFixed(1) + 'd' : '0d' }}
                  </span>
                  <span v-if="employee.duodecima !== undefined && employee.duodecima > 0" class="inline-flex items-center rounded-full px-1 py-0.5 font-bold text-[9px] bg-blue-100 text-blue-700" title="Duodécimas disponibles">
                    +{{ employee.duodecima.toFixed(1) }}d
                  </span>
                  <span v-if="employee.rejectedCount !== undefined && employee.rejectedCount > 0" class="inline-flex items-center rounded-full px-1 py-0.5 font-bold text-[9px] bg-red-100 text-red-700" title="Solicitudes rechazadas">
                    {{ employee.rejectedCount }} {{ employee.rejectedCount === 1 ? 'rechazo' : 'rechazos' }}
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
                'bg-purple-50/40': day && isHoliday(day, employee),
                'bg-white': day && !isWeekend(day) && !isHoliday(day, employee)
              }"
              @click="day && isHoliday(day, employee) ? showHolidayInfo(day, employee) : openVacationModal(employee.emp_id, day)"
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
                  @click.stop="showVacationContextMenu(employee.emp_id, day, $event)"
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
                  
                </div>
              </div>
              
              <!-- Indicador de celda vacía (para programar vacaciones) -->
              <div v-else-if="day" class="absolute inset-0 flex flex-col items-center justify-center">
                <!-- Indicador de feriado -->
                <div v-if="isHoliday(day, employee)" class="text-[8px] font-bold text-purple-600 mb-1 cursor-pointer hover:text-purple-700" @click.stop="showHolidayInfo(day, employee)">FERIADO</div>
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
              v-if="currentVacation.status !== 'rejected' && currentVacation.status !== 'approved'"
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
      @click="!isCreatingVacation && (showCreateModal = false)"
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
          
          <!-- Mostrar información de días disponibles -->
          <div v-if="selectedEmployeeForVacation" class="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
            <div v-if="canSuggestVacation(selectedEmployeeForVacation.emp_id)">
              <span class="font-semibold">Días disponibles:</span>
              {{ getAvailableDaysWithDuodecima(selectedEmployeeForVacation.emp_id) }} de {{ getTotalDaysWithDuodecima(selectedEmployeeForVacation.emp_id) }}
              <span v-if="selectedEmployeeForVacation.duodecima && selectedEmployeeForVacation.duodecima > 0" class="text-blue-600 ml-1">
                (incluye {{ selectedEmployeeForVacation.duodecima.toFixed(1) }} duodécimas)
              </span>
            </div>
            <div v-else class="text-red-600 font-semibold">
              ⚠️ Sin días disponibles ({{ getProgrammedDaysCount(String(selectedEmployeeForVacation.emp_id)) }} días ya programados)
            </div>
          </div>
          
          <!-- Selector de turno -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Turno:</label>
            <div class="flex gap-2">
              <button
                @click="newVacationTurno = 'COMPLETO'"
                :class="[
                  'flex-1 px-3 py-2 text-sm rounded-lg transition-colors font-medium',
                  newVacationTurno === 'COMPLETO'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                Día Completo
              </button>
              <button
                @click="newVacationTurno = 'MAÑANA'"
                :class="[
                  'flex-1 px-3 py-2 text-sm rounded-lg transition-colors font-medium',
                  newVacationTurno === 'MAÑANA'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                Medio Día (Mañana)
              </button>
              <button
                @click="newVacationTurno = 'TARDE'"
                :class="[
                  'flex-1 px-3 py-2 text-sm rounded-lg transition-colors font-medium',
                  newVacationTurno === 'TARDE'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                Medio Día (Tarde)
              </button>
            </div>
            <p class="text-xs text-gray-500">
              {{ newVacationTurno === 'COMPLETO' ? 'Se contará como 1 día' : 'Se contará como 0.5 días' }}
            </p>
          </div>
          
          <div class="flex gap-2 pt-2">
            <button
              @click="submitVacationForm"
              :disabled="!canSuggestVacation(selectedEmployeeForVacation?.emp_id) || isCreatingVacation"
              :class="[
                'w-full px-3 py-2 text-sm rounded-lg transition-colors font-semibold flex items-center justify-center gap-2',
                canSuggestVacation(selectedEmployeeForVacation?.emp_id) && !isCreatingVacation
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              ]"
            >
              <span v-if="isCreatingVacation" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              <span v-if="!canSuggestVacation(selectedEmployeeForVacation?.emp_id)">
                Sin días disponibles
              </span>
              <span v-else-if="isCreatingVacation">
                Creando...
              </span>
              <span v-else>
                Confirmar
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Sugerencias -->
    <div
      v-if="showSuggestionModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="!isSubmittingSuggestion && (showSuggestionModal = false)"
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
                :title="isHoliday(alternateDate) ? getHolidayNameForDate(alternateDate) || 'Feriado' : ''"
              >
                {{ alternateDate.getDate() }}
              </button>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3">
            <button
              @click="confirmSuggestion"
              :disabled="selectedAlternateDates.length === 0 || isSubmittingSuggestion"
              class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <span v-if="isSubmittingSuggestion" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              <span>{{ isSubmittingSuggestion ? 'Enviando...' : 'Enviar Sugerencia' }}</span>
            </button>
            <button
              @click="showSuggestionModal = false"
              :disabled="isSubmittingSuggestion"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de información de feriado -->
    <div
      v-if="showHolidayModal && selectedHolidayInfo"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showHolidayModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-purple-700">Feriado</h3>
          <button
            @click="showHolidayModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <div class="text-sm text-gray-600 mb-1">Fecha</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ formatDate(selectedHolidayInfo.date.toISOString()) }}
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
            <div class="text-sm text-gray-600 mb-1">Nombre del Feriado</div>
            <div class="text-xl font-bold text-purple-700">
              {{ selectedHolidayInfo.name }}
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button
            @click="showHolidayModal = false"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Menú contextual mejorado con preaprobación - Renderizado fuera del contenedor con overflow -->
    <div
      v-if="contextMenu.show && contextMenu.date"
      data-context-menu
      class="fixed z-[9999] w-56 bg-white rounded-lg shadow-xl border-2 border-gray-200 py-2 overflow-hidden"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      @click.stop
    >
      <!-- Header del menú -->
      <div class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div class="text-xs font-semibold text-gray-700">Acciones Rápidas</div>
        <div class="text-[10px] text-gray-500 mt-0.5">{{ formatDate(contextMenu.date.toISOString()) }}</div>
      </div>
      
      <!-- Acciones principales -->
      <div class="py-1">
        <button
          v-if="contextMenu.date && getVacationStatus(contextMenu.emp_id, contextMenu.date) === 'pending'"
          @click="preapproveVacationDay(contextMenu.emp_id, contextMenu.date)"
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
          v-if="contextMenu.date && getVacationStatus(contextMenu.emp_id, contextMenu.date) !== 'rejected' && getVacationStatus(contextMenu.emp_id, contextMenu.date) !== 'approved'"
          @click="rejectVacationDay(contextMenu.emp_id, contextMenu.date)"
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
          @click="preapproveVacationYear(contextMenu.emp_id)"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-2 transition-colors"
        >
          <span class="text-yellow-600">📅</span>
          <span>Preaprobar todo el año</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, X } from 'lucide-vue-next'
import { getHolidaysForEmployee, getHolidayName } from '@/data/boliviaHolidays'
import { calcularRangoVacaciones } from '@/utils/vacationRange'

interface Employee {
  emp_id: string
  name: string
  department: string
  regional?: string
  vacationBalance?: number
  usagePercentage?: number
  daysRemaining?: number
  totalDays?: number
  rejectedCount?: number
  duodecima?: number
  fechaIngreso?: string
}

interface Vacation {
  id: string
  emp_id: string
  employee_name: string
  department: string
  start_date: string
  end_date: string
  status: 'pending' | 'preapproved' | 'approved' | 'rejected'
  tipo?: string
  es_programada?: boolean
}

const props = defineProps<{
  managerId?: number
}>()

// Log del managerId recibido
console.log('🏢 BossCalendarView - Props recibidas:', props)
console.log('🏢 BossCalendarView - managerId:', props.managerId)

// Iniciar con el mes actual
const currentDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const selectedEmployee = ref<Employee | null>(null)
const viewMode = ref<'month' | 'day'>('month')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showSuggestModal = ref(false)
const currentVacation = ref<Vacation | null>(null)
const selectedDepartment = ref('')
const departments = ref<string[]>([])
const calendarScroll = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const showCreateModal = ref(false)
const selectedEmployeeForVacation = ref<Employee | null>(null)
const selectedDateForVacation = ref<Date | null>(null)
const newVacationStartDate = ref('')
const newVacationEndDate = ref('')
const newVacationNote = ref('')
const newVacationTurno = ref<'COMPLETO' | 'MAÑANA' | 'TARDE'>('COMPLETO')
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
  date: null as Date | null,
  x: 0,
  y: 0
})

// Modal de sugerencias
const showSuggestionModal = ref(false)
const isSubmittingSuggestion = ref(false) // Estado para prevenir múltiples envíos
// Bloqueo por empId+fecha para evitar duplicados mientras carga
const pendingCreationSlots = ref<Set<string>>(new Set())
const isCreatingVacation = ref(false) // Estado para prevenir múltiples creaciones
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
const publicHolidays = ref<{ date: string; name: string; type: 'national' | 'regional' }[]>([])
// Almacenar todas las solicitudes originales para contar días programados
const allRequests = ref<any[]>([])
// Estado para mostrar información del feriado al hacer click
const selectedHolidayInfo = ref<{ date: Date; name: string } | null>(null)
const showHolidayModal = ref(false)

// Notification state
const notification = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  title: '',
  message: ''
})

// Show notification function
const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
  notification.value = {
    show: true,
    type,
    title,
    message
  }

  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

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
  // NO recargar datos al cambiar de mes - ya están cargados
  
  // Actualizar botones de scroll después de cambiar de mes
  nextTick(() => {
    if (calendarScroll.value) {
      updateScrollButtons(calendarScroll.value)
    }
  })
}

// Watcher para actualizar los botones cuando cambie el número de días
watch(daysInMonth, () => {
  nextTick(() => {
    if (calendarScroll.value) {
      updateScrollButtons(calendarScroll.value)
    }
  })
})

const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const isHoliday = (date: Date, employee?: Employee): boolean => {
  if (!date) return false
  const dateStr = date.toISOString().split('T')[0]
  // Si se proporciona un empleado, usar sus feriados específicos
  if (employee) {
    const employeeHolidays = getHolidaysForEmployee(date.getFullYear(), employee.regional)
    return employeeHolidays.some(h => h.date === dateStr)
  }
  // Si no hay empleado, usar solo feriados nacionales del encabezado
  const isNationalHoliday = publicHolidays.value.some(h => h.date === dateStr)
  // Debug: verificar si el 2 de febrero aparece como feriado
  if (dateStr === '2026-02-02') {
    console.log('🔍 Debug 2026-02-02:', {
      dateStr,
      isNationalHoliday,
      publicHolidays: publicHolidays.value.filter(h => h.date === dateStr),
      allHolidays: publicHolidays.value.map(h => h.date)
    })
  }
  return isNationalHoliday
}

const getHolidayNameForDate = (date: Date, employee?: Employee): string | null => {
  if (!date) return null
  const dateStr = date.toISOString().split('T')[0]
  return getHolidayName(dateStr, employee?.regional)
}

const showHolidayInfo = (date: Date, employee?: Employee) => {
  const holidayName = getHolidayNameForDate(date, employee)
  if (holidayName) {
    selectedHolidayInfo.value = { date, name: holidayName }
    showHolidayModal.value = true
  }
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
    // Todas las vacaciones aprobadas (programadas o no) se muestran en verde
    classes.push('bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700')
    classes.push('ring-2 ring-green-300/50')
    classes.push('min-h-[50px]')
  } else if (vacation.status === 'preapproved') {
    // Todas las vacaciones preaprobadas (revisadas) se muestran en amarillo/naranja
    classes.push('bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600')
    classes.push('ring-2 ring-yellow-300/50')
    classes.push('border-2 border-yellow-400/60')
    classes.push('min-h-[48px]')
  } else if (vacation.status === 'pending') {
    // Todas las vacaciones pendientes se muestran en azul
    classes.push('bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600')
    classes.push('ring-2 ring-blue-300/50')
    classes.push('min-h-[45px]')
  } else if (vacation.status === 'rejected') {
    // Rechazadas siempre en rojo, sin importar el tipo
    classes.push('bg-gradient-to-br from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700')
    classes.push('min-h-[40px]')
    classes.push('ring-2 ring-red-300/50')
    classes.push('border-2 border-red-500/60')
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
  
  // Usar el estado real, no el tipo, para determinar el texto
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

// Función para calcular días programados de un empleado
const getProgrammedDaysCount = (empId: string | number | undefined): number => {
  if (!empId) return 0
  
  // Contar solo las solicitudes PROGRAMADA que AÚN estén en cola (pendiente / proceso / preaprobado).
  // No contar APROBADO ni RECHAZADO, para evitar bloquear sugerencias por solicitudes ya resueltas.
  let totalDays = 0
  
  const empIdStr = String(empId)
  console.log('🔍 Calculando días programados para empId:', empIdStr)
  console.log('📋 Total de solicitudes en allRequests:', allRequests.value.length)
  
  // Buscar en las solicitudes originales (allRequests) que tienen todas las fechas
  const estadosQueCuentan = new Set([
    'PENDIENTE',
    'PROCESO',
    'PREAPROBADO',
    'PRE-APROBADO'
  ])

  const programmedRequests = allRequests.value.filter(req => {
    const reqEmpId = String(req.emp_id || '')
    const reqTipo = String(req.tipo || '').toUpperCase()
    const reqEstado = String(req.estado || '').toUpperCase()
    
    return reqEmpId === empIdStr && 
           reqTipo === 'PROGRAMADA' &&
           estadosQueCuentan.has(reqEstado)
  })
  
  console.log('📊 Solicitudes PROGRAMADA encontradas para', empIdStr, ':', programmedRequests.length)
  
  // Contar todas las fechas de cada solicitud programada
  programmedRequests.forEach((req, index) => {
    let daysInRequest = 0
    
    if (req.fechas && Array.isArray(req.fechas) && req.fechas.length > 0) {
      // Calcular días considerando medio día = 0.5
      daysInRequest = req.fechas.reduce((total: number, fecha: any) => {
        const tipo = fecha.turno || fecha.tipo_dia || 'COMPLETO';
        if (tipo === 'MAÑANA' || tipo === 'TARDE') {
          return total + 0.5;
        }
        return total + 1; // COMPLETO o cualquier otro
      }, 0);
      console.log(`  📅 Solicitud ${index + 1} (${req.id_solicitud}): ${daysInRequest} días (desde array fechas)`)
    } else if (req.fechas_agrupadas && Array.isArray(req.fechas_agrupadas) && req.fechas_agrupadas.length > 0) {
      // Si tiene fechas_agrupadas, calcular días desde fechas con turno si están disponibles
      if (req.fechas && Array.isArray(req.fechas) && req.fechas.length > 0) {
        daysInRequest = req.fechas.reduce((total: number, fecha: any) => {
          const tipo = fecha.turno || fecha.tipo_dia || 'COMPLETO';
          if (tipo === 'MAÑANA' || tipo === 'TARDE') {
            return total + 0.5;
          }
          return total + 1;
        }, 0);
        console.log(`  📅 Solicitud ${index + 1} (${req.id_solicitud}): ${daysInRequest} días (desde fechas con turno)`)
      } else {
        // Fallback: contar fechas_agrupadas como días completos (no ideal pero mejor que nada)
        daysInRequest = req.fechas_agrupadas.length
        console.log(`  📅 Solicitud ${index + 1} (${req.id_solicitud}): ${daysInRequest} días (desde fechas_agrupadas, sin turno)`)
      }
    } else if (req.start_date && req.end_date) {
      // Si tiene start_date y end_date, calcular la diferencia
      const start = new Date(req.start_date)
      const end = new Date(req.end_date)
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      daysInRequest = daysDiff
      console.log(`  📅 Solicitud ${index + 1} (${req.id_solicitud}): ${daysInRequest} días (desde start_date/end_date)`)
    } else {
      console.warn(`  ⚠️ Solicitud ${index + 1} (${req.id_solicitud}) sin fechas válidas:`, req)
    }
    
    totalDays += daysInRequest
  })
  
  console.log('✅ Total días programados para', empIdStr, ':', totalDays)
  
  // Validación adicional: si no encontramos solicitudes pero el array está vacío, retornar 0
  if (programmedRequests.length === 0 && allRequests.value.length > 0) {
    console.warn('⚠️ No se encontraron solicitudes PROGRAMADA para', empIdStr, 'pero hay', allRequests.value.length, 'solicitudes en total')
    // Mostrar un ejemplo de las primeras solicitudes para debug
    const sampleRequests = allRequests.value.slice(0, 3).map((req: any) => ({
      emp_id: req.emp_id,
      tipo: req.tipo,
      estado: req.estado
    }))
    console.log('📋 Ejemplo de solicitudes en allRequests:', sampleRequests)
  }
  
  return totalDays
}

// Función helper para obtener días totales incluyendo duodécimas
const getTotalDaysWithDuodecima = (empId: string | number | undefined): number => {
  if (!empId) {
    console.warn('⚠️ getTotalDaysWithDuodecima: empId no proporcionado')
    return 0
  }
  
  const empIdStr = String(empId)
  const employee = teamEmployees.value.find(emp => String(emp.emp_id) === empIdStr)
  
  if (!employee) {
    console.warn('⚠️ getTotalDaysWithDuodecima: empleado no encontrado:', empIdStr)
    return 0
  }
  
  // Obtener saldo base: usar vacationBalance si existe, sino totalDays, sino 0
  const vacationBalance = employee.vacationBalance !== undefined && employee.vacationBalance !== null 
    ? employee.vacationBalance 
    : (employee.totalDays !== undefined && employee.totalDays !== null ? employee.totalDays : 0)
  
  const saldoBase = vacationBalance
  const duodecima = employee.duodecima || 0
  
  // Si el saldo es negativo, calcular: 15 días base + saldo negativo
  // Ejemplo: saldo -1.5 → 15 + (-1.5) = 13.5 días
  if (saldoBase < 0) {
    const diasDisponibles = 15 + saldoBase // saldoBase ya es negativo, así que se resta
    console.log('📋 Empleado con saldo negativo detectado, asignando 15 días base + saldo negativo:', {
      empId: empIdStr,
      employeeName: employee.name,
      vacationBalance: employee.vacationBalance,
      totalDays: employee.totalDays,
      saldoBase,
      diasBase: 15,
      diasDisponibles,
      duodecima
    })
    return Math.max(0, diasDisponibles) // Asegurar que nunca sea negativo
  }
  
  // Si el saldo es 0 (empleado nuevo), darle 15 días por defecto
  if (saldoBase === 0) {
    console.log('📋 Empleado nuevo detectado (saldo 0), asignando 15 días:', {
      empId: empIdStr,
      employeeName: employee.name,
      vacationBalance: employee.vacationBalance,
      totalDays: employee.totalDays,
      saldoBase,
      duodecima
    })
    return 15
  }
  
  // Si tiene saldo pero es muy bajo (menor a 1), también puede ser empleado nuevo
  // pero con algún error en los datos, así que darle 15 días
  if (saldoBase < 1 && saldoBase > 0) {
    console.log('📋 Empleado con saldo muy bajo, tratando como nuevo (15 días):', {
      empId: empIdStr,
      employeeName: employee.name,
      vacationBalance: employee.vacationBalance,
      totalDays: employee.totalDays,
      saldoBase
    })
    return 15
  }
  
  const resultado = saldoBase + duodecima
  console.log('📊 getTotalDaysWithDuodecima calculado:', {
    empId: empIdStr,
    employeeName: employee.name,
    vacationBalance: employee.vacationBalance,
    totalDays: employee.totalDays,
    saldoBase,
    duodecima,
    resultado
  })
  
  return resultado
}

// Función helper para obtener días disponibles incluyendo duodécimas
const getAvailableDaysWithDuodecima = (empId: string | number | undefined): number => {
  if (!empId) return 0
  
  const empIdStr = String(empId)
  const employee = teamEmployees.value.find(emp => String(emp.emp_id) === empIdStr)
  
  if (!employee) return 0
  
  const totalDays = getTotalDaysWithDuodecima(empId)
  const programmedDays = getProgrammedDaysCount(empIdStr)
  
  return Math.max(0, totalDays - programmedDays)
}

// Función helper para verificar si se puede sugerir vacación
const canSuggestVacation = (empId: string | number | undefined): boolean => {
  if (!empId) {
    console.log('❌ canSuggestVacation: empId no proporcionado')
    return false
  }
  
  const empIdStr = String(empId)
  const employee = teamEmployees.value.find(emp => String(emp.emp_id) === empIdStr)
  
  if (!employee) {
    console.warn('⚠️ Empleado no encontrado para canSuggestVacation:', empIdStr)
    return false
  }
  
  // Verificar si el empleado es nuevo (saldo 0, negativo o sin saldo)
  const saldoBase = employee.vacationBalance !== undefined && employee.vacationBalance !== null
    ? employee.vacationBalance
    : (employee.totalDays !== undefined && employee.totalDays !== null ? employee.totalDays : 0)
  const isEmpleadoNuevo = saldoBase <= 0
  
  // Obtener días totales incluyendo duodécimas
  const totalDays = getTotalDaysWithDuodecima(empId)
  const programmedDays = getProgrammedDaysCount(empIdStr)
  const daysRemaining = totalDays - programmedDays
  
  console.log('🔍 canSuggestVacation:', {
    empId: empIdStr,
    employeeName: employee.name,
    saldoBase,
    isEmpleadoNuevo,
    duodecima: employee.duodecima || 0,
    totalDays,
    programmedDays,
    daysRemaining,
    canSuggest: daysRemaining > 0
  })
  
  // Si el empleado es nuevo, debe tener 15 días disponibles
  if (isEmpleadoNuevo && totalDays !== 15) {
    console.warn('⚠️ Empleado nuevo pero totalDays no es 15:', {
      empId: empIdStr,
      totalDays,
      saldoBase
    })
  }
  
  if (totalDays === 0) {
    console.warn('⚠️ El empleado no tiene días de vacaciones configurados:', employee)
    return false
  }
  
  return daysRemaining > 0
}

const openVacationModal = (empId: string, date: Date) => {
  // No permitir sugerir días feriados
  if (isHoliday(date)) {
    showNotification('warning', 'Día Feriado', 'No se pueden sugerir vacaciones en días feriados.')
    return
  }
  
  // Verificar si el empleado ya programó todos sus días
  const empIdStr = String(empId)
  const employee = teamEmployees.value.find(emp => String(emp.emp_id) === empIdStr)
  
  if (!employee) {
    console.warn('⚠️ Empleado no encontrado en teamEmployees para empId:', empIdStr)
    showNotification('error', 'Error', 'No se pudo verificar la información del empleado. Por favor, recarga la página.')
    return
  }
  
  // Verificar si el empleado es nuevo (saldo 0, negativo o sin saldo)
  const saldoBase = employee.vacationBalance !== undefined && employee.vacationBalance !== null
    ? employee.vacationBalance
    : (employee.totalDays !== undefined && employee.totalDays !== null ? employee.totalDays : 0)
  const isEmpleadoNuevo = saldoBase <= 0
  
  // Obtener el total de días del empleado incluyendo duodécimas
  const totalDays = getTotalDaysWithDuodecima(empId)
  
  if (totalDays === 0) {
    console.warn('⚠️ El empleado no tiene días de vacaciones configurados:', employee)
    showNotification('warning', 'Información Incompleta', 'No se pudo determinar el total de días de vacaciones del empleado.')
    return
  }
  
  const programmedDays = getProgrammedDaysCount(empIdStr)
  const daysRemaining = totalDays - programmedDays
  
  console.log('🔍 Validación de días programados en openVacationModal:', {
    empId: empIdStr,
    employeeName: employee.name,
    saldoBase,
    isEmpleadoNuevo,
    duodecima: employee.duodecima || 0,
    totalDays,
    programmedDays,
    daysRemaining,
    allRequestsCount: allRequests.value.length
  })
  
  if (daysRemaining <= 0) {
    const duodecima = employee.duodecima || 0
    const mensajeDuodecima = duodecima > 0 ? ` (incluye ${duodecima.toFixed(1)} duodécimas)` : ''
    const mensajeEmpleadoNuevo = isEmpleadoNuevo ? '\n\nComo empleado nuevo, tiene derecho a 15 días.' : ''
    // Asegurar que totalDays nunca sea negativo o cero en el mensaje
    const totalDaysFormatted = totalDays > 0 ? totalDays.toFixed(1) : (isEmpleadoNuevo ? '15' : '0')
    showNotification(
      'warning',
      'Sin Días Disponibles',
      `${employee.name} ya programó todos sus ${totalDaysFormatted} días de vacaciones${mensajeDuodecima} (${programmedDays} días programados).\n\nSolo puedes sugerir días adicionales si rechazas alguna de sus solicitudes programadas.${mensajeEmpleadoNuevo}`
    )
    return
  }
  
  const vacation = vacations.value.find(v => 
    v.emp_id === empId && 
    date >= new Date(v.start_date) && 
    date <= new Date(v.end_date)
  )

  const dateStr = date.toISOString().split('T')[0]
  const slotKey = `${empId}_${dateStr}`
  if (pendingCreationSlots.value.has(slotKey)) {
    showNotification('info', 'En proceso', 'Ya se está creando una sugerencia para ese día. Espera un momento.')
    return
  }
  
  if (vacation) {
    // Si hay vacación, mostrar modal de acciones
    currentVacation.value = vacation
    showSuggestModal.value = true
  } else {
    // Si no hay vacación, mostrar modal de creación
    selectedEmployeeForVacation.value = employee || null
    selectedDateForVacation.value = date
    
    // Prellenar fechas
    newVacationStartDate.value = dateStr
    newVacationEndDate.value = dateStr
    
    showCreateModal.value = true
  }
}

const approveVacation = async (vacationId: string) => {
  try {
    const vacation = vacations.value.find(v => v.id === vacationId)
    
    if (!vacation) {
      showNotification('error', 'Error', 'No se encontró la solicitud de vacaciones.')
      return
    }
    
    // Validar que la solicitud no esté ya aprobada
    if (vacation.status === 'approved') {
      showNotification('info', 'Ya aprobada', 'Esta solicitud ya está aprobada.')
      return
    }
    
    // Pedir confirmación antes de aprobar
    const employee = teamEmployees.value.find(e => e.emp_id === vacation.emp_id)
    const employeeName = employee?.name || vacation.employee_name || `Empleado #${vacation.emp_id}`
    const fechaFormateada = new Date(vacation.start_date).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    const confirmar = confirm(
      `¿Estás seguro de que deseas APROBAR la solicitud de vacaciones?\n\n` +
      `Empleado: ${employeeName}\n` +
      `Fecha: ${fechaFormateada}\n\n` +
      `Esta acción enviará una notificación al empleado.`
    )
    
    if (!confirmar) {
      return
    }
    
    console.log('✓ Aprobando vacación:', vacation)
    
    // Extraer el id_solicitud del id de la vacación (formato: id_solicitud_fecha)
    const id_solicitud = vacation.id.split('_')[0]
    const dateStr = vacation.start_date
    
    // Llamar a la API para actualizar en la base de datos
    const response = await fetch('http://190.171.225.68:8006/api/vacaciones/state', {
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
      // Cambiar estado a aprobado en el array local
      vacation.status = 'approved'
      console.log('✅ Vacación aprobada en la base de datos')
      
      // Enviar notificación de correo electrónico
      try {
        const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
        
        // Formatear la fecha para el payload (DD-MM-YYYY (TURNO))
        // Como no tenemos el turno en el objeto vacation, asumimos COMPLETO
        // dateStr está en formato YYYY-MM-DD, convertir a DD-MM-YYYY
        const [year, month, day] = dateStr.split('-')
        const fechaFormateada = `${day}-${month}-${year} (COMPLETO)`
        
        const notifPayload = {
          id_solicitud: id_solicitud,
          emp_id: vacation.emp_id,
          emp_nombre: employeeName,
          estado: 'APROBADO',
          comentario: `Fecha aprobada: ${dateStr}`,
          tipo: vacation.tipo || 'PROGRAMADA',
          dias_solicitados: 1,
          fechas: [fechaFormateada]
        }
        
        console.log('📧 Enviando notificación de aprobación:', notifPayload)
        
        const notifResponse = await fetch(`${BOT_URL}/api/vacation-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notifPayload)
        })
        
        if (notifResponse.ok) {
          console.log('✅ Notificación de aprobación enviada exitosamente')
          showNotification('success', 'Aprobada', 'La solicitud ha sido aprobada y se ha enviado la notificación.')
        } else {
          const notifErrorText = await notifResponse.text()
          console.warn('⚠️ Error al enviar notificación de aprobación:', notifResponse.status, notifErrorText)
          showNotification('warning', 'Aprobada', 'La solicitud ha sido aprobada, pero hubo un problema al enviar la notificación.')
        }
      } catch (notifError) {
        console.warn('⚠️ Error al enviar notificación de aprobación:', notifError)
        showNotification('warning', 'Aprobada', 'La solicitud ha sido aprobada, pero hubo un problema al enviar la notificación.')
        // No fallar la operación si la notificación falla
      }
      
      // Disparar evento para actualizar el Panel de Aprobación
      const event = new CustomEvent('vacation-status-changed', {
        detail: { 
          action: 'approved',
          id_solicitud: id_solicitud,
          emp_id: vacation.emp_id
        }
      })
      window.dispatchEvent(event)
      
      // Cerrar modal si está abierto
      showSuggestModal.value = false
    } else {
      console.error('❌ Error al aprobar en la API')
      showNotification('error', 'Error', 'Error al aprobar la solicitud. Por favor intenta nuevamente.')
    }
  } catch (error) {
    console.error('Error al aprobar vacación:', error)
    showNotification('error', 'Error', 'Error al aprobar la solicitud. Por favor intenta nuevamente.')
  }
}

const rejectVacation = async (vacationId: string) => {
  try {
    const vacation = vacations.value.find(v => v.id === vacationId)
    
    if (!vacation) {
      showNotification('error', 'Error', 'No se encontró la solicitud de vacaciones.')
      return
    }
    
    // Validar que la solicitud no esté aprobada
    if (vacation.status === 'approved') {
      showNotification('error', 'No se puede rechazar', 'No se puede rechazar una solicitud que ya está aprobada.')
      showSuggestModal.value = false
      return
    }
    
    // TODO: Llamar a API para rechazar
    console.log('Rechazar vacación:', vacationId)
    loadData()
  } catch (error) {
    console.error('Error al rechazar vacación:', error)
    showNotification('error', 'Error', 'Error al rechazar la solicitud. Por favor intenta nuevamente.')
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
const showVacationContextMenu = (empId: string, date: Date, event?: MouseEvent) => {
  if (event) {
    event.stopPropagation()
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const menuWidth = 224 // w-56 = 14rem = 224px
    const menuHeight = 200 // altura aproximada del menú
    let x = rect.left
    let y = rect.bottom + 4
    
    // Ajustar posición si el menú se sale de la pantalla
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10
    }
    if (y + menuHeight > window.innerHeight) {
      y = rect.top - menuHeight - 4
    }
    if (x < 0) x = 10
    if (y < 0) y = 10
    
    contextMenu.value = {
      show: true,
      emp_id: empId,
      date: date,
      x: x,
      y: y
    }
  } else {
    contextMenu.value = {
      show: true,
      emp_id: empId,
      date: date,
      x: 0,
      y: 0
    }
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
      const response = await fetch('http://190.171.225.68:8006/api/vacaciones/state', {
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


// Función para preaprobar desde el modal
const preapproveVacationFromModal = async (vacation: Vacation) => {
  try {
    const dateStr = vacation.start_date
    const id_solicitud = vacation.id.split('_')[0]
    
    // El backend ahora acepta 'PRE-APROBADO' (con guión)
    const response = await fetch('http://190.171.225.68:8006/api/vacaciones/state', {
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
            fechas: [`${dateStr} (COMPLETO)`]
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
      // Validar que la solicitud no esté aprobada
      if (vacation.status === 'approved') {
        showNotification('error', 'No se puede rechazar', 'No se puede rechazar una solicitud que ya está aprobada.')
        contextMenu.value.show = false
        return
      }
      
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
      const response = await fetch('http://190.171.225.68:8006/api/vacaciones/state', {
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
        
        // Enviar notificación de correo electrónico
        try {
          const BOT_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005'
          
          // Formatear la fecha para el payload (DD-MM-YYYY (TURNO))
          // Como no tenemos el turno en el objeto vacation, asumimos COMPLETO
          // dateStr está en formato YYYY-MM-DD, convertir a DD-MM-YYYY
          const [year, month, day] = dateStr.split('-')
          const fechaFormateada = `${day}-${month}-${year} (COMPLETO)`
          
          const notifPayload = {
            id_solicitud: id_solicitud,
            emp_id: empId,
            emp_nombre: employeeName,
            estado: 'RECHAZADO',
            comentario: `Fecha rechazada: ${dateStr}`,
            tipo: vacation.tipo || 'PROGRAMADA',
            dias_solicitados: 1,
            fechas: [fechaFormateada]
          }
          
          console.log('📧 Enviando notificación de rechazo:', notifPayload)
          
          const notifResponse = await fetch(`${BOT_URL}/api/vacation-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notifPayload)
          })
          
          if (notifResponse.ok) {
            console.log('✅ Notificación de rechazo enviada exitosamente')
          } else {
            const notifErrorText = await notifResponse.text()
            console.warn('⚠️ Error al enviar notificación de rechazo:', notifResponse.status, notifErrorText)
          }
        } catch (notifError) {
          console.warn('⚠️ Error al enviar notificación de rechazo:', notifError)
          // No fallar la operación si la notificación falla
        }
        
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
        showNotification('error', 'Error', 'Error al rechazar la solicitud. Por favor intenta nuevamente.')
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
      showNotification('info', 'Sin Vacaciones', 'No hay vacaciones para este empleado en el año seleccionado.')
      contextMenu.value.show = false
      return
    }
    
    // Obtener id_solicitud únicos del año (solo las que están pendientes)
    const pendingVacations = yearVacations.filter(v => v.status === 'pending')
    console.log(`📅 Vacaciones pendientes: ${pendingVacations.length}`)
    console.log(`📅 IDs de vacaciones pendientes:`, pendingVacations.map(v => v.id))
    
    if (pendingVacations.length === 0) {
      showNotification('info', 'Sin Solicitudes Pendientes', 'No hay solicitudes pendientes para preaprobar. Todas las solicitudes ya fueron procesadas.')
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
      showNotification('error', 'Error', 'No se encontraron IDs de solicitud válidos. Verifica la consola para más detalles.')
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
        console.log(`📤 URL: http://190.171.225.68:8006/api/vacaciones/state`)
        
        const response = await fetch('http://190.171.225.68:8006/api/vacaciones/state', {
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
            const reemplazanteResponse = await fetch(`http://190.171.225.68:8006/api/reemplazante-vacation?idsolicitud=${primeraSolicitudId}`)
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
      
      const message = `${successCount} solicitud(es) preaprobada(s) exitosamente para el año ${year}${errorCount > 0 ? `\n\n${errorCount} solicitud(es) con errores:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}` : ''}`
      showNotification('success', 'Preaprobación Exitosa', message)
    } else {
      const message = `No se pudo preaprobar ninguna solicitud.\n\nErrores:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}\n\nRevisa la consola (F12) para más detalles.`
      showNotification('error', 'Error en Preaprobación', message)
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
    showNotification('error', 'Error', `Error al preaprobar las vacaciones: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nRevisa la consola (F12) para más detalles.`)
    contextMenu.value.show = false
  }
}



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
  // Parsear la fecha manualmente para evitar problemas de zona horaria
  // Si viene en formato YYYY-MM-DD, parsearlo directamente
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // Los meses en JS son 0-indexados
    const day = parseInt(parts[2], 10)
    const date = new Date(year, month, day)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }
  // Fallback para otros formatos
  const date = new Date(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const confirmSuggestion = async () => {
  // Prevenir múltiples envíos simultáneos
  if (isSubmittingSuggestion.value) {
    console.warn('⚠️ Ya hay una sugerencia en proceso, ignorando clic duplicado')
    return
  }
  
  // Validación temprana antes de activar loading
  if (selectedAlternateDates.value.length === 0) {
    return
  }
  
  // Activar estado de loading inmediatamente
  isSubmittingSuggestion.value = true
  
  try {
    // Verificar si el empleado ya programó todos sus días antes de sugerir
    const empId = String(suggestionData.value.emp_id)
    const employee = teamEmployees.value.find(emp => String(emp.emp_id) === empId)
    
    if (employee) {
      // Obtener días totales incluyendo duodécimas
      const totalDays = getTotalDaysWithDuodecima(empId)
      const programmedDays = getProgrammedDaysCount(empId)
      const daysRemaining = totalDays - programmedDays
      const datesToSuggest = selectedAlternateDates.value.length
      const duodecima = employee.duodecima || 0
      
      console.log('🔍 Validación en confirmSuggestion:', {
        empId,
        employeeName: employee.name,
        saldoBase: employee.vacationBalance || employee.totalDays || 0,
        duodecima,
        totalDays,
        programmedDays,
        daysRemaining,
        datesToSuggest
      })
      
      if (daysRemaining <= 0) {
        const mensajeDuodecima = duodecima > 0 ? ` (incluye ${duodecima.toFixed(1)} duodécimas)` : ''
        showNotification(
          'warning',
          'Sin Días Disponibles',
          `${employee.name} ya programó todos sus ${totalDays.toFixed(1)} días de vacaciones${mensajeDuodecima} (${programmedDays} días programados).\n\nSolo puedes sugerir días adicionales si rechazas alguna de sus solicitudes programadas.`
        )
        isSubmittingSuggestion.value = false
        return
      }
      
      if (datesToSuggest > daysRemaining) {
        const mensajeDuodecima = duodecima > 0 ? ` (incluye ${duodecima.toFixed(1)} duodécimas)` : ''
        showNotification(
          'warning',
          'Días Insuficientes',
          `${employee.name} solo tiene ${daysRemaining.toFixed(1)} día(s) disponible(s) de ${totalDays.toFixed(1)} totales${mensajeDuodecima} (ya tiene ${programmedDays} días programados).\n\nEstás intentando sugerir ${datesToSuggest} día(s). Por favor, reduce la cantidad de días a sugerir.`
        )
        isSubmittingSuggestion.value = false
        return
      }
    } else {
      console.warn('⚠️ Empleado no encontrado en teamEmployees para empId:', empId)
    }
    
    const suggestedDates = selectedAlternateDates.value.map(d => d.toISOString().split('T')[0])
    
    console.log('💡 Enviando sugerencia con fechas alternativas:', suggestedDates)
    console.log('💡 Empleado:', suggestionData.value.emp_id)
    console.log('💡 Fechas originales:', suggestionData.value.originalDates)
    
    // Crear UNA SOLA solicitud con todas las fechas alternativas en el detalle
    // Esto evita duplicación y cuenta correctamente los días
    const payload = {
      emp_id: suggestionData.value.emp_id,
      tipo: 'PROGRAMADA',
      comentario: `Sugerencia de fechas alternativas: ${suggestedDates.join(', ')}`,
      manager_id: props.managerId,
      antiguedad: '1',
      total_dias: suggestedDates.length.toString(), // Total de días = número de fechas
      detalle: suggestedDates.map(dateStr => ({
        fecha: dateStr,
        turno: 'COMPLETO',
        observacion: 'Fecha sugerida como alternativa'
      })),
      reemplazantes: []
    }

    console.log('💡 Enviando sugerencia con todas las fechas:', payload)

    const response = await fetch('http://190.171.225.68:8006/api/store-vacation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error en respuesta:', errorText)
      throw new Error(`Error al enviar sugerencia: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Sugerencia enviada exitosamente:', result)
    
    showNotification('success', 'Sugerencia enviada', 'Las fechas alternativas se han sugerido correctamente.')
    
    showSuggestionModal.value = false
    selectedAlternateDates.value = []
    
    // Recargar datos para mostrar las sugerencias
    await loadData()
  } catch (error) {
    console.error('Error al enviar sugerencia:', error)
    showNotification('error', 'Error', 'Error al enviar la sugerencia. Intenta nuevamente.')
  } finally {
    // Siempre desactivar el estado de loading, incluso si hay error
    isSubmittingSuggestion.value = false
  }
}

// Cerrar menú contextual al hacer clic fuera
const setupContextMenuListener = () => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    // No cerrar si el clic es dentro del menú contextual
    if (target.closest('[data-context-menu]')) {
      return
    }
    contextMenu.value.show = false
  }
  
  window.addEventListener('click', handleClickOutside)
  
  // También cerrar al hacer scroll
  window.addEventListener('scroll', () => {
    contextMenu.value.show = false
  }, true)
}

const formatDayMonth = (dateString?: string) => {
  if (!dateString) return ''
  // Parsear la fecha manualmente para evitar problemas de zona horaria
  // Si viene en formato YYYY-MM-DD, parsearlo directamente
  const parts = dateString.split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // Los meses en JS son 0-indexados
    const day = parseInt(parts[2], 10)
    const d = new Date(year, month, day)
    const monthNamesEs = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    return `${d.getDate()} de ${monthNamesEs[d.getMonth()]}`
  }
  // Fallback para otros formatos
  const d = new Date(dateString)
  const monthNamesEs = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${d.getDate()} de ${monthNamesEs[d.getMonth()]}`
}

const filterEmployees = () => {
  // La función filteredEmployees es computada, no necesita lógica adicional
  console.log('Filtrar empleados por departamento:', selectedDepartment.value)
}

const updateScrollButtons = (element: HTMLElement) => {
  if (!element) return
  const { scrollLeft, scrollWidth, clientWidth } = element
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
}

const scrollCalendarHorizontal = (direction: 'left' | 'right') => {
  if (!calendarScroll.value) return
  
  const scrollAmount = 300 // Píxeles a desplazar
  const currentScroll = calendarScroll.value.scrollLeft
  const newScroll = direction === 'left' 
    ? Math.max(0, currentScroll - scrollAmount)
    : currentScroll + scrollAmount
  
  calendarScroll.value.scrollTo({
    left: newScroll,
    behavior: 'smooth'
  })
  
  // Actualizar botones después de un breve delay
  setTimeout(() => {
    if (calendarScroll.value) {
      updateScrollButtons(calendarScroll.value)
    }
  }, 300)
}

const handleCalendarScroll = (event: Event) => {
  const target = event.target as HTMLElement
  // Actualizar estado de botones de navegación
  updateScrollButtons(target)
}

const submitVacationForm = () => {
  // Verificar ANTES de ejecutar si se puede sugerir
  if (!selectedEmployeeForVacation.value) {
    showNotification('warning', 'Empleado No Seleccionado', 'No se ha seleccionado un empleado.')
    return
  }
  
  const empId = String(selectedEmployeeForVacation.value.emp_id)
  if (!canSuggestVacation(empId)) {
    const employee = selectedEmployeeForVacation.value
    const totalDays = getTotalDaysWithDuodecima(empId)
    const programmedDays = getProgrammedDaysCount(empId)
    const duodecima = employee.duodecima || 0
    const mensajeDuodecima = duodecima > 0 ? ` (incluye ${duodecima.toFixed(1)} duodécimas)` : ''
    showNotification(
      'warning',
      'Sin Días Disponibles',
      `${employee.name} ya programó todos sus ${totalDays} días de vacaciones${mensajeDuodecima} (${programmedDays} días programados).\n\nSolo puedes sugerir días adicionales si rechazas alguna de sus solicitudes programadas.`
    )
    return
  }
  
  // Ejecutar directamente sin modal de confirmación
  createVacation()
}

const createVacation = async () => {
  // Prevenir múltiples creaciones simultáneas
  if (isCreatingVacation.value) {
    console.warn('⚠️ Ya hay una creación de vacación en proceso, ignorando clic duplicado')
    return
  }
  
  // Validación temprana antes de activar loading
  if (!selectedEmployeeForVacation.value) {
    return
  }
  
  // Activar estado de loading inmediatamente
  isCreatingVacation.value = true
  
  try {
    const empId = String(selectedEmployeeForVacation.value.emp_id)
    const startDate = newVacationStartDate.value || ''
    const slotKey = `${empId}_${startDate}`

    // Bloqueo por slot (evita doble click/reintento mientras no pinta el cuadrito)
    if (pendingCreationSlots.value.has(slotKey)) {
      console.warn('⚠️ Ya hay una creación en curso para este día:', slotKey)
      showNotification('info', 'Ya existe una sugerencia', 'Ya se está creando una sugerencia para ese día.')
      return
    }
    pendingCreationSlots.value.add(slotKey)

    // Verificar si el empleado ya programó todos sus días
    const totalDays = getTotalDaysWithDuodecima(empId)
    const programmedDays = getProgrammedDaysCount(empId)
    const daysRemaining = totalDays - programmedDays
    const employee = selectedEmployeeForVacation.value
    const duodecima = employee.duodecima || 0
    
    console.log('🔍 Validación en createVacation:', {
      empId,
      employeeName: employee.name,
      saldoBase: employee.vacationBalance || employee.totalDays || 0,
      duodecima,
      totalDays,
      programmedDays,
      daysRemaining
    })
    
    // Calcular días que se están sugiriendo (considerando medio día = 0.5)
    const endDate = newVacationEndDate.value || startDate
    // Si es medio día, contar como 0.5, si es completo contar como 1
    const daysToSuggest = newVacationTurno.value === 'COMPLETO' ? 1 : 0.5
    
      if (daysRemaining <= 0) {
        const mensajeDuodecima = duodecima > 0 ? ` (incluye ${duodecima.toFixed(1)} duodécimas)` : ''
        showNotification(
          'warning',
          'Sin Días Disponibles',
          `${employee.name} ya programó todos sus ${totalDays} días de vacaciones${mensajeDuodecima} (${programmedDays} días programados).\n\nSolo puedes sugerir días adicionales si rechazas alguna de sus solicitudes programadas.`
        )
        showCreateModal.value = false
        isCreatingVacation.value = false
        return
      }
      
      if (daysToSuggest > daysRemaining) {
        const mensajeDuodecima = duodecima > 0 ? ` (incluye ${duodecima.toFixed(1)} duodécimas)` : ''
        showNotification(
          'warning',
          'Días Insuficientes',
          `${employee.name} solo tiene ${daysRemaining.toFixed(1)} día(s) disponible(s) de ${totalDays.toFixed(1)} totales${mensajeDuodecima} (ya tiene ${programmedDays} días programados).\n\nEstás intentando sugerir ${daysToSuggest} día(s). Por favor, selecciona menos días.`
        )
        isCreatingVacation.value = false
        return
      }
    
    console.log('📝 Creando vacación:', {
      employee: selectedEmployeeForVacation.value,
      start_date: startDate,
      end_date: endDate,
      note: newVacationNote.value,
      daysRemaining,
      daysToSuggest
    })

    // Pintado optimista: mostrar el cuadrito inmediatamente
    const alreadyExists = vacations.value.some(v => v.emp_id === empId && v.start_date === startDate && v.end_date === endDate)
    if (!alreadyExists) {
      vacations.value.push({
        id: `temp_${empId}_${startDate}_${Date.now()}`,
        emp_id: empId,
        employee_name: employee.name || `Empleado #${empId}`,
        department: employee.department || employee.departamento || 'N/A',
        start_date: startDate,
        end_date: endDate,
        status: 'pending',
        tipo: 'PROGRAMADA',
        es_programada: true
      })
    }
    
    // Calcular días según el turno
    const diasCalculados = newVacationTurno.value === 'COMPLETO' ? 1 : 0.5
    
    const payload = {
      emp_id: selectedEmployeeForVacation.value.emp_id,
      tipo: 'PROGRAMADA',
      comentario: newVacationNote.value || `Vacación programada del ${startDate} al ${endDate}`,
      manager_id: props.managerId,
      antiguedad: '1',
      total_dias: diasCalculados.toString(), // Agregar total_dias calculado
      detalle: [{
        fecha: startDate,
        turno: newVacationTurno.value,
        observacion: null
      }],
      reemplazantes: []
    }

    console.log('📤 Payload para crear vacación:', payload)

    const response = await fetch('http://190.171.225.68:8006/api/store-vacation', {
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
    
    showNotification('success', 'Vacación creada', 'La vacación se ha creado correctamente.')
    
    // Cerrar modal de creación y recargar datos
    showCreateModal.value = false
    newVacationStartDate.value = ''
    newVacationEndDate.value = ''
    newVacationNote.value = ''
    newVacationTurno.value = 'COMPLETO'
    selectedEmployeeForVacation.value = null
    await loadData()
  } catch (error) {
    console.error('❌ Error al crear vacación:', error)
    showNotification('error', 'Error', 'Error al crear la vacación. Intenta nuevamente.')
    showCreateModal.value = false
  } finally {
    // Siempre desactivar el estado de loading, incluso si hay error
    isCreatingVacation.value = false
    // Liberar el bloqueo del slot si ya no está en modal
    try {
      const empId = selectedEmployeeForVacation.value ? String(selectedEmployeeForVacation.value.emp_id) : ''
      const startDate = newVacationStartDate.value || ''
      if (empId && startDate) {
        pendingCreationSlots.value.delete(`${empId}_${startDate}`)
      }
    } catch (_) {
      // no-op
    }
  }
}

const formatDate = (dateString: string): string => {
  // Parsear la fecha manualmente para evitar problemas de zona horaria
  // Si viene en formato YYYY-MM-DD, parsearlo directamente
  const parts = dateString.split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // Los meses en JS son 0-indexados
    const day = parseInt(parts[2], 10)
    const date = new Date(year, month, day)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }
  // Fallback para otros formatos
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

// Cargar feriados de Bolivia desde datos locales
const fetchHolidays = async () => {
  try {
    const year = currentDate.value.getFullYear()
    // Limpiar feriados anteriores para evitar datos residuales
    publicHolidays.value = []
    
    // Obtener solo los feriados nacionales para el encabezado (sin regional)
    const allHolidays = getHolidaysForEmployee(year, undefined)
    // Filtrar solo feriados nacionales para el encabezado
    publicHolidays.value = allHolidays
      .filter(h => h.type === 'national')
      .map(h => ({
        date: h.date,
        name: h.name,
        type: h.type
      }))
    console.log(`✅ ${publicHolidays.value.length} feriados nacionales cargados para ${year}`)
    console.log('📅 Feriados nacionales cargados:', publicHolidays.value.map(h => `${h.date}: ${h.name}`))
    
    // Verificar específicamente el 2 de febrero
    const feb2Holiday = publicHolidays.value.find(h => h.date === '2026-02-02')
    if (feb2Holiday) {
      console.warn('⚠️ ADVERTENCIA: El 2 de febrero aparece como feriado:', feb2Holiday)
    } else {
      console.log('✅ Confirmado: El 2 de febrero NO es feriado')
    }
  } catch (error) {
    console.error('Error al cargar feriados:', error)
    publicHolidays.value = []
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
      const response = await fetch(`http://190.171.225.68:8006/api/vacacion-data-manager?manager=${props.managerId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Respuesta de solicitudes del manager:', data)
        
        if (data.success && Array.isArray(data.data)) {
          // Guardar todas las solicitudes para poder contar días programados
          allRequests.value = data.data
          console.log('✅ allRequests cargado con', allRequests.value.length, 'solicitudes')
          
          // Log de las primeras solicitudes PROGRAMADA para debug
          const programadas = allRequests.value.filter((req: any) => req.tipo === 'PROGRAMADA')
          console.log('📊 Solicitudes PROGRAMADA encontradas:', programadas.length)
          if (programadas.length > 0) {
            console.log('📋 Ejemplo de solicitud PROGRAMADA:', {
              id: programadas[0].id_solicitud,
              emp_id: programadas[0].emp_id,
              tipo: programadas[0].tipo,
              estado: programadas[0].estado,
              fechas_count: programadas[0].fechas?.length || 0,
              fechas_agrupadas_count: programadas[0].fechas_agrupadas?.length || 0,
              fechas_sample: programadas[0].fechas?.slice(0, 3) || 'N/A'
            })
          }
          
          // Extraer empleados únicos de las solicitudes
          const uniqueEmployees = new Map<string, any>()
          
          for (const solicitud of data.data) {
            if (!uniqueEmployees.has(solicitud.emp_id)) {
              // Intentar cargar info del empleado
              let nombre = `Empleado #${solicitud.emp_id}`
              let cargo = 'N/A'
              let regional = null
              let available = 0
              let taken = 0
              let total = 0
              let duodecima = 0
              let fechaIngreso: string | undefined = undefined
              
              // Intentar cargar información del empleado con retry
              let maxRetries = 2
              let retryCount = 0
              let empleadoInfo: any = null
              
              while (retryCount <= maxRetries && !empleadoInfo) {
                try {
                  const controller = new AbortController()
                  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout
                  
                  const empInfoResponse = await fetch(`http://190.171.225.68:8006/api/empleado/info?emp_id=${solicitud.emp_id}`, {
                    signal: controller.signal
                  })
                  
                  clearTimeout(timeoutId)
                  
                  if (empInfoResponse.ok) {
                    const empInfoData = await empInfoResponse.json()
                    
                    // La API ahora devuelve directamente un array o un objeto con status
                    if (Array.isArray(empInfoData) && empInfoData.length > 0) {
                      // Nuevo formato: array directo
                      empleadoInfo = empInfoData[0]
                    } else if (empInfoData.status === 'success' && Array.isArray(empInfoData.data) && empInfoData.data.length > 0) {
                      // Formato antiguo: objeto con status y data
                      empleadoInfo = empInfoData.data[0]
                    }
                    
                    if (empleadoInfo) {
                      // Intentar múltiples campos posibles para el nombre
                      nombre = empleadoInfo.fullName || 
                              empleadoInfo.name || 
                              empleadoInfo.nombre || 
                              empleadoInfo.NOMBRE ||
                              empleadoInfo.FULLNAME ||
                              empleadoInfo.NAME ||
                              empleadoInfo.FULL_NAME ||
                              nombre
                      
                      // Intentar múltiples campos posibles para el cargo/departamento
                      cargo = empleadoInfo.cargo || 
                             empleadoInfo.CARGO ||
                             empleadoInfo.department || 
                             empleadoInfo.DEPARTMENT ||
                             empleadoInfo.departamento ||
                             empleadoInfo.DEPARTAMENTO ||
                             empleadoInfo.dept ||
                             empleadoInfo.DEPT ||
                             cargo
                      
                      // Obtener el regional del empleado si está disponible
                      regional = empleadoInfo.regional || 
                                empleadoInfo.REGIONAL || 
                                empleadoInfo.departamento || 
                                empleadoInfo.DEPARTAMENTO ||
                                null
                      
                      // También cargar información de vacaciones si está disponible
                      if (empleadoInfo.vacation) {
                        const vacationInfo = empleadoInfo.vacation
                        available = parseFloat(vacationInfo.available || vacationInfo.AVAILABLE || '0')
                        taken = parseFloat(vacationInfo.taken || vacationInfo.TAKEN || '0')
                        const totalFromAPI = parseFloat(vacationInfo.total || vacationInfo.TOTAL || '0')
                        
                        // Calcular total de días - usar totalFromAPI si está disponible y es razonable, sino calcular
                        if (totalFromAPI > 0 && totalFromAPI <= 30) {
                          total = totalFromAPI
                        } else {
                          total = available + taken
                        }
                        
                        // Si el total calculado es mayor a 30, probablemente hay un error
                        // En ese caso, usar el valor de available como referencia (si es razonable)
                        if (total > 30 && available > 0 && available <= 30) {
                          // Si available parece ser el total correcto (ej: 15), usarlo
                          total = available
                          console.warn('⚠️ Total calculado muy alto, usando available como total:', {
                            emp_id: solicitud.emp_id,
                            available,
                            taken,
                            total_calculado: available + taken,
                            total_api: totalFromAPI,
                            total_usado: total
                          })
                        }
                        
                        console.log('✅ Información completa del empleado cargada:', {
                          emp_id: solicitud.emp_id,
                          nombre,
                          cargo,
                          available,
                          taken,
                          total
                        })
                      } else {
                        // Si no hay información de vacaciones en el objeto vacation, buscar en otros campos
                        const altAvailable = parseFloat(empleadoInfo.vacationBalance || empleadoInfo.vacation_balance || empleadoInfo.available || '0')
                        const altTaken = parseFloat(empleadoInfo.vacationTaken || empleadoInfo.vacation_taken || empleadoInfo.taken || '0')
                        const altTotal = parseFloat(empleadoInfo.vacationTotal || empleadoInfo.vacation_total || empleadoInfo.total || '0')
                        
                        if (altAvailable > 0 || altTotal > 0) {
                          available = altAvailable
                          taken = altTaken
                          total = altTotal || (altAvailable + altTaken)
                          console.log('✅ Información de vacaciones encontrada en campos alternativos:', {
                            emp_id: solicitud.emp_id,
                            available,
                            taken,
                            total
                          })
                        } else {
                          // Si no hay información de vacaciones, el empleado es nuevo (saldo 0)
                          available = 0
                          taken = 0
                          total = 0
                          console.log('📋 Empleado nuevo detectado (sin información de vacaciones):', {
                            emp_id: solicitud.emp_id,
                            nombre
                          })
                        }
                      }
                      
                      // Obtener fecha de ingreso para calcular duodécimas
                      fechaIngreso = empleadoInfo.fechaIngreso || 
                                    empleadoInfo.FECHA_INGRESO || 
                                    empleadoInfo.fecha_ingreso ||
                                    empleadoInfo.ingreso ||
                                    empleadoInfo.INGRESO ||
                                    empleadoInfo.startDate ||
                                    empleadoInfo.START_DATE ||
                                    undefined
                      
                      // Calcular duodécimas si tenemos fecha de ingreso y saldo
                      if (fechaIngreso && available >= 0) {
                        try {
                          const fechaActual = new Date().toISOString().split('T')[0] // YYYY-MM-DD
                          const rangoVacaciones = calcularRangoVacaciones({
                            fechaIngreso: fechaIngreso,
                            fechaActual: fechaActual,
                            saldoAcumulado: available
                          })
                          duodecima = rangoVacaciones.duodecima
                          console.log('✅ Duodécimas calculadas:', {
                            emp_id: solicitud.emp_id,
                            fechaIngreso,
                            saldoAcumulado: available,
                            duodecima,
                            diasPorGestion: rangoVacaciones.diasPorGestion
                          })
                        } catch (error: any) {
                          console.warn('⚠️ Error al calcular duodécimas:', {
                            emp_id: solicitud.emp_id,
                            error: error.message
                          })
                        }
                      }
                    } else {
                      console.warn('⚠️ Respuesta vacía o inválida para empleado:', {
                        emp_id: solicitud.emp_id,
                        response: empInfoData,
                        retryCount
                      })
                    }
                  } else {
                    console.warn('⚠️ Error HTTP al obtener información del empleado:', {
                      emp_id: solicitud.emp_id,
                      status: empInfoResponse.status,
                      statusText: empInfoResponse.statusText,
                      retryCount
                    })
                  }
                } catch (err: any) {
                  console.error('❌ Error al cargar info del empleado (intento ' + (retryCount + 1) + '):', {
                    emp_id: solicitud.emp_id,
                    error: err?.message || err,
                    retryCount
                  })
                  
                  // Si es un error de timeout o red, esperar un poco antes de reintentar
                  if (retryCount < maxRetries && (err?.name === 'TimeoutError' || err?.message?.includes('fetch'))) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Delay incremental
                  }
                }
                
                retryCount++
              }
              
              // Si después de todos los intentos no se obtuvo información, loguear el problema
              if (!empleadoInfo) {
                console.error('❌ No se pudo cargar información del empleado después de ' + (maxRetries + 1) + ' intentos:', solicitud.emp_id)
              }
              
              // Agregar empleado al mapa (incluso si no se pudo cargar toda la info)
              // Si el empleado no tiene información de vacaciones (available = 0 y total = 0),
              // es un empleado nuevo y debe tener 15 días disponibles
              const isEmpleadoNuevo = available === 0 && total === 0 && !empleadoInfo?.vacation
              
              uniqueEmployees.set(solicitud.emp_id, {
                emp_id: solicitud.emp_id,
                name: nombre,
                department: cargo,
                regional: regional,
                vacationBalance: available, // Si es 0, será detectado como empleado nuevo
                totalDays: total, // Si es 0, será detectado como empleado nuevo
                usagePercentage: total > 0 ? Math.round((taken / total) * 100) : 0,
                daysRemaining: available,
                rejectedCount: 0, // Se actualizará después
                duodecima: duodecima,
                fechaIngreso: fechaIngreso
              })
              
              if (isEmpleadoNuevo) {
                console.log('✅ Empleado nuevo agregado al calendario (15 días disponibles):', {
                  emp_id: solicitud.emp_id,
                  nombre,
                  vacationBalance: available,
                  totalDays: total
                })
              }
            }
          }
          
          // Contar solicitudes rechazadas por empleado
          for (const solicitud of data.data) {
            if (solicitud.estado === 'RECHAZADO' || solicitud.estado === 'REJECTED') {
              const empleado = uniqueEmployees.get(solicitud.emp_id)
              if (empleado) {
                empleado.rejectedCount = (empleado.rejectedCount || 0) + 1
              }
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
                  tipo: solicitud.tipo || 'VACACION',
                  es_programada: solicitud.tipo === 'PROGRAMADA',
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
      // No usar datos de ejemplo - mostrar error y dejar vacío
      teamEmployees.value = []
      vacations.value = []
      departments.value = []
      
      // Mostrar mensaje de error al usuario
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showNotification(
        'error',
        'Error al cargar datos',
        `No se pudieron cargar los datos del equipo. Por favor verifica tu conexión e intenta recargar la página.\n\nError: ${errorMessage}`
      )
    }
    
    // Extraer departamentos únicos para el filtro (solo si hay empleados)
    if (teamEmployees.value.length > 0) {
      departments.value = Array.from(new Set(teamEmployees.value.map(emp => emp.department))).sort()
    }
  } catch (error) {
    console.error('❌ Error al cargar datos en loadData:', error)
    // No usar datos de ejemplo - mostrar error y dejar vacío
    teamEmployees.value = []
    vacations.value = []
    departments.value = []
    // Mostrar mensaje de error al usuario
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    showNotification(
      'error',
      'Error al cargar datos',
      `No se pudieron cargar los datos del equipo. Por favor verifica tu conexión e intenta recargar la página.\n\nError: ${errorMessage}`
    )
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
                  'pending' as const, // PROCESO y PENDIENTE son ambos pending
          tipo: req.tipo || 'VACACION', // Agregar tipo para identificar programadas
          es_programada: req.tipo === 'PROGRAMADA'
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

<style scoped>
/* Scrollbar personalizado para mejor UX */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #9ca3af #e5e7eb;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.scrollbar-thumb-gray-400::-webkit-scrollbar-thumb {
  background: #9ca3af;
}

.scrollbar-thumb-gray-500::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.scrollbar-track-gray-200::-webkit-scrollbar-track {
  background: #e5e7eb;
}

/* Asegurar que el scroll de la página funcione durante la carga */
.w-full {
  overflow-y: visible;
}

/* Mejorar el scroll horizontal del calendario */
.overflow-auto {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Indicador de scroll más visible */
.scroll-indicator {
  position: relative;
}

.scroll-indicator::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, #3b82f6, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.scroll-indicator:hover::after {
  opacity: 1;
}
</style>
