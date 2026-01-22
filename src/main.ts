import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 👈 Aquí importamos el router

// Función para verificar si hay una nueva versión disponible
const checkForUpdates = async () => {
  try {
    // Obtener la versión actual almacenada
    const currentVersion = localStorage.getItem('app_version')
    
    // Obtener la versión del servidor (con timestamp para evitar caché)
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (response.ok) {
      const versionData = await response.json()
      const serverVersion = versionData.version
      
      // Si hay una nueva versión, recargar la página
      if (currentVersion && currentVersion !== serverVersion) {
        console.log('🔄 Nueva versión detectada. Recargando...')
        localStorage.setItem('app_version', serverVersion)
        window.location.reload()
        return
      }
      
      // Guardar la versión actual si es la primera vez
      if (!currentVersion) {
        localStorage.setItem('app_version', serverVersion)
      }
    }
  } catch (error) {
    console.warn('⚠️ No se pudo verificar la versión:', error)
  }
}

// Verificar actualizaciones al cargar la app
checkForUpdates()

// Verificar actualizaciones cada 5 minutos
setInterval(checkForUpdates, 5 * 60 * 1000)

// También verificar cuando la ventana recupera el foco
window.addEventListener('focus', checkForUpdates)

const app = createApp(App)
app.use(router) // 👈 Registramos Vue Router
app.mount('#app') // Montamos la app
