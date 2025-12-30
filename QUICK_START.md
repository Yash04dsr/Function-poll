# 🎯 Quick Start Guide - Multi-Judge Voting System

## 🚀 Getting Started

### Step 1: Start the Server
```bash
npm run dev
```
Visit: http://localhost:3000

---

## 👨‍💼 Admin Workflow

### 1. Login to Admin Panel
- Go to http://localhost:3000/admin
- Password: `admin123`

### 2. Create a New Poll
1. Enter performance name (e.g., "Classical Dance Performance")
2. Select category:
   - 🎭 Dance/Drama
   - 🎵 Music
3. Click "Create Poll"

### 3. Start Voting
1. Find the poll in "Poll Controls" section
2. Click "Start Voting"
3. Poll is now LIVE for both audience and judges!

### 4. Monitor Results
- View real-time leaderboard
- See audience votes update instantly
- Watch judge ratings come in
- Final scores calculated automatically

### 5. Stop & Export
1. Click "Stop Voting" when done
2. Click "📥 Export CSV" to download all results

---

## ⚖️ Judge Workflow

### Dance/Drama Judges

**Judge 1:**
- URL: http://localhost:3000/judge/dance1
- Password: `dance1pass`

**Judge 2:**
- URL: http://localhost:3000/judge/dance2
- Password: `dance2pass`

### Music Judges

**Judge 1:**
- URL: http://localhost:3000/judge/music1
- Password: `music1pass`

**Judge 2:**
- URL: http://localhost:3000/judge/music2
- Password: `music2pass`

### Rating Process
1. Enter your unique judge URL
2. Login with password
3. Wait for poll to go LIVE in your category
4. Rate performance 1-5 stars (click any number)
5. Rating saved instantly ✅
6. Can change rating anytime during voting

**Note:** Judges only see polls in their category!

---

## 👥 Audience Workflow

### Voting
1. Go to http://localhost:3000/vote
2. Wait for active poll
3. Click 1-5 stars to rate
4. Enjoy confetti celebration! 🎉
5. Vote is saved (can't vote twice on same poll)

---

## 📊 Understanding the Dashboard

### Performance Card Layout

```
┌─────────────────────────────────────────────┐
│  #1 Classical Dance Performance    🎭       │
│  [LIVE badge if active]                     │
├──────────────────┬──────────────────────────┤
│  👥 AUDIENCE    │  ⚖️ JUDGES              │
│                  │                          │
│  Total: 45      │  Judge 1: 4.5 ⭐        │
│  Raw: 4.3       │  Judge 2: 4.0 ⭐        │
│  Overall: 4.2   │  Average: 4.25          │
│                  │                          │
│  5★:20 4★:15... │                          │
├─────────────────────────────────────────────┤
│  🏆 FINAL SCORE: 4.23                      │
│  (Audience 4.2 + Judge 4.25) / 2          │
└─────────────────────────────────────────────┘
```

### Color Coding
- 🥇 **#1**: Gold text
- 🥈 **#2**: Silver text
- 🥉 **#3**: Bronze text
- Others: Purple text

### Badges
- 🎭 **Pink badge**: Dance/Drama category
- 🎵 **Blue badge**: Music category
- 🟢 **LIVE**: Currently accepting votes

---

## 🎓 Tips & Best Practices

### For Admins
1. ✅ Create all polls before the event starts
2. ✅ Test with judges before going live
3. ✅ Only activate one poll at a time
4. ✅ Give judges 30-60 seconds to submit ratings
5. ✅ Export CSV regularly as backup

### For Judges
1. ✅ Login 10 minutes before event
2. ✅ Keep browser tab open during event
3. ✅ Wait for performance to finish before rating
4. ✅ Use full 1-5 range (don't only use 4-5)
5. ✅ Refresh if poll doesn't appear (rare)

### For Audience
1. ✅ One vote per person per performance
2. ✅ Vote is final (can't change after submission)
3. ✅ Wait for admin to activate poll
4. ✅ Use any device (mobile, tablet, laptop)

---

## 🔍 Troubleshooting

### "Poll not appearing for judge"
- ✅ Check category matches (Dance judge won't see Music polls)
- ✅ Verify poll is ACTIVE (check admin panel)
- ✅ Refresh the page

### "Can't vote again"
- ✅ This is intentional! One vote per poll per device
- ✅ Use different device if needed for testing

### "Scores not updating"
- ✅ Wait 1-2 seconds (real-time updates may have slight delay)
- ✅ Check internet connection
- ✅ Refresh browser

### "Judge rating shows 0"
- ✅ Judge hasn't rated yet (shows "Not rated" in dashboard)
- ✅ Judge needs to click 1-5 stars to submit

---

## 📈 Scoring Explained Simply

### Audience Score
- **Raw Average**: Simple average of all votes
- **Overall Score**: Adjusted for fairness (prevents new performances from being unfairly low)

### Judge Score
- Average of both judges in that category
- Only relevant judges count (Dance judges for Dance, Music judges for Music)

### Final Score
- Takes average of Audience Overall and Judge Average
- This is the ranking you see in leaderboard
- Winner = Highest Final Score 🏆

---

## 🎉 Event Day Checklist

### Before Event
- [ ] All polls created with correct categories
- [ ] Judge passwords shared with judges
- [ ] Judges logged in and waiting
- [ ] Test poll created and voted on
- [ ] Audience knows the voting URL

### During Event
- [ ] Activate poll when performance starts
- [ ] Monitor judge ratings coming in
- [ ] Wait for most audience votes
- [ ] Stop voting before next performance
- [ ] Quick glance at current rankings

### After Event
- [ ] All polls stopped
- [ ] Export CSV with final results
- [ ] Backup CSV file
- [ ] Announce winners! 🎊

---

## 💡 Pro Tips

1. **Projector Display**: Open admin dashboard on projector to show live rankings
2. **QR Code**: Create QR code for `/vote` URL for easy audience access
3. **Judge Devices**: Use tablets for judges for better experience
4. **Backup**: Screenshot leaderboard periodically
5. **Testing**: Do a complete run-through with sample polls before event

---

## 🎊 You're All Set!

Everything is configured and ready to go. The system handles:
- ✅ Real-time vote counting
- ✅ Automatic score calculations
- ✅ Judge filtering by category
- ✅ Duplicate vote prevention
- ✅ Beautiful visual presentation

**Just start voting and let the system do the magic! ✨**

---

Need help? Check `IMPLEMENTATION_COMPLETE.md` for technical details or `README.md` for setup instructions.
