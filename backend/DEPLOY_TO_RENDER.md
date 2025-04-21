# Deploying the Iris Backend to Render

This guide provides step-by-step instructions for deploying the Iris Backend API to Render's free tier.

## Prerequisites

- A Render account (sign up at https://render.com)
- The backend code from this repository

## Deployment Steps

### Option 1: Deploy using render.yaml (Recommended)

1. Fork or clone this repository to your GitHub account
2. Log in to your Render dashboard
3. Click the "New" button and select "Blueprint" from the dropdown menu
4. Connect your GitHub account and select your forked/cloned repository
5. Click "Apply Blueprint"
6. Render will automatically detect the `render.yaml` file and create your web service
7. Wait for the deployment to complete (this may take a few minutes)
8. Once deployed, your API will be available at `https://iris-backend.onrender.com/api`

### Option 2: Manual Deployment

1. Log in to your Render dashboard
2. Click the "New" button and select "Web Service" from the dropdown menu
3. Connect your GitHub account and select your repository
4. Configure the service with the following settings:
   - **Name**: iris-backend
   - **Region**: Ohio (or your preferred region)
   - **Branch**: main (or your default branch)
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements-deploy.txt && mkdir -p model_files && python init_db.py`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free
5. Add the following environment variables:
   - `FLASK_ENV`: production
   - `FLASK_DEBUG`: 0
   - `SECRET_KEY`: (leave blank and Render will generate a secure key)
6. Click "Create Web Service"
7. Wait for the deployment to complete

## Testing Your Deployment

Once deployed, you can verify your API is running by visiting:

```
https://iris-backend.onrender.com/api/health
```

You should see a JSON response with `{"status": "ok", "message": "API is running"}`.

## Notes on Free Tier Limitations

- The free tier on Render will spin down after 15 minutes of inactivity
- The first request after spin-down will take up to 30 seconds to respond
- The API will automatically spin up on the first request
- Render provides 750 free hours per month for your services 