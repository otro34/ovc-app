# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OV-APP is a sales contract and purchase order management system for a palm oil company. The application manages:
- Client contracts with extended time periods (months to a year)
- Purchase orders linked to contracts
- Automatic volume tracking (attended/pending volumes)
- Client management

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI Framework:** Material-UI (MUI) v5
- **Database:** IndexedDB (Dexie.js) for local storage
- **Authentication:** JWT with localStorage
- **State Management:** Context API + useReducer
- **Routing:** React Router v6
- **Form Handling:** React Hook Form + Yup
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint + Prettier

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests
npm run test:watch      # Tests in watch mode
npm run test:coverage   # Tests with coverage report

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting errors
npm run format          # Format with Prettier
```

## Project Structure

```
src/
├── components/       # Reusable components
│   └── [Component]/
│       ├── index.tsx
│       ├── styles.ts
│       └── types.ts
├── pages/           # Page views
├── services/        # Business logic and DB services
├── hooks/           # Custom hooks
├── context/         # Context providers
├── utils/           # Utility functions
├── types/           # Global types
└── constants/       # Global constants
```

## Key Business Rules

1. **Contracts**: Each contract must have:
   - Unique 6-digit correlative number
   - Client association
   - Total volume and sale price
   - Attended volume (sum of linked purchase orders)
   - Pending volume (total - attended)

2. **Purchase Orders**:
   - Always linked to a contract
   - Cannot exceed contract's pending volume
   - Automatically update contract's attended/pending volumes
   - Support cancellation with volume restoration

3. **Volume Management**:
   - When creating a purchase order: contract.attendedVolume += order.volume
   - When canceling a purchase order: contract.attendedVolume -= order.volume
   - contract.pendingVolume = contract.totalVolume - contract.attendedVolume

## Database Schema (IndexedDB/Dexie)

The application uses local IndexedDB storage with these main entities:
- Users (authentication)
- Clients
- Contracts (linked to clients)
- Purchase Orders (linked to contracts)

## Git Workflow

- **Main branch:** `main` (production)
- **Development branch:** `develop`
- **Feature branches:** `feature/HU-XXX-description`
- **Commit format:** `type(scope): description [HU-XXX] #issue`

### Git Configuration
```bash
git config user.email "otro34@hotmail.com"
git config user.name "Juan Carlos Romaina"
```

## Proceso Estándar para Historias de Usuario

### Flujo completo para cada HU completada:

1. **Crear branch específico**
   ```bash
   git checkout -b feature/HU-XXX-description
   ```

2. **Implementar la funcionalidad**
   - Seguir las convenciones del proyecto
   - Mantener cobertura de tests
   - Validar que compile sin errores

3. **Commit con mensaje detallado**
   ```bash
   git add .
   git commit -m "$(cat <<'EOF'
   type(scope): descripción detallada [HU-XXX]

   - Lista de cambios implementados
   - Funcionalidades agregadas
   - Tests añadidos
   - Actualización de documentación

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Push y crear Pull Request**
   ```bash
   git push -u origin feature/HU-XXX-description
   ```

5. **Crear PR con MCP GitHub**
   - Usar `mcp__github__create_pull_request` con:
     - Título descriptivo con [HU-XXX]
     - Body detallado con resumen, funcionalidades y plan de pruebas
     - Base: `main`
     - Head: `feature/HU-XXX-description`

6. **Asignar revisores**
   - Asignar a `otro34` como revisor principal
   - Solicitar revisión de Copilot: `mcp__github__request_copilot_review`

7. **Actualizar seguimiento**
   - Actualizar `docs/seguimiento-historias.md`
   - Cambiar estado de 🔵 Pendiente → 🟢 Completada
   - Actualizar métricas de progreso
   - Agregar entrada en historial de cambios

### Template de PR Body:
```markdown
## 📋 Resumen
[Descripción de la historia de usuario implementada]

### ✨ Funcionalidades implementadas
- [Lista de características]

### 🧪 Testing y calidad
- [Tests añadidos]
- [Validaciones realizadas]

### 📊 Progreso del proyecto
- [Estado del sprint]
- [Progreso global]

## 🔧 Plan de pruebas
- [ ] [Lista de verificaciones]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Testing Requirements

- Unit tests for critical functions: 90% coverage
- Component tests: 70% coverage
- Service tests: 80% coverage
- Overall minimum: 70% coverage

## Implementation Phases

The project follows a phased implementation plan documented in `docs/plan-implementacion.md`:

1. **Phase 1:** Base setup and authentication (HU-001, HU-002)
2. **Phase 2:** Client management (HU-003 to HU-006)
3. **Phase 3:** Contract management Part 1 (HU-007 to HU-009)
4. **Phase 4:** Contract management Part 2 (HU-010, HU-011)
5. **Phase 5:** Purchase order management (HU-012 to HU-015)
6. **Phase 6:** Dashboard and reports (HU-016, HU-017)
7. **Phase 7:** Configuration and admin (HU-018 to HU-020)
8. **Phase 8:** Testing and optimization

## Code Conventions

- TypeScript: Use explicit types, avoid `any`
- React: Functional components with hooks
- Component names: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Interfaces: PascalCase with `I` prefix (e.g., `IClient`)

## Performance Requirements

- Page load time: < 2 seconds
- Responsive design for desktop and tablet
- Pagination for large datasets
- Lazy loading for routes