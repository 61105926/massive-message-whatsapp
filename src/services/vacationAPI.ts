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
 */
const formatDateForAPI = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Mapea el estado de la vacación a los valores de la API externa
 */
const mapVacationStatus = (estado: 'APROBADO' | 'RECHAZADO'): string => {
  return estado === 'APROBADO' ? 'AP' : 'RE';
};

/**
 * Mapea el tipo de vacación a los valores de la API externa
 */
const mapVacationType = (tipo: string): string => {
  switch (tipo.toUpperCase()) {
    case 'VACACION':
      return 'A';
    case 'A_CUENTA':
      return 'C';
    default:
      return 'A';
  }
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

    // Preparar datos de días individuales (máximo 4 días)
    const diasData = fechasOrdenadas.slice(0, 4).map((dia) => ({
      numDias: 1,
      fromDate: formatDateForAPI(dia.fecha),
      toDate: formatDateForAPI(dia.fecha)
    }));

    // Construir objeto de datos para la API externa
    const vacationAPIData = {
      DOCVAC: docVac,
      FECHA: fechaActual,
      HORA: horaActual,
      EMPID: parseInt(payload.emp_id),
      COMMENT: payload.comentario || '',
      FROMDATE: fechaInicio,
      TODATE: fechaFin,
      NUMDIAS: payload.fechas.length,
      TIPO: mapVacationType(payload.tipo),
      AUTORIZA: payload.estado === 'APROBADO' ? 'Y' : 'N',
      ANIO: new Date(fechasOrdenadas[0].fecha).getFullYear().toString(),
      BRANCH: payload.branch || 1,
      DEPT: payload.dept || 10,
      NAMEEMP: payload.emp_nombre,
      NAMECREA: payload.emp_nombre, // Asumimos que el empleado crea su propia solicitud
      NAMEAUTORIZ: payload.manager_nombre,
      ESTADO: mapVacationStatus(payload.estado),
      STARTDATE: Math.floor(new Date(fechasOrdenadas[0].fecha).getTime() / (1000 * 60 * 60 * 24)) + 25569, // Fecha serial de Excel
      NUMDIAS1: diasData[0]?.numDias || 0,
      NUMDIAS2: diasData[1]?.numDias || 0,
      NUMDIAS3: diasData[2]?.numDias || 0,
      NUMDIAS4: diasData[3]?.numDias || 0,
      FROMDATE1: diasData[0]?.fromDate || '',
      TODATE1: diasData[0]?.toDate || '',
      FROMDATE2: diasData[1]?.fromDate || '',
      TODATE2: diasData[1]?.toDate || '',
      FROMDATE3: diasData[2]?.fromDate || '',
      TODATE3: diasData[2]?.toDate || '',
      FROMDATE4: diasData[3]?.fromDate || '',
      TODATE4: diasData[3]?.toDate || ''
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
