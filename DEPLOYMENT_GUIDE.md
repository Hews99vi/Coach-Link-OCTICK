# 🚀 Coach-Link Deployment Guide

Complete guide to deploy Coach-Link on **Render.com** (100% FREE tier).

---

## 📋 Overview

- **Frontend**: React app (static files)
- **Backend**: Node.js + Express API
- **Database**: PostgreSQL (Render free tier)
- **Deployment**: Render.com (all-in-one platform)

**Total Cost**: $0/month with free tier limits

---

## ⚡ Quick Start (15 minutes)

### Prerequisites
- GitHub account with your Coach-Link repo
- Render.com account (sign up with GitHub)

### Deployment Order
1. ✅ Database (PostgreSQL)
2. ✅ Backend (Node.js API)
3. ✅ Frontend (Static Site)

---

## 🗄️ Step 1: Deploy PostgreSQL Database

### 1.1 Create Database

1. Go to **https://render.com** → Sign in with GitHub
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   ```
   Name: coach-link-db
   Database: coach_link
   User: coach_link_user (auto-generated)
   Region: Choose closest to your location
   PostgreSQL Version: 16 (default)
   Plan: Free
   ```
4. Click **"Create Database"**
5. Wait ~1 minute for provisioning

### 1.2 Get Connection String

1. Open your database from dashboard
2. Scroll down to **"Connections"** section
3. Copy the **"Internal Database URL"** (starts with `postgresql://`)
4. Save it somewhere - you'll need it in Step 2

**Example:**
```
postgresql://coach_link_user:xxxxx@dpg-xxxxx.oregon-postgres.render.com/coach_link
```

---

## 🔧 Step 2: Deploy Backend (Node.js API)

### 2.1 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** → Authorize Render
3. Select repository: **"Coach-Link-OCTICK"**
4. Configure:

   ```
   Name: coach-link-backend
   Region: Same region as your database (important!)
   Branch: main (or feature/postgresql-migration)
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node app.js
   Instance Type: Free
   ```

### 2.2 Add Environment Variables

Click **"Environment"** → **"Add Environment Variable"** for each:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render default |
| `JWT_SECRET` | Generate secure key* | Min 32 chars |
| `DATABASE_URL` | Paste from Step 1.2 | PostgreSQL URL |
| `FRONTEND_URL` | `https://coach-link.onrender.com` | Update after Step 3 |

**\*Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Wait ~3-5 minutes for first build
3. Watch build logs for errors
4. When you see: ✅ **"Live"** - backend is ready!

### 2.4 Verify Backend

Your backend URL: `https://coach-link-backend.onrender.com`

Test it:
```bash
curl https://coach-link-backend.onrender.com/api/health
```

Should return: `{"status":"ok"}`

### 2.5 Initialize Database

The database tables will be created automatically on first run by Sequelize.

**Default Admin User:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: coordinator

⚠️ **Change this password after first login!**

---

## 🎨 Step 3: Deploy Frontend (Static Site)

### 3.1 Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:

   ```
   Name: coach-link
   Branch: main (or feature/postgresql-migration)
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

### 3.2 Add Environment Variable

Click **"Environment"** → Add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://coach-link-backend.onrender.com/api` |

⚠️ **Important**: Include `/api` at the end!

### 3.3 Deploy

1. Click **"Create Static Site"**
2. Wait ~2-3 minutes for build
3. When you see: ✅ **"Live"** - frontend is ready!

### 3.4 Update Backend CORS

1. Go back to your **backend service**
2. Environment → Edit `FRONTEND_URL`
3. Update to your frontend URL: `https://coach-link.onrender.com`
4. Save → Backend will auto-redeploy (~1 min)

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Frontend
1. Open: `https://coach-link.onrender.com`
2. You should see the login page
3. Try logging in with default admin credentials

### 4.2 Test Backend
1. Open: `https://coach-link-backend.onrender.com/api/health`
2. Should return: `{"status":"ok"}`

### 4.3 Test Full Flow
1. Login as admin
2. Create a new request
3. View dashboard
4. Check real-time updates work

---

## 🎯 Free Tier Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| **Backend** | 750 hours/month | Sleeps after 15 min inactivity |
| **Frontend** | 100 GB bandwidth | No sleep, always fast |
| **Database** | 1 GB storage | Auto-deleted after 90 days of inactivity |
| **Build Minutes** | 500/month | Usually enough |
| **Deployments** | Unlimited | Auto-deploy on git push |

### ⚠️ Backend Sleep Behavior

Free tier backends sleep after **15 minutes** of inactivity:
- First request after sleep: ~30 seconds response time
- Subsequent requests: Normal speed

**Solution**: Use a free uptime monitor:
1. Sign up: **https://uptimerobot.com** (free)
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://coach-link-backend.onrender.com/api/health`
   - Interval: 5 minutes
3. Your backend stays awake 24/7!

