# MoView Deployment Guide

Deploy your MoView application for FREE using modern cloud services!

## Deployment Stack

- **Database**: NeonDB (PostgreSQL, Free Tier: 0.5GB storage)
- **Backend**: Render (FastAPI, Free Tier: 750 hours/month)
- **Frontend**: Render (React Static Site, Free Tier: 750 hours/month)

---

## Step 1: Setup NeonDB (Database)

### 1.1 Create NeonDB Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (recommended)
3. Create a new project called `moview-db`

### 1.2 Get Database Connection String
1. In your NeonDB dashboard, go to **Connection Details**
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@host.neondb.tech:5432/dbname?sslmode=require
   ```
3. Save this for later - you'll need it for Render

### 1.3 Optional: Test Connection
```bash
# Install psql client (if not already installed)
brew install postgresql  # macOS
# or
sudo apt-get install postgresql-client  # Ubuntu

# Test connection
psql "postgresql://username:password@host.neondb.tech:5432/dbname?sslmode=require"
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **New** → **Web Service**

### 2.2 Connect Repository
1. Select your `MoView` repository
2. Render will automatically detect it's a Python project

### 2.3 Configure Build Settings
- **Name**: `moview-backend`
- **Environment**: `Python 3`
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2.4 Configure Environment Variables
In Render dashboard, go to **Environment** tab and add:

```bash
DATABASE_URL=postgresql://username:password@host.neondb.tech:5432/dbname?sslmode=require
TMDB_API_KEY=your_tmdb_api_key_here
GROQ_API_KEY=your_groq_api_key_here  # Optional - only needed for movie recommendations
SECRET_KEY=your-super-secret-production-key-here
ENVIRONMENT=production
```

### 2.5 Deploy
1. Click **Create Web Service**
2. Wait for deployment (3-5 minutes)
3. Copy your Render URL: `https://your-app-name.onrender.com`

---

## Step 3: Deploy Frontend to Render

### 3.1 Create Frontend Service
1. In your Render dashboard, click **New** → **Static Site**
2. Connect your GitHub repository
3. Select your `MoView` repository

### 3.2 Configure Build Settings
- **Name**: `moview-frontend` (or your preferred name)
- **Root Directory**: `frontend`
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `build`

### 3.3 Configure Environment Variables
In Render dashboard, go to **Environment** tab and add:

```bash
REACT_APP_API_URL=https://your-backend-app-name.onrender.com
```

**Note**: Replace `your-backend-app-name` with your actual backend service name from Step 2.

### 3.4 Deploy
1. Click **Create Static Site**
2. Wait for deployment (2-3 minutes)
3. Your app will be live at: `https://your-frontend-name.onrender.com`

---

## Step 4: Final Configuration

### 4.1 Update CORS (if needed)
If you get CORS errors, update `backend/main.py`:

```python
allowed_origins = [
    "https://your-frontend-name.onrender.com",  # Your Render frontend domain
    "http://localhost:3000",  # Keep for local development
]
```

### 4.2 Test Your Deployment
1. Visit your Render frontend URL
2. Try registering a new user
3. Test movie search and reviews
4. Check that data persists in NeonDB

---

## Cost Breakdown (All FREE!)

| Service | Free Tier Limits | Monthly Cost |
|---------|------------------|--------------|
| **NeonDB** | 0.5GB storage, 1 database | $0 |
| **Render Backend** | 750 hours, 0.5GB RAM, auto-sleep | $0 |
| **Render Frontend** | 750 hours, free static site hosting | $0 |
| **Total** | | **$0/month** |

---

## Continuous Deployment

Both Render services (backend and frontend) will automatically redeploy when you push to your main branch!

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Both services will automatically redeploy! 
```

---

## Troubleshooting

### Common Issues:

**1. Database Connection Error**
- Verify NeonDB connection string includes `?sslmode=require`
- Check DATABASE_URL in Render environment variables

**2. CORS Errors**
- Add your Render frontend domain to allowed_origins in `backend/main.py`
- Redeploy Render service

**3. API Not Found (404)**
- Verify REACT_APP_API_URL in Render frontend environment variables
- Check Render deployment logs

**4. Build Failures**
- Check Render logs in dashboard  
- Verify all environment variables are set

**5. Service Sleep (Render Free Tier)**
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep may take 10-30 seconds
- Consider upgrading to paid plan for production use

### Useful Commands:

```bash
# Check Render logs (via dashboard)
# Go to your service → Logs tab

# Manual redeploy
# Go to your service → Manual Deploy

# Check Render deployment status
# (Check in Render dashboard)
```

---

## Success!

Your MoView app is now live and scalable! Share your deployment URLs:

- **Frontend**: `https://your-frontend-name.onrender.com`
- **Backend API**: `https://your-app-name.onrender.com`
- **Database**: Managed by NeonDB

### Next Steps:
- Add a custom domain
- Set up monitoring
- Implement user analytics
- Scale up as needed

---

## Support

If you encounter issues:
1. Check service status pages (neon.tech/status, render.com/status)  
2. Review deployment logs
3. Verify environment variables
4. Test API endpoints manually

Happy deploying!