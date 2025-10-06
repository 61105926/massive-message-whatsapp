// Configuración de la API
export const API_CONFIG = {
  // URL base del backend (bot de WhatsApp)
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3005',

  // URL base para APIs externas
  EXTERNAL_API_URL: import.meta.env.VITE_EXTERNAL_API_URL || 'http://localhost',

  // Endpoints principales
  ENDPOINTS: {
    // Dashboard
    DASHBOARD: '/admin/dashboard',

    // Gestión de meses
    ENABLE_MONTH: '/admin/enable-latest-month',
    DISABLE_MONTH: '/admin/disable-current-month',

    // Boletas masivas
    BULK_PAYSLIPS: '/sendPayslipLinks',  // ✅ Corregido

    // Mensajes masivos
    BULK_MESSAGES: '/sendRegionalMessages',  // ✅ Corregido

    // Regionales
    REGIONALES: '/regionales',

    // Control de cola
    PROGRESS: '/progress',
    PAUSE: '/pause',
    RESUME: '/resume',
    CANCEL: '/cancel',
    RESET: '/reset',

    // Logs
    PAYSLIP_LOGS: '/logs/payslips',
    MESSAGE_LOGS: '/logs/bulk-messages',

    // Estado del sistema
    STATUS: '/status',

    // APIs externas
    SURVEY_API: '/api/survey'
  }
}

// Helper function para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function para construir URLs externas
export const buildExternalApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.EXTERNAL_API_URL}${endpoint}`
}

// Helper function para hacer requests con manejo de errores
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint)

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Helper para requests con FormData
export const apiFormRequest = async (endpoint: string, formData: FormData, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint)

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API form request failed:', error)
    throw error
  }
}