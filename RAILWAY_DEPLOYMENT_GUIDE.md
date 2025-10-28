# 🚂 Coach-Link Deployment on Railway.app

Complete guide to deploy Coach-Link on **Railway.app** - **FREE $5 credit/month**, no credit card required!

---

## 📋 Overview

- **Frontend**: React app (static files)
- **Backend**: Node.js + Express API
- **Database**: PostgreSQL (Railway free tier)
- **Deployment**: Railway.app (easiest setup!)

**Total Cost**: $0/month ($5 free credit = ~500 hours)

---

## ⚡ Quick Start (10 minutes)

### Why Railway?
- ✅ **$5 FREE credit/month** (no card required)
- ✅ **Easiest deployment** - auto-detects everything
- ✅ **PostgreSQL included** - 1-click setup
- ✅ **Auto-deploys from GitHub**
- ✅ **Better than Render** - no card, faster setup

### Prerequisites
- GitHub account with your Coach-Link repo
- Railway.app account (sign up with GitHub)

---

## 🚀 Step-by-Step Deployment

### Step 1: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub
4. ✅ You get **$5 free credit** immediately!

---

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: **"Coach-Link-OCTICK"**
4. Railway will automatically detect:
   - ✅ Backend (Node.js in `backend/` folder)
   - ✅ Frontend (React in `frontend/` folder)

---

### Step 3: Add PostgreSQL Database

1. In your project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway provisions database instantly (~10 seconds)
4. ✅ Database is ready!

---

### Step 4: Configure Backend

#### 4.1 Set Root Directory

1. Click on your **backend service** (left sidebar)
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Set to: `backend`
5. Click **"Update"**

#### 4.2 Add Environment Variables

1. Click **"Variables"** tab
2. Click **"+ New Variable"** for each:

```env
NODE_ENV=production
JWT_SECRET=<generate-using-command-below>
FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4.3 Railway Variables Explained

- `${{Postgres.DATABASE_URL}}` - Automatically links to your PostgreSQL database
- `${{Frontend.RAILWAY_PUBLIC_DOMAIN}}` - Automatically links to your frontend URL
- Railway automatically sets `PORT` variable

#### 4.4 Deploy Backend

1. Click **"Settings"** tab
2. Scroll to **"Deploy"**
3. Build Command: `npm install` (auto-detected)
4. Start Command: `node app.js` (auto-detected)
5. Click **"Redeploy"** if needed
6. Wait ~2-3 minutes for first deployment

#### 4.5 Get Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy your backend URL: `https://coach-link-backend.up.railway.app`

---

### Step 5: Configure Frontend

#### 5.1 Set Root Directory

1. Click on your **frontend service** (left sidebar)
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Set to: `frontend`
5. Click **"Update"**

#### 5.2 Add Environment Variable

1. Click **"Variables"** tab
2. Add variable:

```env
REACT_APP_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

⚠️ **Important**: Railway automatically adds `https://`, so just add `/api` at the end!

**Or use the full URL manually:**
```env
REACT_APP_API_URL=https://coach-link-backend.up.railway.app/api
```

#### 5.3 Configure Build Settings

1. Go to **"Settings"** tab
2. Build Command: `npm install && npm run build` (auto-detected)
3. Start Command: Leave empty (static site)
4. Click **"Redeploy"**
5. Wait ~2 minutes for build

#### 5.4 Generate Frontend Domain

1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Your frontend URL: `https://coach-link.up.railway.app`

---

### Step 6: Update Backend CORS

1. Go back to **Backend service**
2. Click **"Variables"** tab
3. Update `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://coach-link.up.railway.app
   ```
4. Backend will auto-redeploy (~1 min)

---

## ✅ Verify Deployment

### Test Backend
```bash
curl https://coach-link-backend.up.railway.app/api/health
```
Should return: `{"status":"ok"}`

### Test Frontend
1. Open: `https://coach-link.up.railway.app`
2. You should see the login page
3. Login with default credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
   - ⚠️ **Change this password immediately!**

### Test Full Flow
1. ✅ Login works
2. ✅ Create a new request
3. ✅ View admin dashboard
4. ✅ Real-time updates working

---

## 📊 Railway Free Tier

| Resource | Limit | Notes |
|----------|-------|-------|
| **Credit** | $5/month | ~500 execution hours |
| **Projects** | Unlimited | But limited by credit |
| **Databases** | Unlimited | But limited by credit |
| **Build Minutes** | Unlimited | Not counted against credit |
| **Bandwidth** | 100 GB/month | More than enough |
| **Custom Domain** | ✅ Free | Add your own domain |
| **SSL** | ✅ Free | Automatic HTTPS |

### Credit Usage Breakdown

**Typical monthly usage:**
- Backend: ~$2-3 (always running)
- Database: ~$1-2
- Frontend: ~$0.50
- **Total**: ~$3.50-5.50/month

⚠️ With $5 credit, you can run comfortably for development/testing!

---

## 🔄 Auto-Deployment

