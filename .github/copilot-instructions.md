# Flex Backend - Production-Ready Node.js REST API

## Project Overview
This is a production-ready Node.js REST API built with Express and TypeScript, featuring comprehensive authentication, database integration, testing, and deployment capabilities.

## Key Features
- **Authentication & Authorization**: JWT-based with refresh tokens and role-based access control
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, input validation, password hashing
- **Testing**: Jest with comprehensive unit and integration tests
- **Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Logging**: Structured logging with Winston
- **Docker**: Multi-stage builds with health checks
- **CI/CD**: GitHub Actions workflow

## Development Setup
1. Install dependencies: `npm install`
2. Copy environment variables: `cp .env.example .env`
3. Start MongoDB and Redis services
4. Run development server: `npm run dev`
5. Access API documentation: `http://localhost:3000/api-docs`

## Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure
```
src/
├── config/          # Application configuration
├── controllers/     # Route controllers and business logic
├── middleware/      # Express middleware (auth, validation, error handling)
├── models/         # Database models and schemas
├── routes/         # API route definitions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and helpers
├── tests/          # Test files and setup
└── index.ts        # Application entry point
```

## API Endpoints
- **Authentication**: `/api/v1/auth/*` - Login, register, refresh, logout
- **Users**: `/api/v1/users/*` - User management and profile operations
- **Health**: `/health` - Health check endpoints

## Environment Configuration
Key environment variables (see `.env.example`):
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_URL` - Redis connection string

## Security Features
- JWT authentication with refresh token rotation
- Role-based authorization (Admin, User, Moderator)
- Input validation and sanitization
- Rate limiting and request throttling
- Password hashing with bcrypt
- Security headers via Helmet.js
- CORS configuration

## Docker Support
- Multi-stage production Dockerfile
- Docker Compose for development with MongoDB and Redis
- Health checks and non-root user configuration
- Optimized image size and security

## Testing Strategy
- Unit tests for utilities and helpers
- Integration tests for API endpoints
- Database testing with in-memory MongoDB
- Coverage reporting and CI integration
- Automated testing in GitHub Actions

## Deployment
- GitHub Actions CI/CD pipeline
- Automated testing, building, and deployment
- Docker image publishing to GitHub Container Registry
- Production deployment with health monitoring