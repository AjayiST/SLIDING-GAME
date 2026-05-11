@echo off
REM Start Python Simple HTTP Server for the game
cd /d "%~dp0"
echo Starting game server...
echo.
echo Opening http://localhost:8000/game.html in your browser
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000