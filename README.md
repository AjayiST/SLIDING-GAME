# 🎮 FRAME PUZZLE - SETUP GUIDE

## ⚡ QUICK START

### Option 1: Use the Batch File (EASIEST)
1. **Double-click** `start-server.bat` 
2. Browser will open to `http://localhost:8000/game.html`
3. Your game is ready! 🎲

### Option 2: PowerShell (if batch doesn't work)
```powershell
cd "C:\Users\Eliza\Documents\SLIDING GAME"
python -m http.server 8000
```
Then open browser to: `http://localhost:8000/game.html`

### Option 3: Use Python Directly
```
python -m http.server 8000 --directory "C:\Users\Eliza\Documents\SLIDING GAME"
```
Then open: `http://localhost:8000/game.html`

---

## 📁 Current Folder Structure

```
SLIDING GAME/
├── game.html              ← Main game file
├── styles.css             ← Styling
├── script.js              ← Game logic
├── start-server.bat       ← Quick start ✅
├── README.md              ← This file
├── assets/
│   └── nft-art/
│       ├── frame 1.png ✓
│       ├── frame 2.png ✓
│       ├── frame 3.png ✓
│       ├── frame 4.png ✓
│       ├── frame 5.jpg ✓
│       ├── frame 6.jpg ✓
│       └── frame 7.jpg ✓
```

---

## 🎮 How to Play

1. **Open game.html** via the server
2. **Click "🎲 SHUFFLE"** to start with a random NFT frame
3. **Move tiles** - Click tiles next to empty space or use arrow keys
4. **Difficulty modes**:
   - 3×3 (Easy - 9 tiles)
   - 4×4 (Medium - 16 tiles) ← Default
   - 5×5 (Hard - 25 tiles)
5. **Save score** - Enter your name after solving
6. **Check leaderboard** - See top 10 best scores

---

## 📊 Features

✨ **13 Unique NFT Frames** - Randomly shuffled each play
🏆 **Global Leaderboard** - Persistent scoring
⏱️ **Time & Move Tracking** - Personal best record
🎨 **Premium Design** - Smooth animations & effects
📱 **Responsive** - Works on desktop & mobile

---

## 🔧 Troubleshooting

### Images not showing?
- ✅ Use `start-server.bat` (runs local web server)
- ✅ Don't open game.html directly
- ✅ Access via `http://localhost:8000/game.html`

### Port 8000 already in use?
```powershell
python -m http.server 8001  # Use port 8001 instead
```

### Python not installed?
- Download from python.org
- Or use Option 2 with Node.js/npm server
- Or upload to any web host (GitHub Pages, Vercel, Netlify)

---

## 🌐 Deploy Online

### Free Options:
1. **GitHub Pages** - Upload folder to GitHub
2. **Vercel** - Connect Git repo (auto-deploys)
3. **Netlify** - Drag & drop folder
4. **Replit** - Web IDE hosting

Just zip this folder and upload to any of these services!

---

## 📝 Notes

- Scores saved in browser storage (survives refresh)
- Each play shuffles a random NFT frame
- Works offline once loaded
- No external dependencies needed

**Questions?** Check console (F12) for debugging info!

Made with ❤️ for your NFT community 🎨
