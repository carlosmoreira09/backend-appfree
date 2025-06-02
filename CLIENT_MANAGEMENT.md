# Client Management Guide

This document provides instructions on how to use the client management functionality in the AppFree backend.

## Changing a User's Role to Admin

To change a user's role to admin, use the following command:

```bash
npm run change:role <user_email>
```

For example:

```bash
npm run change:role admin@example.com
```

## Client Management API Endpoints

### List Clients

```http
GET /api/clients
```

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)
- `search`: Search term for filtering by name
- `sortBy`: Field to sort by (name, email, createdAt)
- `sortOrder`: Sort order (ASC, DESC)
- `isActive`: Filter by active status (true, false)
- `managed`: Show only clients managed by the authenticated user (true)

Example:

```http
GET /api/clients?page=1&limit=10&search=john&sortBy=name&sortOrder=ASC&isActive=true
```

### Get Client by ID

```http
GET /api/clients/:id
```

### Register a Client with Authentication

```http
POST /api/clients/register
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "cpf": "123.456.789-00",
  "phone": "+1234567890",
  "birthday": "1990-01-01",
  "age": 35,
  "salary": 5000,
  "address": "123 Main St",
  "city": "Example City",
  "state": "EX",
  "zipCode": "12345-678",
  "complement": "Apt 101",
  "maritalStatus": "single",
  "password": "password123",
  "managerId": "manager-uuid"
}
```

Note: `password` is required for this endpoint.

### Create a Client (without requiring password)

```http
POST /api/clients
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "cpf": "123.456.789-00",
  "phone": "+1234567890",
  "birthday": "1990-01-01",
  "age": 35,
  "salary": 5000,
  "address": "123 Main St",
  "city": "Example City",
  "state": "EX",
  "zipCode": "12345-678",
  "complement": "Apt 101",
  "maritalStatus": "single",
  "password": "password123",
  "managerId": "manager-uuid"
}
```

Note: `password` is optional for this endpoint.

### Update a Client

```http
PUT /api/clients/:id
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "cpf": "123.456.789-00",
  "phone": "+1234567890",
  "birthday": "1990-01-01",
  "age": 35,
  "salary": 5000,
  "address": "123 Main St",
  "city": "Example City",
  "state": "EX",
  "zipCode": "12345-678",
  "complement": "Apt 101",
  "maritalStatus": "single",
  "isActive": true,
  "managerId": "manager-uuid"
}
```

### Deactivate a Client

```http
PATCH /api/clients/:id/deactivate
```

### Delete a Client

```http
DELETE /api/clients/:id
```

## Authentication

All client management endpoints require authentication. You need to include a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

To get a token, use the login endpoint:

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

## Role-Based Access Control

- Admin users can access all clients
- Manager users can only access clients they manage
- Client users can only access their own data
