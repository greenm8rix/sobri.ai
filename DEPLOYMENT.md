# Sobri.ai Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env` file in the project root with the following variables:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_BACKEND_URL=https://soberi-backend-service-280233666207.europe-west1.run.app  || 'you can use your own'
VITE_BACKEND_API_KEY=your_backend_api_key_here
```

### 2. Build the Application
```bash
npm install
npm run build
```

### 3. Test the Production Build
```bash
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts
4. Set environment variables in Vercel dashboard

### Option 2: Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Option 3: Cloud Run (Google Cloud)
1. Create a Dockerfile:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Build and deploy to Cloud Run

## Post-Deployment Tasks

### 1. Verify PWA Installation
- Check that the app can be installed on mobile devices
- Verify offline functionality works correctly

### 2. Test Critical Features
- [ ] User authentication (sign up, login, logout)
- [ ] Chat functionality with AI
- [ ] Data encryption/decryption
- [ ] Check-in functionality
- [ ] Journal entries
- [ ] Task management
- [ ] Progress tracking
- [ ] Subscription flow

### 3. Monitor Performance
- Set up error tracking (e.g., Sentry)
- Monitor API usage and costs
- Track user analytics

### 4. Security Checks
- [ ] All API keys are environment variables
- [ ] HTTPS is enforced
- [ ] Content Security Policy headers are set
- [ ] Data is encrypted at rest

### 5. Update Backend CORS
Add your production domain to the backend CORS whitelist:
```javascript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com'
];
```

## Important Notes

1. **API Keys**: Never commit API keys to the repository
2. **Database**: User data is stored locally with encryption
3. **Backend**: The backend service handles only chat functionality
4. **PWA**: The app works offline for most features except AI chat

## Troubleshooting

### Icons Not Loading
- Ensure all icon files exist in `public/` directory
- Run `node generate-icons.js` to regenerate placeholder icons

### Manifest Issues
- Check that `manifest.json` is served with correct MIME type
- Verify all icon paths in manifest are correct

### Service Worker Issues
- Clear browser cache and re-register service worker
- Check console for service worker errors

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- Check that `.env` is in project root

## Support

For deployment issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Application tab for PWA/Service Worker status 