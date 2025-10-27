# 🚀 Quick Start Guide

## One-Command Start (Recommended)

From the root directory, run both backend and frontend simultaneously:

```bash
npm start
```

This will start:
- 🔵 **Backend API** on `http://localhost:5000`
- 🟣 **Frontend App** on `http://localhost:3000`

### Alternative: Start with Colored Output

```bash
npm run dev
```

This shows labeled output:
- **API** - Backend logs (Blue)
- **WEB** - Frontend logs (Magenta)

---

## Individual Start Commands

If you prefer to start them separately:

### Backend Only
```bash
npm run start:backend
```

### Frontend Only
```bash
npm run start:frontend
```

---

## 🧪 End-to-End Testing Flow

Once both servers are running, test the complete application:

### 1. Test Customer Portal
1. Open browser: `http://localhost:3000/`
2. Fill out the service request form:
   - **Customer Name:** "Test User"
   - **Phone:** "555-1234"
   - **Pickup Location:** "123 Main St"
   - **Dropoff Location:** "456 Oak Ave"
   - **Pickup Time:** Select tomorrow's date
   - **Passengers:** 2
   - **Notes:** "Test request"
3. Click **"Submit Request"**
4. Verify success message appears
5. Form should reset

**✅ Expected Result:** Request saved to database with status "pending"

---

### 2. Test Admin Login
1. Navigate to: `http://localhost:3000/login`
2. Enter credentials:
   - **Username:** `coordinator`
   - **Password:** `password`
3. Click **"Login"**
4. Verify redirect to admin dashboard

**✅ Expected Result:** Admin panel loads with all requests displayed

---

### 3. Test Request Management

#### A. View Requests
- Verify the submitted request appears in the table
- Check all columns display correctly
- Status badge should be yellow ("Pending")

#### B. Search Functionality
- Type "Test" in the search box
- Verify table filters to show only matching requests

#### C. Status Filter
- Select "Pending" from status dropdown
- Verify only pending requests shown

#### D. Approve Request
- Find your test request
- Click **"Approve"** button
- Verify status changes to "Approved" (blue badge)
- Note: "Approve" button changes to "Schedule"

#### E. Schedule Assignment
- Click **"Schedule"** on approved request
- Modal opens with two dropdowns
- Select a driver (e.g., "John Smith")
- Select a vehicle (e.g., "Toyota Camry 2020")
- Click **"Confirm Schedule"**
- Verify:
  - Status changes to "Scheduled" (green badge)
  - Driver and vehicle names appear in table
  - Modal closes
  - Success message shown

#### F. Test Other Actions
- **Reject:** Click reject on a pending request → status becomes "Rejected" (red)
- **Delete:** Click delete → request removed from table

---

### 4. Test Analytics
1. Scroll to bottom of admin panel
2. Verify bar chart displays
3. Chart shows last 7 days with request counts
4. Hover over bars to see exact numbers

---

### 5. Test Pagination
1. If you have 10+ requests, verify pagination
2. Click page numbers to navigate
3. Total count should be correct

---

### 6. Test Logout
1. Click **"Logout"** button in admin panel
2. Verify redirect to login page
3. Try accessing `http://localhost:3000/admin` directly
4. Verify automatic redirect back to login

**✅ Expected Result:** Authentication required for protected routes

---

## 📱 Responsive Design Testing

The application uses Bootstrap for responsive design. Test on different screen sizes:

### Desktop (≥992px)
- Forms use centered columns (col-lg-6, col-lg-4)
- Admin table displays all columns
- Search and filters in separate columns

### Tablet (≥768px and <992px)
- Forms use medium columns (col-md-8, col-md-5)
- Table remains functional with horizontal scroll if needed
- Filters stack vertically

### Mobile (<768px)
- Forms use full width (col-12)
- Table scrolls horizontally
- Buttons stack vertically
- Navigation simplified

**To Test:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone, iPad, and Desktop viewports
4. Verify all features work on each size

---

## 🔍 Troubleshooting

### Backend Won't Start
- **Error:** Port 5000 already in use
  - **Solution:** Stop other process using port 5000, or change PORT in `.env`
- **Error:** Database connection failed
  - **Solution:** Delete `backend/app.db` and restart (will recreate with seed data)
- **Error:** Missing .env file
  - **Solution:** Ensure `backend/.env` exists with required variables

### Frontend Won't Start
- **Error:** Port 3000 already in use
  - **Solution:** Stop other process, or frontend will offer alternative port
- **Error:** Cannot connect to API
  - **Solution:** Ensure backend is running on port 5000

### Login Fails
- **Error:** "Invalid credentials"
  - **Solution:** Backend server must be restarted after `.env` changes
  - Verify `.env` has bcrypt hashed password
  - Try: Username `coordinator`, Password `password`

### CORS Errors
- **Error:** "Access-Control-Allow-Origin"
  - **Solution:** Ensure backend CORS allows `http://localhost:3000`
  - Check `backend/app.js` CORS configuration

---

## 📝 Available Scripts

From **root directory**:

| Command | Description |
|---------|-------------|
| `npm start` | Start both backend and frontend |
| `npm run dev` | Start both with colored/labeled output |
| `npm run start:backend` | Start backend API only |
| `npm run start:frontend` | Start frontend app only |

---

## ⚙️ Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here-change-in-production
COORDINATOR_PASSWORD=$2b$10$oAa0D0D3357ko938KUbfauD6/0k7qqv0g3PcM/aLbSMVD8x1Bj91a
```

### Frontend
API URL is configured to `http://localhost:5000/api` (hardcoded in components)

---

## 🎯 Test Checklist

Use this checklist to verify all features:

- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 3000
- [ ] Customer form submits successfully
- [ ] Form validation works (try empty fields)
- [ ] Admin login works with correct credentials
- [ ] Admin login fails with wrong password
- [ ] Protected routes redirect to login
- [ ] Admin dashboard displays all requests
- [ ] Search filters requests correctly
- [ ] Status dropdown filters work
- [ ] Can approve pending requests
- [ ] Can reject pending requests
- [ ] Can schedule with driver/vehicle assignment
- [ ] Can delete requests
- [ ] Analytics chart displays
- [ ] Pagination works (if 10+ requests)
- [ ] Logout clears session
- [ ] Responsive on mobile, tablet, desktop
- [ ] All Bootstrap styles render correctly

---

## 🌐 API Endpoints Reference

### Public
- `GET /api/health` - Health check
- `POST /api/requests` - Submit service request

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Protected (Requires JWT)
- `GET /api/requests` - List requests (with pagination/search/filters)
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request
- `GET /api/drivers` - List drivers
- `GET /api/vehicles` - List vehicles
- `GET /api/analytics/daily` - Get 7-day analytics

---

## 📚 Additional Documentation

- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Authentication Guide:** `backend/AUTHENTICATION.md`
- **Database Setup:** `backend/DATABASE_SETUP.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Test Report:** `TEST_REPORT.md`

---

**Happy Testing! 🎉**
