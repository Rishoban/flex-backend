// Vercel serverless function entry point
const path = require('path');
const cors = require('cors');

// Configure module aliases for path resolution
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../dist'));
moduleAlias.addAlias('@config', path.join(__dirname, '../dist/config'));
moduleAlias.addAlias('@controllers', path.join(__dirname, '../dist/controllers'));
moduleAlias.addAlias('@middleware', path.join(__dirname, '../dist/middleware'));
moduleAlias.addAlias('@models', path.join(__dirname, '../dist/models'));
moduleAlias.addAlias('@routes', path.join(__dirname, '../dist/routes'));
moduleAlias.addAlias('@services', path.join(__dirname, '../dist/services'));
moduleAlias.addAlias('@utils', path.join(__dirname, '../dist/utils'));
moduleAlias.addAlias('@types', path.join(__dirname, '../dist/types'));

// Set environment variables for Vercel
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

// Set CORS_ALLOWED_ORIGINS for production
process.env.CORS_ALLOWED_ORIGINS = 'https://flex-review-management.vercel.app,http://localhost:3000,http://localhost:3001';

try {
  // Import the compiled Express app
  const app = require('../dist/index.js');
  
  // Get the Express app instance
  const expressApp = app.default || app;
  
  // Add additional CORS middleware as a safety net
  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'https://flex-review-management.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
      ];
      
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200
  };
  
  // Prepend CORS to handle it before other middleware
  expressApp.use(cors(corsOptions));
  expressApp.options('*', cors(corsOptions));
  
  // Export the Express app
  module.exports = expressApp;
} catch (error) {
  console.error('Failed to load app:', error);
  
  // Fallback simple Express app with CORS
  const express = require('express');
  const fallbackApp = express();
  
  // Add CORS to fallback
  const corsOptions = {
    origin: 'https://flex-review-management.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  };
  
  fallbackApp.use(cors(corsOptions));
  fallbackApp.options('*', cors(corsOptions));
  
  fallbackApp.get('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: error.message,
      stack: error.stack
    });
  });
  
  module.exports = fallbackApp;
}