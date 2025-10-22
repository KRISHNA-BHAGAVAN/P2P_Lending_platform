# 💰 P2P Lending Platform

A full-stack peer-to-peer lending platform built with React, Node.js, MongoDB, and Stripe integration.

## 🚀 Features

### 👤 User Management
- **Role-based Authentication** (Borrower/Lender)
- **Email Verification** with 6-digit codes
- **Profile Management** with photo uploads
- **JWT-based Security** with token blacklisting
- **Responsive Profile Interface** across all devices

### 💸 Borrower Features
- **Create Loan Requests** with customizable terms
- **Edit/Delete** pending loan requests
- **Mobile-optimized Dashboard** with loan tracking and payment schedules
- **Repayment Management** with automated notifications
- **Touch-friendly Controls** for mobile users

### 💼 Lender Features
- **Loan Marketplace** to browse available loans
- **Stripe Connect Integration** for secure payments
- **Investment Tracking** with performance analytics
- **Automated Payouts** with platform fee handling
- **Responsive Investment Dashboard** for all screen sizes

### 🔧 Technical Features
- **Real-time Notifications** system
- **Fully Responsive Design** with mobile-first approach
- **File Upload** for profile pictures
- **Email Service** with nodemailer
- **Transaction Management** with audit trails
- **Cross-device Compatibility** (Mobile, Tablet, Desktop)
- **Touch-friendly Interface** for mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Icons** for UI elements
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Stripe** payment processing
- **Nodemailer** for emails
- **Multer** for file uploads

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Stripe Account
- Gmail App Password

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/P2P_Lending_Platform.git
cd P2P_Lending_Platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/p2p_lending_platform
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=P2P Lending Platform <noreply@p2plending.com>
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASS` | Gmail app password |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## 📱 Usage

### For Borrowers
1. **Register** with email verification (mobile-friendly forms)
2. **Create loan requests** with amount, interest rate, and tenure
3. **Track loan status** in responsive dashboard
4. **Manage repayments** when funded (optimized for mobile)

### For Lenders
1. **Complete Stripe onboarding** for payouts
2. **Browse loan marketplace** with filters (touch-optimized)
3. **Fund loans** with secure payments
4. **Track investments** and returns (responsive analytics)

### 📱 Mobile Experience
- **Touch-optimized Interface** for smartphones and tablets
- **Adaptive Layouts** that work seamlessly across screen sizes
- **Mobile-first Navigation** with collapsible menus
- **Optimized Forms** for easy mobile input

## 🏗️ Project Structure

```
P2P_Lending_Platform/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── uploads/         # File storage
├── frontend/
│   ├── src/
│   │   ├── components/  # Responsive React components
│   │   │   ├── auth/    # Authentication components
│   │   │   ├── common/  # Shared components (ProfileSidebar)
│   │   │   ├── dashboard/ # Responsive dashboards
│   │   │   ├── loans/   # Loan management components
│   │   │   ├── notifications/ # Notification center
│   │   │   └── profile/ # Profile management
│   │   ├── context/     # Auth context
│   │   ├── config/      # API configuration
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── README.md
```

## 🔒 Security Features

- **JWT Authentication** with secure cookies
- **Password Hashing** with bcrypt
- **Email Verification** for account security
- **Stripe Connect** for secure payments
- **Input Validation** and sanitization
- **CORS Protection** for API security
- **Secure File Uploads** with type validation
- **Token Blacklisting** for logout security

## 📱 Responsive Design Features

- **Mobile-First Approach** with Tailwind CSS
- **Adaptive Navigation** that collapses on mobile
- **Responsive Dashboards** for borrowers and lenders
- **Touch-Optimized Controls** and buttons
- **Flexible Grid Layouts** that adapt to screen size
- **Optimized Typography** scaling across devices
- **Mobile-Friendly Forms** with proper input types
- **Responsive Profile Management** with image uploads
- **Cross-Device Notification Center**

## 🚀 Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, or DigitalOcean
- Set up MongoDB Atlas for production database
- Configure environment variables
- Ensure file upload directory permissions

### Frontend (React)
- Deploy to Vercel, Netlify, or AWS S3
- Update API URLs for production
- Configure build settings
- Test responsive design across devices

### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Stripe keys updated for production
- [ ] Email service configured
- [ ] Responsive design tested on multiple devices
- [ ] File upload functionality verified

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Krishna Bhagavan**
- Email: krishnabhagavan910@gmail.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Stripe for payment processing
- MongoDB for database
- React team for the framework
- Tailwind CSS for styling

---

⭐ **Star this repo if you found it helpful!**