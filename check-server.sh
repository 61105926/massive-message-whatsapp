#!/bin/bash

# Script para verificar el servidor
SERVER_IP="192.168.0.123"
PORT="82"

echo "🔍 Verificando servidor $SERVER_IP:$PORT..."

# Test básico de conectividad
echo "1. Test de conectividad básica..."
if nc -z $SERVER_IP $PORT 2>/dev/null; then
    echo "✅ Puerto $PORT está abierto en $SERVER_IP"
else
    echo "❌ Puerto $PORT NO está accesible en $SERVER_IP"
fi

# Test HTTP
echo "2. Test HTTP..."
if curl -f -m 10 http://$SERVER_IP:$PORT/ 2>/dev/null; then
    echo "✅ HTTP responde correctamente"
else
    echo "❌ HTTP no responde"
fi

# Test de status endpoint
echo "3. Test de status endpoint..."
if curl -f -m 5 http://$SERVER_IP:$PORT/status 2>/dev/null; then
    echo "✅ Status endpoint responde"
else
    echo "❌ Status endpoint no responde"
fi

# Información del servidor
echo "4. Información del servidor..."
curl -I http://$SERVER_IP:$PORT/ 2>/dev/null | head -5

echo "🏁 Verificación completada"