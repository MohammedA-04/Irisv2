# Deepfake Detection Application

A modern web application for detecting deepfakes using AI models.

## Project Structure

- **frontend/**: React application for user interface
- **backend/**: Node.js API for deepfake detection

## Deployment Options

### Option 1: Deploy Frontend and Backend Separately

#### Frontend:
- **Netlify**: Use `frontend/netlify.toml` and GitHub Actions
- **Vercel**: Use `frontend/vercel.json`

#### Backend:
- **Vercel**: Use `backend/vercel.json`
- **Render**: Use `backend/deploy-render.json`
- **Railway**: Use `backend/railway.json`

### Option 2: Deploy Using Docker

```bash
# Build and run using Docker Compose
docker-compose up -d
```

### Option 3: Manual Deployment

#### Frontend:
```bash
cd frontend
npm install
npm run build
# Deploy the build folder to a static hosting service
```

#### Backend:
```bash
cd backend
npm install
# Set environment variables
node app.js
```

## Environment Variables

### Frontend:
- `REACT_APP_API_URL`: URL to the backend API

### Backend:
- `NODE_ENV`: Production or development
- `PORT`: Server port
- `JWT_SECRET`: Secret for JWT authentication
- `MONGODB_URI`: MongoDB connection string

## Documentation

For detailed documentation, see:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md) 