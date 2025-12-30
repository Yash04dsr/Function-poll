# Judge Password Configuration

Add these to your `.env.local` file (or `.env` file):

```env
# Judge Passwords
NEXT_PUBLIC_DANCE_JUDGE1_PASSWORD=dance1pass
NEXT_PUBLIC_DANCE_JUDGE2_PASSWORD=dance2pass
NEXT_PUBLIC_MUSIC_JUDGE1_PASSWORD=music1pass
NEXT_PUBLIC_MUSIC_JUDGE2_PASSWORD=music2pass
```

## Judge Access URLs

### Dance/Drama Judges
- **Dance Judge 1**: http://localhost:3000/judge/dance1
  - Default Password: `dance1pass`
  
- **Dance Judge 2**: http://localhost:3000/judge/dance2
  - Default Password: `dance2pass`

### Music Judges
- **Music Judge 1**: http://localhost:3000/judge/music1
  - Default Password: `music1pass`
  
- **Music Judge 2**: http://localhost:3000/judge/music2
  - Default Password: `music2pass`

## How It Works

1. **Poll Creation**: Admin creates polls and assigns them a category (Dance/Drama or Music)
2. **Judge Access**: Each judge logs in with their unique password
3. **Category Filtering**: Judges only see active polls in their category
4. **Rating**: Judges rate performances 1-5 stars
5. **Final Score**: System calculates: (Audience Overall Score + Judge Average) / 2

## Security Note

⚠️ **IMPORTANT**: Change these default passwords in production by updating the environment variables!
