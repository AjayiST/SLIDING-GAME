# 🎨 NFT Art Integration Guide

Your sliding puzzle game with **pre-loaded NFT artwork**.

## Quick Setup (30 seconds)

1. **Save your NFT art** as `nft-artwork.png` or `nft-artwork.jpg`
2. **Place it** in: `assets/nft-art/` folder
3. **Open** `index-image.html` in your browser
4. **Done!** Your art is now the puzzle 🎮

---

## Folder Structure

```
SLIDING GAME/
├── index.html              (Number tiles version)
├── index-image.html        (Your NFT art version) ← USE THIS
├── ASSET_GUIDE.md         (This file)
└── assets/
    ├── images/            (Optional - reference images)
    └── nft-art/           (PUT YOUR ART HERE)
        └── nft-artwork.png
```

---

## Customizing the Art File

### If your file has a different name:

1. Open `index-image.html` in a text editor
2. Find this line (around line 333):
   ```javascript
   const NFT_ART_PATH = 'assets/nft-art/nft-artwork.png';
   ```
3. Change `nft-artwork.png` to your filename:
   ```javascript
   const NFT_ART_PATH = 'assets/nft-art/your-filename.png';
   ```
4. Save and reload in browser

---

## Best Practices for Art

### Image Format:
- **Size**: 800×800px to 1200×1200px
- **Aspect Ratio**: Must be **square**
- **Format**: PNG (recommended), JPG, or WebP
- **File Size**: Keep under 5MB

### Art Quality Tips:
- ✅ High contrast designs show up better in tile pieces
- ✅ Bold colors work great for puzzle identification
- ✅ Add your project logo/watermark for branding
- ❌ Avoid overly detailed textures (gets fragmented across tiles)

### Test Different Difficulties:
- **3×3** = 9 pieces (best for detailed art)
- **4×4** = 16 pieces (balanced challenge)
- **5×5** = 25 pieces (hardcore mode)

---

## File Included

- **index.html** - Classic number-based game
- **index-image.html** - Your custom NFT art puzzle
- **ASSET_GUIDE.md** - This guide

---

## How Community Plays

Players simply open `index-image.html` and see your NFT art as the puzzle. They can:
- Click tiles or use arrow keys
- Choose difficulty (3×3, 4×4, 5×5)
- Track best scores (saved in browser)
- See live preview of complete image

---

## Sharing Your Game

### Option 1: File Sharing
- ZIP the entire `SLIDING GAME` folder
- Send to community
- They extract and open `index-image.html`

### Option 2: Host Online
Upload to any free hosting:
- **GitHub Pages** (free, permanent)
- **Vercel** (free, fast)
- **Netlify** (free, easy)
- **your-domain.com** (custom)

Link format: `https://yoursite.com/index-image.html`
