#!/bin/sh
# Health check script para verificar que la aplicación está funcionando

# Verificar que nginx está corriendo
if ! pgrep nginx > /dev/null; then
    echo "ERROR: Nginx no está corriendo"
    exit 1
fi

# Verificar que los archivos están en su lugar
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "ERROR: index.html no encontrado"
    exit 1
fi

# Verificar que la aplicación responde
if ! wget -q --spider http://localhost:82/; then
    echo "ERROR: La aplicación no responde en puerto 82"
    exit 1
fi

echo "OK: Aplicación funcionando correctamente"
exit 0