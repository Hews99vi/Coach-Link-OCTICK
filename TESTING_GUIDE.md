# Application Testing Guide

## Complete Application Flow Test

This guide walks you through testing the entire Coach-Link application from customer request submission to admin management.

## Prerequisites

1. **Backend server must be running**
   ```bash
   cd backend
   node app.js
   ```
   You should see:
   ```
   ✓ Database connection established successfully
   🚀 Server is running on port 5000
   ```

2. **Environment variables configured**
   - Ensure `backend/.env` exists with:
     ```
     NODE_ENV=development
     PORT=5000
     JWT_SECRET=your-secret-key-here-change-in-production
     COORDINATOR_PASSWORD=password
     ```

---

## Automated Test Script

Run the comprehensive test script (requires backend server running):

```bash
cd backend
node scripts/testFlow.js
```

This will test:
- ✅ Health endpoint
- ✅ Customer request submission (public)
- ✅ Admin login with JWT
- ✅ Token verification
- ✅ Protected endpoints access
- ✅ Search and filtering
- ✅ Request approval/scheduling
- ✅ Driver/vehicle assignment
- ✅ Analytics data
- ✅ Request deletion

---

## Manual Testing

### 1. Test Backend API (Terminal)

#### A. Health Check
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"ok","timestamp":"...","database":"connected"}`

#### B. Submit Customer Request (Public Endpoint)
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "phone": "555-1234",
    "pickup_location": "123 Main St",
    "dropoff_location": "456 Oak Ave",
    "pickup_time": "2025-10-28T10:00:00.000Z",
    "passengers": 3,
    "notes": "Test request"
  }'
```
Expected: `{"success":true,"data":{...},"message":"Service request created successfully"}`

#### C. Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"coordinator","password":"password"}'
```
Expected: `{"success":true,"token":"eyJhbGc...",...}`

**Save the token for next requests!**

#### D. Get All Requests (Protected)
```bash
curl http://localhost:5000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Expected: `{"success":true,"data":[...],"pagination":{...}}`

#### E. Search Requests
```bash
curl "http://localhost:5000/api/requests?search=John&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### F. Update Request Status
```bash
curl -X PUT http://localhost:5000/api/requests/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

#### G. Get Drivers & Vehicles
```bash
curl http://localhost:5000/api/drivers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

curl http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### H. Schedule Assignment
```bash
curl -X PUT http://localhost:5000/api/requests/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "scheduled",
    "driver_id": 1,
    "vehicle_id": 1
  }'
```

#### I. Get Analytics
```bash
curl http://localhost:5000/api/analytics/daily \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### J. Delete Request
```bash
curl -X DELETE http://localhost:5000/api/requests/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 2. Test Frontend UI (Browser)

#### A. Start Frontend Server
In a **new terminal**:
```bash
cd frontend
npm start
```
Browser should automatically open to `http://localhost:3000`

#### B. Test Customer Portal
1. Navigate to `http://localhost:3000/`
2. Fill out the request form:
   - Customer Name: "Jane Smith"
   - Phone: "555-5678"
   - Pickup Location: "789 Elm St"
   - Dropoff Location: "321 Pine Ave"
   - Pickup Time: Select a future date/time
   - Passengers: 4
   - Notes: "Airport pickup"
3. Click "Submit Request"
4. Verify success message appears
5. Check that form resets

#### C. Test Admin Login
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Username: `coordinator`
   - Password: `password`
3. Click "Login"
4. Verify redirect to admin panel

#### D. Test Admin Dashboard
1. **View Requests Table**
   - Verify all submitted requests appear
   - Check pagination works (if > 10 requests)

2. **Search Functionality**
   - Type "Jane" in search box
   - Verify filtered results

3. **Status Filter**
   - Select "Pending" from dropdown
   - Verify only pending requests shown
   - Try other statuses

4. **Approve Request**
   - Click "Approve" button on a pending request
   - Verify status changes to "Approved"

