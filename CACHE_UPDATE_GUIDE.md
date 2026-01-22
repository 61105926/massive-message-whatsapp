# Guía de Actualización de Caché

## Problema
Cuando se despliegan cambios a producción, los usuarios pueden no ver las actualizaciones debido al caché del navegador.

## Solución Implementada

### 1. Configuración de Nginx (`nginx.conf`)
- **index.html**: Nunca se cachea (siempre obtiene la última versión)
- **Archivos con hash** (JS, CSS, imágenes): Se cachean por 1 año (porque Vite les asigna un hash único)
- **Archivos sin hash**: No se cachean

### 2. Configuración de Vite (`vite.config.ts`)
- Todos los archivos generados tienen hash único en el nombre
- Esto permite cachear agresivamente sin problemas de actualización

### 3. Sistema de Detección de Versiones
- Se genera un archivo `version.json` en cada build con un hash único
- La aplicación verifica periódicamente si hay una nueva versión:
  - Al cargar la página
  - Cada 5 minutos
  - Cuando la ventana recupera el foco
- Si detecta una nueva versión, recarga automáticamente la página

## Cómo Funciona

1. **En cada build**:
   ```bash
   npm run build
   ```
   - Se genera un nuevo `version.json` con un hash único
   - Vite genera archivos JS/CSS con hash en el nombre

2. **Cuando un usuario abre la app**:
   - La app carga `version.json` (sin caché)
   - Compara con la versión guardada en `localStorage`
   - Si hay diferencia, recarga automáticamente

3. **Durante el uso**:
   - Verifica cada 5 minutos si hay nueva versión
   - También verifica cuando la ventana recupera el foco

## Despliegue

Después de hacer cambios y desplegar:

1. Los usuarios verán automáticamente la nueva versión en máximo 5 minutos
2. Si están activos, verán la actualización cuando la ventana recupere el foco
3. Si recargan la página manualmente, verán la nueva versión inmediatamente

## Notas Importantes

- El archivo `version.json` **nunca se cachea** (configurado en nginx)
- Los archivos JS/CSS con hash se pueden cachear porque cada nueva versión tiene un nombre diferente
- El `index.html` nunca se cachea para asegurar que siempre cargue los archivos correctos

## Troubleshooting

Si los usuarios aún no ven los cambios:

1. **Verificar que el build se ejecutó correctamente**:
   ```bash
   npm run build
   ```

2. **Verificar que nginx.conf está actualizado** en el servidor

3. **Limpiar caché manualmente** (último recurso):
   - Los usuarios pueden presionar `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
   - O limpiar el caché del navegador
