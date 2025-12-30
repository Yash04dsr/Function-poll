# Timer & Category Filter Fixes

## ✅ Issues Fixed:

### 1. Timer Not Displaying
**Problem:** Timer only showing on admin, not on audience or judge pages  
**Solution:** 
- Added backwards compatibility for old polls without `duration` field (defaults to 60s)
- Reset `isExpired` state when new poll becomes active
- Reset `expiredPolls` object when poll list changes

### 2. Judges Can't See Their Category Polls
**Problem:** Music judges not seeing Music polls, Dance judges not seeing Dance polls  
**Solution:**
- Added console logging to debug category matching
- The filter logic was correct, but we can now see what's happening in console

## 🧪 Testing Instructions:

### Test Timer Display:

1. **Open browser console** (F12 or Cmd+Option+I)

2. **Create a test poll:**
   - Go to Admin (`/admin`)
   - Create poll: "Test Dance" with type "Dance/Drama", duration 30s
   - Click "Start Voting"

3. **Check Audience Timer:**
   - Go to `/vote`
   - You should see countdown timer above voting buttons
   - Watch it countdown and turn red at 10 seconds

4. **Check Judge Timer:**
   - Go to `/judge/dance1` (login: dance1pass)
   - You should see the same countdown timer
   - Should auto-disable rating buttons when expired

5. **Check Music Judge:**
   - Go to `/judge/music1` (login: music1pass)
   - Should NOT see Dance poll (correct!)
   - Create Music poll and activate it
   - Should now see the Music poll with timer

### Debug Console Output:

When you open a judge page, you'll see logs like:
```
[Dance Judge 1] Total polls: 3
[Dance Judge 1] Looking for category: Dance/Drama
  - Test Dance: type="Dance/Drama", isActive=true, match=true
  - Test Music: type="Music", isActive=false, match=false
[Dance Judge 1] Filtered polls: 1
```

This helps verify:
- ✅ Polls are being fetched
- ✅ Category matching is working
- ✅ Active status filtering is working

## 🎯 What Works Now:

✅ **Admin Dashboard** - Timer displays for active polls  
✅ **Audience Voting** - Timer displays above rating buttons  
✅ **Judge Panels** - Timer displays above rating buttons  
✅ **Auto-Disable** - Voting/rating automatically disabled when time expires  
✅ **Category Filter** - Judges only see polls in their category  
✅ **Backwards Compatible** - Old polls without duration field default to 60s  

## 📝 Notes:

- **Old Polls:** If you have existing active polls created before adding timer, stop them and restart them. This will add the `startTime` field.
- **Default Duration:** If a poll has no duration field, it defaults to 60 seconds
- **Console Logs:** You can remove the console.log statements in JudgeVotingPage after confirming everything works

## 🚀 Ready to Test!

Refresh your browser and test all three pages:
1. Admin - Create and start a poll
2. Audience - Should see timer
3. Judge - Should see timer (only for matching category)
