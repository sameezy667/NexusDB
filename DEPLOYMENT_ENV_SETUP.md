# Deployment Environment Variable Setup

## Problem
Your deployed frontend is getting 404 errors when trying to call `/api/generate` because the `NEXT_PUBLIC_API_URL` environment variable is not set in your deployment environment.

## Error You're Seeing
```
Failed to load resource: the server responded with a status of 404
Error: Server responded with 404
```

This happens because when `NEXT_PUBLIC_API_URL` is not set, the fetch call becomes:
```javascript
fetch(`/api/generate`, ...)  // Relative path - looks for Next.js API route
```

Instead of:
```javascript
fetch(`https://your-backend.com/api/generate`, ...)  // Absolute path to FastAPI backend
```

---

## ✅ Solution: Set Environment Variable in Deployment

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your FastAPI backend URL (e.g., `https://your-backend.herokuapp.com`)
   - **Environment**: Production (and Preview if needed)
4. Click **Save**
5. **Redeploy** your application (Vercel → Deployments → click "..." → Redeploy)

### For Netlify Deployment

1. Go to your Netlify site dashboard
2. Click on **Site settings** → **Environment variables**
3. Click **Add a variable**
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your FastAPI backend URL
4. Click **Save**
5. **Trigger a new deploy** (Deploys → Trigger deploy → Deploy site)

### For Railway Deployment

1. Go to your Railway project
2. Click on your frontend service
3. Go to **Variables** tab
4. Click **+ New Variable**
   - **Variable**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your FastAPI backend URL
5. Railway will automatically redeploy

### For Other Platforms

The key is to set the environment variable `NEXT_PUBLIC_API_URL` with your backend URL before building.

---

## Important Notes

### 1. NEXT_PUBLIC_ Prefix is Required
Next.js only exposes environment variables to the browser if they start with `NEXT_PUBLIC_`. This is a security feature.

```bash
# ✅ CORRECT - Will be available in browser
NEXT_PUBLIC_API_URL=https://backend.com

# ❌ WRONG - Will NOT be available in browser
API_URL=https://backend.com
```

### 2. Must Redeploy After Setting
Environment variables are baked into the build at build time. You must trigger a new deployment after setting the variable.

### 3. No Trailing Slash
Your backend URL should NOT have a trailing slash:

```bash
# ✅ CORRECT
NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com

# ❌ WRONG
NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com/
```

The code automatically strips trailing slashes, but it's best practice to not include them.

---

## Backend URL Examples

Depending on where your FastAPI backend is deployed:

### Heroku
```bash
NEXT_PUBLIC_API_URL=https://your-app-name.herokuapp.com
```

### Railway
```bash
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

### Render
```bash
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
```

### Custom Domain
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Local Development (for reference)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Verification Steps

### 1. Check Environment Variable is Set

After deployment, you can verify the variable is set by:

**Option A**: Check in browser console
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

**Option B**: Check in deployment logs
Look for build logs that show environment variables being loaded.

### 2. Test the Upload

1. Go to your deployed site
2. Navigate to `/whiteboard`
3. Upload a whiteboard image
4. Should see schema generation succeed (not 404)

### 3. Check Network Tab

Open browser DevTools → Network tab:
- ✅ Should see: `https://your-backend.com/api/generate`
- ❌ Should NOT see: `/api/generate` (relative path)

---

## Common Issues

### Issue 1: Still Getting 404 After Setting Variable

**Cause**: Didn't redeploy after setting the variable

**Solution**: Trigger a new deployment. Environment variables are baked in at build time.

### Issue 2: Variable Shows as Undefined

**Cause**: Missing `NEXT_PUBLIC_` prefix

**Solution**: Variable must be named exactly `NEXT_PUBLIC_API_URL`

### Issue 3: CORS Errors

**Cause**: Backend not configured to allow requests from your frontend domain

**Solution**: Update backend CORS settings to include your frontend URL:
```python
# backend/main.py
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend.vercel.app",  # Add your deployed frontend URL
]
```

### Issue 4: Backend Not Deployed

**Cause**: Backend is not running or not accessible

**Solution**: 
1. Deploy your FastAPI backend first
2. Verify it's accessible by visiting `https://your-backend.com/docs`
3. Then set the frontend environment variable

---

## Local Development vs Production

### Local (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production (Deployment Platform)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
```

These are separate configurations. Setting `.env.local` does NOT affect production.

---

## Quick Fix Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend URL is correct (test in browser: `https://backend.com/docs`)
- [ ] Environment variable is named `NEXT_PUBLIC_API_URL` (exact spelling)
- [ ] Environment variable value has no trailing slash
- [ ] Environment variable is set in deployment platform (not just .env.local)
- [ ] Triggered a new deployment after setting the variable
- [ ] Cleared browser cache and tested again

---

## Testing Your Setup

### 1. Test Backend Directly
```bash
curl https://your-backend.com/
# Should return: {"message": "Whiteboard Architect API"}
```

### 2. Test Frontend Environment Variable
Open browser console on your deployed site:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: "https://your-backend.com"
// NOT: undefined or ""
```

### 3. Test Full Flow
1. Upload whiteboard image
2. Check Network tab for the request URL
3. Should be: `https://your-backend.com/api/generate`
4. Should return 200 OK with schema data

---

## Need Help?

If you're still getting 404 errors after following this guide:

1. Check browser console for the exact error message
2. Check Network tab to see what URL is being called
3. Verify `process.env.NEXT_PUBLIC_API_URL` in browser console
4. Check deployment platform logs for build errors
5. Verify backend is accessible at `/docs` endpoint

---

## Summary

**The Fix**: Set `NEXT_PUBLIC_API_URL` environment variable in your deployment platform with your FastAPI backend URL, then redeploy.

**Why It Broke**: Recent commits improved error handling but exposed that the environment variable wasn't set in production.

**How to Prevent**: Always set environment variables in deployment platform before deploying, not just in local `.env.local` file.
