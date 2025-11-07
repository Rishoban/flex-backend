// Vercel serverless function entry point
try {
  // Import the compiled Express app
  const app = require('../dist/index.js');
  
  // Export the default export (the Express app)
  module.exports = app.default || app;
} catch (error) {
  console.error('Failed to load app:', error);
  
  // Fallback simple Express app
  const express = require('express');
  const fallbackApp = express();
  
  fallbackApp.get('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: error.message
    });
  });
  
  module.exports = fallbackApp;
}