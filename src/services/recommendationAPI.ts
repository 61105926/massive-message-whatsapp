import axios from "axios";

export interface ReemplazanteRecomendado {
  ID_REEMPLAZO: string;
  REEMPLAZANTE_EMP_ID: string;
  REEMPLAZANTE_NOMBRE: string;
  CARGO: string;
  TELEFONO: string;
  TIPO: string;
}

export interface RecommendationResponse {
  empId: string;
  reemplazantes: ReemplazanteRecomendado[];
}

/**
 * Obtiene recomendaciones de reemplazantes para un empleado específico
 */
export async function getReemplazantesRecomendados(empId: string): Promise<RecommendationResponse> {
  try {
    const apiUrl = `http://190.171.225.68:8006/api/recomendar-reemplazante?empId=${empId}`;
    
    console.log('🔍 Obteniendo recomendaciones de reemplazantes:', {
      empId,
      apiUrl
    });

    const response = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000, // 10 segundos de timeout
      withCredentials: false
    });

    console.log('✅ Recomendaciones obtenidas exitosamente:', {
      empId,
      totalReemplazantes: response.data.reemplazantes?.length || 0,
      reemplazantes: response.data.reemplazantes
    });

    return response.data;

  } catch (error: any) {
    console.error('❌ Error al obtener recomendaciones de reemplazantes:', {
      empId,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    });

    throw new Error(`Error al obtener recomendaciones de reemplazantes: ${error.message}`);
  }
}
