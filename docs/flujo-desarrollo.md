# Flujo de Desarrollo y Reglas del Proyecto - OV-APP

## 1. Flujo de Trabajo Git

### Estructura de Ramas
```
main (producción)
  └── develop (desarrollo)
        └── feature/HU-XXX-descripcion-corta
        └── bugfix/HU-XXX-descripcion-corta
        └── hotfix/HU-XXX-descripcion-corta
```

### Proceso de Desarrollo

1. **Inicio de una Historia de Usuario**
   - Crear issue en GitHub desde el archivo `seguimiento-historias.md`
   - Asignar el issue al desarrollador
   - Crear rama desde `develop`: `git checkout -b feature/HU-XXX-descripcion`

2. **Durante el Desarrollo**
   - Hacer commits frecuentes siguiendo Conventional Commits
   - Mantener la rama actualizada con `develop`
   - Actualizar el estado en `seguimiento-historias.md`

3. **Finalización**
   - Ejecutar pruebas locales
   - Crear Pull Request hacia `develop`
   - Solicitar code review
   - Merge después de aprobación

## 2. Reglas de Commits (Conventional Commits)

### Formato
```
<tipo>(<alcance>): <descripción> [HU-XXX] #<issue>

[cuerpo opcional]

[pie opcional]
```

### Tipos de Commits
- `feat`: Nueva funcionalidad
- `fix`: Corrección de error
- `docs`: Cambios en documentación
- `style`: Formato, sin cambios de código
- `refactor`: Refactorización de código
- `test`: Añadir o corregir tests
- `chore`: Tareas de mantenimiento
- `perf`: Mejoras de rendimiento

### Ejemplos de Commits

```bash
feat(auth): implementar pantalla de login [HU-001] #1

- Crear componente LoginForm con Material-UI
- Implementar validación de formulario
- Configurar Context de autenticación
```

```bash
fix(contracts): corregir cálculo de volumen pendiente [HU-007] #7

El volumen pendiente no se actualizaba correctamente al crear
un nuevo pedido de venta.
```

```bash
docs(readme): actualizar instrucciones de instalación [HU-000] #15
```

```bash
refactor(clients): mejorar estructura de servicios [HU-003] #3

- Separar lógica de negocio de componentes
- Crear capa de servicios independiente
- Mejorar manejo de errores
```

## 3. Reglas para Pull Requests

### Plantilla de Pull Request

```markdown
## 📋 Descripción
[Descripción clara y concisa de los cambios implementados]

## 🎯 Historia de Usuario
- **ID:** HU-XXX
- **Historia:** Como [usuario], quiero [funcionalidad] para [beneficio]
- **Issue:** #XX

## ✅ Cambios Realizados
- [ ] Implementación de [componente/funcionalidad]
- [ ] Validaciones de [datos/formularios]
- [ ] Pruebas unitarias
- [ ] Actualización de documentación

## 🧪 Cómo Probar
1. Paso para reproducir la funcionalidad
2. Datos de prueba necesarios
3. Resultado esperado

## 📸 Capturas de Pantalla
[Si aplica, incluir capturas de la interfaz]

## 🔍 Checklist
- [ ] El código sigue las convenciones del proyecto
- [ ] He realizado auto-revisión de mi código
- [ ] He agregado comentarios en áreas complejas
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests que prueban mi funcionalidad
- [ ] Tests nuevos y existentes pasan localmente
- [ ] La rama está actualizada con develop

## 📝 Notas Adicionales
[Cualquier información adicional relevante]
```

### Reglas para PR

1. **Título del PR:** `[HU-XXX] Descripción concisa del cambio`
2. **Tamaño:** Máximo 400 líneas de código modificadas
3. **Reviews:** Mínimo 1 aprobación antes de merge
4. **Tests:** Todos los tests deben pasar
5. **Conflictos:** Resolver antes de solicitar review

## 4. Gestión de Issues

### Plantilla de Issue

```markdown
## 📝 Historia de Usuario
**ID:** HU-XXX
**Como:** [tipo de usuario]
**Quiero:** [funcionalidad]
**Para:** [beneficio/objetivo]

## ✅ Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## 🔗 Dependencias
- Depende de: [HU-XXX]
- Bloquea a: [HU-YYY]

## 📋 Tareas Técnicas
- [ ] Tarea 1
- [ ] Tarea 2
- [ ] Tarea 3

## 🏷️ Labels
- `feature` / `bug` / `enhancement`
- `priority-high` / `priority-medium` / `priority-low`
- `sprint-X`

## 📎 Referencias
- Link a diseños
- Documentación relacionada
```

