#!/bin/bash

# Script para probar Docker localmente
set -e

echo "🧪 Probando configuración de Docker..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Limpiar contenedores existentes
log "Limpiando contenedores existentes..."
docker stop rrhh-test 2>/dev/null || true
docker rm rrhh-test 2>/dev/null || true

# Build con debug
log "Construyendo imagen de debug..."
if docker build -f Dockerfile.debug -t rrhh-debug .; then
    log "✅ Build exitoso"
else
    error "❌ Build falló"
    exit 1
fi

# Probar el contenedor
log "Iniciando contenedor en puerto 81..."
docker run -d --name rrhh-test -p 81:82 rrhh-debug

# Esperar que inicie
log "Esperando que el servicio inicie..."
sleep 5

# Probar endpoints
log "Probando endpoints..."

if curl -f http://localhost:82/health; then
    log "✅ Health check OK"
else
    warning "❌ Health check falló"
fi

if curl -f http://localhost:82/ >/dev/null; then
    log "✅ Página principal OK"
else
    warning "❌ Página principal falló"
fi

# Mostrar logs
log "📄 Logs del contenedor:"
docker logs rrhh-test

# Limpiar
log "🧹 Limpiando..."
docker stop rrhh-test
docker rm rrhh-test

log "✅ Test completado"