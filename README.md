# Coach-Link Platform

A fullstack coaching platform built with Node.js/Express backend, React frontend, and SQLite database. This application facilitates connections between coaches and clients, providing scheduling, session management, and progress tracking capabilities.

## 🏗️ Architecture Overview

This is a monorepo containing:
- **Backend**: Node.js/Express REST API with SQLite database
- **Frontend**: React single-page application

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Development Notes](#development-notes)
- [Testing](#testing)
- [Deployment Considerations](#deployment-considerations)

## ✅ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **Git**

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Hews99vi/Coach-Link-OCTICK.git
cd Coach-Link-
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Set up environment variables

Copy the `.env.example` file to `.env` in the backend directory:

```bash
cp .env.example backend/.env
```

Edit the `.env` file and add your configuration:
- `JWT_SECRET`: A secure random string for JWT token generation
- `COORDINATOR_PASSWORD`: Hashed password for coordinator access
- `PORT`: Backend server port (default: 5000)
- `DATABASE_PATH`: Path to SQLite database file

## 🏃 Running Locally

### Development Mode

#### Start the backend server:

```bash
cd backend
npm run dev
```

The backend API will run on `http://localhost:5000` (or your configured PORT).

#### Start the frontend development server:

Open a new terminal window:

```bash
cd frontend
npm start
```

The React app will run on `http://localhost:3000` and automatically open in your browser.

### Production Build

#### Build the frontend:

```bash
cd frontend
npm run build
```

#### Serve the production build:

The backend can be configured to serve the static frontend build files.

## 📁 Project Structure

```
Coach-Link-/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, validation)
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── tests/           # Jest test files
│   ├── server.js        # Express server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   ├── utils/       # Utility functions
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   ├── package.json
│   └── .env
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Auth Routes (`/api/auth`)

- **POST** `/register` - Register a new user
  - Body: `{ username, email, password, role }`
  - Response: `{ token, user }`

- **POST** `/login` - Login user
  - Body: `{ email, password }`
  - Response: `{ token, user }`

#### User Routes (`/api/users`)

- **GET** `/profile` - Get current user profile (authenticated)
- **PUT** `/profile` - Update user profile (authenticated)
- **GET** `/` - Get all users (admin only)

#### Coach Routes (`/api/coaches`)

- **GET** `/` - Get all coaches
- **GET** `/:id` - Get coach by ID
- **POST** `/` - Create coach profile (authenticated)
- **PUT** `/:id` - Update coach profile (authenticated)

#### Session Routes (`/api/sessions`)

- **GET** `/` - Get all sessions (filtered by user role)
- **POST** `/` - Create new session (authenticated)
- **PUT** `/:id` - Update session (authenticated)
- **DELETE** `/:id` - Delete session (authenticated)

### Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Coordinator Access
COORDINATOR_PASSWORD=hashed_password_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 💡 Development Notes

### Technology Stack Rationale

**Backend:**
- **Express.js**: Lightweight, flexible, and widely adopted framework
- **SQLite**: Simple setup, no separate database server needed, perfect for development and small-to-medium scale deployments
- **Sequelize**: ORM for easier database operations and migrations
- **JWT**: Stateless authentication, scalable across multiple servers

**Frontend:**
- **React**: Component-based architecture, large ecosystem
- **React Router**: Client-side routing
- **Axios**: Promise-based HTTP client
- **Chart.js**: Data visualization for progress tracking
- **Bootstrap**: Quick UI development with responsive design

### Tradeoffs

**SQLite Limitations:**
- Not ideal for high-concurrency scenarios
- Limited to single-server deployments without replication
- **Migration Path**: Can migrate to PostgreSQL or MySQL for production scaling

**Monorepo Structure:**
- **Pros**: Easier local development, shared dependencies
- **Cons**: More complex deployment, larger repository size
- **Alternative**: Could separate into microservices for larger scale

**JWT Authentication:**
- **Pros**: Stateless, scalable, works well with mobile apps
- **Cons**: Cannot revoke tokens before expiry, larger payload size
- **Mitigation**: Short expiration times, refresh token strategy

### Progress Tracking

- [x] Initial project setup
- [x] Backend scaffolding with Express
- [x] SQLite database integration
- [x] Authentication system (JWT)
- [ ] User management endpoints
- [ ] Coach profile management
- [ ] Session scheduling system
- [ ] Progress tracking features
- [ ] Frontend dashboard
- [ ] Client-coach matching algorithm
- [ ] Payment integration
- [ ] Email notifications

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📦 Deployment Considerations

### Backend Deployment

1. Set `NODE_ENV=production`
2. Use a process manager (PM2, systemd)
3. Consider migrating from SQLite to PostgreSQL/MySQL
4. Implement proper logging (Winston, Morgan)
5. Set up reverse proxy (Nginx)
6. Enable HTTPS
7. Implement rate limiting
8. Set up database backups

### Frontend Deployment

1. Build production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, S3)
3. Configure environment variables
4. Set up CDN for assets
5. Enable HTTPS

### Database Migration (SQLite → PostgreSQL)

For production, consider:
1. Export data from SQLite
2. Set up PostgreSQL instance
3. Update Sequelize configuration
4. Import data to PostgreSQL
5. Test thoroughly before switching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

## 👥 Authors

- GitHub: [@Hews99vi](https://github.com/Hews99vi)

## 🆘 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Note**: This is a development setup. For production deployment, additional security measures, optimization, and infrastructure considerations are required.
