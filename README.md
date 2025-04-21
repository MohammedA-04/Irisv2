# Iris - DeepFake Detection Application

A web application for detecting deepfake images and videos using AI.

## Local Development

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set environment variables:
   ```
   export JWT_SECRET=your_jwt_secret
   export MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the backend server:
   ```
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Deployment

### Deploying to Render

This application is configured for deployment on Render.com using the blueprint configuration.

1. Fork this repository to your GitHub account

2. Create a new Blueprint instance on Render:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Select "Blueprints" and click "New Blueprint Instance"
   - Connect to your GitHub repository
   - Configure the necessary environment variables:
     - `JWT_SECRET`: Your secure JWT secret
     - `MONGODB_URI`: Your MongoDB connection string

3. Deploy the blueprint
   - Render will automatically deploy both the backend API and frontend application

### Manual Deployment

#### Backend

The backend can be deployed independently using the `deploy-render.json` configuration:

1. Create a new Web Service on Render
2. Link to your GitHub repository
3. Set the build command: `pip install -r requirements-deploy.txt`
4. Set the start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Add environment variables: `JWT_SECRET`, `MONGODB_URI`, etc.

#### Frontend

1. Create a new Web Service on Render
2. Link to your GitHub repository
3. Set the build command: `cd frontend && npm install && npm run build`
4. Set the start command: `cd frontend && npm run start`
5. Add environment variable `REACT_APP_API_URL` pointing to your deployed backend

## Features

- Deepfake image detection
- Video analysis
- Text content authentication
- Secure user authentication
- Responsive web interface

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