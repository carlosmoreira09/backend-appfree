# Client Access Functionality

This document provides information about the client access functionality in the AppFree backend.

## Overview

The client access functionality allows clients to:

1. Login to their account
2. Register and manage their monthly salary
3. Set budget limits (percentage or fixed amount)
4. Track daily transactions
5. View remaining balance

## Database Schema

The functionality is built on two main entities:

1. **MonthlyBudget**: Stores the client's monthly budget information
   - Monthly salary
   - Budget amount (percentage or fixed)
   - Daily budget (calculated)
   - Remaining balance

2. **DailyTransaction**: Stores the client's daily transactions
   - Transaction details (description, amount, type)
   - Date
   - Remaining balance after transaction
   - Category (optional)

## API Endpoints

### Authentication

```http
POST /api/auth/login
```

Request body:
```json
{
  "email": "client@example.com",
  "password": "client123"
}
```

### Monthly Budget Management

#### Get All Monthly Budgets

```http
GET /api/monthly-budgets
```

#### Get Monthly Budget by ID

```http
GET /api/monthly-budgets/:id
```

#### Get or Create Monthly Budget for Year and Month

```http
GET /api/monthly-budgets/year/:year/month/:month
```

#### Update Monthly Salary

```http
PATCH /api/monthly-budgets/:id/salary
```

Request body:
```json
{
  "monthlySalary": 5000
}
```

#### Update Budget Amount

```http
PATCH /api/monthly-budgets/:id/budget
```

Request body:
```json
{
  "budgetAmount": 3000,
  "isPercentage": false
}
```

or for percentage:

```json
{
  "budgetAmount": 60,
  "isPercentage": true
}
```

### Daily Transaction Management

#### Get All Daily Transactions

```http
GET /api/daily-transactions
```

#### Get Daily Transactions by Date

```http
GET /api/daily-transactions/date/:date
```

Example:
```
GET /api/daily-transactions/date/2025-06-01
```

#### Get Daily Transactions by Month

```http
GET /api/daily-transactions/year/:year/month/:month
```

Example:
```
GET /api/daily-transactions/year/2025/month/6
```

#### Get Daily Transaction by ID

```http
GET /api/daily-transactions/:id
```

#### Create Daily Transaction

```http
POST /api/daily-transactions
```

Request body:
```json
{
  "description": "Lunch",
  "amount": 15,
  "type": "expense",
  "date": "2025-06-01",
  "categoryId": "category-uuid"
}
```

#### Update Daily Transaction

```http
PUT /api/daily-transactions/:id
```

Request body:
```json
{
  "description": "Dinner",
  "amount": 25,
  "type": "expense",
  "date": "2025-06-01",
  "categoryId": "category-uuid"
}
```

#### Delete Daily Transaction

```http
DELETE /api/daily-transactions/:id
```

#### Get Daily Transactions Sum by Date

```http
GET /api/daily-transactions/sum/date/:date
```

#### Get Daily Transactions Sum by Month

```http
GET /api/daily-transactions/sum/year/:year/month/:month
```

## Workflow

1. **Client Login**: Client logs in using their email and password
2. **Monthly Budget Setup**: 
   - Client sets their monthly salary
   - Client sets budget amount (percentage or fixed)
   - System calculates daily budget (budget amount / days in month)
3. **Daily Transactions**:
   - Client records transactions throughout the day
   - System updates remaining balance after each transaction
   - Client can view transactions by day or month
4. **Budget Tracking**:
   - Client can see remaining balance
   - Client can navigate between days to view transactions

## Automatic Calculations

- **Daily Budget**: When a client sets a budget amount, the system automatically calculates the daily budget by dividing the budget amount by the number of days in the month.
- **Remaining Balance**: The system updates the remaining balance after each transaction.

## Example Usage

1. Client logs in with their credentials
2. Client sets their monthly salary to $5000
3. Client sets budget to 60% of their salary ($3000)
4. System calculates daily budget ($3000 / 30 days = $100 per day)
5. Client records a transaction (lunch for $15)
6. System updates remaining balance ($3000 - $15 = $2985)
7. Client can view all transactions for the day
8. Client can navigate to different days to view or add transactions
