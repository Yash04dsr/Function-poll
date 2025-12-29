# Festival Voting App

A real-time voting application for cultural festivals built with Next.js and Firebase.

## 🎯 Features

- **Real-Time Voting**: Instant vote updates using Firebase Firestore
- **Smart Ranking System**: 
  - **Raw Average**: Simple average scoring
  - **Bayesian Average**: IMDb-style weighted ranking that prevents low-vote bias
- **Admin Dashboard**: Create polls, control voting, and view leaderboard
- **Mobile-Optimized**: Responsive design with large, easy-to-tap buttons
- **Dark Mode UI**: Easy on the eyes with Tailwind CSS
- **No Login Required**: Voters use LocalStorage to prevent double voting

## 📊 Scoring Logic

### 1. Raw Quality (Simple Average)
$$\text{Score} = \frac{\text{Total Score}}{\text{Total Votes}}$$

### 2. True Rank (Bayesian Average)
$$WR = \frac{v}{v+m} \times R + \frac{m}{v+m} \times C$$

Where:
- $R$ = Raw Average
- $v$ = Total votes for this performance
- $m$ = Minimum votes threshold (default: 10)
- $C$ = Festival-wide average (default: 3.0)

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Firebase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in **Production mode**
   - Choose your region

4. Set Firestore Rules (for development):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /polls/{pollId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

5. Get your Firebase config:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Web" icon (</>)
   - Copy your config values

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### For Voters (Audience)

1. Navigate to `/vote` or click "Vote" on the homepage
2. Wait for the admin to start a poll
3. When a poll is active, rate it from 1-5 stars
4. Your vote is saved locally to prevent duplicates

### For Admins (Organizers)

1. Navigate to `/admin` or click "Admin" on the homepage
2. Login with your admin password (default: `admin123`)
3. **Create Poll**: Enter the performance/question name
4. **Start Voting**: Click "Start Voting" to activate a poll
5. **View Results**: See the leaderboard with both Raw Average and Bayesian Score
6. **Stop Voting**: Click "Stop Voting" when done

## 🏗️ Project Structure

```
festival-voting-app/
├── components/
│   ├── AdminDashboard.js    # Admin interface with poll controls & leaderboard
│   └── VotingPage.js         # Voter interface with real-time updates
├── lib/
│   ├── firebase.js           # Firebase configuration
│   └── utils.js              # Scoring calculation functions
├── pages/
│   ├── _app.js               # Next.js app wrapper
│   ├── index.js              # Homepage
│   ├── admin.js              # Admin login & dashboard page
│   └── vote.js               # Voting page
├── styles/
│   └── globals.css           # Global Tailwind CSS styles
├── .env.local                # Environment variables (create this)
└── package.json              # Dependencies
```

## 🔒 Security Notes

### Development
- The admin password is stored in environment variables
- Firestore rules are open for development (allow read/write: true)

### Production
Before deploying to production:

1. **Implement proper authentication** (Firebase Auth)
2. **Update Firestore Security Rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /polls/{pollId} {
      // Anyone can read polls
      allow read: if true;
      
      // Only authenticated admins can write
      allow write: if request.auth != null && 
                     request.auth.token.admin == true;
    }
  }
}
```

3. **Add rate limiting** to prevent vote spam
4. **Use server-side verification** for critical operations

## 🎨 Customization

### Change Minimum Votes Threshold
Edit [lib/utils.js](lib/utils.js):
```javascript
export function calculateBayesianAverage(voteCounts, festivalAverage = 3.0, minimumVotes = 10)
```

### Modify Rating Scale
Edit [components/VotingPage.js](components/VotingPage.js) to add/remove rating options.

### Styling
All styles use Tailwind CSS. Modify classes in component files or add custom styles in [styles/globals.css](styles/globals.css).

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

Deploy to Vercel (recommended for Next.js):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or deploy to any Node.js hosting platform.

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify your `.env.local` credentials
- Check Firebase project settings
- Ensure Firestore is enabled

### Votes Not Updating
- Check browser console for errors
- Verify Firestore rules allow writes
- Clear localStorage: `localStorage.clear()`

### Admin Login Not Working
- Check `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local`
- Default password is `admin123`
- Clear sessionStorage: `sessionStorage.clear()`

## 📄 License

MIT License - Feel free to use this project for your cultural festival!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Firebase, and Tailwind CSS
