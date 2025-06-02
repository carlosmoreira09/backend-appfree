# AppFree Backend

A backend application for MoneyTrack using Express.js, PostgreSQL, and TypeORM.

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- npm or yarn
- Docker and Docker Compose (optional, for containerized setup)

## Setup

### Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and update with your database credentials:
   ```bash
   cp .env .env
   ```
4. Create a PostgreSQL database named `moneytrack` (or update the DB_DATABASE in your .env file)
5. Initialize the database:
   ```bash
   npm run init:db
   ```

### Docker Setup

1. Clone the repository
2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```
3. Initialize the database (first time only):
   ```bash
   docker-compose exec app npm run init:db
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Using Docker

```bash
docker-compose up -d
```

## Database Migrations

### Generate a Migration

```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Run Migrations

```bash
npm run migration:run
```

## API Endpoints

### Health Check
- GET `/health` - Check if the server is running

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login and get authentication token
- GET `/api/auth/profile` - Get authenticated user profile (requires authentication)

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get a user by ID
- POST `/api/users` - Create a new user
- PUT `/api/users/:id` - Update a user (requires authentication)
- DELETE `/api/users/:id` - Delete a user (requires authentication)

### Categories
- GET `/api/users/:userId/categories` - Get all categories for a user (requires authentication)
- GET `/api/users/:userId/categories/:id` - Get a category by ID (requires authentication)
- POST `/api/users/:userId/categories` - Create a new category (requires authentication)
- PUT `/api/users/:userId/categories/:id` - Update a category (requires authentication)
- DELETE `/api/users/:userId/categories/:id` - Delete a category (requires authentication)

### Transactions
- GET `/api/users/:userId/transactions` - Get all transactions for a user (requires authentication)
- GET `/api/users/:userId/transactions/summary` - Get transaction summary (requires authentication)
- GET `/api/users/:userId/transactions/:id` - Get a transaction by ID (requires authentication)
- POST `/api/users/:userId/transactions` - Create a new transaction (requires authentication)
- PUT `/api/users/:userId/transactions/:id` - Update a transaction (requires authentication)
- DELETE `/api/users/:userId/transactions/:id` - Delete a transaction (requires authentication)

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints:

1. Register a user or login to get a token
2. Include the token in the Authorization header of your requests:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

## Project Structure

```
src/
├── controllers/     # Request handlers
│   ├── AuthController.ts
│   ├── UserController.ts
│   ├── CategoryController.ts
│   └── TransactionController.ts
├── entities/        # TypeORM entities
│   ├── User.ts
│   ├── Category.ts
│   └── Transaction.ts
├── middlewares/     # Express middlewares
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── migrations/      # TypeORM migrations
├── routes/          # API routes
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── category.routes.ts
│   └── transaction.routes.ts
├── scripts/         # Utility scripts
│   └── init-db.ts
├── services/        # Business logic
│   ├── AuthService.ts
│   └── DatabaseService.ts
├── data-source.ts   # TypeORM configuration
└── index.ts         # Application entry point
```

## Features

- User management with secure password hashing
- JWT authentication for protected routes
- Category management for organizing transactions
- Transaction tracking with income and expense types
- Transaction filtering by date range, type, and category
- Financial summary with income, expenses, and balance
- Expense breakdown by category
- Input validation using express-validator
- Error handling middleware
- Docker containerization for easy deployment
# backend-appfree
