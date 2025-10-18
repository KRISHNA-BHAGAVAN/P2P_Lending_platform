# P2P Lending Platform API Documentation

## Overview
This is a comprehensive P2P lending platform that connects borrowers with lenders, facilitating micro-loans with automated repayment processing.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require JWT token in cookies or Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/register`
Register a new user (borrower or lender)
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "user@example.com",
  "password": "password123",
  "role": "borrower", // or "lender"
  "phone": "+12345678901"
}
```

#### POST `/login`
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/profile`
Get current user profile (requires auth)

### Loan Routes (`/api/loans`)

#### POST `/` (Borrowers only)
Create loan request
```json
{
  "amount": 5000,
  "interestRate": 12.5,
  "tenure": 24,
  "purpose": "business",
  "description": "Business expansion loan"
}
```

#### GET `/my-loans` (Borrowers only)
Get borrower's loan requests

#### GET `/marketplace` (Lenders only)
View available loans for funding
Query params: `page`, `limit`, `riskGrade`, `minAmount`, `maxAmount`

#### GET `/:id`
Get specific loan details

#### PUT `/:id` (Borrowers only)
Update loan request (pending status only)

#### DELETE `/:id` (Borrowers only)
Delete loan request (pending status only)

### Stripe Routes (`/api/stripe`)

#### POST `/create-connect-account` (Lenders only)
Create Stripe Connect account for lender onboarding

#### GET `/account/:id`
Get Stripe account status

#### POST `/create-account-link`
Create new onboarding link
```json
{
  "accountId": "acct_1234567890"
}
```

#### POST `/fund-loan/:loanId` (Lenders only)
Fund a specific loan
```json
{
  "paymentMethodId": "pm_card_visa"
}
```

#### POST `/create-payment-intent` (Lenders only)
Create payment intent for loan funding
```json
{
  "loanId": "loan_id_here"
}
```

### Repayment Routes (`/api/repayments`)

#### GET `/my-loans` (Borrowers only)
Get borrower's active loans with repayment schedules

#### GET `/loan/:loanId` (Borrowers only)
Get specific loan repayment details

#### POST `/create-payment-intent` (Borrowers only)
Create payment intent for repayment
```json
{
  "loanId": "loan_id_here"
}
```

#### POST `/confirm-payment` (Borrowers only)
Confirm successful payment
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

#### GET `/history` (Borrowers only)
Get repayment transaction history

### Dashboard Routes (`/api/dashboard`)

#### GET `/`
Get role-specific dashboard data (borrower or lender)

#### GET `/analytics`
Get analytics data
Query params: `period` (1month, 3months, 6months, 1year)

### Notification Routes (`/api/notifications`)

#### GET `/`
Get user notifications
Query params: `page`, `limit`, `unreadOnly`

#### PUT `/:id/read`
Mark notification as read

#### PUT `/mark-all-read`
Mark all notifications as read

#### DELETE `/:id`
Delete notification

#### GET `/summary`
Get notification summary by type

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error