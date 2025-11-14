import axios from 'axios';

export interface VacationDetail {
  fecha: string;
  tipo_dia: string;
}

export interface VacationAPIData {
  DOCVAC: number;
  FECHA: string;
  HORA: string;
  EMPID: number;
  COMMENT: string;
  FROMDATE: string;
  TODATE: string;
  NUMDIAS: number;
  TIPO: string;
  AUTORIZA: string;
  ANIO: string;
  BRANCH: number;
  DEPT: number;
  NAMEEMP: string;
  NAMECREA: string;
  NAMEAUTORIZ: string;
  ESTADO: string;
  STARTDATE: number;
  NUMDIAS1: number;
  NUMDIAS2: number;
  NUMDIAS3: number;
  NUMDIAS4: number;
  FROMDATE1: string;
  TODATE1: string;
  FROMDATE2: string;
  TODATE2: string;
  FROMDATE3: string;
  TODATE3: string;
  FROMDATE4: string;
  TODATE4: string;
}

export interface SaveVacationPayload {
  emp_id: string;
  emp_nombre: string;
  manager_id: string;
  manager_nombre: string;
  tipo: string;
  estado: 'APROBADO' | 'RECHAZADO';
  comentario?: string;
  fechas: VacationDetail[];
  branch?: number;
  dept?: number;
}

/**
 * Formatea fechas a DD-MM-YYYY para la API externa
 * Parsea directamente desde el string para evitar problemas de zona horaria
 * El formato de entrada esperado es: "YYYY-MM-DD"
 */
const formatDateForAPI = (dateString: string): string => {
  // Si el formato es YYYY-MM-DD, parsear directamente sin usar Date para evitar problemas de zona horaria
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }
  
  // Fallback: usar Date pero con métodos UTC para evitar conversión de zona horaria
  const date = new Date(dateString + 'T12:00:00'); // Usar mediodía para evitar problemas de zona horaria
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Guarda los datos de vacación en la API externa
 * Llama directamente a tu backend principal
 */
