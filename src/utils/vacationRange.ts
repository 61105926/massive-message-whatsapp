/**
 * Calcula el rango de vacaciones permitido para un empleado
 * según las reglas de la empresa
 */

export interface VacationRangeInput {
  fechaIngreso: string; // YYYY-MM-DD
  fechaActual: string; // YYYY-MM-DD
  saldoAcumulado: number;
  diasPorGestion?: 15 | 20 | 30; // Opcional: si no se proporciona, se calcula según antigüedad
}

export interface VacationRangeOutput {
  minimo: number;
  maximo: number;
  duodecima: number;
  saldoAcumulado: number;
  diasPorGestion: number;
}

/**
 * Calcula el rango de vacaciones de un empleado
 */
export function calcularRangoVacaciones(
  input: VacationRangeInput
): VacationRangeOutput {
  const {
    fechaIngreso,
    fechaActual,
    saldoAcumulado,
    diasPorGestion: diasPorGestionInput,
  } = input;

  const fechaIngresoDate = new Date(fechaIngreso + "T00:00:00");
  const fechaActualDate = new Date(fechaActual + "T00:00:00");
  const añosAntiguedad = calcularAntiguedad(fechaIngresoDate, fechaActualDate);

  // Calcular días por gestión según antigüedad si no se proporciona
  // 1 a 5 años: 15 días | 5 a 10 años: 20 días | Más de 10 años: 30 días
  let diasPorGestion: 15 | 20 | 30;
  if (diasPorGestionInput) {
    diasPorGestion = diasPorGestionInput;
  } else {
    if (añosAntiguedad >= 1 && añosAntiguedad < 5) {
      diasPorGestion = 15;
    } else if (añosAntiguedad >= 5 && añosAntiguedad < 10) {
      diasPorGestion = 20;
    } else if (añosAntiguedad >= 10) {
      diasPorGestion = 30;
    } else {
      diasPorGestion = 15;
    }
  }

  // Empleados con menos de 1 año de antigüedad
  if (añosAntiguedad < 1) {
    const mesIngreso = fechaIngresoDate.getMonth() + 1;
    // Contar meses desde el mes de ingreso hasta diciembre
    const mesesRestantes = 12 - mesIngreso + 1;
    const minimo = mesesRestantes; // 1 día por mes
    const maximo = 15; // Máximo 15 días para empleados nuevos

    return {
      minimo,
      maximo,
      duodecima: 0,
      saldoAcumulado,
      diasPorGestion,
    };
  }

  // Empleados con 1 año o más de antigüedad
  // Calcular la duodécima: meses desde el mes de ingreso hasta el mes actual
  // Considerando el cruce de años correctamente
  const mesIngreso = fechaIngresoDate.getMonth() + 1;
  const diaIngreso = fechaIngresoDate.getDate();
  
  const añoActual = fechaActualDate.getFullYear();
  const mesActual = fechaActualDate.getMonth() + 1;
  const diaActual = fechaActualDate.getDate();
  
  // Determinar el año de inicio de la última gestión
  const añoGestion =
    mesActual > mesIngreso || (mesActual === mesIngreso && diaActual >= diaIngreso)
      ? añoActual
      : añoActual - 1;
  
  // Calcular meses transcurridos desde la última gestión
  const mesesTranscurridos =
    (añoActual - añoGestion) * 12 +
    (mesActual - mesIngreso) +
    (diaActual >= diaIngreso ? 1 : 0);
  
  // Calcular duodécimas según días por gestión:
  // - 15 días por gestión = 1.25 días por mes (15/12)
  // - 20 días por gestión = 1.67 días por mes (20/12)
  // - 30 días por gestión = 2.5 días por mes (30/12)
  let diasPorMes: number;
  if (diasPorGestion === 15) {
    diasPorMes = 15 / 12; // 1.25 días por mes
  } else if (diasPorGestion === 20) {
    diasPorMes = 20 / 12; // 1.67 días por mes
  } else {
    diasPorMes = 30 / 12; // 2.5 días por mes
  }
  
  const duodecima = Math.max(0, mesesTranscurridos * diasPorMes); // Días proporcionales según gestión, nunca negativo

  // Calcular mínimo según saldo acumulado
  // Si saldo >= 60: mínimo = 60 + duodécima
  // Si saldo < 60: mínimo = saldo acumulado (sin sumar duodécima)
  let minimo: number;
  if (saldoAcumulado >= 60) {
    minimo = 60 + duodecima;
  } else {
    minimo = saldoAcumulado;
  }

  // El máximo es el saldo acumulado + duodécimas disponibles
  const maximo = Math.max(saldoAcumulado + duodecima, minimo);

  return {
    minimo,
    maximo,
    duodecima,
    saldoAcumulado,
    diasPorGestion,
  };
}

/**
 * Calcula la antigüedad en años entre dos fechas
 */
function calcularAntiguedad(fechaIngreso: Date, fechaActual: Date): number {
  const diffTime = fechaActual.getTime() - fechaIngreso.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays / 365.25; // Considerar años bisiestos
}
