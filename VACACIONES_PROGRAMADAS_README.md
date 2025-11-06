# Vacaciones Programadas 2026

## Acceso a la Funcionalidad

Para acceder a la vista de vacaciones programadas, navega a:

```
http://localhost:5173/vacaciones/programadas
```

## Características Implementadas

### 1. Vista del Calendario 2026

- **Calendario Anual**: Muestra los 12 meses del año 2026
- **Navegación Mensual**: Botones para navegar entre meses
- **Año Adelantado**: Siempre muestra el año siguiente (2026 en 2025)

### 2. Selección de Días

- **Click para Seleccionar**: Haz click en cualquier día disponible para seleccionarlo
- **Indicadores Visuales**:
  - 🔵 Azul: Tus días seleccionados
  - 🟠 Naranja: Días con vacaciones de colegas
  - 🔴 Rojo claro: Fines de semana
  - 🟣 Púrpura: Feriados nacionales

### 3. Restricciones

- ❌ No se pueden seleccionar domingos
- ❌ No se pueden seleccionar feriados nacionales
- ✅ Se pueden seleccionar sábados y días laborables

### 4. Visualización de Colegas

- **Lista de Colegas de Vacaciones**: Muestra quiénes están de vacaciones cada mes
- **Contador en el Calendario**: Número de colegas de vacaciones por día
- **Tooltip Informativo**: Al pasar el mouse, muestra detalles de quiénes están de vacaciones
- **Filtro por Área**: Permite filtrar las vacaciones por departamento

### 5. Resumen de Selección

- **Contador de Días**: Total de días seleccionados
- **Lista de Días**: Fechas seleccionadas en formato legible
- **Estadísticas**: Primer día, último día y total
- **Botón de Envío**: Para enviar la programación
- **Botón de Limpiar**: Para reiniciar la selección

### 6. Estadísticas en el Header

- **Mis Días Seleccionados**: Contador grande de días programados
- **Selector de Mes**: Dropdown para cambiar de mes rápidamente
- **Filtro por Área**: Dropdown para filtrar vacaciones por departamento

## Integración con Permisos del Admin

La vista verifica automáticamente si las vacaciones programadas están habilitadas:

```typescript
const checkScheduledVacationsEnabled = async () => {
  const response = await fetch('http://localhost:3005/vacation-config')
  const config = await response.json()
  scheduledVacationsEnabled.value = config.scheduledVacationsEnabled
}
```

Si no están habilitadas, se muestra un mensaje informativo con un botón para volver.

## Estructura de Archivos

```
massive-message-whatsapp/
├── src/
│   ├── components/
│   │   └── vacation/
│   │       └── ScheduledVacationCalendar.vue  (Componente del calendario)
│   ├── views/
│   │   └── screens/
│   │       └── vacaciones/
│   │           └── ScheduledVacation.vue      (Vista principal)
│   └── router/
│       └── index.ts                            (Ruta agregada)
```

## Próximos Pasos (Backend)

Para completar la funcionalidad, se necesita implementar en el backend:

### 1. Endpoint de Configuración
```javascript
GET /vacation-config
// Retorna: { scheduledVacationsEnabled: boolean }
```

### 2. Endpoint para Guardar Programación
```javascript
POST /api/scheduled-vacations
Body: {
  employeeId: string,
  year: number,
  dates: string[] // Array de fechas ISO
}
```

### 3. Endpoint para Obtener Vacaciones de Colegas
```javascript
GET /api/scheduled-vacations/colleagues?year=2026&department=Distribución
// Retorna: Array de vacaciones de colegas
```

### 4. Endpoint para Feriados
```javascript
GET /api/holidays?year=2026&country=BO
// Retorna: Array de feriados nacionales
```

## Uso del Componente

Puedes usar el componente `ScheduledVacationCalendar` en cualquier vista:

```vue
<template>
  <ScheduledVacationCalendar @submit="handleSubmit" />
</template>

<script setup>
import ScheduledVacationCalendar from '@/components/vacation/ScheduledVacationCalendar.vue'

const handleSubmit = (dates) => {
  console.log('Fechas seleccionadas:', dates)
  // Lógica para guardar
}
</script>
```

## Estilos y Diseño

- ✨ Diseño moderno con gradientes
- 📱 Completamente responsive
- 🎨 Colores coherentes con el sistema
- 💫 Animaciones suaves
- 🖱️ Tooltips informativos
- ⚡ Interacciones fluidas

## Testing

Para probar la funcionalidad:

1. Inicia el servidor de desarrollo:
   ```bash
   cd massive-message-whatsapp
   npm run dev
   ```

2. Navega a: `http://localhost:5173/vacaciones/programadas`

3. Selecciona días en el calendario

4. Verifica el resumen y envía la programación

## Notas Importantes

- Los datos de colegas actualmente son simulados
- Los feriados incluyen algunos ejemplos de Bolivia
- La integración con la API está preparada pero comentada
- Se recomienda agregar autenticación para identificar al usuario actual
