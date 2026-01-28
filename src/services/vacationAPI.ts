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
  antiguedad?: string; // Años de antigüedad del empleado (ej: "2")
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
    const backendUrl = 'http://190.171.225.68:8006/api/vacaciones/add-vacation';
    
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

    // Agrupar días consecutivos o con máximo 1 día de diferencia del mismo tipo en rangos (máximo 4 rangos)
    const rangos: Array<{
      numDias: number;
      fromDate: string;
      toDate: string;
      tipo: string;
    }> = [];

    if (fechasOrdenadas.length > 0) {
      let rangoActual: {
        tipo: string;
        fechas: string[];
        numDias: number;
      } | null = null;

      for (const dia of fechasOrdenadas) {
        const tipo = dia.tipo_dia || 'COMPLETO';
        const fecha = dia.fecha;
        
        // Verificar si es día consecutivo o con máximo 1 día de diferencia del mismo tipo
        const puedeAgruparse = rangoActual && rangoActual.tipo === tipo && (() => {
          const ultimaFecha = rangoActual!.fechas[rangoActual!.fechas.length - 1];
          // Convertir ambas fechas a Date para comparar
          const fechaUltima = new Date(ultimaFecha + 'T12:00:00');
          const fechaActual = new Date(fecha + 'T12:00:00');
          
          // Calcular diferencia en días
          const diffTime = fechaActual.getTime() - fechaUltima.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Permitir agrupar si es consecutivo (diffDays = 1) o con máximo 1 día de diferencia (diffDays = 2)
          return diffDays >= 1 && diffDays <= 2;
        })();

        if (puedeAgruparse && rangoActual) {
          // Agregar al rango actual
          rangoActual.fechas.push(fecha);
          rangoActual.numDias += getDaysForType(tipo);
        } else {
          // Guardar rango anterior si existe
          if (rangoActual) {
            rangos.push({
              numDias: rangoActual.numDias,
              fromDate: formatDateForAPI(rangoActual.fechas[0]),
              toDate: formatDateForAPI(rangoActual.fechas[rangoActual.fechas.length - 1]),
              tipo: rangoActual.tipo
            });
          }
          
          // Iniciar nuevo rango
          rangoActual = {
            tipo,
            fechas: [fecha],
            numDias: getDaysForType(tipo)
          };
        }
      }

      // Guardar último rango
      if (rangoActual) {
        rangos.push({
          numDias: rangoActual.numDias,
          fromDate: formatDateForAPI(rangoActual.fechas[0]),
          toDate: formatDateForAPI(rangoActual.fechas[rangoActual.fechas.length - 1]),
          tipo: rangoActual.tipo
        });
      }
    }

    // Si hay más de 4 rangos, agrupar todos los días COMPLETO en un solo rango
    // Si aún hay más de 4, también agrupar TARDE y MAÑANA
    const seAgruparonRangos = rangos.length > 4;
    if (seAgruparonRangos) {
      const rangosCompletos = rangos.filter(r => r.tipo === 'COMPLETO');
      const rangosTarde = rangos.filter(r => r.tipo === 'TARDE');
      const rangosManana = rangos.filter(r => r.tipo === 'MAÑANA');
      const otrosRangos = rangos.filter(r => r.tipo !== 'COMPLETO' && r.tipo !== 'TARDE' && r.tipo !== 'MAÑANA');
      
      const nuevosRangos: typeof rangos = [];
      
      // Agrupar MAÑANA si hay más de uno
      if (rangosManana.length > 0) {
        if (rangosManana.length === 1) {
          nuevosRangos.push(rangosManana[0]);
        } else {
          const fechasManana = fechasOrdenadas
            .filter(dia => (dia.tipo_dia || 'COMPLETO') === 'MAÑANA')
            .map(dia => dia.fecha)
            .sort();
          const totalDiasManana = rangosManana.reduce((sum, r) => sum + r.numDias, 0);
          nuevosRangos.push({
            numDias: totalDiasManana,
            fromDate: formatDateForAPI(fechasManana[0]),
            toDate: formatDateForAPI(fechasManana[fechasManana.length - 1]),
            tipo: 'MAÑANA'
          });
        }
      }
      
      // Agrupar TARDE si hay más de uno
      if (rangosTarde.length > 0) {
        if (rangosTarde.length === 1) {
          nuevosRangos.push(rangosTarde[0]);
        } else {
          const fechasTarde = fechasOrdenadas
            .filter(dia => (dia.tipo_dia || 'COMPLETO') === 'TARDE')
            .map(dia => dia.fecha)
            .sort();
          const totalDiasTarde = rangosTarde.reduce((sum, r) => sum + r.numDias, 0);
          nuevosRangos.push({
            numDias: totalDiasTarde,
            fromDate: formatDateForAPI(fechasTarde[0]),
            toDate: formatDateForAPI(fechasTarde[fechasTarde.length - 1]),
            tipo: 'TARDE'
          });
        }
      }
      
      // Agrupar COMPLETO si hay más de uno
      if (rangosCompletos.length > 0) {
        const fechasCompletas = fechasOrdenadas
          .filter(dia => (dia.tipo_dia || 'COMPLETO') === 'COMPLETO')
          .map(dia => dia.fecha)
          .sort();
        const totalDiasCompletos = rangosCompletos.reduce((sum, r) => sum + r.numDias, 0);
        nuevosRangos.push({
          numDias: totalDiasCompletos,
          fromDate: formatDateForAPI(fechasCompletas[0]),
          toDate: formatDateForAPI(fechasCompletas[fechasCompletas.length - 1]),
          tipo: 'COMPLETO'
        });
      }
      
      // Agregar otros rangos
      nuevosRangos.push(...otrosRangos);
      
      // Reemplazar rangos
      rangos.length = 0;
      rangos.push(...nuevosRangos);
    }

    // Preparar datos de rangos (máximo 4 rangos)
    const diasData = rangos.slice(0, 4).map(r => ({
      numDias: r.numDias,
      fromDate: r.fromDate,
      toDate: r.toDate
    }));

    // Generar detalle de todas las fechas para el comentario
    const detalleFechas = fechasOrdenadas
      .map(dia => {
        const fechaFormateada = formatDateForAPI(dia.fecha);
        const tipo = dia.tipo_dia || 'COMPLETO';
        const tipoTexto = tipo === 'MAÑANA' ? 'MAÑANA' : tipo === 'TARDE' ? 'TARDE' : 'COMPLETO';
        return `${fechaFormateada}: ${tipoTexto}`;
      })
      .join(', ');

    // Construir comentario con el detalle de fechas
    const comentarioCompleto = payload.comentario 
      ? `${payload.comentario}, ${detalleFechas}`
      : detalleFechas;

    // Construir objeto de datos para la API externa
    const vacationAPIData = {
      FECHA: `${fechaActual} 0:00:00.0`,
      HORA: horaActual || 0,
      EMPID: parseInt(payload.emp_id),
      COMMENT: comentarioCompleto,
      AUTOR: '0', // default
      FROMDATE: `${fechaInicio} 0:00:00.0`,
      TODATE: `${fechaFin} 0:00:00.0`,
      NUMDIAS: totalDays,
      TIPO: 'V',
      AUTORIZA: payload.manager_id || 0, // ID del manager que aprobó
      // Usar los años de antigüedad del empleado (vacation.years) en lugar del año de la fecha
      ANIO: payload.antiguedad || (() => {
        // Fallback: calcular desde la fecha si no se proporciona antigüedad
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
      NUMDIAS1: seAgruparonRangos ? 0 : (diasData[0]?.numDias || 0),
      NUMDIAS2: seAgruparonRangos ? 0 : (diasData[1]?.numDias || 0),
      NUMDIAS3: seAgruparonRangos ? 0 : (diasData[2]?.numDias || 0),
      NUMDIAS4: seAgruparonRangos ? 0 : (diasData[3]?.numDias || 0),
      FROMDATE1: seAgruparonRangos ? null : (diasData[0]?.fromDate ? `${diasData[0].fromDate} 0:00:00.0` : null),
      TODATE1: seAgruparonRangos ? null : (diasData[0]?.toDate ? `${diasData[0].toDate} 0:00:00.0` : null),
      FROMDATE2: seAgruparonRangos ? null : (diasData[1]?.fromDate ? `${diasData[1].fromDate} 0:00:00.0` : null),
      TODATE2: seAgruparonRangos ? null : (diasData[1]?.toDate ? `${diasData[1].toDate} 0:00:00.0` : null),
      FROMDATE3: seAgruparonRangos ? null : (diasData[2]?.fromDate ? `${diasData[2].fromDate} 0:00:00.0` : null),
      TODATE3: seAgruparonRangos ? null : (diasData[2]?.toDate ? `${diasData[2].toDate} 0:00:00.0` : null),
      FROMDATE4: seAgruparonRangos ? null : (diasData[3]?.fromDate ? `${diasData[3].fromDate} 0:00:00.0` : null),
      TODATE4: seAgruparonRangos ? null : (diasData[3]?.toDate ? `${diasData[3].toDate} 0:00:00.0` : null)
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
      backendUrl: 'http://190.171.225.68:8006/api/vacaciones/add-vacation',
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      code: error.code
    });

    throw new Error(`Error al guardar vacación en la API externa: ${error.message}`);
  }
}
