# CORS Fix Deployment Guide

## 🚨 Issue Summary
Users were unable to sign up, login, or create experiments due to CORS origin restrictions in production.

## 🔧 Changes Made

### Backend Changes (`backend/app/main.py`)
1. **Fixed CORS Configuration**:
   - Removed wildcard origin (`"*"`) which conflicts with credentials
   - Enabled `allow_credentials=True` for production
   - Added proper environment variable support for CORS origins

2. **Updated CORS Preflight Handler**:
   - Now properly handles credentials
   - Uses the same origins list as the main CORS middleware
   - Added proper `Access-Control-Allow-Credentials: true` header

3. **Added Health Check Endpoint**:
   - `/health` endpoint for debugging CORS configuration
   - Shows current CORS origins and debug mode

### Frontend Changes (`frontend/src/services/api.ts`)
1. **Enabled Credentials**:
   - Changed `withCredentials: false` to `withCredentials: true`
   - This allows cookies and authorization headers to be sent

### Configuration Changes
1. **Environment Variables** (`render.yaml`):
   - Added `BACKEND_CORS_ORIGINS` with all production frontend URLs
   - Added `DEBUG: false` for production

2. **Backend Config** (`backend/app/core/config.py`):
   - Updated `BACKEND_CORS_ORIGINS` to use string format for environment variables

## 🚀 Deployment Steps

### 1. Deploy Backend to Render
```bash
# The changes are already in the codebase
# Render will automatically deploy when you push to your repository
git add .
git commit -m "Fix CORS configuration for production"
git push origin main
```

### 2. Verify Backend Deployment
```bash
# Test the health endpoint
curl https://brand-ranker-backend.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "message": "BrandRanker Backend is running",
  "cors_origins": ["https://brand-ranker-app.web.app", ...],
  "debug_mode": false,
  "timestamp": "2024-..."
}
```

### 3. Deploy Frontend to Firebase
```bash
cd frontend
npm run build
firebase deploy
```

### 4. Test CORS Configuration
```bash
# Run the CORS test script
python test-cors-production.py
```

## 🧪 Testing Checklist

### Before Deployment
- [ ] Backend CORS configuration allows production frontend URLs
- [ ] Frontend has `withCredentials: true`
- [ ] Environment variables are set in Render

### After Deployment
- [ ] Health endpoint returns correct CORS origins
- [ ] Users can register/login from different devices
- [ ] Users can create experiments from different devices
- [ ] No CORS errors in browser console

## 🔍 Debugging

### Check CORS Headers
```bash
# Test OPTIONS request
curl -X OPTIONS \
  -H "Origin: https://brand-ranker-app.web.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  https://brand-ranker-backend.onrender.com/api/auth/login
```

### Expected CORS Headers
```
Access-Control-Allow-Origin: https://brand-ranker-app.web.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH
Access-Control-Allow-Headers: Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma, Expires, X-CSRF-Token, X-API-Key
```

## 🚨 Common Issues

### Issue: Still getting CORS errors
**Solution**: 
1. Check that the frontend URL is in the `BACKEND_CORS_ORIGINS` list
2. Verify `allow_credentials=True` in backend
3. Verify `withCredentials: true` in frontend

### Issue: 401 Unauthorized errors
**Solution**:
1. Check that Authorization headers are being sent
2. Verify token is stored in localStorage
3. Check that credentials are enabled

### Issue: Preflight requests failing
**Solution**:
1. Check that OPTIONS requests return 200
2. Verify CORS headers are present in OPTIONS response
3. Check that `Access-Control-Allow-Credentials: true` is set

## 📞 Support
If issues persist after deployment:
1. Check browser console for specific CORS errors
2. Test with the provided test script
3. Verify environment variables in Render dashboard
4. Check that both frontend and backend are deployed to production URLs 