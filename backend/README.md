# Deepfake Detection API

Backend API for the Deepfake Detection application.

## Deployment Options

The API can be deployed to several free hosting platforms:

### 1. Vercel

Deployment is configured via `vercel.json`:

```bash
npm install -g vercel
vercel login
vercel
```

### 2. Render

Deployment is configured via `deploy-render.json`:

1. Create a new Web Service on Render
2. Connect your repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `node app.js`

### 3. Railway

Deployment is configured via `railway.json`:

```bash
npm install -g @railway/cli
railway login
railway up
```

## Environment Variables

Required environment variables:

- `NODE_ENV`: Set to `production` for deployment
- `PORT`: Port for the server (default: 8080)
- `JWT_SECRET`: Secret for JWT authentication
- `MONGODB_URI`: MongoDB connection string

## API Endpoints

- `/api/health`: Health check endpoint
- `/api/register`: User registration
- `/api/login`: User login
- `/api/verify-otp`: OTP verification
- `/api/analyze`: Analyze content for deepfakes
- `/api/user/history`: Get user analysis history 