// Simple test API for Vercel
const express = require('express');

const app = express();

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