# 🚌 Coach-Link - Professional Transportation Management System

A comprehensive fullstack transportation request management platform with real-time updates, role-based access control, and professional UI/UX. Built with Node.js/Express backend, React frontend, and PostgreSQL/SQLite database.

[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen)](https://render.com)

## 🏗️ Architecture Overview

This is a monorepo containing:
- **Backend**: Node.js/Express REST API with PostgreSQL (production) or SQLite (dev), JWT auth, SSE real-time updates
- **Frontend**: React SPA with Bootstrap 5, Chart.js, and custom hooks

## 🚀 Deployment

**Ready to deploy?** See our complete deployment guide:

📖 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step instructions for deploying on Render.com (100% FREE)

**Quick Deploy Links:**
- Deploy Backend: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)
- Deploy Frontend: Same as above, follow the guide

**Live Demo** (Coming soon): `https://coach-link.onrender.com`

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Real-Time Updates](#real-time-updates)
- [Accessibility](#accessibility)
- [Environment Variables](#environment-variables)
- [Development Notes](#development-notes)
- [Testing](#testing)
- [Deployment Considerations](#deployment-considerations)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- ✅ **Professional Landing Page** - Modern hero section with services and contact
- ✅ **Trip Request Management** - Book transportation with detailed validation
- ✅ **Role-Based Access Control** - Coordinator (full access) and Viewer (read-only) roles
- ✅ **Real-Time Updates** - Server-Sent Events (SSE) for live status notifications
- ✅ **Admin Dashboard** - Complete management interface with analytics
- ✅ **Request Lifecycle** - Pending → Approved → Scheduled → Completed workflow
- ✅ **Driver & Vehicle Assignment** - Schedule trips with available resources
- ✅ **Analytics Dashboard** - Visual charts showing request trends
- ✅ **Search & Filtering** - Find requests by name, phone, or status
- ✅ **Pagination** - Efficient data loading for large datasets

### Accessibility Features (WCAG 2.1 Level AA Compliant)
- ✅ Skip navigation links for keyboard users
- ✅ Proper ARIA labels and landmarks
- ✅ Focus indicators on all interactive elements
- ✅ Screen reader optimized
- ✅ High contrast color schemes

## ✅ Prerequisites

Before you begin, ensure you have installed:

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | v14.x or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | v6.x or higher | Included with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

## 🚀 Quick Start

Get up and running in **3 minutes**:

```bash
# 1. Clone the repository
git clone https://github.com/Hews99vi/Coach-Link-OCTICK.git
cd Coach-Link-

# 2. Install all dependencies (backend + frontend)
npm run install:all

# 3. Initialize database with default users
cd backend && npm run init:db && cd ..

# 4. Start both servers concurrently
npm run dev
```

🎉 Open http://localhost:3000 to see the application!

**Default Login Credentials**:
- **Coordinator**: `coordinator` / `password` (Full access)
- **Viewer**: `viewer` / `viewer123` (Read-only access)

⚠️ **Change these passwords in production!**

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

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=1h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

⚠️ **Security Warning**: Change `JWT_SECRET` to a strong random value in production!

### 6. Initialize Database

```bash
cd backend
npm run init:db
```

This creates the database and seeds it with default users:
- **Coordinator**: `coordinator` / `password`
- **Viewer**: `viewer` / `viewer123`
- **Admin**: `admin` / `admin123`

## 🏃 Running Locally

### Development Mode (Recommended)

#### Option 1: Run Both Servers Concurrently (Easiest)

From the **root directory**:

```bash
npm run dev
```

This starts:
- **Backend API** on http://localhost:5000
- **Frontend React app** on http://localhost:3000

#### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Production Build

#### Build the frontend:

```bash
cd frontend
npm run build
```

#### Start production server:

```bash
cd backend
NODE_ENV=production npm start
```

The backend can serve the static frontend build files in production.

## 📁 Project Structure

```
Coach-Link-/
├── backend/                    # Node.js/Express API
│   ├── middleware/            # Auth, validation, error handling
│   │   ├── auth.js           # JWT authentication (150 lines)
│   │   ├── validation.js     # Request validation
│   │   └── errorHandler.js   # Global error handler
│   ├── models/               # Sequelize ORM models
│   │   ├── user.js          # User model (RBAC)
│   │   ├── serviceRequest.js # Service request model
│   │   ├── driver.js        # Driver model
│   │   ├── vehicle.js       # Vehicle model
│   │   └── assignment.js    # Assignment model
│   ├── routes/              # API route handlers
│   │   ├── auth.js         # Authentication routes
│   │   ├── requests.js     # Request CRUD + scheduling (410 lines)
│   │   ├── drivers.js      # Driver management
│   │   ├── vehicles.js     # Vehicle management
│   │   ├── analytics.js    # Analytics endpoints (180 lines)
│   │   └── events.js       # SSE real-time updates (126 lines)
│   ├── seeders/            # Database seeders
│   │   └── seedUsers.js    # Default user accounts
│   ├── __tests__/          # Jest tests
│   ├── app.js              # Express app setup
│   ├── database.sqlite     # SQLite database (auto-created)
│   └── package.json
│
├── frontend/                # React SPA
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── LandingPage.js      # Professional landing page (417 lines)
│   │   │   ├── RequestForm.js      # Trip request form (407 lines)
│   │   │   ├── AdminPanel.js       # Admin dashboard (782 lines ⚠️)
│   │   │   ├── Login.js            # Login component
│   │   │   ├── SkipLink.js         # Accessibility skip link
│   │   │   └── *.css               # Component styles
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useSSE.js   # Server-Sent Events hook (159 lines)
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json
│
├── .gitignore
├── package.json            # Root package.json (convenience scripts)
├── README.md              # This file
├── ACCESSIBILITY_AUDIT.md # WCAG 2.1 compliance report
├── PROJECT_QUALITY_AUDIT.md # Code quality assessment
└── docker-compose.yml     # Docker configuration (optional)
```

**File Size Guidelines**:
- ✅ Most files under 500 lines
- ⚠️ `AdminPanel.js` (782 lines) - **needs refactoring** into smaller components
- ✅ Clear separation of concerns
- ✅ Logical folder structure

## 🛠️ Technology Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 14.x+ |
| **Express** | Web framework | 5.1.0 |
| **PostgreSQL** | Production database | Latest |
| **SQLite3** | Development database | 5.1.7 |
| **Sequelize** | ORM | 6.37.5 |
| **JWT** | Authentication | jsonwebtoken 9.0.2 |
| **bcryptjs** | Password hashing | 2.4.3 |
| **express-validator** | Input validation | 7.2.1 |
| **cors** | CORS middleware | 2.8.5 |

**Database**: Automatically uses PostgreSQL in production (via `DATABASE_URL`), SQLite for local development.

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 18.3.1 |
| **React Router** | Client-side routing | 6.29.0 |
| **Axios** | HTTP client | 1.7.9 |
| **Chart.js** | Data visualization | 4.4.7 |
| **Bootstrap 5** | CSS framework | Via CDN |

### Features
- **Server-Sent Events (SSE)** - Real-time updates (not polling!)
- **Role-Based Access Control** - Coordinator and Viewer roles
- **JWT Authentication** - Secure stateless auth
- **WCAG 2.1 Level AA** - Full accessibility compliance

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

## 📦 Deployment

### Free Deployment Options

1. **Render.com** ⭐ **RECOMMENDED**
   - ✅ Free PostgreSQL database
   - ✅ Auto-deploy from GitHub
   - ✅ Free SSL certificates
   - 📖 [Complete Guide](./DEPLOYMENT_GUIDE.md)

2. **Vercel (Frontend) + Render (Backend)**
   - ✅ Ultra-fast frontend delivery
   - ✅ Serverless at scale
   - 📖 See deployment guide

3. **Railway.app**
   - ✅ $5 free credit/month
   - ✅ Easy PostgreSQL setup

### Quick Deploy

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete instructions.

**Deployment checklist:**
- [ ] Create Render account
- [ ] Deploy PostgreSQL database
- [ ] Deploy backend with environment variables
- [ ] Deploy frontend with API URL
- [ ] Update CORS settings
- [ ] Test login and features
- [ ] Set up uptime monitoring (optional)

### Environment Variables

#### Production Backend (Render)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<from Render PostgreSQL>
JWT_SECRET=<generate 32+ char secret>
FRONTEND_URL=https://your-frontend.onrender.com
```

#### Production Frontend (Render/Vercel)
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Database Migration

The app automatically uses:
- **PostgreSQL** when `DATABASE_URL` is set (production)
- **SQLite** for local development

No code changes needed for deployment! 🎉

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