---

## 🔄 Auto-Deployment

Render automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Builds backend & frontend
# 3. Deploys in ~3-5 minutes
```

---

## 🛠️ Troubleshooting

### Backend Won't Start

**Check logs:** Render Dashboard → Backend Service → Logs

Common issues:
- ❌ Missing environment variables → Add them in Environment tab
- ❌ Wrong `DATABASE_URL` → Copy from database "Internal URL"
- ❌ Port conflict → Ensure `PORT=10000` in env vars
- ❌ Build failed → Check `package.json` scripts

### Frontend Shows "Network Error"

1. Check `REACT_APP_API_URL` has `/api` at end
2. Verify backend is live (check backend URL)
3. Check backend `FRONTEND_URL` matches frontend URL
4. Look at browser console for CORS errors

### Database Connection Error

1. Verify `DATABASE_URL` is correct
2. Ensure backend and database are in same region
3. Check database status (should be "Available")
4. Try using "External URL" instead of "Internal URL"

### Real-time Updates Not Working (SSE)

1. Ensure both servers are HTTPS (Render provides this)
2. Check browser console for EventSource errors
3. Verify token is being passed in SSE URL
4. Check backend logs for connection attempts

---

## 🔒 Security Best Practices

### Before Going Live

1. ✅ **Change default admin password**
   - Login as `admin@example.com`
   - Go to profile → Change password

2. ✅ **Generate strong JWT_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. ✅ **Limit FRONTEND_URL to your actual domain**
   - Don't use `*` or multiple URLs
   - Use exact URL: `https://coach-link.onrender.com`

4. ✅ **Review CORS settings**
   - Check `backend/app.js` CORS configuration
   - Ensure only your frontend can access API

5. ✅ **Enable HTTPS only**
   - Render provides free SSL
   - Force HTTPS in production

---

## 📊 Monitoring

### Render Dashboard

Monitor your services:
- **Metrics**: CPU, Memory, Response time
- **Logs**: Real-time application logs
- **Events**: Deployments, restarts, crashes

### Set Up Alerts

1. Render Dashboard → Service → Settings
2. Add notification webhook or email
3. Get notified of:
   - Deployment failures
   - Service crashes
   - High resource usage

---

## 🌐 Custom Domain (Optional)

### Add Your Domain

1. Purchase domain (Namecheap, GoDaddy, etc.)
2. Render Dashboard → Static Site → Settings
3. Click **"Custom Domain"**
4. Add domain: `coach-link.com`
5. Add DNS records:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: <your-render-site>.onrender.com
   ```
6. Wait for DNS propagation (~10 min - 24 hours)
7. Free SSL certificate auto-generated!

---

## 🔄 Database Backup

### Manual Backup

```bash
# Get database URL from Render
# Run pg_dump locally

pg_dump -h dpg-xxxxx.oregon-postgres.render.com \
  -U coach_link_user \
  -d coach_link \
  -F c \
  -f backup.dump
```

### Automated Backups

Free tier: **No automated backups**

Options:
1. Upgrade to paid plan ($7/month) for daily backups
2. Create manual backup script with GitHub Actions
3. Export data to CSV periodically

---

## 📈 Scaling Options

### When to Upgrade

Free tier is great for:
- ✅ Development
- ✅ Testing
- ✅ Small teams (<50 users)
- ✅ Low traffic (<1000 requests/day)

Upgrade when you need:
- ❌ No sleep (always-on backend)
- ❌ More database storage (>1GB)
- ❌ Faster response times
- ❌ Automated backups
- ❌ Multiple environments (staging/prod)

### Paid Plans (Render)

| Plan | Cost | Features |
|------|------|----------|
| **Starter** | $7/month | No sleep, 2GB DB |
| **Standard** | $25/month | More resources, backups |
| **Pro** | $85/month | High availability |

---

## 🆘 Support

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Project Issues
- GitHub Issues: https://github.com/Hews99vi/Coach-Link-OCTICK/issues

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Database connection string saved
- [ ] Backend deployed with all env vars
- [ ] Backend health check passes
- [ ] Frontend deployed with API URL
- [ ] Frontend CORS updated in backend
- [ ] Login with default admin works
- [ ] Change admin password
- [ ] Test creating request
- [ ] Test real-time updates
- [ ] Set up UptimeRobot (optional)
- [ ] Add custom domain (optional)

---

## 🎉 Success!

Your Coach-Link application is now live on Render!

**Next Steps:**
1. Share your app URL with users
2. Monitor usage and performance
3. Set up regular database backups
4. Consider custom domain for professional look
5. Upgrade to paid tier when needed

**Your URLs:**
- Frontend: `https://coach-link.onrender.com`
- Backend: `https://coach-link-backend.onrender.com`
- API Docs: `https://coach-link-backend.onrender.com/api/health`

Happy deploying! 🚀
