#!/bin/sh

# Script de inicio para RRHH app
echo "🚀 Iniciando aplicación RRHH..."

# Verificar que los archivos estén en su lugar
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ Error: No se encontraron los archivos de la aplicación"
    exit 1
fi

# Mostrar configuración
echo "📋 Configuración:"
echo "  - Puerto: 81"
echo "  - Archivos en: /usr/share/nginx/html"
echo "  - Configuración Nginx: /etc/nginx/conf.d/default.conf"

# Verificar configuración de Nginx
echo "🔍 Verificando configuración de Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración de Nginx válida"
else
    echo "❌ Error en configuración de Nginx"
    exit 1
fi

# Iniciar Nginx
echo "🌐 Iniciando Nginx en puerto 81..."
exec nginx -g 'daemon off;'