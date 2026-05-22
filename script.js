// 🎨 ALL YOUR NFT ARTWORKS WITH ARTIST INFO
const NFT_ART_COLLECTION = [
    { path: 'assets/nft-art/Beebs.jpg', artist: 'Beebs', link: '#' },
    { path: 'assets/nft-art/Bigmykel.jpg', artist: 'Bigmykel', link: '#' },
    { path: 'assets/nft-art/danii.jpg', artist: 'danii', link: '#' },
    { path: 'assets/nft-art/ebby.jpg', artist: 'ebby', link: '#' },
    { path: 'assets/nft-art/Jinxlockin.jpg', artist: 'Jinxlockin', link: '#' },
    { path: 'assets/nft-art/Marvolo.jpg', artist: 'Marvolo', link: '#' },
    { path: 'assets/nft-art/OG.jpg', artist: 'OG', link: '#' },
    { path: 'assets/nft-art/Oluwaseun.jpg', artist: 'Oluwaseun', link: '#' },
    { path: 'assets/nft-art/playgirl.jpg', artist: 'playgirl', link: '#' },
    { path: 'assets/nft-art/screwysanta.jpg', artist: 'screwysanta', link: '#' },
];

// ===== UUID/Player Identification =====
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getOrCreatePlayerID() {
    let playerID = localStorage.getItem('playerID');
    if (!playerID) {
        playerID = generateUUID();
        localStorage.setItem('playerID', playerID);
    }
    return playerID;
}

let gridSize = 4;
let tiles = [];
let emptyIndex = null;
let moveCount = 0;
let startTime = null;
let timerInterval = null;
let isGameStarted = false;
let isSolved = false;
let tileImages = [];
let currentArtIndex = 0;
let currentArtPath = null;
let bestMoves = localStorage.getItem('bestMoves') || '-';
let leaderboard = [];
let lastGameMoves = 0;
let pausedElapsed = 0; // milliseconds paused
let loadingHideTimer = null;
let loadingPulseTimer = null;
let currentLoadingPercent = 0;
let currentPlayerID = getOrCreatePlayerID();

// ===== UI Helpers: Toasts & Confirm Modals =====
function showToast(message, type = 'info', timeout = 3000) {
    const root = document.getElementById('toastRoot');
    if (!root) return;

    // Ensure container announces politely to assistive tech
    try { root.setAttribute('aria-live', 'polite'); root.setAttribute('aria-atomic', 'true'); } catch (e) {}

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('tabindex', '-1');

    root.appendChild(toast);
    // trigger show animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // Remove after timeout using transitionend for smoothness
    const removeToast = () => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, { once: true });
    };

    setTimeout(removeToast, timeout);
}

function updateProgress(percent) {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar-container');
    const progressFill = document.getElementById('progress-fill');
    const ostrichRunner = document.getElementById('ostrich-runner');

    if (!loadingScreen || !progressBar || !progressFill || !ostrichRunner) return;

    currentLoadingPercent = Math.max(0, Math.min(100, Number(percent) || 0));

    if (loadingHideTimer) {
        clearTimeout(loadingHideTimer);
        loadingHideTimer = null;
    }

    if (loadingPulseTimer && currentLoadingPercent >= 100) {
        clearInterval(loadingPulseTimer);
        loadingPulseTimer = null;
    }

    if (currentLoadingPercent < 100) {
        loadingScreen.classList.remove('is-complete');
        loadingScreen.classList.add('is-visible');
        loadingScreen.style.display = 'flex';
    }

    progressFill.style.width = `${currentLoadingPercent}%`;

    const barWidth = progressBar.clientWidth;
    const runnerWidth = ostrichRunner.offsetWidth || 0;
    const travelWidth = Math.max(barWidth - runnerWidth, 0);
    const left = travelWidth * (currentLoadingPercent / 100);

    ostrichRunner.style.left = `${left}px`;

    if (currentLoadingPercent >= 100) {
        loadingScreen.classList.add('is-complete');
        loadingHideTimer = window.setTimeout(() => {
            loadingScreen.classList.remove('is-visible');
            loadingScreen.style.display = 'none';
        }, 450);
    }
}

