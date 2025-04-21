# Deepfake Detection Web Application

A modern web application for detecting deepfakes using AI models.

## Features

- AI-powered deepfake detection for images, audio, and video
- User authentication with OTP verification
- Analysis history tracking
- Educational resources about deepfake technology

## Technology Stack

- React
- React Router for navigation
- Tailwind CSS for styling
- Jest and Cypress for testing

## Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/deepfake-detection.git
cd deepfake-detection/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Run tests
```bash
npm test
npm run test:e2e
```

## Deployment

### Deploying to Netlify

#### Option 1: Deploy with Netlify CLI

1. Install Netlify CLI
```bash
npm install netlify-cli -g
```

2. Build your project
```bash
npm run build
```

3. Deploy to Netlify
```bash
netlify deploy
```

Follow the prompts to complete the deployment.

#### Option 2: Deploy through the Netlify website

1. Build your project:
```bash
npm run build
```

2. Go to [Netlify](https://app.netlify.com/) and sign up or log in
3. Drag and drop your `build` folder to the Netlify dashboard
4. Configure your site settings:
   - Domain name
   - Environment variables
   - Build settings

#### Option 3: Connect to GitHub for continuous deployment

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com/) and sign up or log in
3. Click "New site from Git"
4. Choose GitHub and select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Configure environment variables:
   - REACT_APP_API_URL: URL to your backend API
7. Deploy the site

## Environment Variables

Create a `.env` file in the root of your project with these variables:

```
REACT_APP_API_URL=https://your-backend-api.com/api
```

For local development, it will default to `http://localhost:5000/api`.

## Backend Configuration

Ensure your backend CORS settings allow requests from your Netlify domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-app.netlify.app'
  ],
  credentials: true
}));
```

## Connecting to a Backend Service

To connect this frontend to a backend service, you have several options:

1. **Netlify Functions**: Deploy serverless functions alongside your frontend
2. **Heroku**: Deploy your backend to Heroku's free tier
3. **Render**: Deploy your backend on Render's free tier
4. **Railway**: Deploy your backend on Railway with limited free usage

## Helpful Links

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Netlify Documentation](https://docs.netlify.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cypress Documentation](https://docs.cypress.io/) 