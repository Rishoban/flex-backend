// Vercel serverless function entry point
const path = require('path');

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
      error: error.message,
      stack: error.stack
    });
  });
  
  module.exports = fallbackApp;
}