function beginLoadingOverlay() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    loadingScreen.classList.remove('is-complete');
    loadingScreen.classList.add('is-visible');
    loadingScreen.style.display = 'flex';

    updateProgress(0);

    if (loadingPulseTimer) {
        clearInterval(loadingPulseTimer);
    }

    let simulated = 0;
    loadingPulseTimer = setInterval(() => {
        simulated = Math.min(simulated + (simulated < 35 ? 9 : simulated < 75 ? 5 : 2), 92);
        updateProgress(simulated);
    }, 120);
}

function endLoadingOverlay() {
    if (loadingPulseTimer) {
        clearInterval(loadingPulseTimer);
        loadingPulseTimer = null;
    }
    updateProgress(100);
}

function showConfirm(title, message) {
    return new Promise((resolve) => {
        const root = document.getElementById('modalRoot');
        if (!root) return resolve(false);

        const previouslyFocused = document.activeElement;

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.tabIndex = -1;

        const win = document.createElement('div');
        win.className = 'modal-window';
        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-modal', 'true');
        const titleId = 'modalTitle_' + Date.now();
        win.setAttribute('aria-labelledby', titleId);
        win.tabIndex = -1;

        win.innerHTML = `
            <div class="modal-title" id="${titleId}">${title}</div>
            <div class="modal-body">${message}</div>
            <div class="modal-actions">
                <button class="modal-btn cancel">Cancel</button>
                <button class="modal-btn confirm">Confirm</button>
            </div>
        `;

        backdrop.appendChild(win);
        root.appendChild(backdrop);

        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        let focusable = Array.from(win.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));

        const cancel = win.querySelector('.modal-btn.cancel');
        const confirm = win.querySelector('.modal-btn.confirm');

        function cleanup(result) {
            document.removeEventListener('keydown', handleKeyDown);
            try { root.removeChild(backdrop); } catch (e) {}
            if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
            resolve(result);
        }

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                cleanup(false);
                return;
            }

            if (e.key === 'Tab') {
                focusable = Array.from(win.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        // Click on backdrop (outside modal) will cancel
        backdrop.addEventListener('click', (ev) => { if (ev.target === backdrop) cleanup(false); });

        cancel.addEventListener('click', () => cleanup(false));
        confirm.addEventListener('click', () => cleanup(true));

        document.addEventListener('keydown', handleKeyDown);

        // Focus the first focusable element
        setTimeout(() => {
            focusable = Array.from(win.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
            if (focusable.length) focusable[0].focus(); else win.focus();
        }, 20);
    });
}

/* ===== Custom select replacement ===== */
function createCustomSelect(selectEl) {
    // wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';

    // control shown
    const control = document.createElement('div');
    control.className = 'custom-select__control';
    control.tabIndex = 0;
    wrapper.appendChild(control);

    // options list
    const list = document.createElement('div');
    list.className = 'custom-select__list';
    list.style.display = 'none';
    wrapper.appendChild(list);

    // populate
    const options = Array.from(selectEl.querySelectorAll('option'));
    function setValueFromOption(optEl) {
        control.textContent = optEl.textContent;
        options.forEach(o => o._li && o._li.removeAttribute('aria-selected'));
        if (optEl._li) optEl._li.setAttribute('aria-selected', 'true');
        selectEl.value = optEl.value;
        // dispatch change
        const ev = new Event('change', { bubbles: true });
        selectEl.dispatchEvent(ev);
    }

    options.forEach(opt => {
        const li = document.createElement('div');
        li.className = 'custom-select__option';
        li.textContent = opt.textContent;
        li.tabIndex = 0;
        li.addEventListener('click', () => {
            setValueFromOption(opt);
            list.style.display = 'none';
        });
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
        });
        opt._li = li;
        list.appendChild(li);
    });

    // initial value
    const selected = selectEl.querySelector('option:checked') || options[0];
    if (selected) setValueFromOption(selected);

    // interactions
    function toggleList() {
        list.style.display = (list.style.display === 'none') ? 'block' : 'none';
    }
    control.addEventListener('click', toggleList);
    control.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleList(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); list.style.display='block'; list.querySelector('.custom-select__option')?.focus(); }
    });

    // close on outside click
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) list.style.display = 'none';
    });

    // insert wrapper before select and hide native select
    selectEl.parentNode.insertBefore(wrapper, selectEl);
    selectEl.classList.add('native-hidden');
}