Railway automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Builds services
# 3. Deploys in ~2-3 minutes
```

---

## 🛠️ Troubleshooting

### Backend Won't Start

**Check logs:**
1. Backend service → **"Deployments"** tab
2. Click latest deployment
3. View build and deploy logs

**Common issues:**

#### ❌ Error: Cannot find module '/app/index.js'

**Problem:** Railway is trying to run the wrong entry point.

**Solution 1 - Use Start Command (Easiest):**
1. Backend service → **"Settings"** tab
2. Scroll to **"Deploy"** section
3. Set **"Start Command"**: `node app.js`
4. Click **"Redeploy"**

**Solution 2 - Already Fixed (If you pulled latest code):**
- The `railway.json` and `nixpacks.toml` files in the backend folder tell Railway the correct start command
- Just redeploy!

#### Other Common Issues:
- ❌ Wrong root directory → Should be `backend`
- ❌ Missing `DATABASE_URL` → Check Variables tab
- ❌ Wrong start command → Should be `node app.js` (not `index.js`)

### Frontend Shows "Network Error"

**Check:**
1. `REACT_APP_API_URL` includes `/api` at end
2. Backend is deployed and running
3. Backend `FRONTEND_URL` matches frontend domain
4. Browser console for CORS errors

### Database Connection Failed

**Check:**
1. PostgreSQL service is running (green dot)
2. `DATABASE_URL` variable is set: `${{Postgres.DATABASE_URL}}`
3. Backend and database are in same project
4. Check backend logs for connection errors

### Variables Not Working

**Fix:**
1. Make sure variable names are exact (case-sensitive)
2. Use Railway reference format: `${{ServiceName.VARIABLE}}`
3. Redeploy after adding variables
4. Check deployment logs for variable substitution

---

## 🎯 Railway Pro Tips

### 1. Monitor Your Credit Usage

- Dashboard → **"Usage"** → See real-time credit consumption
- Set up notifications when credit is low
- **Tip**: Pause services you're not using

### 2. View Live Logs

```bash
# Install Railway CLI (optional)
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs
```

### 3. Environment-Specific Deployments

- Create multiple environments (dev, staging, prod)
- Each environment gets separate services
- Clone variables between environments

### 4. Database Backups

**Manual Backup:**
1. PostgreSQL service → **"Data"** tab
2. Connect using provided credentials
3. Use `pg_dump` to backup:

```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### 5. Custom Domains

1. Service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Add your domain: `coach-link.com`
4. Add DNS records (Railway provides instructions)
5. ✅ Free SSL automatically provisioned!

---

## 🔒 Security Best Practices

### 1. Change Default Credentials

After first deployment:
- Login as `admin@example.com` / `admin123`
- Immediately change password
- Create new admin user
- Delete default user (optional)

### 2. Secure JWT Secret

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never use the same secret in dev and production!

### 3. Restrict CORS

Update `backend/app.js` CORS settings:
```javascript
const allowedOrigins = [process.env.FRONTEND_URL];
```

Don't use `*` in production!

### 4. Enable Environment Protection

- Railway → Project Settings → Enable **"Protected Environments"**
- Require approval for production deployments
- Prevent accidental changes

---

## 📈 When to Upgrade

### Hobby Plan ($5/month after credit)
- No credit limit
- Priority support
- More resources

### Pro Plan ($20/month)
- Team collaboration
- Advanced metrics
- Higher resource limits
- SLA guarantees

---

## 🚀 Advanced: Using Railway CLI

### Install CLI

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
```

### Link Project

```bash
cd "f:\gitt\Coachlink Intern\Coach-Link-"
railway link
```

### Deploy from CLI

```bash
# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

### Useful Commands

```bash
# View logs
railway logs

# Open in browser
railway open

# Run commands in Railway environment
railway run npm test

# View environment variables
railway vars
```

---

## 🎊 Comparison: Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| **Free Tier** | $5 credit/month | 750 hours/month |
| **Card Required** | ❌ No | ✅ Yes (now) |
| **Setup Speed** | ⚡ 10 min | 🐢 15 min |
| **Auto-detect** | ✅ Excellent | ✅ Good |
| **Database** | ✅ 1-click | ✅ Easy |
| **Sleep** | ❌ No sleep! | ✅ Yes (15 min) |
| **CLI** | ✅ Powerful | ✅ Available |
| **Logs** | ✅ Real-time | ✅ Real-time |
| **Custom Domain** | ✅ Free | ✅ Free |

**Winner**: 🏆 **Railway** (no card, no sleep, easier setup)

---

## 📋 Deployment Checklist

- [ ] Railway account created (GitHub login)
- [ ] New project created from GitHub repo
- [ ] PostgreSQL database added
- [ ] Backend root directory set to `backend`
- [ ] Backend environment variables added
- [ ] Backend domain generated
- [ ] Frontend root directory set to `frontend`
- [ ] Frontend environment variable added
- [ ] Frontend domain generated
- [ ] Backend CORS updated with frontend URL
- [ ] Login test successful
- [ ] Default password changed
- [ ] Create request test successful
- [ ] Real-time updates working

---

## 🆘 Need Help?

### Railway Support
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Project Issues
- GitHub: https://github.com/Hews99vi/Coach-Link-OCTICK/issues

---

## 🎉 Success!

Your Coach-Link application is now live on Railway!

**Your URLs:**
- Frontend: `https://coach-link.up.railway.app`
- Backend: `https://coach-link-backend.up.railway.app`
- Database: Internal (Railway network)

**Next Steps:**
1. 📱 Share your app URL
2. 👥 Create real users
3. 🎨 Add custom domain (optional)
4. 📊 Monitor credit usage
5. 🚀 Deploy updates via `git push`

**Free tier includes:**
- ✅ No card required
- ✅ $5 credit/month
- ✅ No sleep
- ✅ Auto-deploy
- ✅ Free SSL
- ✅ Custom domains

Happy deploying on Railway! 🚂💨
