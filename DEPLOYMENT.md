# 🚀 RENDER DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment Fixes Applied

### Critical Fixes (502 Resolution)
- [x] Fixed `connectToDatabase()` call - now passes `MONGO_URI` and `DB_NAME` parameters
- [x] Server binds to PORT BEFORE MongoDB connection (fixes health check timeout)
- [x] Added timeout to MongoDB connection (5s instead of hanging indefinitely)
- [x] Explicit binding to `0.0.0.0` instead of localhost

### CORS Fixes
- [x] Added `OPTIONS` method to CORS configuration
- [x] Explicit `app.options('*', cors())` for preflight handling
- [x] Support for multiple origins (production + development)
- [x] Proper `optionsSuccessStatus: 200` for legacy browsers

### Error Handling Improvements
- [x] Async error wrapper for all routes
- [x] Errors now properly forwarded to global error handler
- [x] Input validation on auth routes
- [x] ObjectId validation on gift routes
- [x] 404 handler for unknown routes
- [x] Unhandled promise rejection handler
- [x] Graceful shutdown handlers (SIGTERM, SIGINT)

### MongoDB Connection Improvements
- [x] Added connection timeout (serverSelectionTimeoutMS: 5000ms)
- [x] Added connection pooling configuration
- [x] Added retry logic (retryWrites, retryReads)
- [x] Parameter validation (throws if uri/dbName missing)
- [x] Ping verification after connection
- [x] Exported `closeDatabase()` for cleanup

### Code Quality
- [x] JWT expiration added (24h)
- [x] Environment variable validation
- [x] Better logging with timestamps
- [x] Health endpoint returns uptime info
- [x] NODE_ENV awareness in error messages

---

## 🔧 RENDER DEPLOYMENT STEPS

### 1. Verify MongoDB Atlas Configuration

```bash
# Test your connection string locally
mongosh "mongodb+srv://giftadmin:midhun%4010@cluster0.u1agete.mongodb.net/?appName=Cluster0"
```

**MongoDB Atlas Checklist:**
- [ ] Cluster is running (not paused)
- [ ] Network Access → IP Whitelist → Add `0.0.0.0/0` (allow all)
- [ ] Database Access → User `giftadmin` exists with correct password
- [ ] Connection string is correct (password URL-encoded)

---

### 2. Push to GitHub

```bash
git add .
git commit -m "fix: resolve 502 error and CORS issues for Render deployment"
git push origin main
```

---

### 3. Configure Render

**A. Create New Web Service:**
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your `giftlink-backend` repository
4. Render will auto-detect `render.yaml` configuration

**B. Environment Variables (CRITICAL):**

Set these in Render Dashboard → Environment:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://giftadmin:midhun%4010@cluster0.u1agete.mongodb.net/?appName=Cluster0
DB_NAME=giftlink
JWT_SECRET=your_super_secret_random_string_here_change_this
PORT=10000
```

⚠️ **IMPORTANT**: 
- Don't copy `JWT_SECRET` from above - generate your own: `openssl rand -base64 32`
- `PORT` is automatically set by Render, but we set fallback

**C. Advanced Settings:**
- **Health Check Path**: `/health` (already configured in render.yaml)
- **Auto-Deploy**: Enable (so pushes trigger deploys)

---

### 4. Deploy & Monitor

Click **"Create Web Service"**

**Watch Logs:**
```
[Expected successful output]
==> Starting service...
✓ Server listening on port 10000
✓ Environment: production
Connecting to MongoDB...
MongoDB connected to database: giftlink
✓ MongoDB connected successfully
```

**If you see this → SUCCESS! ✅**

---

## 🧪 POST-DEPLOYMENT TESTING

### Test 1: Health Check
```bash
curl https://your-app.onrender.com/health
```
Expected:
```json
{"status":"OK","timestamp":"2026-02-25T...","uptime":123.45}
```

### Test 2: CORS Preflight
```bash
curl -X OPTIONS https://your-app.onrender.com/api/gifts \
  -H "Origin: https://giftlink-frontend-eta.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v
```
Expected: 
```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Origin: https://giftlink-frontend-eta.vercel.app
< Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

### Test 3: Get Gifts
```bash
curl https://your-app.onrender.com/api/gifts
```
Expected: Array of 16 gift objects

### Test 4: Search by Category
```bash
curl "https://your-app.onrender.com/api/search?category=electronics"
```
Expected: Filtered array of electronics gifts

### Test 5: Frontend Integration
Update your Vercel frontend `.env`:
```
VITE_API_URL=https://your-app.onrender.com
```

Redeploy frontend and test:
- [ ] Homepage loads gifts
- [ ] Category filtering works
- [ ] Login/Register work
- [ ] No CORS errors in browser console

---

## 🐛 TROUBLESHOOTING

### Still Getting 502?

**Check Render Logs:**
1. Render Dashboard → Your Service → Logs
2. Look for:
   - `✓ Server listening on port 10000` - If missing, port binding failed
   - `MongoDB connected` - If missing, check MONGO_URI
   - Any error stack traces

**Common Causes:**
```
❌ "Database not connected" 
   → MONGO_URI not set in Render env vars

❌ "querySrv ENOTFOUND"
   → MONGO_URI format wrong or MongoDB Atlas unreachable

❌ "MongoServerError: bad auth"
   → Password wrong or user doesn't exist in MongoDB Atlas

❌ Service exits immediately
   → Syntax error (check `node -c app.js` locally)

❌ "Connection timeout"
   → MongoDB Atlas IP whitelist doesn't include 0.0.0.0/0
```

### CORS Still Failing?

**Check frontend origin:**
```javascript
// In app.js, verify your Vercel URL is whitelisted:
const allowedOrigins = [
  'https://giftlink-frontend-eta.vercel.app',  // ← Update this
  // ...
];
```

**Browser Console Check:**
```
F12 → Network Tab → Click failed request → Headers
Look for:
  Access-Control-Allow-Origin: [should match your frontend URL]
  Access-Control-Allow-Methods: [should include GET, POST, OPTIONS]
```

### Render Free Tier Spins Down

**Symptom**: First request takes 30+ seconds (cold start)

**Solution**: 
- Use Render's paid tier ($7/mo) for always-on service
- Or accept cold starts (free tier spins down after 15min inactivity)

---

## 🎯 FINAL VERIFICATION

Before marking deployment as complete:

- [ ] `/health` returns 200 OK
- [ ] `/api/gifts` returns 16 gifts
- [ ] `/api/search?category=electronics` filters correctly
- [ ] `POST /api/auth/register` creates user
- [ ] `POST /api/auth/login` returns JWT token
- [ ] Frontend on Vercel can fetch data (no CORS errors)
- [ ] Render logs show no errors for 5+ minutes
- [ ] MongoDB Atlas shows active connections

---

## 📞 Need Help?

**Check these first:**
1. Render Logs (Dashboard → Logs)
2. MongoDB Atlas Metrics (Database → Metrics)
3. Browser DevTools Console (F12 → Console)
4. Network Tab (F12 → Network → filter by Fetch/XHR)

**Common Environment Variable Mistakes:**
```bash
# ❌ WRONG - Password not URL encoded
MONGO_URI=mongodb+srv://user:pass@10@cluster...

# ✅ CORRECT - @ symbol encoded as %40
MONGO_URI=mongodb+srv://user:pass%4010@cluster...
```

---

**Status**: Ready to deploy ✅
**Last Updated**: 2026-02-25