function initCustomSelects() {
    const selects = Array.from(document.querySelectorAll('.difficulty-select'));
    selects.forEach(s => {
        // avoid double-init
        if (s._customInited) return;
        try { createCustomSelect(s); s._customInited = true; } catch (e) { console.warn('custom select init failed', e); }
    });
}

// ===== START SCREEN =====
function goToGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameContainer').style.display = 'block';
    getRandomArt();
    loadImageAndInit();
}

async function shufflePuzzle() {
    if (isGameStarted && !isSolved) {
        const ok = await showConfirm('Start Over?', 'A game is in progress. Start over and reshuffle?');
        if (!ok) return;
    }

    // Shuffle tiles with random valid moves
    for (let i = 0; i < 100; i++) {
        const adjacentTiles = getAdjacentTiles();
        const randomTile = adjacentTiles[Math.floor(Math.random() * adjacentTiles.length)];
        [tiles[emptyIndex], tiles[randomTile]] = [tiles[randomTile], tiles[emptyIndex]];
        emptyIndex = randomTile;
    }

    renderGrid();
    document.getElementById('message').innerHTML = '🔀 Shuffled! Click START to begin!';
    document.getElementById('message').className = 'message';
}

function startTimer() {
    if (!tiles || tiles.length === 0) {
        showToast('⚠️ Load a puzzle first!', 'error');
        return;
    }

    if (isGameStarted && !isSolved) {
        showToast('⚠️ Game already in progress!', 'warning');
        return;
    }

    // If we were paused, resume from pausedElapsed; otherwise start fresh
    if (pausedElapsed > 0 && !isSolved) {
        startTime = Date.now() - pausedElapsed;
    } else {
        moveCount = 0;
        document.getElementById('moveCount').textContent = '0';
        startTime = Date.now();
        pausedElapsed = 0;
    }

    isGameStarted = true;
    isSolved = false;
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 100);

    document.getElementById('message').innerHTML = '🚀 Go!';
    document.getElementById('message').className = 'message';
    document.getElementById('completionBadge').classList.remove('show');
}

function pauseGame() {
    if (!isGameStarted) {
        showToast('⚠️ No active game to pause.', 'info');
        return;
    }

    // Capture elapsed time so we can resume
    pausedElapsed = Date.now() - startTime;
    clearInterval(timerInterval);
    isGameStarted = false;
    document.getElementById('message').innerHTML = '⏸️ Paused. Click START to resume.';
    document.getElementById('message').className = 'message';
    showToast('⏸️ Game paused', 'info');
}

function displayArtGallery() {
    const gallery = document.getElementById('artGallery');
    if (!gallery) return;
    
    // Create items for 3x3 grid with continuous loop (duplicate 4 times for seamless scrolling)
    const items = NFT_ART_COLLECTION.map((art, idx) => `
        <div class="gallery-item" role="listitem" tabindex="0" aria-label="Artwork ${idx + 1} by ${art.artist}" onclick="selectArt(${idx})" onkeydown="if(event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar'){ selectArt(${idx}); }">
            <img src="${encodeURI(art.path)}" alt="Art ${idx + 1}" class="gallery-img" loading="lazy" decoding="async" fetchpriority="low">
            <div class="gallery-artist"><a href="${art.link}" target="_blank" class="artist-link" onclick="event.stopPropagation()">By ${art.artist} →</a></div>
        </div>
    `).join('');

    gallery.innerHTML = `
        <div class="gallery-title">✨ Featured Artworks ✨</div>
        <div class="gallery-grid animate" role="region" aria-label="Featured artworks">
            ${items}${items}${items}${items}
        </div>
    `;
}

function scheduleArtGallery() {
    const run = () => {
        const gallery = document.getElementById('artGallery');
        if (!gallery || gallery.children.length > 0) return;
        displayArtGallery();
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(run, { timeout: 1500 });
    } else {
        setTimeout(run, 300);
    }
}

// Called when a film-item is clicked — select that artwork and go to game
function selectArt(index) {
    currentArtIndex = index % NFT_ART_COLLECTION.length;
    currentArtPath = NFT_ART_COLLECTION[currentArtIndex].path;
    loadImageAndInit();
    goToGame();
}

