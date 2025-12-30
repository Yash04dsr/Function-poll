# 🚀 Production Deployment Guide

## 📝 Pre-Deployment Checklist

### 1. Environment Variables (CRITICAL)

**⚠️ Change ALL default passwords before deploying!**

Update your production `.env.local` (or hosting platform environment variables):

```env
# Firebase Config (from your Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Password (CHANGE THIS!)
NEXT_PUBLIC_ADMIN_PASSWORD=YourSecureAdminPassword123!

# Judge Passwords (CHANGE THESE!)
NEXT_PUBLIC_DANCE_JUDGE1_PASSWORD=SecureDance1Pass456!
NEXT_PUBLIC_DANCE_JUDGE2_PASSWORD=SecureDance2Pass789!
NEXT_PUBLIC_MUSIC_JUDGE1_PASSWORD=SecureMusic1Pass321!
NEXT_PUBLIC_MUSIC_JUDGE2_PASSWORD=SecureMusic2Pass654!
```

**Password Requirements for Production:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Unique for each judge
- Never share publicly
- Store securely (password manager)

---

### 2. Firebase Security Rules (CRITICAL)

Your current Firebase rules allow **anyone** to read/write. This MUST be fixed for production.

**Go to Firebase Console → Firestore Database → Rules**

Replace with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /polls/{pollId} {
      // Anyone can read polls
      allow read: if true;
      
      // Only allow writing to specific vote fields
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['voteCounts', 'judgeVotes', 'isActive']) &&
        // Ensure vote counts only increment (prevent negative votes)
        request.resource.data.voteCounts.vote1 >= resource.data.voteCounts.vote1 &&
        request.resource.data.voteCounts.vote2 >= resource.data.voteCounts.vote2 &&
        request.resource.data.voteCounts.vote3 >= resource.data.voteCounts.vote3 &&
        request.resource.data.voteCounts.vote4 >= resource.data.voteCounts.vote4 &&
        request.resource.data.voteCounts.vote5 >= resource.data.voteCounts.vote5;
      
      // Prevent deletion from client
      allow delete: if false;
      
      // Prevent creation from client (admin should use Firebase Console or Cloud Functions)
      allow create: if false;
    }
  }
}
```

**Note:** For full security, admin operations (create, delete, start/stop voting) should be moved to Firebase Cloud Functions with proper authentication. Client-side password checks are NOT secure.

---

### 3. Git Commit & Push

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add multi-judge voting system with split-view dashboard

- Added 4 separate judge panels (Dance 1/2, Music 1/2)
- Implemented category-based poll filtering
- Enhanced admin dashboard with audience/judge split view
- Added final score calculation (audience + judge average)
- New utility functions: calculateJudgeAverage, calculateFinalScore
- Updated CSV export with all metrics
- Added comprehensive documentation"

# Push to main branch
git push origin main
```

---

### 4. Deploy to Vercel (Recommended)

**Option A: Automatic Deployment via Vercel Dashboard**

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

2. **Configure Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add ALL environment variables from your `.env.local`
   - Make sure to use **production passwords** (not defaults!)

3. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Get your production URL: `https://your-app.vercel.app`

**Option B: Command Line Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to add environment variables
```

---

### 5. Alternative: Deploy to Netlify

```bash
# Install Netlify CLI
npm install netlify-cli -g

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

---

## 🔒 Security Hardening (Before Public Launch)

### Priority 1: Immediate (Before Event)

- [x] ✅ Change all default passwords
- [x] ✅ Update Firebase security rules
- [x] ✅ Add `.env.local` to `.gitignore` (already done)
- [x] ⚠️ Remove `paste.env` from repository (contains credentials!)

```bash
# Remove paste.env from git
git rm paste.env
git commit -m "security: Remove environment file with credentials"
git push
```

- [ ] ⚠️ Enable Firebase App Check (prevents abuse)
  - Go to Firebase Console → App Check
  - Enable for your app
  - Add reCAPTCHA v3 for web

### Priority 2: Within 1 Week

- [ ] 🔐 Move admin operations to Firebase Cloud Functions
  - Create polls via authenticated API
  - Delete polls via authenticated API
  - Control voting via authenticated API
  
