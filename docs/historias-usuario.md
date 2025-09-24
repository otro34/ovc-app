# Historias de Usuario - OV-APP

## Épica 1: Gestión de Autenticación
### HU-001: Como usuario, quiero poder iniciar sesión en el sistema
**Criterios de aceptación:**
- El sistema debe mostrar una pantalla de inicio de sesión
- Debo poder ingresar mi usuario y contraseña
- Al autenticarme correctamente, debo ser redirigido al dashboard principal
- Si las credenciales son incorrectas, debe mostrar un mensaje de error
- La sesión debe mantenerse activa hasta que cierre sesión

### HU-002: Como usuario, quiero poder cerrar sesión del sistema
**Criterios de aceptación:**
- Debe existir una opción visible para cerrar sesión
- Al cerrar sesión, debo ser redirigido a la pantalla de login
- La sesión debe invalidarse completamente

## Épica 2: Gestión de Clientes
### HU-003: Como usuario, quiero poder registrar nuevos clientes
**Criterios de aceptación:**
- Poder ingresar datos del cliente: nombre, RUC/DNI, dirección, teléfono, email
- Validar que los campos obligatorios estén completos
- Validar formato de email y RUC/DNI
- Mostrar mensaje de confirmación al registrar exitosamente

### HU-004: Como usuario, quiero poder ver la lista de clientes
**Criterios de aceptación:**
- Ver tabla con todos los clientes registrados
- Mostrar información básica: nombre, RUC/DNI, teléfono
- Incluir opción de búsqueda por nombre o RUC/DNI
- Poder ordenar por nombre alfabéticamente

### HU-005: Como usuario, quiero poder editar información de clientes
**Criterios de aceptación:**
- Poder seleccionar un cliente de la lista para editar
- Modificar cualquier campo del cliente
- Validar los datos antes de guardar
- Mostrar confirmación de actualización exitosa

### HU-006: Como usuario, quiero poder eliminar clientes sin contratos asociados
**Criterios de aceptación:**
- Opción de eliminar solo disponible si el cliente no tiene contratos
- Solicitar confirmación antes de eliminar
- Mostrar mensaje de éxito al eliminar

## Épica 3: Gestión de Contratos
### HU-007: Como usuario, quiero poder registrar nuevos contratos
**Criterios de aceptación:**
- Poder seleccionar un cliente existente
- Ingresar: fecha de cierre, periodo de cierre (mes/año), volumen de ventas, precio total, base de materia prima
- El número de contrato debe generarse automáticamente (correlativo de 6 dígitos)
- Inicializar volumen atendido en 0 y volumen por atender igual al volumen total
- Validar que todos los campos requeridos estén completos

### HU-008: Como usuario, quiero poder ver la lista de contratos
**Criterios de aceptación:**
- Ver tabla con todos los contratos registrados
- Mostrar: número de contrato, cliente, fecha de cierre, volumen total, volumen atendido, volumen por atender
- Incluir filtros por: cliente, periodo de cierre, estado (activo/completado)
- Poder ordenar por fecha de cierre o número de contrato

### HU-009: Como usuario, quiero poder ver contratos recientemente firmados
**Criterios de aceptación:**
- Dashboard con vista de contratos de los últimos 30 días
- Mostrar información resumida del contrato
- Indicador visual para contratos nuevos (últimos 7 días)
- Acceso rápido al detalle del contrato

### HU-010: Como usuario, quiero poder ver el detalle de un contrato
**Criterios de aceptación:**
- Ver toda la información del contrato
- Ver lista de pedidos de venta asociados
- Ver porcentaje de cumplimiento (volumen atendido/volumen total)
- Ver estado del contrato (activo/completado)

### HU-011: Como usuario, quiero poder editar contratos sin pedidos asociados
**Criterios de aceptación:**
- Solo permitir edición si no hay pedidos de venta registrados
- Poder modificar todos los campos excepto el número de contrato
- Validar datos antes de guardar
- Mostrar confirmación de actualización

## Épica 4: Gestión de Pedidos de Venta
### HU-012: Como usuario, quiero poder registrar pedidos de venta
**Criterios de aceptación:**
- Seleccionar un contrato activo (con volumen por atender > 0)
- Ingresar fecha de pedido y volumen de pedido
- Validar que el volumen no exceda el volumen por atender del contrato
- Al guardar, actualizar automáticamente el volumen atendido y por atender del contrato
- Mostrar confirmación de registro exitoso

### HU-013: Como usuario, quiero poder ver la lista de pedidos de venta
**Criterios de aceptación:**
- Ver tabla con todos los pedidos registrados
- Mostrar: número de pedido, contrato asociado, cliente, fecha, volumen
- Filtrar por: contrato, cliente, rango de fechas
- Ordenar por fecha o número de pedido

### HU-014: Como usuario, quiero poder ver pedidos de venta de un contrato
**Criterios de aceptación:**
- Desde el detalle del contrato, ver todos sus pedidos
- Mostrar información completa de cada pedido
- Ver el total acumulado de volumen atendido
- Ordenar pedidos por fecha

### HU-015: Como usuario, quiero poder anular un pedido de venta
**Criterios de aceptación:**
- Opción de anular pedido con justificación
- Al anular, revertir el volumen en el contrato (restar del atendido, sumar al por atender)
- Mantener registro del pedido como anulado
- No permitir edición de pedidos anulados

## Épica 5: Reportes y Dashboard
### HU-016: Como usuario, quiero ver un dashboard con métricas principales
**Criterios de aceptación:**
- Ver total de contratos activos
- Ver volumen total comprometido vs volumen atendido
- Ver contratos próximos a vencer (próximos 30 días)
- Ver pedidos recientes (últimos 7 días)
- Gráficos de evolución mensual de ventas

### HU-017: Como usuario, quiero poder exportar información
**Criterios de aceptación:**
- Exportar lista de contratos a Excel/CSV
- Exportar lista de pedidos a Excel/CSV
- Exportar reporte de cumplimiento de contratos
- Incluir filtros aplicados en la exportación

## Épica 6: Configuración del Sistema
### HU-018: Como administrador, quiero configurar parámetros del sistema
**Criterios de aceptación:**
- Configurar formato de número de contrato
- Configurar tipos de base de materia prima disponibles
- Configurar periodos de cierre permitidos
- Configurar unidades de medida para volumen

### HU-019: Como administrador, quiero gestionar usuarios del sistema
**Criterios de aceptación:**
- Crear nuevos usuarios con credenciales
- Asignar roles (administrador/operador)
- Activar/desactivar usuarios
- Resetear contraseñas

### HU-020: Como usuario, quiero poder cambiar mi contraseña
**Criterios de aceptación:**
- Opción en el perfil de usuario
- Validar contraseña actual
- Validar nueva contraseña (requisitos de seguridad)
- Confirmar nueva contraseña
- Cerrar sesión automáticamente tras el cambio