function displayFrontPageLeaderboard() {
    const leaderboardFront = document.getElementById('leaderboardListFront');
    if (!leaderboardFront) return;
    
    // Show top 5 entries on front page
    const topEntries = leaderboard.slice(0, 5);
    
    leaderboardFront.innerHTML = topEntries.map((entry, idx) => {
        const medals = ['🥇', '🥈', '🥉', '#4️⃣', '#5️⃣'];
        const medal = medals[idx] || `#${idx + 1}`;
        const shortID = entry.playerID ? entry.playerID.substring(0, 8) : 'N/A';
        const isCurrentPlayer = entry.playerID === currentPlayerID ? '👤' : '';
        return `
            <div class="leaderboard-item-front">
                <span class="medal">${medal}</span>
                <span class="name">${entry.name} ${isCurrentPlayer}</span>
                <span class="moves">${entry.moves} moves</span>
                <span class="leaderboard-id-front" title="${entry.playerID}">${shortID}</span>
            </div>
        `;
    }).join('') || '<div style="text-align: center; color: var(--text-secondary);">No scores yet!</div>';
}

function continueToGame() {
    // Forward to the canonical entry point
    goToGame();
}

function scrollLeaderboard() {
    const leaderboardFront = document.getElementById('leaderboardListFront');
    if (leaderboardFront) {
        // Toggle showing all vs top 5
        const allEntries = leaderboard;
        const topEntries = leaderboard.slice(0, 5);
        const isShowingAll = leaderboardFront.dataset.showingAll === 'true';
        
        if (isShowingAll) {
            // Show top 5
            leaderboardFront.dataset.showingAll = 'false';
            leaderboardFront.innerHTML = topEntries.map((entry, idx) => {
                const medals = ['🥇', '🥈', '🥉', '#4️⃣', '#5️⃣'];
                const medal = medals[idx] || `#${idx + 1}`;
                const shortID = entry.playerID ? entry.playerID.substring(0, 8) : 'N/A';
                const isCurrentPlayer = entry.playerID === currentPlayerID ? '👤' : '';
                return `
                    <div class="leaderboard-item-front">
                        <span class="medal">${medal}</span>
                        <span class="name">${entry.name} ${isCurrentPlayer}</span>
                        <span class="moves">${entry.moves} moves</span>
                        <span class="leaderboard-id-front" title="${entry.playerID}">${shortID}</span>
                    </div>
                `;
            }).join('');
        } else {
            // Show all
            leaderboardFront.dataset.showingAll = 'true';
            leaderboardFront.innerHTML = allEntries.map((entry, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[idx] || `#${idx + 1}`;
                const shortID = entry.playerID ? entry.playerID.substring(0, 8) : 'N/A';
                const isCurrentPlayer = entry.playerID === currentPlayerID ? '👤' : '';
                return `
                    <div class="leaderboard-item-front">
                        <span class="medal">${medal}</span>
                        <span class="name">${entry.name} ${isCurrentPlayer}</span>
                        <span class="moves">${entry.moves} moves</span>
                        <span class="leaderboard-id-front" title="${entry.playerID}">${shortID}</span>
                    </div>
                `;
            }).join('') || '<div style="text-align: center; color: var(--text-secondary);">No scores yet!</div>';
        }
    }
}

async function stopGame() {
    if (isGameStarted && !isSolved) {
        // Temporarily pause the timer while we ask for confirmation so the UI clearly stops
        pausedElapsed = Date.now() - startTime;
        clearInterval(timerInterval);

        const end = await showConfirm('End Session?', 'A game is currently running. End session and return to the home screen?');

        if (!end) {
            // User cancelled - resume timer using pausedElapsed
            startTime = Date.now() - pausedElapsed;
            timerInterval = setInterval(updateTimer, 100);
            isGameStarted = true;
            document.getElementById('message').innerHTML = '🚀 Resumed';
            document.getElementById('message').className = 'message';
            return;
        }
    }

    // Proceed to fully stop and return home
    clearInterval(timerInterval);
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameContainer').style.display = 'none';

    // Reset game state
    isGameStarted = false;
    moveCount = 0;
    lastGameMoves = 0;
    pausedElapsed = 0; // Reset pausedElapsed when stopping the session

    scheduleArtGallery();
    displayFrontPageLeaderboard();
}

