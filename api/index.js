// Vercel serverless function entry point
const path = require('path');

// Set environment variables FIRST before any imports
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';
process.env.CORS_ALLOWED_ORIGINS = 'https://flex-review-management.vercel.app,http://localhost:3000,http://localhost:3001';

// Configure module aliases for path resolution
const moduleAlias = require('module-alias');
const distPath = path.join(__dirname, '../dist');

moduleAlias.addAlias('@', distPath);
moduleAlias.addAlias('@config', path.join(distPath, 'config'));
moduleAlias.addAlias('@controllers', path.join(distPath, 'controllers'));
moduleAlias.addAlias('@middleware', path.join(distPath, 'middleware'));
moduleAlias.addAlias('@models', path.join(distPath, 'models'));
moduleAlias.addAlias('@routes', path.join(distPath, 'routes'));
moduleAlias.addAlias('@services', path.join(distPath, 'services'));
moduleAlias.addAlias('@utils', path.join(distPath, 'utils'));
moduleAlias.addAlias('@types', path.join(distPath, 'types'));

let app;

try {
  // Import the compiled Express app
  const appModule = require(path.join(distPath, 'index.js'));
  
  // Handle both default export and direct export
  app = appModule.default || appModule;
  
  if (typeof app !== 'function') {
    throw new Error('Loaded app is not a valid Express application');
  }
  
  console.log('✅ Express app loaded successfully');
} catch (error) {
  console.error('❌ Failed to load app:', error);
  console.error('Stack:', error.stack);
  
  // Fallback to simple Express app
  const express = require('express');
  const cors = require('cors');
  
  app = express();
  
  // Add CORS
  app.use(cors({
    origin: 'https://flex-review-management.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }));
  
  app.use(express.json());
  
  // Debug endpoint
  app.get('/', (req, res) => {
    res.json({
      success: false,
      message: 'Fallback mode - main app failed to load',
      error: error.message,
      distPath: distPath,
      filesInDist: require('fs').existsSync(distPath) 
        ? require('fs').readdirSync(distPath) 
        : 'dist folder not found'
    });
  });
  
  // Catch all
  app.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: error.message,
      path: req.path
    });
  });
}

module.exports = app;