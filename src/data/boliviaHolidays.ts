export interface NationalHoliday {
  date: string
  name: string
  type: 'national'
}

export interface DepartmentHoliday {
  department: string
  date: string
  name: string
  type: 'regional'
}

export interface HolidaysData {
  year: number
  national_holidays: NationalHoliday[]
  department_holidays: DepartmentHoliday[]
}

export const boliviaHolidays2026: HolidaysData = {
  year: 2026,
  national_holidays: [
    { date: "2026-01-01", name: "Año Nuevo", type: "national" },
    { date: "2026-01-02", name: "Feriado Nacional", type: "national" },
    { date: "2026-02-16", name: "Carnaval (Lunes)", type: "national" },
    { date: "2026-02-17", name: "Carnaval (Martes)", type: "national" },
    { date: "2026-04-03", name: "Viernes Santo", type: "national" },
    { date: "2026-05-01", name: "Día del Trabajador", type: "national" },
    { date: "2026-06-04", name: "Corpus Christi", type: "national" },
    { date: "2026-06-21", name: "Año Nuevo Aymara", type: "national" },
    { date: "2026-08-06", name: "Día de la Independencia de Bolivia", type: "national" },
    { date: "2026-11-02", name: "Día de Todos los Santos", type: "national" },
    { date: "2026-12-25", name: "Navidad", type: "national" }
  ],
  department_holidays: [
    {
      department: "Chuquisaca",
      date: "2026-05-25",
      name: "Día del Departamento de Chuquisaca",
      type: "regional"
    },
    {
      department: "Oruro",
      date: "2026-10-06",
      name: "Revolución de Oruro",
      type: "regional"
    },
    {
      department: "La Paz",
      date: "2026-07-16",
      name: "Día de La Paz",
      type: "regional"
    },
    {
      department: "Potosí",
      date: "2026-04-10",
      name: "Día de Potosí",
      type: "regional"
    },
    {
      department: "Tarija",
      date: "2026-04-19",
      name: "Día de Tarija",
      type: "regional"
    },
    {
      department: "Santa Cruz",
      date: "2026-09-24",
      name: "Día de Santa Cruz",
      type: "regional"
    },
    {
      department: "Beni",
      date: "2026-11-18",
      name: "Aniversario de Beni",
      type: "regional"
    },
    {
      department: "Cochabamba",
      date: "2026-09-14",
      name: "Día de Cochabamba",
      type: "regional"
    },
    {
      department: "Pando",
      date: "2026-08-10",
      name: "Día de Pando",
      type: "regional"
    }
  ]
}

/**
 * Obtiene todos los feriados para un año específico
 * @param year Año para el cual obtener los feriados
 * @returns Array de feriados con fecha y nombre
 */
export function getHolidaysForYear(year: number): Array<{ date: string; name: string; type: 'national' | 'regional'; department?: string }> {
  // Por ahora solo tenemos datos para 2026
  // En el futuro se pueden agregar más años
  if (year === 2026) {
    const holidays: Array<{ date: string; name: string; type: 'national' | 'regional'; department?: string }> = []
    
    // Agregar feriados nacionales
    boliviaHolidays2026.national_holidays.forEach(holiday => {
      holidays.push({
        date: holiday.date,
        name: holiday.name,
        type: 'national'
      })
    })
    
    // Agregar feriados departamentales
    boliviaHolidays2026.department_holidays.forEach(holiday => {
      holidays.push({
        date: holiday.date,
        name: holiday.name,
        type: 'regional',
        department: holiday.department
      })
    })
    
    return holidays
  }
  
  // Si no hay datos para el año, retornar array vacío
  return []
}

/**
 * Obtiene los feriados visibles para un empleado según su regional
 * @param year Año para el cual obtener los feriados
 * @param regional Regional del empleado (opcional)
 * @returns Array de feriados con fecha y nombre
 */
export function getHolidaysForEmployee(year: number, regional?: string): Array<{ date: string; name: string; type: 'national' | 'regional' }> {
  const allHolidays = getHolidaysForYear(year)
  
  // Filtrar feriados según el regional del empleado
  return allHolidays.filter(holiday => {
    // Siempre incluir feriados nacionales
    if (holiday.type === 'national') {
      return true
    }
    
    // Si es feriado regional, solo incluirlo si el empleado tiene ese regional
    if (holiday.type === 'regional' && holiday.department) {
      if (!regional) {
        return false // Si no tiene regional, no mostrar feriados regionales
      }
      
      // Normalizar nombres para comparación (case-insensitive y sin acentos)
      const normalizeString = (str: string) => {
        return str
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
          .replace(/\s+/g, ' ') // Normalizar espacios
      }
      
      const normalizedDepartment = normalizeString(holiday.department)
      const normalizedRegional = normalizeString(regional)
      
      // Comparación exacta o parcial (por si viene "La Paz" vs "La Paz, Bolivia")
      const matches = normalizedDepartment === normalizedRegional || 
                      normalizedRegional.includes(normalizedDepartment) ||
                      normalizedDepartment.includes(normalizedRegional)
      
      // console.log('🔍 Comparando regional:', {
      //   department: holiday.department,
      //   regional: regional,
      //   normalizedDepartment,
      //   normalizedRegional,
      //   matches
      // })
      
      return matches
    }
    
    return false
  })
}

/**
 * Obtiene el nombre del feriado para una fecha específica
 * @param date Fecha en formato YYYY-MM-DD
 * @param regional Regional del empleado (opcional)
 * @returns Nombre del feriado o null si no hay feriado
 */
export function getHolidayName(date: string, regional?: string): string | null {
  const year = parseInt(date.split('-')[0])
  const holidays = getHolidaysForEmployee(year, regional)
  
  const holiday = holidays.find(h => h.date === date)
  return holiday ? holiday.name : null
}

