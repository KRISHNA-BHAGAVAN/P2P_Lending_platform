# P2P Lending Platform - Frontend

## Overview
React.js frontend for the P2P Lending Platform with role-based dashboards and real-time notifications.

## Features

### Borrower Dashboard
- **Loan Overview**: Active loans, pending requests, completed loans
- **Payment Tracking**: Upcoming payments with due dates and amounts
- **Repayment History**: Transaction history and payment status
- **Financial Stats**: Total borrowed, repaid, outstanding balance
- **Progress Indicators**: Visual loan completion progress

### Lender Dashboard  
- **Investment Portfolio**: Active and completed investments
- **Expected Returns**: Upcoming payments from borrowers
- **Performance Metrics**: ROI, total earned, average returns
- **Investment Tracking**: Borrower details and credit scores
- **Payment History**: Received payments and platform fees

### Notification System
- **Real-time Notifications**: In-app notification center
- **Priority Levels**: Urgent, high, medium, low priority alerts
- **Notification Types**: 
  - Loan funded confirmations
  - Payment due reminders  
  - Payment received alerts
  - Overdue payment warnings
  - Loan completion notices
- **Management**: Mark as read, delete, filter options

## Tech Stack
- **React 19** - Frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling and responsive design
- **Axios** - HTTP client for API calls
- **Context API** - State management
- **Stripe Elements** - Payment processing (future integration)

## Getting Started

### Prerequisites
- Node.js 18+
- Backend server running on http://localhost:5000

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
Access the app at http://localhost:5173

### Build for Production
```bash
npm run build
```

## Project Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── loans/          # Loan management components
│   └── notifications/  # Notification components
├── context/            # React Context providers
├── utils/              # API utilities and helpers
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

## API Integration
The frontend communicates with the backend API through:
- **Authentication**: Login, register, logout
- **Dashboard Data**: Role-specific dashboard information
- **Notifications**: Real-time notification management
- **Loans**: Loan creation, marketplace, repayments
- **Stripe**: Payment processing integration

## Authentication Flow
1. User logs in with email/password
2. JWT token stored in HTTP-only cookies
3. Protected routes check authentication status
4. Role-based dashboard rendering (borrower/lender)
5. Automatic token refresh and logout handling

## Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Responsive grid layouts
- **Desktop**: Full-featured dashboard experience
- **Accessibility**: WCAG compliant components

## Environment Variables
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Testing
```bash
npm run test
```

## Deployment
The frontend can be deployed to:
- Vercel
- Netlify  
- AWS S3 + CloudFront
- Any static hosting service

## Future Enhancements
- Real-time WebSocket notifications
- Advanced analytics and charts
- Mobile app (React Native)
- Progressive Web App (PWA) features
- Multi-language support