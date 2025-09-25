# OVC-APP API Specification

## Overview

This document defines the REST API specification for the OVC-APP (Oil & Vegetable Company Application) - a sales contract and purchase order management system for a palm oil company.

### Base Configuration
- **Protocol**: HTTP/HTTPS
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)
- **Data Storage**: Local JSON files (file-based storage)
- **Base URL**: `http://localhost:3001/api/v1`

### Data Storage Structure

The API uses local file storage with the following structure:
```
data/
├── users.json          # User accounts and authentication
├── clients.json        # Client information
├── contracts.json      # Contract data
├── purchase-orders.json # Purchase order data
├── config.json         # Application configuration
└── backups/            # Automated backups
    ├── users_YYYY-MM-DD.json
    ├── clients_YYYY-MM-DD.json
    ├── contracts_YYYY-MM-DD.json
    └── purchase-orders_YYYY-MM-DD.json
```

### Authentication

All endpoints except `/auth/login` require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Pagination

For list endpoints that support pagination:
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Data Models

### User
```typescript
interface User {
  id?: number;
  username: string;
  password: string; // Hashed
  email?: string;
  name?: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Client
```typescript
interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Contract
```typescript
interface Contract {
  id?: number;
  correlativeNumber: string; // 6-digit unique number
  clientId: number;
  totalVolume: number;
  attendedVolume: number; // Sum of linked purchase orders
  pendingVolume: number; // totalVolume - attendedVolume
  salePrice: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Purchase Order
```typescript
interface PurchaseOrder {
  id?: number;
  contractId: number;
  volume: number;
  price: number;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'pending' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## API Endpoints

### Authentication

#### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    }
  }
}
```

#### POST /auth/logout
Logout user (invalidate token).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /auth/me
Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "name": "Administrator",
    "email": "admin@ovapp.com",
    "role": "admin"
  }
}
```

### Users

#### GET /users
Get list of users (admin only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by username or name
- `role` (string): Filter by role ('admin' | 'user')

#### POST /users
Create new user (admin only).

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "name": "New User",
  "role": "user"
}
```

#### GET /users/:id
Get user by ID (admin only).

#### PUT /users/:id
Update user (admin only).

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "name": "Updated Name",
  "role": "admin"
}
```

#### DELETE /users/:id
Delete user (admin only).

### Clients

#### GET /clients
Get list of clients.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or email
- `sortBy` ('name' | 'email' | 'createdAt'): Sort field
- `sortOrder` ('asc' | 'desc'): Sort direction

#### POST /clients
Create new client.

**Request Body:**
```json
{
  "name": "Client Company S.A.",
  "email": "contact@client.com",
  "phone": "+1234567890",
  "address": "123 Business Ave, City"
}
```

#### GET /clients/:id
Get client by ID.

#### PUT /clients/:id
Update client.

**Request Body:**
```json
{
  "name": "Updated Client Name",
  "email": "newemail@client.com",
  "phone": "+0987654321",
  "address": "456 New Address St, City"
}
```

#### DELETE /clients/:id
Delete client.

**Note:** Cannot delete client if they have active contracts.

#### GET /clients/:id/contracts
Get all contracts for a specific client.

**Query Parameters:**
- `status` (string): Filter by status ('active' | 'completed' | 'cancelled')
- `startDate` (string): Filter contracts starting after this date
- `endDate` (string): Filter contracts ending before this date

### Contracts

#### GET /contracts
Get list of contracts.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `clientId` (number): Filter by client
- `status` ('active' | 'completed' | 'cancelled'): Filter by status
- `startDate` (string): Filter by start date range
- `endDate` (string): Filter by end date range
- `correlativeNumber` (string): Search by correlative number

#### POST /contracts
Create new contract.

**Request Body:**
```json
{
  "clientId": 1,
  "totalVolume": 1000.5,
  "salePrice": 25000.00,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "correlativeNumber": "240001",
    "clientId": 1,
    "totalVolume": 1000.5,
    "attendedVolume": 0,
    "pendingVolume": 1000.5,
    "salePrice": 25000.00,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /contracts/:id
Get contract by ID.

#### PUT /contracts/:id
Update contract.

**Request Body:**
```json
{
  "totalVolume": 1200.0,
  "salePrice": 30000.00,
  "endDate": "2024-12-31T23:59:59.999Z",
  "status": "active"
}
```

#### DELETE /contracts/:id
Delete contract.

**Note:** Cannot delete contract if it has purchase orders.

#### GET /contracts/:id/purchase-orders
Get all purchase orders for a specific contract.

#### GET /contracts/stats
Get contract statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "active": 32,
    "completed": 10,
    "cancelled": 3,
    "totalVolume": 50000.5,
    "attendedVolume": 32500.2,
    "pendingVolume": 17500.3
  }
}
```