### Labels de Issues

| Label | Descripción | Color |
|-------|------------|--------|
| `feature` | Nueva funcionalidad | Verde |
| `bug` | Error a corregir | Rojo |
| `enhancement` | Mejora de funcionalidad existente | Azul |
| `documentation` | Mejoras en documentación | Gris |
| `priority-high` | Prioridad alta | Rojo oscuro |
| `priority-medium` | Prioridad media | Naranja |
| `priority-low` | Prioridad baja | Amarillo |
| `blocked` | Bloqueado por dependencias | Negro |
| `in-progress` | En desarrollo | Púrpura |
| `ready-for-review` | Listo para revisión | Verde claro |

## 5. Estándares de Código

### TypeScript
- Usar tipos explícitos siempre
- Evitar `any`, usar `unknown` si es necesario
- Interfaces para objetos, types para uniones
- Nombres descriptivos para variables y funciones

### React
- Componentes funcionales con hooks
- Un componente por archivo
- Props tipadas con interfaces
- Destructuring de props
- Nombres de componentes en PascalCase

### Estructura de Archivos
```
src/
├── components/       # Componentes reutilizables
│   └── [Component]/
│       ├── index.tsx
│       ├── styles.ts
│       └── types.ts
├── pages/           # Páginas/vistas
├── services/        # Lógica de negocio y API
├── hooks/           # Custom hooks
├── context/         # Context providers
├── utils/           # Funciones utilitarias
├── types/           # Tipos globales
└── constants/       # Constantes globales
```

### Naming Conventions

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `ClientForm.tsx` |
| Funciones | camelCase | `calculateVolume()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_VOLUME` |
| Interfaces | PascalCase con I | `IClient` |
| Types | PascalCase | `ClientType` |
| Archivos utils | camelCase | `dateHelpers.ts` |
| Hooks | camelCase con use | `useAuth()` |

## 6. Testing

### Tipos de Tests
1. **Unit Tests:** Para funciones y componentes aislados
2. **Integration Tests:** Para flujos completos
3. **E2E Tests:** Para flujos críticos de usuario (opcional)

### Estructura de Tests
```typescript
describe('ComponentName', () => {
  describe('when rendered', () => {
    it('should display correct content', () => {
      // test
    });
  });

  describe('when user interacts', () => {
    it('should handle click event', () => {
      // test
    });
  });
});
```

### Coverage Mínimo
- Funciones críticas: 90%
- Componentes: 70%
- Servicios: 80%
- Global: 70%

## 7. Code Review Checklist

### Para el Desarrollador (antes de crear PR)
- [ ] Código cumple con los estándares
- [ ] Sin console.log() en producción
- [ ] Sin código comentado
- [ ] Nombres descriptivos
- [ ] Sin duplicación de código
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada

### Para el Reviewer
- [ ] La implementación cumple con los requisitos
- [ ] El código es legible y mantenible
- [ ] No hay problemas de seguridad
- [ ] Los tests son apropiados
- [ ] El rendimiento es aceptable
- [ ] Sigue los patrones del proyecto
- [ ] Manejo de errores apropiado

## 8. Definición de "Done"

Una tarea se considera completada cuando:

1. ✅ Código implementado según especificaciones
2. ✅ Tests escritos y pasando
3. ✅ Code review aprobado
4. ✅ Sin errores de linting
5. ✅ Documentación actualizada
6. ✅ PR mergeado a develop
7. ✅ Issue cerrado con referencia al PR
8. ✅ Estado actualizado en `seguimiento-historias.md`

## 9. Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build           # Construir para producción
npm run preview         # Preview de producción

# Testing
npm run test            # Ejecutar tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con coverage

# Linting y Formato
npm run lint            # Ejecutar ESLint
npm run lint:fix        # Corregir errores de lint
npm run format          # Formatear con Prettier

# Git
git checkout -b feature/HU-XXX-descripcion
git add .
git commit -m "tipo(alcance): mensaje [HU-XXX] #issue"
git push origin feature/HU-XXX-descripcion
```

## 10. Recursos y Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Material Design Guidelines](https://material.io/design)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite Documentation](https://vitejs.dev/)
- [Material-UI Documentation](https://mui.com/)

---

**Última actualización:** [Fecha de creación del documento]
**Mantenido por:** Equipo de Desarrollo OV-APP