function generateScoreCard(username, moves) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // Select a random artwork for the card
        const randomArtIndex = Math.floor(Math.random() * NFT_ART_COLLECTION.length);
        const randomArtPath = NFT_ART_COLLECTION[randomArtIndex].path;
        
        const artworkImg = new Image();
        artworkImg.crossOrigin = 'Anonymous';
        artworkImg.onload = function() {
            // Draw artwork as background
            ctx.drawImage(artworkImg, 0, 0, 600, 400);
            
            // Add Beaks-themed overlay for text readability
            ctx.fillStyle = 'rgba(20, 18, 36, 0.55)';
            ctx.fillRect(0, 0, 600, 400);
            
            // Title
            ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
            ctx.fillStyle = '#EFE7DD';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillText('🏆 PUZZLE VICTORY 🏆', 300, 60);
            
            // Stats
            ctx.font = 'bold 22px "Inter", Arial, sans-serif';
            ctx.fillStyle = '#EFE7DD';
            
            // Moves
            ctx.fillText(`Moves: ${moves}`, 170, 150);
            // Time
            ctx.fillText(`Time: ${document.getElementById('timer').textContent}`, 430, 150);
            
            // Username
            ctx.font = '20px "Inter", Arial, sans-serif';
            ctx.fillText(username, 300, 220);
            
            // Footer
            ctx.font = '18px "Inter", Arial, sans-serif';
            ctx.fillStyle = '#B89A72';
            ctx.fillText('Join the Challenge! 🚀', 300, 300);
            
            // Watermark
            ctx.font = '14px "Inter", Arial, sans-serif';
            ctx.fillStyle = '#EFE7DD';
            ctx.fillText('Beaks', 300, 370);
            
            resolve(canvas.toDataURL('image/png'));
        };
        artworkImg.onerror = function() {
            // Fallback to gradient if image fails
            const gradient = ctx.createLinearGradient(0, 0, 600, 400);
            gradient.addColorStop(0, '#141224');
            gradient.addColorStop(1, '#1B1F34');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 600, 400);
            
            // Title
            ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
            ctx.fillStyle = '#EFE7DD';
            ctx.textAlign = 'center';
            ctx.fillText('🏆 PUZZLE VICTORY 🏆', 300, 60);
            
            // Stats
            ctx.font = 'bold 22px "Inter", Arial, sans-serif';
            ctx.fillStyle = '#EFE7DD';
            ctx.fillText(`Moves: ${moves}`, 170, 150);
            ctx.fillText(`Time: ${document.getElementById('timer').textContent}`, 450, 150);
            
            // Username
            ctx.font = '20px "Inter", Arial, sans-serif';
            ctx.fillText(username, 300, 220);
            
            // Footer
            ctx.font = '18px "Inter", Arial, sans-serif';
            ctx.fillStyle = '#B89A72';
            ctx.fillText('Join the Challenge! 🚀', 300, 300);
            
            // Watermark
            ctx.font = '14px "Inter", Arial, sans-serif';
            ctx.fillStyle = '#EFE7DD';
            ctx.fillText('Beaks', 300, 370);
            
            resolve(canvas.toDataURL('image/png'));
        };
        artworkImg.src = randomArtPath;
    });
}

// Initialize
document.getElementById('bestMoves').textContent = bestMoves;
scheduleArtGallery();
// initialize custom selects (replace native dropdown with themed list)
initCustomSelects();

// ===== LEADERBOARD =====
function loadLeaderboard() {
    const stored = localStorage.getItem('leaderboard');
    leaderboard = stored ? JSON.parse(stored) : [];
    displayLeaderboard();
    displayFrontPageLeaderboard();
}

function displayLeaderboard() {
    const listContainer = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        listContainer.innerHTML = '<div class="empty-leaderboard">📊 No scores yet. Be the first!</div>';
        return;
    }

    const sorted = [...leaderboard].sort((a, b) => a.moves - b.moves).slice(0, 10);
    
    listContainer.innerHTML = sorted.map((entry, index) => {
        let rankClass = '';
        let rankEmoji = '';
        
        if (index === 0) {
            rankClass = 'gold';
            rankEmoji = '🥇';
        } else if (index === 1) {
            rankClass = 'silver';
            rankEmoji = '🥈';
        } else if (index === 2) {
            rankClass = 'bronze';
            rankEmoji = '🥉';
        } else {
            rankEmoji = `#${index + 1}`;
        }
        
        const shortID = entry.playerID ? entry.playerID.substring(0, 8) : 'N/A';
        const isCurrentPlayer = entry.playerID === currentPlayerID ? '👤' : '';

        return `
            <div class="leaderboard-item">
                <div class="leaderboard-rank ${rankClass}">${rankEmoji}</div>
                <div class="leaderboard-name">${entry.name} ${isCurrentPlayer}</div>
                <div class="leaderboard-score">${entry.moves} moves</div>
                <div class="leaderboard-id" title="${entry.playerID}">${shortID}</div>
            </div>
        `;
    }).join('');
}

