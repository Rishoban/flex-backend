# Flex Backend - Node.js REST API

A production-ready Node.js REST API built with Express and TypeScript. This project follows best practices for security, performance, testing, and deployment.

## 🚀 Features

- **API Framework**: Express.js with TypeScript for type safety
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Caching**: Redis integration for caching (optional)
- **Logging**: Structured logging with Winston
- **Testing**: Comprehensive unit and integration tests with Jest
- **Documentation**: Auto-generated API documentation with Swagger
- **Docker**: Multi-stage Docker builds with health checks
- **CI/CD**: GitHub Actions workflow with automated testing and deployment
- **Code Quality**: ESLint, Prettier, and Husky for code formatting and pre-commit hooks

## 📋 Prerequisites

- Node.js 18+
- Redis 6+ (optional)
- Docker (optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flex-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── routes/          # Route definitions
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── tests/           # Test files
└── index.ts         # Application entry point
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
```

## 📚 API Documentation

Interactive API documentation is available at:
- **Development**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

### Main Endpoints

- **API**: `/api/v1/status` - API status endpoint
- **API**: `/api/v1/hello` - Hello world endpoint with optional name parameter
- **Health**: `/health` - Health check endpoints

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security Features

- **Input Validation**: Express-validator with custom rules
- **Rate Limiting**: Configurable request rate limiting
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **Comprehensive Error Handling**: Structured error responses

## 📊 Monitoring & Logging

### Health Checks

- `/health` - Overall health status
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

### Logging

Structured logging with Winston:
- Console output (development)
- File output (production)
- Log rotation
- Different log levels

## 🐳 Docker

### Development
```bash
docker-compose up
```

### Production
```bash
docker build -t flex-backend .
docker run -p 3000:3000 flex-backend
```

## 🚀 Deployment

### Using GitHub Actions

1. Configure secrets in GitHub:
   - `CODECOV_TOKEN` (optional)
   - `SNYK_TOKEN` (optional)

2. Push to main branch triggers:
   - Automated testing
   - Security scanning
   - Docker image building
   - Deployment (configure as needed)

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

3. **Start with PM2 (recommended)**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name flex-backend
   ```

## 📈 Performance

- **Compression**: Gzip compression enabled
- **Caching**: Redis integration for caching (optional)
- **Rate Limiting**: Protection against abuse
- **Health Checks**: Container health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit changes: `git commit -m "Add new feature"`
7. Push to branch: `git push origin feature/new-feature`
8. Submit a pull request

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
```

## 🐛 Troubleshooting

### Common Issues

1. **Redis connection failed** (if using Redis)
   - Check Redis is running
   - Verify Redis URL in `.env`

2. **Port already in use**
   - Change PORT in `.env` file
   - Kill process using the port: `netstat -ano | findstr :3000`

### Logs

Check application logs:
```bash
# Development
npm run dev

# Production logs
tail -f logs/app.log
tail -f logs/error.log
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Jest Testing Framework](https://jestjs.io/)
- [Docker Documentation](https://docs.docker.com/)

## 🎯 Current Status

Your application is now running successfully! 🎉

- **Server**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **API Status**: http://localhost:3000/api/v1/status
- **Hello Endpoint**: http://localhost:3000/api/v1/hello?name=YourName

The application has been simplified and no longer requires external database dependencies, making it easier to deploy and maintain.