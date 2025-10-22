# Deployment Guide

## Pre-deployment Checklist

### Environment Setup
- [ ] Node.js v16+ installed
- [ ] MongoDB database ready (local or Atlas)
- [ ] Stripe account configured
- [ ] Gmail app password generated
- [ ] Domain/hosting service ready

### Configuration Files
- [ ] `backend/.env` configured with production values
- [ ] `frontend/.env` configured with production API URL
- [ ] Database connection string updated
- [ ] Stripe keys set to production mode
- [ ] Email service credentials verified

### Code Preparation
- [ ] All dependencies installed (`npm install`)
- [ ] Build process tested (`npm run build`)
- [ ] Responsive design tested on multiple devices
- [ ] All environment variables documented
- [ ] Security review completed

## Backend Deployment

### Option 1: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... add all other environment variables

# Deploy
git push heroku main
```

### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure environment variables
3. Set build and run commands
4. Deploy

## Frontend Deployment

### Option 1: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

### Option 2: Netlify
```bash
# Build the project
cd frontend
npm run build

# Deploy dist folder to Netlify
```

### Option 3: AWS S3 + CloudFront
1. Build the project: `npm run build`
2. Upload `dist` folder to S3 bucket
3. Configure CloudFront distribution
4. Update DNS settings

## Post-deployment

### Verification Steps
- [ ] Application loads correctly on all devices
- [ ] User registration and login work
- [ ] Email notifications are sent
- [ ] Stripe payments process correctly
- [ ] File uploads function properly
- [ ] Database connections are stable
- [ ] All responsive breakpoints work
- [ ] SSL certificate is active
- [ ] Performance is acceptable on mobile

### Monitoring
- Set up error tracking (e.g., Sentry)
- Configure uptime monitoring
- Monitor database performance
- Track user analytics
- Set up backup procedures

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update `FRONTEND_URL` in backend environment
2. **Database Connection**: Verify MongoDB URI and network access
3. **Stripe Webhooks**: Update webhook endpoints in Stripe dashboard
4. **Email Issues**: Check Gmail app password and SMTP settings
5. **File Uploads**: Ensure upload directory permissions are correct

### Mobile-Specific Issues
- Test on actual devices, not just browser dev tools
- Verify touch interactions work properly
- Check form inputs on mobile keyboards
- Ensure images load correctly on slower connections