async function submitScore() {
    if (lastGameMoves === 0) {
        showToast('⚠️ Complete a puzzle first!', 'warning');
        return;
    }

    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        showToast('📝 Enter your X username (e.g., @nftfanatic)!', 'warning');
        return;
    }

    leaderboard.push({
        name: playerName.substring(0, 20),
        moves: lastGameMoves,
        date: new Date().toLocaleDateString(),
        playerID: currentPlayerID
    });

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
    
    // Generate and display score card
    await displayScoreCard(playerName, lastGameMoves);
}

async function displayScoreCard(username, moves) {
    const scoreCardImage = await generateScoreCard(username, moves);
    
    // Display the score card with optional sharing
    const xPostContent = document.getElementById('xPostContent');
    xPostContent.innerHTML = `
        <div class="score-card-container">
            <img src="${scoreCardImage}" alt="Score Card" class="score-card-preview">
            <div class="score-card-actions">
                <button class="btn-download-only" onclick="downloadScoreCardOnly()">⬇️ Download Card</button>
                <button class="btn-share-options" onclick="toggleXPostOptions('${username}', ${moves})">🐦 Share Options</button>
            </div>
        </div>
        <div id="xPostOptions" class="x-post-options" style="display: none;"></div>
    `;
    document.getElementById('xPostSection').style.display = 'block';
    
    // Store for later use
    window.currentScoreCard = scoreCardImage;
    window.currentUsername = username;
    window.currentMoves = moves;
    
    // Clear input
    document.getElementById('playerName').value = '';
}

function toggleXPostOptions(username, moves) {
    const optionsDiv = document.getElementById('xPostOptions');
    if (optionsDiv.style.display === 'none') {
        // Show X post options
        generateXPostOptions(username, moves);
        optionsDiv.style.display = 'block';
    } else {
        // Hide X post options
        optionsDiv.style.display = 'none';
    }
}

function generateXPostOptions(username, moves) {
    const postText = `🎨 Just crushed the Beaks challenge! 🏆\n\nMoves: ${moves}\nUsername: ${username}\n\nCan you beat my score? Join the leaderboard now! 🚀\n\n#Beaks #GameFi #PuzzleChallenge`;
    
    const optionsDiv = document.getElementById('xPostOptions');
    optionsDiv.innerHTML = `
        <div class="x-post-text-section">
            <div class="x-post-text-label">🐦 X Post Preview:</div>
            <div class="x-post-text">${postText.replace(/\n/g, '<br>')}</div>
        </div>
        <div class="x-post-sharing-actions">
            <button class="btn-share-x" onclick="shareToX('${postText.split('\n').join(' ')}')">Share on X</button>
            <button class="btn-copy-post" onclick="copyPostToClipboard('${postText.split('\n').join(' ')}')">Copy Post</button>
        </div>
    `;
    
    window.currentXPost = postText;
}

// ===== X POST GENERATION & SHARING =====
function shareToX(text) {
    const postText = text || window.currentXPost || 'I just beat the Beaks challenge!';
    const encodedText = encodeURIComponent(postText);
    const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(xUrl, '_blank');
}

function copyPostToClipboard(text) {
    const postText = text || window.currentXPost || 'I just beat the Beaks challenge!';
    navigator.clipboard.writeText(postText).then(() => {
        showToast('✅ Post copied to clipboard! Ready to share on X', 'success');
    }).catch(() => {
        showToast('❌ Failed to copy. Please try again.', 'error');
    });
}

