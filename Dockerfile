# Dockerfile para aplicación Vue.js con RRHH
# Multi-stage build para optimizar el tamaño final

# Etapa 1: Build de la aplicación
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (necesarias para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Verificar que el build se completó correctamente
RUN ls -la /app/dist && echo "Build files found:" && ls -la /app/dist/ || echo "ERROR: No build files found"

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine AS production

# Instalar wget para health check
RUN apk add --no-cache wget

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Verificar que los archivos se copiaron correctamente
RUN ls -la /usr/share/nginx/html && echo "Files copied successfully:" && ls -la /usr/share/nginx/html/

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar y configurar health check
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Verificar configuración de Nginx
RUN nginx -t

# Exponer puerto 82
EXPOSE 82

# Health check para monitoreo
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Comando directo sin script personalizado
CMD ["nginx", "-g", "daemon off;"]