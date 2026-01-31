# 🚀 Quick Setup Checklist

## Firebase Authentication - 5 Steps to Success

### ☐ Step 1: Create Firebase Project (5 min)
- Go to https://console.firebase.google.com/
- Create new project
- Name it (e.g., "quiz-x-ai")

### ☐ Step 2: Register Web App (3 min)
- Click web icon `</>`
- Register app
- **COPY the config values** (keep page open!)

### ☐ Step 3: Enable Auth Methods (5 min)
- Go to Authentication → Get started
- Enable **Email/Password**
- Enable **Google** sign-in
- Add your support email

### ☐ Step 4: Update .env.local (2 min)
Replace these values in your `.env.local` file:
```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### ☐ Step 5: Restart & Test (2 min)
```bash
# Stop current server (Ctrl+C)
npm run dev
```

Then test:
- ✅ Sign up with email
- ✅ Google sign-in
- ✅ Regular login
- ✅ Check Firebase Console → Users

---

## 🎯 Total Time: ~15 minutes

## 📚 Full Guide
See `FIREBASE_SETUP_GUIDE.md` for detailed instructions and troubleshooting.
