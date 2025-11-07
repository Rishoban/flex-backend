// Vercel serverless handler with CORS support
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Allowed origins
    const allowedOrigins = [
      'https://flex-review-management.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Basic middleware
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Flex Backend API is running on Vercel!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: 'vercel'
    }
  });
});

app.get('/api/v1/status', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Flex Backend API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'vercel'
    }
  });
});

// Catch all route
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    availableRoutes: ['/', '/health', '/api/v1/status']
  });
});

module.exports = app;