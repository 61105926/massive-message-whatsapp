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

# Verificar que el build se completó
RUN ls -la /app/dist && echo "Build files found" || echo "ERROR: No build files found"

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine AS production

# Instalar wget para health check
RUN apk add --no-cache wget

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Verificar que los archivos se copiaron
RUN ls -la /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verificar configuración de Nginx
RUN nginx -t

# Exponer puerto 81
EXPOSE 81

# Health check usando el endpoint específico
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:81/health || exit 1

# Comando directo sin script personalizado
CMD ["nginx", "-g", "daemon off;"]