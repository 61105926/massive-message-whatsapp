#!/bin/bash

# Script para desplegar automáticamente a Coolify
set -e

echo "🚀 Iniciando despliegue a Coolify..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "package.json no encontrado. ¿Estás en el directorio correcto?"
fi

# Verificar que git está instalado y el repo está limpio
if ! command -v git &> /dev/null; then
    error "Git no está instalado"
fi

# Verificar variables de entorno necesarias
if [ -z "$COOLIFY_WEBHOOK_URL" ]; then
    warning "COOLIFY_WEBHOOK_URL no está configurada"
    echo "Por favor, configura la variable de entorno COOLIFY_WEBHOOK_URL"
    echo "Ejemplo: export COOLIFY_WEBHOOK_URL='https://tu-coolify.com/api/webhooks/deploy/tu-app-id'"
fi

# Limpiar y construir
log "Limpiando archivos anteriores..."
rm -rf dist node_modules/.cache

log "Instalando dependencias..."
npm ci

log "Ejecutando build de producción..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    error "El build falló - directorio 'dist' no encontrado"
fi

log "Build completado exitosamente"

# Construir imagen Docker localmente para verificar
log "Construyendo imagen Docker..."
docker build -t rrhh-app:latest .

log "Imagen Docker construida exitosamente"

# Hacer commit y push si hay cambios
if [[ -n $(git status --porcelain) ]]; then
    log "Detectados cambios - creando commit..."
    git add .
    git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
    git push origin main
    log "Cambios enviados a repositorio"
else
    log "No hay cambios para commitear"
fi

# Trigger webhook de Coolify si está configurado
if [ ! -z "$COOLIFY_WEBHOOK_URL" ]; then
    log "Triggering Coolify deployment..."
    if curl -X POST "$COOLIFY_WEBHOOK_URL" \
           -H "Content-Type: application/json" \
           -d "{\"branch\":\"main\",\"commit\":\"$(git rev-parse HEAD)\"}" \
           --silent --fail; then
        log "Despliegue triggered exitosamente en Coolify"
    else
        error "Falló el trigger del webhook de Coolify"
    fi
else
    warning "Webhook no configurado - despliegue manual requerido en Coolify"
fi

log "✅ Despliegue completado"
echo ""
echo "🔗 Para configurar el webhook, ve a tu panel de Coolify y copia la URL del webhook"
echo "🔗 Luego ejecuta: export COOLIFY_WEBHOOK_URL='tu-webhook-url'"