# Getting Started with Iris DeepFake Detection App

This guide provides step-by-step instructions to get the Iris application running correctly.

## Quick Start

### Local Testing (Recommended First)

1. **Test the Backend**:
   ```bash
   cd backend
   pip install -r requirements-deploy.txt
   python test_server.py
   ```
   Verify the health check works at http://localhost:5000/api/health
   
2. **Set up Frontend for Testing**:
   ```bash
   cd frontend
   npm install
   # Create a .env.local file with:
   # REACT_APP_API_URL=http://localhost:5000/api
   npm start
   ```
   
3. **Verify Basic Functionality**:
   - Test image upload
   - Test authentication flow
   - Check API responses

## Deployment Steps

### Option 1: Deploy to Render (Recommended)

1. **Fork or Clone the Repository**:
   Fork this repository to your GitHub account.

2. **Set up Render Blueprint**:
   - Log in to Render.com
   - Go to Blueprints section
   - Click "New Blueprint Instance"
   - Connect to your GitHub repository
   - Follow the on-screen instructions

3. **Verify Deployment**:
   - Check if backend health endpoint is accessible
   - Verify frontend is loading
   - Test key functionality

### Option 2: Manual Deployment

#### Backend:
1. Deploy to Render using `backend/deploy-render.json`
2. Set required environment variables:
   - `SECRET_KEY`: Secure random string
   - `FLASK_ENV`: production
   - `PORT`: 10000
   - `DATABASE_URL`: Your database connection string

#### Frontend:
1. Update `.env.production` with backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```
2. Build and deploy:
   ```bash
   npm run build
   # Deploy build folder to Netlify, Vercel, etc.
   ```

## Troubleshooting

### Common Issues

1. **Backend Not Starting**:
   - Check if all dependencies are installed
   - Verify Python version (recommend 3.8+)
   - Check for syntax errors
   - Review logs for detailed error messages

2. **Frontend Not Connecting to Backend**:
   - Confirm API URL is correct in environment variables
   - Check for CORS issues (backend allows frontend origin)
   - Verify network requests in browser developer tools

3. **Database Issues**:
   - Run database initialization script manually
   - Check database connection string
   - Ensure database tables are created properly

4. **Deployment Failures**:
   - Review deployment logs
   - Verify all environment variables are set
   - Check build commands and start commands

### Quick Fixes

1. **Database Initialization**:
   ```bash
   cd backend
   python init_db.py
   ```

2. **Testing Backend without ML Models**:
   ```bash
   cd backend
   python test_server.py
   ```

3. **Clearing Frontend Cache**:
   ```bash
   cd frontend
   rm -rf node_modules
   npm cache clean --force
   npm install
   ```

4. **Testing API Endpoints**:
   Use tools like Postman or curl to test API endpoints directly:
   ```bash
   curl -X GET https://your-backend-url.onrender.com/api/health
   ```

## Get Support

If you encounter issues, please:
1. Check the troubleshooting section above
2. Review the logs in Render dashboard
3. Open an issue in the GitHub repository with detailed information 