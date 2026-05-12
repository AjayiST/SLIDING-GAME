# Beaks

Beaks is a surreal sliding puzzle game built with static HTML, CSS, and vanilla JavaScript. The current theme uses the Beaks artwork as its visual reference and includes a custom-styled difficulty picker, a two-column control layout, and a branded game screen.

## Quick Start

### Option 1: Use the batch file
1. Double-click `start-server.bat`
2. Your browser opens to `http://localhost:8000/game.html`

### Option 2: Run a local server manually
```powershell
cd "C:\Users\Eliza\Documents\SLIDING GAME"
python -m http.server 8000
```

Then open `http://localhost:8000/game.html`.

## How to Play

1. Open the game in your browser.
2. Choose a difficulty from the dropdown.
3. Use `SHUFFLE` to start a new puzzle.
4. Move tiles by clicking them or using the arrow keys.
5. Solve the puzzle, then save your score to the leaderboard.

## Current Features

- Beaks-themed UI with custom colors, shadows, and typography
- Full-width difficulty dropdown on its own row
- Button layout grouped in pairs for easier scanning
- Move and time tracking
- Persistent leaderboard storage in the browser
- Responsive layout for desktop and mobile

## Project Structure

```text
SLIDING GAME/
├── game.html
├── index.html
├── index-image.html
├── styles.css
├── beaks-theme.css
├── script.js
├── start-server.bat
├── README.md
└── assets/
   ├── images/
   └── nft-art/
```

## Notes

- Do not open `game.html` directly from disk; use a local server.
- Score and progress data are stored in browser local storage.
- The custom difficulty control is used to keep the themed options readable.

## Troubleshooting

- If the page does not load images, make sure you started a local server.
- If port 8000 is busy, try another port such as 8001.
- If the difficulty control looks odd, refresh the page after clearing cached styles.