export async function saveVacationToExternalAPI(payload: SaveVacationPayload): Promise<any> {
  try {
    // Llamar directamente a tu backend principal
    const backendUrl = 'http://190.171.225.68/api/vacaciones/add-vacation';
    
    console.log('Enviando datos directamente a API externa:', {
      backendUrl,
      emp_id: payload.emp_id,
      emp_nombre: payload.emp_nombre,
      estado: payload.estado
    });

    // Generar DOCVAC (número único más pequeño para SAP)
    const docVac = Math.floor(Math.random() * 999999) + 100000;

    const now = new Date();
    const fechaActual = formatDateForAPI(now.toISOString().split('T')[0]);
    const horaActual = now.toTimeString().split(' ')[0];

    // Calcular fechas de inicio y fin
    const fechasOrdenadas = payload.fechas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const fechaInicio = formatDateForAPI(fechasOrdenadas[0].fecha);
    const fechaFin = formatDateForAPI(fechasOrdenadas[fechasOrdenadas.length - 1].fecha);

    // Función helper para calcular días según el tipo (medio día = 0.5, día completo = 1)
    const getDaysForType = (tipo: string): number => {
      if (tipo === 'MAÑANA' || tipo === 'TARDE') return 0.5;
      return 1; // COMPLETO o cualquier otro
    };

    // Calcular el total de días considerando medio día = 0.5
    const totalDays = payload.fechas.reduce((total, dia) => {
      const tipo = dia.tipo_dia || 'COMPLETO';
      return total + getDaysForType(tipo);
    }, 0);

    // Preparar datos de días individuales (máximo 4 días)
    const diasData = fechasOrdenadas.slice(0, 4).map((dia) => {
      const tipo = dia.tipo_dia || 'COMPLETO';
      return {
        numDias: getDaysForType(tipo),
        fromDate: formatDateForAPI(dia.fecha),
        toDate: formatDateForAPI(dia.fecha)
      };
    });

    // Construir objeto de datos para la API externa
    const vacationAPIData = {
      FECHA: `${fechaActual} 0:00:00.0`,
      HORA: horaActual || 0,
      EMPID: parseInt(payload.emp_id),
      COMMENT: payload.comentario || '',
      AUTOR: '0', // default
      FROMDATE: `${fechaInicio} 0:00:00.0`,
      TODATE: `${fechaFin} 0:00:00.0`,
      NUMDIAS: totalDays,
      TIPO: 'V',
      AUTORIZA: payload.manager_id || 0, // ID del manager que aprobó
      // Calcular ANIO parseando directamente desde el string para evitar problemas de zona horaria
      ANIO: (() => {
        const fechaStr = fechasOrdenadas[0].fecha;
        if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year] = fechaStr.split('-');
          return year;
        }
        return new Date(fechaStr + 'T12:00:00').getFullYear().toString();
      })(),
      BRANCH: payload.branch || 1,
      DEPT: payload.dept || 10,
      NAMEEMP: payload.emp_nombre,
      NAMECREA: payload.emp_nombre,
      NAMEAUTORIZ: payload.manager_nombre,
      ESTADO: payload.estado === 'APROBADO' ? 'A' : 'R', // <-- forzamos A o R
      // Calcular STARTDATE usando la fecha directamente sin conversión de zona horaria
      STARTDATE: (() => {
        const fechaStr = fechasOrdenadas[0].fecha;
        if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = fechaStr.split('-').map(Number);
          // Fecha serial de Excel: días desde 1900-01-01
          const excelEpoch = new Date(1900, 0, 1);
          const targetDate = new Date(year, month - 1, day);
          const daysDiff = Math.floor((targetDate.getTime() - excelEpoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return daysDiff + 25569;
        }
        // Fallback
        return Math.floor(new Date(fechasOrdenadas[0].fecha + 'T12:00:00').getTime() / (1000 * 60 * 60 * 24)) + 25569;
      })(),
      NUMDIAS1: diasData[0]?.numDias || 0,
      NUMDIAS2: diasData[1]?.numDias || 0,
      NUMDIAS3: diasData[2]?.numDias || 0,
      NUMDIAS4: diasData[3]?.numDias || 0,
      FROMDATE1: diasData[0]?.fromDate ? `${diasData[0].fromDate} 0:00:00.0` : null,
      TODATE1: diasData[0]?.toDate ? `${diasData[0].toDate} 0:00:00.0` : null,
      FROMDATE2: diasData[1]?.fromDate ? `${diasData[1].fromDate} 0:00:00.0` : null,
      TODATE2: diasData[1]?.toDate ? `${diasData[1].toDate} 0:00:00.0` : null,
      FROMDATE3: diasData[2]?.fromDate ? `${diasData[2].fromDate} 0:00:00.0` : null,
      TODATE3: diasData[2]?.toDate ? `${diasData[2].toDate} 0:00:00.0` : null,
      FROMDATE4: diasData[3]?.fromDate ? `${diasData[3].fromDate} 0:00:00.0` : null,
      TODATE4: diasData[3]?.toDate ? `${diasData[3].toDate} 0:00:00.0` : null
    };
    

    console.log('Datos preparados para API externa:', vacationAPIData);

    const response = await axios.post(backendUrl, vacationAPIData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000, // 15 segundos de timeout
      withCredentials: false // No enviar cookies
    });

    console.log('✅ Vacación guardada exitosamente en API externa:', {
      status: response.status,
      docVac: docVac,
      responseData: response.data
    });

    return {
      success: true,
      data: response.data,
      docVac: docVac
    };

  } catch (error: any) {
    console.error('❌ Error al guardar vacación en API externa:', {
      backendUrl: 'http://190.171.225.68/api/vacaciones/add-vacation',
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      code: error.code
    });

    throw new Error(`Error al guardar vacación en la API externa: ${error.message}`);
  }
}