#### GET /contracts/correlative/next
Get next available correlative number.

**Response:**
```json
{
  "success": true,
  "data": {
    "nextCorrelativeNumber": "240156"
  }
}
```

### Purchase Orders

#### GET /purchase-orders
Get list of purchase orders.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `contractId` (number): Filter by contract
- `status` ('pending' | 'delivered' | 'cancelled'): Filter by status
- `orderDate` (string): Filter by order date range
- `deliveryDate` (string): Filter by delivery date range

#### POST /purchase-orders
Create new purchase order.

**Request Body:**
```json
{
  "contractId": 1,
  "volume": 250.5,
  "price": 6250.00,
  "orderDate": "2024-01-15T00:00:00.000Z",
  "deliveryDate": "2024-02-15T00:00:00.000Z",
  "notes": "Urgent delivery required"
}
```

**Business Rules:**
- Volume cannot exceed contract's pending volume
- Automatically updates contract's attended/pending volumes

#### GET /purchase-orders/:id
Get purchase order by ID.

#### PUT /purchase-orders/:id
Update purchase order.

**Request Body:**
```json
{
  "volume": 300.0,
  "price": 7500.00,
  "deliveryDate": "2024-03-01T00:00:00.000Z",
  "status": "delivered",
  "notes": "Delivered on time"
}
```

#### DELETE /purchase-orders/:id
Delete purchase order.

**Business Rules:**
- Restores volume to contract's pending volume
- Updates contract's attended volume

#### POST /purchase-orders/:id/cancel
Cancel a purchase order.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "cancelled",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Purchase order cancelled successfully"
}
```

## Error Codes

### General Errors
- `INVALID_REQUEST`: Malformed request
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `INTERNAL_ERROR`: Server error

### Authentication Errors
- `INVALID_CREDENTIALS`: Wrong username/password
- `TOKEN_EXPIRED`: JWT token expired
- `TOKEN_INVALID`: JWT token invalid

### Business Logic Errors
- `CLIENT_HAS_CONTRACTS`: Cannot delete client with active contracts
- `CONTRACT_HAS_ORDERS`: Cannot delete contract with purchase orders
- `INSUFFICIENT_VOLUME`: Purchase order volume exceeds contract's pending volume
- `CORRELATIVE_EXISTS`: Contract correlative number already exists
- `INVALID_DATE_RANGE`: Start date must be before end date

## File Storage Implementation

### File Structure
Each entity is stored in a separate JSON file with the following structure:

```json
{
  "metadata": {
    "version": "1.0",
    "lastModified": "2024-01-15T10:30:00.000Z",
    "totalRecords": 150
  },
  "data": [
    {
      "id": 1,
      "...": "entity fields"
    }
  ]
}
```

### Backup Strategy
- Automatic daily backups at midnight
- Keep backups for 30 days
- Manual backup endpoint: `POST /system/backup`

### Data Integrity
- Atomic file operations using temporary files
- File locking during write operations
- Validation before writing to disk
- Rollback capability on errors

## Performance Considerations

### Caching
- In-memory caching for frequently accessed data
- Cache invalidation on data changes
- TTL-based cache expiration

### Indexing
- Client-side indexing for search operations
- Composite indexes for complex queries
- Full-text search capabilities

### Rate Limiting
- API rate limiting: 100 requests/minute per user
- Bulk operation limits: 1000 records per request

## Security

### Data Protection
- Password hashing using bcrypt
- JWT token expiration (8 hours)
- Input validation and sanitization
- XSS protection

### File Access
- Restricted file system access
- Data directory permissions
- Backup encryption (optional)

### Audit Trail
- Log all data modifications
- User action tracking
- Failed authentication attempts logging

## Testing

### Test Data
Development and testing endpoints:

#### POST /dev/seed-data
Populate with sample data (development only).

#### DELETE /dev/reset-data
Reset all data (development only).

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": "2 days, 5 hours, 30 minutes",
    "dataFiles": {
      "users": "OK",
      "clients": "OK",
      "contracts": "OK",
      "purchaseOrders": "OK"
    }
  }
}
```

## Deployment

### Environment Variables
- `PORT`: Server port (default: 3001)
- `DATA_DIR`: Data files directory (default: ./data)
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: Environment (development/production)
- `BACKUP_ENABLED`: Enable automatic backups (true/false)
- `LOG_LEVEL`: Logging level (error/warn/info/debug)

### File Permissions
```bash
data/
├── users.json (600)
├── clients.json (644)
├── contracts.json (644)
├── purchase-orders.json (644)
└── backups/ (755)
```

This API specification provides a complete foundation for implementing a file-based backend API that matches the existing IndexedDB structure and business logic of the OVC-APP application.