import { ref, onMounted } from 'vue'

interface VersionData {
  version: string
  buildTime: string
}

const versionData = ref<VersionData | null>(null)
const isLoading = ref(true)

export const useVersion = () => {
  const loadVersion = async () => {
    try {
      isLoading.value = true
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        versionData.value = data
      }
    } catch (error) {
      console.warn('No se pudo cargar la versión:', error)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    loadVersion()
  })

  return {
    version: versionData,
    isLoading,
    loadVersion
  }
}
