# Iris Deployment Checklist

This checklist will help you ensure that the Iris DeepFake Detection Application is deployed and functioning correctly.

## Prerequisites Check

- [ ] Git repository is cloned/forked for deployment
- [ ] Render.com account is created
- [ ] All dependencies are updated in requirements-deploy.txt

## Backend Deployment Check

1. **Database Initialization**
   - [ ] Run `python init_db.py` locally to verify database setup works
   - [ ] Confirm tables are created correctly

2. **API Endpoints Check**
   - [ ] `/api/health` returns status 200 and {"status": "ok", "message": "API is running"}
   - [ ] Upload endpoints accept files and return analysis results
   - [ ] Authentication endpoints work correctly

3. **Environment Variables**
   - [ ] `SECRET_KEY` is set (should be a secure random value in production)
   - [ ] `FLASK_ENV` is set to "production"
   - [ ] `PORT` is set correctly (10000 for Render)
   - [ ] `DATABASE_URL` is configured properly

## Frontend Deployment Check

1. **API Connection**
   - [ ] `REACT_APP_API_URL` is pointed to your deployed backend URL
   - [ ] API calls from frontend reach backend successfully

2. **User Interface**
   - [ ] All pages load correctly
   - [ ] Upload functionality works
   - [ ] Analysis results display properly

## Render.com Specific Checks

1. **Service Configuration**
   - [ ] Web service is configured with correct build commands
   - [ ] Health check path is set to `/api/health`
   - [ ] Environment variables are properly set in Render dashboard

2. **Deployment Verification**
   - [ ] Build completes successfully
   - [ ] Application starts without errors
   - [ ] Health check passes

## Troubleshooting Common Issues

### Backend Issues

1. **Application fails to start**
   - Check logs for specific errors
   - Verify all dependencies are installed
   - Ensure environment variables are set correctly

2. **Database connection errors**
   - Check if `DATABASE_URL` is correctly configured
   - Run `python init_db.py` manually to initialize database

3. **API endpoint errors**
   - Check request/response formats
   - Verify CORS configuration allows frontend access

### Frontend Issues

1. **API connection fails**
   - Check network requests in browser dev tools
   - Verify `REACT_APP_API_URL` is set correctly
   - Ensure backend CORS allows requests from frontend domain

2. **Components not rendering**
   - Check for JavaScript errors in console
   - Verify build process completed successfully

## Final Verification

- [ ] Register a new test user
- [ ] Upload an image for analysis
- [ ] Verify analysis results are displayed correctly
- [ ] Check all key features of the application

## Deployment Recovery Plan

If deployment fails:
1. Review logs for specific errors
2. Rollback to previous working version if available
3. Fix identified issues locally and redeploy 