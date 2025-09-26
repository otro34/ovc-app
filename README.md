[![CI/CD Pipeline](https://github.com/otro34/ovc-app/actions/workflows/ci.yml/badge.svg)](https://github.com/otro34/ovc-app/actions/workflows/ci.yml)

# OV-APP - Sales Contract & Purchase Order Management System

A comprehensive sales contract and purchase order management system designed for a palm oil company. The application provides complete lifecycle management of client contracts with automatic volume tracking and purchase order processing.

## 🏢 Business Overview

OV-APP manages the complete sales process for palm oil contracts:

- **Client Contracts**: Extended time periods (months to a year) with volume commitments
- **Purchase Orders**: Individual orders linked to contracts with automatic volume tracking
- **Volume Management**: Real-time tracking of attended vs pending volumes
- **Client Management**: Complete client database with contract history

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI) v5
- **Database**: IndexedDB (Dexie.js) for local storage
- **Authentication**: JWT with localStorage
- **State Management**: Context API + useReducer
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Yup validation
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## 📋 Key Features

### Contract Management
- Unique 6-digit correlative numbering system
- Client association and volume tracking
- Automatic attended/pending volume calculations
- Contract status monitoring

### Purchase Order Processing
- Contract-linked purchase orders
- Volume validation (cannot exceed pending contract volume)
- Automatic contract volume updates
- Order cancellation with volume restoration

### Volume Control System
- Real-time volume tracking: `pendingVolume = totalVolume - attendedVolume`
- Automatic updates on order creation/cancellation
- Volume consistency validation

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ovc-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server (http://localhost:5173)
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

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── [Component]/
│       ├── index.tsx   # Component implementation
│       ├── styles.ts   # MUI styled components
│       └── types.ts    # Component-specific types
├── pages/              # Application pages/views
├── services/           # Business logic and database services
├── hooks/              # Custom React hooks
├── context/            # Context providers for state management
├── utils/              # Utility functions
├── types/              # Global TypeScript types
└── constants/          # Application constants
```

## 🗄️ Database Schema

The application uses IndexedDB (via Dexie.js) with the following entities:

- **Users**: Authentication and user management
- **Clients**: Customer information and contact details
- **Contracts**: Sales contracts linked to clients
- **Purchase Orders**: Individual orders linked to contracts

## 🔧 Business Rules

### Contracts
- Each contract must have a unique 6-digit correlative number
- Must be associated with a client
- Contains total volume and sale price
- Tracks attended volume (sum of linked purchase orders)
- Calculates pending volume automatically

### Purchase Orders
- Always linked to a parent contract
- Cannot exceed the contract's available pending volume
- Automatically updates contract volumes upon creation
- Supports cancellation with automatic volume restoration

### Volume Management Logic
```typescript
// On purchase order creation
contract.attendedVolume += order.volume

// On purchase order cancellation
contract.attendedVolume -= order.volume

// Pending volume calculation
contract.pendingVolume = contract.totalVolume - contract.attendedVolume
```

## 🧪 Testing Requirements

- **Unit Tests**: 90% coverage for critical functions
- **Component Tests**: 70% coverage minimum
- **Service Tests**: 80% coverage for business logic
- **Overall Coverage**: Minimum 70%

## 🎯 Performance Targets

- Page load time: < 2 seconds
- Responsive design for desktop and tablet
- Pagination for large datasets
- Lazy loading for route components

## 🔀 Git Workflow

### Branch Strategy
- **Main branch**: `main` (production)
- **Development**: `develop`
- **Features**: `feature/HU-XXX-description`

### Commit Convention
```bash
type(scope): description [HU-XXX] #issue

Example:
feat(contracts): implement volume validation [HU-007] #123
```

## 📈 Implementation Phases

1. **Phase 1**: Base setup and authentication
2. **Phase 2**: Client management
3. **Phase 3-4**: Contract management
4. **Phase 5**: Purchase order management
5. **Phase 6**: Dashboard and reports
6. **Phase 7**: Configuration and admin
7. **Phase 8**: Testing and optimization

## 📝 Code Conventions

- **TypeScript**: Explicit types, avoid `any`
- **React**: Functional components with hooks
- **Naming**:
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Interfaces: PascalCase with `I` prefix

## 🤝 Contributing

1. Create feature branch: `feature/HU-XXX-description`
2. Implement functionality following project conventions
3. Ensure tests pass and coverage requirements are met
4. Create pull request with detailed description
5. Request review from `otro34`

## 📄 License

MIT

---

Built with ❤️ for efficient palm oil contract management
