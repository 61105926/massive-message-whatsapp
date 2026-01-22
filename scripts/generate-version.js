import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Generar un hash único basado en la fecha y hora actual
const version = Date.now().toString(36) + Math.random().toString(36).substring(2, 11)
const versionFile = resolve(__dirname, '../public/version.json')

const versionData = {
  version,
  buildTime: new Date().toISOString(),
}

writeFileSync(versionFile, JSON.stringify(versionData, null, 2))
console.log(`✅ Versión generada: ${version}`)