5. **Schedule Assignment**
   - Click "Schedule" on an approved request
   - Modal should open
   - Select driver from dropdown
   - Select vehicle from dropdown
   - Click "Confirm Schedule"
   - Verify status changes to "Scheduled"
   - Verify driver/vehicle names appear

6. **Reject Request**
   - Click "Reject" on a pending request
   - Verify status changes to "Rejected"

7. **Delete Request**
   - Click "Delete" on any request
   - Confirm deletion
   - Verify request removed from table

8. **Analytics Chart**
   - Scroll to bottom of admin panel
   - Verify bar chart shows 7 days of data
   - Hover over bars to see counts

9. **Logout**
   - Click "Logout" button
   - Verify redirect to login page
   - Try accessing `/admin` directly
   - Verify redirect back to login (protected route)

---

## Test Scenarios

### Scenario 1: Complete Customer Journey
1. Customer submits request via form
2. Admin logs in
3. Admin approves request
4. Admin schedules with driver/vehicle
5. Verify assignment created

### Scenario 2: Search & Filter
1. Create 3 requests with different names
2. Search by name
3. Filter by status
4. Verify results update correctly

### Scenario 3: Authentication Flow
1. Try accessing `/admin` without login → redirected to `/login`
2. Login with wrong password → error message
3. Login with correct credentials → JWT token stored
4. Access `/admin` → dashboard loads
5. Logout → token cleared
6. Try accessing `/admin` again → redirected to `/login`

### Scenario 4: Validation
1. Try submitting empty form → validation errors
2. Try scheduling without driver → error
3. Try scheduling without vehicle → error

---

## Expected Results Summary

### Backend API
- ✅ Server starts on port 5000
- ✅ Database connects successfully
- ✅ All endpoints respond correctly
- ✅ JWT authentication works
- ✅ Pagination returns correct counts
- ✅ Search filters data properly
- ✅ Assignments created correctly

### Frontend UI
- ✅ Customer form submits successfully
- ✅ Login authenticates and stores token
- ✅ Protected routes redirect when not authenticated
- ✅ Admin table displays all requests
- ✅ Search and filters update table
- ✅ CRUD operations work (approve, schedule, delete)
- ✅ Chart displays analytics data
- ✅ Logout clears session

---

## Troubleshooting

### Backend Issues
- **Server won't start**: Check if port 5000 is already in use
- **Database errors**: Delete `app.db` and restart server (will recreate)
- **Authentication fails**: Verify `.env` file has `COORDINATOR_PASSWORD=password`
- **CORS errors**: Ensure frontend is on `http://localhost:3000`

### Frontend Issues
- **Can't login**: Backend server must be running
- **Requests don't load**: Check browser console for errors
- **Network error**: Verify backend is on port 5000
- **Token expired**: Re-login (tokens expire after 1 hour)

---

## Quick Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
node app.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Browser:**
- Customer Portal: `http://localhost:3000/`
- Admin Login: `http://localhost:3000/login`
- Admin Panel: `http://localhost:3000/admin` (after login)

---

## Test Checklist

- [ ] Backend server starts successfully
- [ ] Health endpoint responds
- [ ] Customer can submit request (public)
- [ ] Admin can login and receive token
- [ ] Admin dashboard loads with data
- [ ] Search functionality works
- [ ] Status filter works
- [ ] Can approve requests
- [ ] Can schedule assignments with driver/vehicle
- [ ] Can reject requests
- [ ] Can delete requests
- [ ] Analytics chart displays correctly
- [ ] Logout clears session
- [ ] Protected routes redirect when not authenticated
- [ ] Form validation works

---

## Next Steps After Testing

1. **If all tests pass:**
   - Application is ready for deployment
   - Consider adding more features (notifications, reports, etc.)

2. **If tests fail:**
   - Check backend/frontend logs
   - Verify environment variables
   - Ensure all dependencies installed
   - Check database has seed data

3. **Production Preparation:**
   - Change JWT_SECRET to strong random value
   - Change COORDINATOR_PASSWORD to secure password
   - Set NODE_ENV=production
   - Add input sanitization
   - Add rate limiting
   - Set up proper logging
   - Configure production database
