# Seguimiento de Historias de Usuario - OV-APP

## Estado General del Proyecto
- **Inicio:** Por definir
- **Fin estimado:** 8 semanas después del inicio
- **Progreso Global:** 0%

## Leyenda de Estados
- 🔵 **Pendiente:** Historia no iniciada
- 🟡 **En Progreso:** Historia en desarrollo
- 🟢 **Completada:** Historia finalizada y en producción
- 🔴 **Bloqueada:** Historia con impedimentos
- ⚫ **Cancelada:** Historia descartada

## Tracking de Historias

### Sprint 1 - Configuración Base y Autenticación
| ID | Historia | Estado | Issue | PR | Notas |
|----|----------|--------|-------|-----|-------|
| HU-001 | Como usuario, quiero poder iniciar sesión en el sistema | 🟢 Completada | - | - | Sistema de login implementado |
| HU-002 | Como usuario, quiero poder cerrar sesión del sistema | 🟢 Completada | - | - | Sistema de logout y gestión de sesión completo |

### Sprint 2 - Gestión de Clientes
| ID | Historia | Estado | Issue | PR | Notas |
|----|----------|--------|-------|-----|-------|
| HU-003 | Como usuario, quiero poder registrar nuevos clientes | 🔵 Pendiente | - | - | |
| HU-004 | Como usuario, quiero poder ver la lista de clientes | 🔵 Pendiente | - | - | |
| HU-005 | Como usuario, quiero poder editar información de clientes | 🔵 Pendiente | - | - | |
| HU-006 | Como usuario, quiero poder eliminar clientes sin contratos | 🔵 Pendiente | - | - | |

### Sprint 3 - Gestión de Contratos (Parte 1)
| ID | Historia | Estado | Issue | PR | Notas |
|----|----------|--------|-------|-----|-------|
| HU-007 | Como usuario, quiero poder registrar nuevos contratos | 🔵 Pendiente | - | - | |
| HU-008 | Como usuario, quiero poder ver la lista de contratos | 🔵 Pendiente | - | - | |
| HU-009 | Como usuario, quiero poder ver contratos recientes | 🔵 Pendiente | - | - | |

### Sprint 4 - Gestión de Contratos (Parte 2)
| ID | Historia | Estado | Issue | PR | Notas |
|----|----------|--------|-------|-----|-------|
| HU-010 | Como usuario, quiero poder ver el detalle de un contrato | 🔵 Pendiente | - | - | |
| HU-011 | Como usuario, quiero poder editar contratos sin pedidos | 🔵 Pendiente | - | - | |

### Sprint 5 - Gestión de Pedidos de Venta
| ID | Historia | Estado | Issue | PR | Notas |
|----|----------|--------|-------|-----|-------|
| HU-012 | Como usuario, quiero poder registrar pedidos de venta | 🔵 Pendiente | - | - | |
| HU-013 | Como usuario, quiero poder ver la lista de pedidos | 🔵 Pendiente | - | - | |
| HU-014 | Como usuario, quiero ver pedidos de un contrato | 🔵 Pendiente | - | - | |
| HU-015 | Como usuario, quiero poder anular un pedido | 🔵 Pendiente | - | - | |

### Sprint 6 - Dashboard y Reportes
| ID | Historia | Estado | Issue | PR | Notas |
|----|----------|--------|-------|-----|-------|
| HU-016 | Como usuario, quiero ver dashboard con métricas | 🔵 Pendiente | - | - | |
| HU-017 | Como usuario, quiero poder exportar información | 🔵 Pendiente | - | - | |

### Sprint 7 - Configuración y Administración
| ID | Historia | Estado | Issue | PR | Notas |
|----|----------|--------|-------|-----|-------|
| HU-018 | Como admin, quiero configurar parámetros del sistema | 🔵 Pendiente | - | - | |
| HU-019 | Como admin, quiero gestionar usuarios del sistema | 🔵 Pendiente | - | - | |
| HU-020 | Como usuario, quiero poder cambiar mi contraseña | 🔵 Pendiente | - | - | |

## Métricas del Proyecto

### Por Sprint
| Sprint | Total HU | Completadas | En Progreso | Pendientes | % Completado |
|--------|----------|-------------|-------------|------------|--------------|
| Sprint 1 | 2 | 2 | 0 | 0 | 100% |
| Sprint 2 | 4 | 0 | 0 | 4 | 0% |
| Sprint 3 | 3 | 0 | 0 | 3 | 0% |
| Sprint 4 | 2 | 0 | 0 | 2 | 0% |
| Sprint 5 | 4 | 0 | 0 | 4 | 0% |
| Sprint 6 | 2 | 0 | 0 | 2 | 0% |
| Sprint 7 | 3 | 0 | 0 | 3 | 0% |
| **TOTAL** | **20** | **2** | **0** | **18** | **10%** |

### Por Épica
| Épica | Total HU | Completadas | % Completado |
|-------|----------|-------------|--------------|
| Autenticación | 2 | 2 | 100% |
| Gestión de Clientes | 4 | 0 | 0% |
| Gestión de Contratos | 5 | 0 | 0% |
| Gestión de Pedidos | 4 | 0 | 0% |
| Reportes y Dashboard | 2 | 0 | 0% |
| Configuración | 3 | 0 | 0% |

## Registro de Cambios

### Plantilla para actualización:
```markdown
**Fecha:** YYYY-MM-DD
**Historia:** HU-XXX
**Cambio:** Estado anterior → Nuevo estado
**Issue:** #XX
**PR:** #XX
**Comentarios:** Descripción del cambio
```

### Historial de Cambios

**Fecha:** 2025-01-24
**Historia:** HU-001 y HU-002
**Cambio:** 🔵 Pendiente → 🟢 Completada
**Issue:** -
**PR:** -
**Comentarios:** Implementación completa del sistema de autenticación con:
- Servicio de autenticación con persistencia en localStorage
- Gestión de sesiones con timeout automático (30 minutos)
- Hook useAuth para gestión de estado
- Componente ProtectedRoute con verificación de roles
- Componente SessionTimeout con alerta de expiración
- Tests básicos del servicio de autenticación
- Integración con IndexedDB para almacenamiento de usuarios
- Configuración de rutas protegidas en App.tsx

---

## Notas Importantes

1. **Actualización:** Este documento debe actualizarse cada vez que:
   - Se crea un issue para una historia
   - Se abre un PR para una historia
   - Se completa una historia
   - Se bloquea o cancela una historia

2. **Enlaces:** Los números de issue y PR deben ser enlaces al repositorio de GitHub

3. **Revisión:** Revisar semanalmente en la reunión de sprint

4. **Responsable:** El desarrollador asignado a cada historia es responsable de actualizar su estado