// Health check endpoint for deployment platforms
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Configure CORS to allow requests from all deployment domains
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://iris-frontend.netlify.app',
        'https://iris-frontend.vercel.app'
    ],
    credentials: true
})); 