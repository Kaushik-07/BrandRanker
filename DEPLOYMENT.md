# 🚀 Deployment Guide

## **Current Issue:**
The frontend is deployed on Firebase but the backend is running locally. This causes authentication to fail when users try to register/login from the live website.

## **Solution: Quick Fix for Production**

### **Option 1: Use ngrok (Recommended for Demo)**

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Expose your local backend:**
   ```bash
   ngrok http 8000
   ```

3. **Get the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Update frontend API URL:**
   ```bash
   cd frontend
   echo "REACT_APP_API_URL=https://abc123.ngrok.io" > .env
   npm run build
   firebase deploy
   ```

### **Option 2: Deploy Backend to Railway (Free)**

1. **Go to [railway.app](https://railway.app)**
2. **Create account and connect GitHub**
3. **Create new project**
4. **Connect your GitHub repository**
5. **Set the root directory to `backend`**
6. **Add environment variables:**
   ```
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```
7. **Deploy the project**

8. **Update frontend API URL:**
   ```bash
   cd frontend
   echo "REACT_APP_API_URL=https://your-app.railway.app" > .env
   npm run build
   firebase deploy
   ```

### **Option 3: Deploy Backend to Render (Free)**

1. **Go to [render.com](https://render.com)**
2. **Create account and connect GitHub**
3. **Create new Web Service**
4. **Connect your GitHub repository**
5. **Set the root directory to `backend`**
6. **Set build command:** `pip install -r requirements.txt`
7. **Set start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
8. **Add environment variables:**
   ```
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```
9. **Deploy the project**

10. **Update frontend API URL:**
    ```bash
    cd frontend
    echo "REACT_APP_API_URL=https://your-app.onrender.com" > .env
    npm run build
    firebase deploy
    ```

## **For Interview Demo:**

**Use Option 1 (ngrok) for immediate demo:**

1. Start your backend: `cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. In another terminal: `ngrok http 8000`
3. Copy the ngrok URL and update frontend
4. Deploy to Firebase
5. Share the Firebase URL with your interviewer

**This will work immediately and show that your authentication works!**

## **Files Responsible for Authentication:**

### **Backend:**
- `backend/app/api/auth.py` - Login/Register endpoints
- `backend/app/services/auth_service.py` - JWT token handling
- `backend/app/models/user.py` - User model

### **Frontend:**
- `frontend/src/components/LoginForm.tsx` - Login/Register UI
- `frontend/src/services/api.ts` - API calls
- `frontend/src/contexts/AuthContext.tsx` - Authentication state

## **Error Handling Improvements Made:**
- ✅ Network error detection
- ✅ User-friendly error messages
- ✅ Proper alerts for authentication errors
- ✅ Automatic redirection to login page
- ✅ Better error logging 