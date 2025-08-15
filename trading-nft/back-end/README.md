# Meme Server

A modern NestJS-based server application for managing memes with features like user management, authentication, and more.

## 🚀 Features

- User Management with CQRS pattern
- JWT Authentication with refresh tokens
- MongoDB integration
- Redis caching
- Elasticsearch integration
- Swagger API documentation
- Winston logging
- Docker support
- Comprehensive testing suite

## 📋 Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- MongoDB (local or containerized)
- Redis (local or containerized)
- Elasticsearch (optional)

## 🛠 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd meme-server
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` file with your configuration values.

## 🐳 Docker Setup

1. Start the required services:
```bash
docker compose up -d
```

This will start:
- MongoDB
- Redis
- Elasticsearch (optional)
- Kibana (optional)

2. Check running containers:
```bash
docker compose ps
```

## 🚀 Running the Application

### Development Mode
```bash
# Start in watch mode
yarn start:dev
```

### Production Mode
```bash
# Build the application
yarn build

# Start in production mode
yarn start:prod
```

The server will be running at `http://localhost:3000` (or your configured port).
Swagger documentation will be available at `http://localhost:3000/api/docs`

## 🔄 Database Migrations

Run database migrations:
```bash
# Apply migrations
yarn migrate

# Rollback last migration
yarn migrate:rollback

# Rollback multiple migrations
yarn migrate:rollback 3  # Rolls back last 3 migrations
```

## 🧪 Testing

```bash
# Unit tests
yarn test:unit

# Integration tests
yarn test:integration

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
├── database/         # Database related files and migrations
├── modules/          # Feature modules
│   ├── auth/        # Authentication module
│   ├── users/       # User management module
│   └── ...
├── shared/          # Shared utilities and common code
└── main.ts          # Application entry point
```

## 🔒 API Security

- JWT-based authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Request validation
- API versioning

## 📚 API Documentation

The API documentation is available through Swagger UI at `/api/docs` when the server is running.
Protected by basic authentication with credentials from your environment configuration.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