function downloadScoreCardOnly() {
    if (!window.currentScoreCard) {
        showToast('❌ Score card not available', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = window.currentScoreCard;
    link.download = `frame-puzzle-score-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== IMAGE LOADING & TILE GENERATION =====
function getRandomArt() {
    currentArtIndex = Math.floor(Math.random() * NFT_ART_COLLECTION.length);
    currentArtPath = NFT_ART_COLLECTION[currentArtIndex].path;
    document.getElementById('artIndicator').textContent = `🎲 Art ${currentArtIndex + 1} of ${NFT_ART_COLLECTION.length}`;
    return currentArtPath;
}

function loadImageAndInit() {
    const img = new Image();
    
    // Add CORS settings for local files
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        console.log('✅ Image loaded successfully:', currentArtPath);
        generateTileImages(img);
        resetGame();
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('previewImage').src = currentArtPath;
    };
    
    img.onerror = function(e) {
        console.error('❌ Failed to load image:', currentArtPath);
        console.error('Error details:', e);
        document.getElementById('message').innerHTML = `⚠️ Cannot load: ${NFT_ART_COLLECTION[currentArtIndex]}`;
        document.getElementById('message').className = 'message error';
        
        // Try alternative path format
        tryAlternativePath();
    };
    
    console.log('📸 Loading image:', currentArtPath);
    img.src = currentArtPath;
}

function tryAlternativePath() {
    console.log('🔄 Trying alternative path format...');
    const altPath = NFT_ART_COLLECTION[currentArtIndex].replace(/\s/g, '%20');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        console.log('✅ Alternative path worked!');
        generateTileImages(img);
        resetGame();
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('previewImage').src = altPath;
    };
    
    img.onerror = function() {
        console.error('❌ Alternative path also failed');
        // Fallback - show placeholder
        document.getElementById('message').innerHTML = '⚠️ Using placeholder - ensure images are in assets/nft-art/';
        document.getElementById('message').className = 'message error';
    };
    
    img.src = altPath;
}

function generateTileImages(sourceImage) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const size = Math.min(sourceImage.width, sourceImage.height);
    canvas.width = size;
    canvas.height = size;
    
    ctx.drawImage(sourceImage, 
        (sourceImage.width - size) / 2, 
        (sourceImage.height - size) / 2,
        size, size,
        0, 0, size, size
    );

    tileImages = [];
    const tileSize = size / gridSize;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileSize;
            tileCanvas.height = tileSize;
            const tileCtx = tileCanvas.getContext('2d');
            
            tileCtx.drawImage(canvas,
                col * tileSize, row * tileSize, tileSize, tileSize,
                0, 0, tileSize, tileSize
            );
            
            tileImages.push(tileCanvas.toDataURL());
        }
    }
    
    console.log('✂️ Generated', tileImages.length, 'tiles');
}

// ===== GAME LOGIC =====
function initGame() {
    tiles = [];
    for (let i = 1; i < gridSize * gridSize; i++) {
        tiles.push(i);
    }
    tiles.push(null);
    emptyIndex = tiles.length - 1;
    renderGrid();
}

function renderGrid() {
    const grid = document.getElementById('puzzleGrid');
    grid.innerHTML = '';
    grid.className = `puzzle-grid grid-${gridSize}`;

    tiles.forEach((tile, index) => {
        const tileEl = document.createElement('div');
        tileEl.className = 'tile';
        
        if (tile !== null && tileImages.length > 0) {
            tileEl.style.backgroundImage = `url(${tileImages[tile - 1]})`;
            tileEl.onclick = () => moveTile(index);
        } else if (tile !== null) {
            tileEl.textContent = tile;
            tileEl.onclick = () => moveTile(index);
        }

        if (tile === null) {
            tileEl.classList.add('empty');
        }

        if (isGameStarted && isSolved && tile !== null) {
            tileEl.classList.add('solved');
        }

        grid.appendChild(tileEl);
    });
}

function moveTile(index) {
    if (!isGameStarted || isSolved) return;

    const emptyX = emptyIndex % gridSize;
    const emptyY = Math.floor(emptyIndex / gridSize);
    const tileX = index % gridSize;
    const tileY = Math.floor(index / gridSize);

    const isAdjacent = (Math.abs(emptyX - tileX) + Math.abs(emptyY - tileY)) === 1;

    if (isAdjacent) {
        [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
        emptyIndex = index;
        moveCount++;
        document.getElementById('moveCount').textContent = moveCount;
        renderGrid();
        checkWin();
    }
}

function handleKeyPress(e) {
    if (!isGameStarted || isSolved) return;

    const emptyX = emptyIndex % gridSize;
    const emptyY = Math.floor(emptyIndex / gridSize);
    let newIndex = null;

    switch(e.key) {
        case 'ArrowUp':
            if (emptyY < gridSize - 1) newIndex = emptyIndex + gridSize;
            break;
        case 'ArrowDown':
            if (emptyY > 0) newIndex = emptyIndex - gridSize;
            break;
        case 'ArrowLeft':
            if (emptyX < gridSize - 1) newIndex = emptyIndex + 1;
            break;
        case 'ArrowRight':
            if (emptyX > 0) newIndex = emptyIndex - 1;
            break;
    }

    if (newIndex !== null) {
        e.preventDefault();
        moveTile(newIndex);
    }
}

function checkWin() {
    const isWon = tiles.slice(0, -1).every((tile, i) => tile === i + 1) && tiles[tiles.length - 1] === null;
    
    if (isWon) {
        isSolved = true;
        clearInterval(timerInterval);
        pausedElapsed = 0;
        document.getElementById('message').innerHTML = '🎉 PUZZLE SOLVED! 🎉';
        document.getElementById('message').className = 'message success';
        
        const minutes = Math.floor((Date.now() - startTime) / 60000);
        const seconds = Math.floor(((Date.now() - startTime) % 60000) / 1000);
        const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        lastGameMoves = moveCount;
        
        if (bestMoves === '-' || moveCount < parseInt(bestMoves)) {
            bestMoves = moveCount;
            localStorage.setItem('bestMoves', bestMoves);
            document.getElementById('bestMoves').textContent = bestMoves;
        }
        
        const badge = document.getElementById('completionBadge');
        document.getElementById('finalStats').innerHTML = `${moveCount} moves in ${timeStr}`;
        badge.classList.add('show');
        
        document.getElementById('playerName').focus();
        
        renderGrid();
    }
}

function getAdjacentTiles() {
    const adjacent = [];
    const x = emptyIndex % gridSize;
    const y = Math.floor(emptyIndex / gridSize);

    if (x > 0) adjacent.push(emptyIndex - 1);
    if (x < gridSize - 1) adjacent.push(emptyIndex + 1);
    if (y > 0) adjacent.push(emptyIndex - gridSize);
    if (y < gridSize - 1) adjacent.push(emptyIndex + gridSize);

    return adjacent;
}

function updateTimer() {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('timer').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function changeDifficulty() {
    gridSize = parseInt(document.getElementById('difficultySelect').value);
    if (currentArtPath && tileImages.length > 0) {
        loadImageAndInit();
    } else {
        resetGame();
        initGame();
    }
}

function resetGame() {
    isGameStarted = false;
    isSolved = false;
    moveCount = 0;
    pausedElapsed = 0;
    clearInterval(timerInterval);
    document.getElementById('moveCount').textContent = '0';
    document.getElementById('timer').textContent = '0:00';
    document.getElementById('message').innerHTML = '';
    document.getElementById('completionBadge').classList.remove('show');
    initGame();
    document.getElementById('message').innerHTML = '🔄 Puzzle reset. Shuffle or start to play!';
    document.getElementById('message').className = 'message';
}

function startPlaySession() {
    moveCount = 0;
    document.getElementById('moveCount').textContent = '0';
    isGameStarted = true;
    isSolved = false;
    pausedElapsed = 0;
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 100);

    // Shuffle tiles with random valid moves
    for (let i = 0; i < 100; i++) {
        const adjacentTiles = getAdjacentTiles();
        const randomTile = adjacentTiles[Math.floor(Math.random() * adjacentTiles.length)];
        [tiles[emptyIndex], tiles[randomTile]] = [tiles[randomTile], tiles[emptyIndex]];
        emptyIndex = randomTile;
    }

    renderGrid();
    document.getElementById('message').innerHTML = '🚀 Go!';
    document.getElementById('message').className = 'message';
    document.getElementById('completionBadge').classList.remove('show');
}

function shuffleAndStart() {
    // Backward compatibility function - calls both shuffle and start
    shufflePuzzle();
    startTimer();
}

window.addEventListener('resize', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.classList.contains('is-visible')) {
        updateProgress(currentLoadingPercent);
    }
});

function initFirstScreenLoading() {
    beginLoadingOverlay();

    window.setTimeout(() => {
        endLoadingOverlay();
    }, 950);
}

// ===== EVENT LISTENERS & INIT =====
window.addEventListener('keydown', handleKeyPress);
loadLeaderboard();
document.getElementById('bestMoves').textContent = bestMoves;
scheduleArtGallery();
initFirstScreenLoading();
