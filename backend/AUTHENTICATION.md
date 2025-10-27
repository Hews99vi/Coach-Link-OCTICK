# Authentication Setup Guide

## Overview

Coach-Link uses JWT (JSON Web Token) authentication to protect admin endpoints. A single coordinator user is hardcoded with credentials stored in environment variables.

## Setup Instructions

### 1. Generate a JWT Secret

Generate a secure random secret for JWT signing:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and add it to your `.env` file:
```env
JWT_SECRET=your_generated_secret_here
```

### 2. Set Coordinator Password

**Option A: Use the password hash script (Recommended)**

```bash
cd backend
node scripts/hashPassword.js yourpassword
```

This will output a bcrypt hash. Copy it to your `.env` file:
```env
COORDINATOR_PASSWORD=$2a$10$...hash...
```

**Option B: Hash manually in Node.js**

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 10).then(console.log)"
```

### 3. Update .env File

Your `.env` file should contain:

```env
# JWT Configuration
JWT_SECRET=your_64_character_hex_string
JWT_EXPIRES_IN=1h

# Coordinator Credentials
COORDINATOR_PASSWORD=$2a$10$...your_hashed_password...
```

## Testing Authentication

### 1. Start the Server

```bash
cd backend
npm run dev
```

### 2. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"coordinator","password":"yourpassword"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1h",
  "user": {
    "username": "coordinator",
    "role": "coordinator"
  }
}
```

### 3. Use Token for Protected Endpoints

```bash
# Save token to variable
TOKEN="your_token_here"

# Access protected endpoint
curl http://localhost:5000/api/requests \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Run Automated Tests

```bash
cd backend
node scripts/testAuth.js
```

**Note:** Make sure to update the password in `scripts/testAuth.js` to match your `.env` password.

## Protected Endpoints

The following endpoints require authentication:

### Service Requests (Admin)
- `GET /api/requests` - List all requests
- `GET /api/requests/:id` - Get single request
- `PUT /api/requests/:id` - Update request/create assignment
- `DELETE /api/requests/:id` - Delete request

### Drivers (Read-only)
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/:id` - Get single driver

### Vehicles (Read-only)
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get single vehicle

### Analytics
- `GET /api/analytics/daily` - Daily request counts
- `GET /api/analytics/status` - Status breakdown
- `GET /api/analytics/overview` - General statistics

### Public Endpoints (No Auth Required)
- `POST /api/requests` - Create service request
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `GET /health` - Health check

## Security Best Practices

### Production Deployment

1. **Use Strong Secrets**
   - Generate new JWT_SECRET with at least 64 characters
   - Use a strong coordinator password (12+ characters, mixed case, numbers, symbols)

2. **Environment Variables**
   - Never commit `.env` file to version control
   - Use environment variable management tools (AWS Secrets Manager, Azure Key Vault, etc.)

3. **HTTPS Only**
   - Always use HTTPS in production
   - JWT tokens can be intercepted over HTTP

4. **Token Expiration**
   - Keep token expiration short (1 hour recommended)
   - Implement refresh tokens for longer sessions

5. **Rate Limiting**
   - Add rate limiting to login endpoint to prevent brute force attacks
   - Consider using `express-rate-limit` package

6. **Password Policy**
   - Require strong passwords
   - Consider implementing password rotation
   - Use password managers for secure storage

## Troubleshooting

### "Invalid credentials" Error
- Verify the password matches the hashed value in `.env`
- Check that USERNAME is exactly "coordinator"
- Ensure bcrypt hashing was done with 10 salt rounds

### "Unauthorized" Error
- Check that token is included in Authorization header
- Verify token hasn't expired (default: 1 hour)
- Ensure JWT_SECRET in `.env` matches the one used to sign token

### "Server configuration error"
- Verify JWT_SECRET is set in `.env`
- Verify COORDINATOR_PASSWORD is set in `.env`
- Restart server after changing `.env` values

## API Usage Examples

### JavaScript/Axios

```javascript
const axios = require('axios');

// Login
const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
  username: 'coordinator',
  password: 'yourpassword'
});

const token = loginResponse.data.token;

// Use token
const requests = await axios.get('http://localhost:5000/api/requests', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

### Frontend (React)

```javascript
// Login function
async function login(username, password) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

// API call with token
async function getRequests() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/requests', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

## Default Credentials

**⚠️ IMPORTANT: Change these in production!**

- **Username:** `coordinator`
- **Password:** Set in `.env` file
- **Role:** `coordinator`

The coordinator user has full access to all admin endpoints.

---

For more information, see:
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Setup](./DATABASE_SETUP.md)