- [ ] 🔐 Implement rate limiting (prevent vote spam)
  - Use Vercel Edge Config or Redis
  - Limit votes per IP address (e.g., 1 vote per 10 seconds)

- [ ] 🔐 Replace client-side passwords with Firebase Authentication
  - Create Firebase Auth accounts for admin + judges
  - Use role-based access control (admin vs judge)

### Priority 3: Nice to Have

- [ ] Add server-side validation for votes
- [ ] Implement audit logging for admin actions
- [ ] Add backup strategy for Firestore data
- [ ] Set up monitoring/alerts (Firebase Performance, Sentry)
- [ ] Add automated tests (Jest, Cypress)

---

## 📊 Testing Before Event

### 1. Create Test Polls
```
1. Login to admin
2. Create 2 Dance/Drama polls
3. Create 2 Music polls
```

### 2. Test All Judge Panels
```
1. Open 4 browser tabs (or devices)
2. Login to each judge panel
3. Verify correct polls appear (Dance judges see Dance, Music judges see Music)
4. Test rating submission
```

### 3. Test Audience Voting
```
1. Open vote page
2. Cast test votes
3. Verify duplicate prevention works
```

### 4. Test Admin Dashboard
```
1. Verify all scores calculate correctly
2. Test CSV export
3. Test Start/Stop voting
```

---

## 🎉 Event Day Setup

### 1 Hour Before Event:

1. **Admin Device:**
   - Open admin dashboard
   - Project on screen (optional)
   - Have CSV export ready

2. **Judge Devices:**
   - Send judge URLs + passwords via secure channel (SMS, WhatsApp)
   - Have judges login 15 minutes early
   - Verify they see empty state (no active polls)

3. **Audience:**
   - Display voting URL on screen
   - Create QR code: https://www.qr-code-generator.com
   - Share via social media if needed

### During Event:

1. Admin creates poll for next performance
2. Admin clicks "Start Voting" when performance begins
3. Judges rate during/after performance
4. Admin monitors real-time results
5. Admin clicks "Stop Voting" before next act
6. Repeat for each performance

### After Event:

1. Stop all active polls
2. Export final CSV
3. Backup CSV file
4. Announce winners from Final Score column 🏆

---

## 🔍 Troubleshooting

### Issue: "Environment variables not loading"
**Solution:**
- Vercel: Check Dashboard → Settings → Environment Variables
- Restart deployment after adding variables
- Verify variable names match exactly (case-sensitive)

### Issue: "Firebase permission denied"
**Solution:**
- Check Firebase security rules are deployed
- Verify Firebase config is correct in environment variables
- Check browser console for specific errors

### Issue: "Judge can't see polls"
**Solution:**
- Verify poll type matches judge category
- Check poll is set to "Active" (green LIVE badge in admin)
- Refresh judge's browser

### Issue: "Votes not counting"
**Solution:**
- Check internet connection
- Verify Firebase quotas not exceeded (unlikely for small events)
- Check browser console for errors

---

## 📈 Performance Tips

### For Events with 100+ Concurrent Users:

1. **Enable Firebase caching:**
   ```javascript
   // In lib/firebase.js, add:
   enableIndexedDbPersistence(db).catch((err) => {
     console.warn('Persistence error:', err);
   });
   ```

2. **Use Vercel Pro** (if needed):
   - Better performance
   - More bandwidth
   - Priority support

3. **Test load before event:**
   - Use LoadForge or similar
   - Test with 50+ concurrent votes

---

## 📞 Support Resources

- **Firebase Status:** https://status.firebase.google.com
- **Vercel Status:** https://www.vercel-status.com
- **Next.js Docs:** https://nextjs.org/docs

---

## ✅ Final Checklist

**Before clicking "Deploy":**

- [ ] All passwords changed from defaults
- [ ] Firebase security rules updated
- [ ] Environment variables configured on hosting platform
- [ ] `paste.env` removed from repository
- [ ] All features tested locally
- [ ] Judge URLs + passwords shared securely
- [ ] QR code created for audience voting
- [ ] Backup plan for internet/power outage

**You're ready for production! 🚀**

