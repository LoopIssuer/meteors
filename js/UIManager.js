/**
 * UIManager - Handles all UI updates
 */
class UIManager {
    constructor() {
        // Cache DOM elements
        this.elements = {
            overlay: document.getElementById('overlay'),
            loadingScreen: document.getElementById('loadingScreen'),
            menuScreen: document.getElementById('menuScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            micPermissionScreen: document.getElementById('micPermissionScreen'),
            uiPanel: document.getElementById('uiPanel'),
            launcher: document.getElementById('launcher'),
            leaderboard: document.getElementById('leaderboard'),
            leaderboardList: document.getElementById('leaderboardList'),
            speechIndicator: document.getElementById('speechIndicator'),
            speechText: document.getElementById('speechText'),
            playersGrid: document.getElementById('playersGrid'),
            startBtn: document.getElementById('startBtn'),
            requestMicBtn: document.getElementById('requestMicBtn'),
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            currentPlayer: document.getElementById('currentPlayer'),
            difficultyLabel: document.getElementById('difficultyLabel'),
            warning: document.getElementById('warning')
        };
    }
    
    // ==================== SCREENS ====================
    
    hideAllScreens() {
        this.elements.loadingScreen.classList.add('hidden');
        this.elements.menuScreen.classList.add('hidden');
        this.elements.gameOverScreen.classList.add('hidden');
        this.elements.micPermissionScreen.classList.add('hidden');
    }
    
    showLoading() {
        this.hideAllScreens();
        this.elements.overlay.classList.remove('hidden');
        this.elements.loadingScreen.classList.remove('hidden');
    }
    
    showMicPermission() {
        this.hideAllScreens();
        this.elements.overlay.classList.remove('hidden');
        this.elements.micPermissionScreen.classList.remove('hidden');
    }
    
    showMenu() {
        this.hideAllScreens();
        this.elements.overlay.classList.remove('hidden');
        this.elements.menuScreen.classList.remove('hidden');
    }
    
    showGame() {
        this.elements.overlay.classList.add('hidden');
        this.elements.uiPanel.classList.remove('hidden');
        this.elements.launcher.classList.remove('hidden');
        this.elements.speechIndicator.classList.remove('hidden');
        this.elements.leaderboard.classList.remove('hidden');
    }
    
    hideGame() {
        this.elements.uiPanel.classList.add('hidden');
        this.elements.launcher.classList.add('hidden');
        this.elements.speechIndicator.classList.add('hidden');
        this.elements.leaderboard.classList.add('hidden');
    }
    
    showGameOver(playerName, avatar, score, isNewHighscore, highscore, difficulty) {
        this.hideAllScreens();
        this.elements.overlay.classList.remove('hidden');
        this.elements.gameOverScreen.classList.remove('hidden');
        
        const difficultyLabel = CONFIG.DIFFICULTY[difficulty].label;
        
        this.elements.gameOverScreen.innerHTML = `
            <h1>💥 KONIEC GRY 💥</h1>
            <div style="font-size: 60px; margin: 20px 0;">${avatar}</div>
            <h2>${playerName}</h2>
            <h2 style="color: #ffd700;">Wynik: ${score} punktów</h2>
            ${isNewHighscore ? `
                <div class="highscore-badge">🎉 NOWY REKORD! 🎉</div>
            ` : `
                <p>Twój rekord: ${highscore} punktów</p>
            `}
            <p>Poziom trudności: ${difficultyLabel}</p>
            
            <div style="display: flex; gap: 15px; margin-top: 30px; flex-wrap: wrap; justify-content: center;">
                <button class="game-btn primary" onclick="game.restart()">🔄 ZAGRAJ PONOWNIE</button>
                <button class="game-btn secondary" onclick="game.backToMenu()">👤 ZMIEŃ GRACZA</button>
            </div>
        `;
    }
    
    showWarning() {
        this.elements.warning.classList.remove('hidden');
        this.elements.overlay.classList.add('hidden');
    }
    
    showLoadingError(message) {
        this.elements.loadingScreen.innerHTML = `
            <p style="color: #f44336;">❌ Błąd ładowania danych</p>
            <p>${message}</p>
            <button onclick="game.loadPlayers()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer; border-radius: 8px; border: none; background: #4CAF50; color: white;">
                🔄 Spróbuj ponownie
            </button>
        `;
    }
    
    // ==================== PLAYERS ====================
    
    renderPlayers(players, onSelect) {
        this.elements.playersGrid.innerHTML = '';
        
        players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.dataset.playerId = player.id;
            card.innerHTML = `
                <div class="player-avatar">${CONFIG.AVATARS[index % CONFIG.AVATARS.length]}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-highscore">
                    🏆 Rekord: <span>${player.highscore}</span>
                </div>
            `;
            card.addEventListener('click', () => {
                this._selectPlayerCard(card);
                onSelect(player);
            });
            this.elements.playersGrid.appendChild(card);
        });
    }
    
    _selectPlayerCard(card) {
        document.querySelectorAll('.player-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    }
    
    updateStartButton(enabled, text) {
        this.elements.startBtn.disabled = !enabled;
        this.elements.startBtn.textContent = text;
    }
    
    updateCurrentPlayer(avatar, name) {
        this.elements.currentPlayer.innerHTML = `${avatar} ${name}`;
    }
    
    // ==================== GAME STATE ====================
    
    updateScore(score) {
        this.elements.score.textContent = score;
        this.elements.score.style.transform = 'scale(1.3)';
        setTimeout(() => {
            this.elements.score.style.transform = 'scale(1)';
        }, 200);
    }
    
    updateLives(lives) {
        const hearts = this.elements.lives.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            heart.classList.toggle('lost', index >= lives);
        });
    }
    
    resetLives() {
        const hearts = this.elements.lives.querySelectorAll('.heart');
        hearts.forEach(heart => heart.classList.remove('lost'));
    }
    
    // ==================== DIFFICULTY ==================== 
    
    /**
     * Update difficulty label during gameplay
     * @param {string} difficulty - easy, medium, or hard
     */
    updateDifficultyLabel(difficulty) {
        const label = this.elements.difficultyLabel;
        const settings = CONFIG.DIFFICULTY[difficulty];
        
        // Remove old classes
        label.classList.remove('easy', 'medium', 'hard');
        
        // Add new class and update text
        label.classList.add(difficulty);
        label.textContent = `Poziom: ${settings.label}`;
    }
    
    setupDifficultyButtons(onSelect) {
        const menuButtons = document.querySelectorAll('#difficultyMenu .diff-btn');
        
        menuButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                menuButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onSelect(btn.dataset.diff);
            });
        });
    }
    
    // ==================== LEADERBOARD ====================
    
    updateLeaderboard(players, currentPlayerId) {
        const sorted = [...players].sort((a, b) => b.highscore - a.highscore);
        this.elements.leaderboardList.innerHTML = sorted.map(player => `
            <div class="leaderboard-entry ${player.id === currentPlayerId ? 'current-player' : ''}">
                <span>${player.name}</span>
                <span>${player.highscore}</span>
            </div>
        `).join('');
    }
    
    // ==================== SPEECH ====================
    
    updateSpeechStatus(status, text) {
        this.elements.speechIndicator.classList.remove('listening', 'heard');
        
        if (status === 'listening') {
            this.elements.speechIndicator.classList.add('listening');
        } else if (status === 'heard') {
            this.elements.speechIndicator.classList.add('heard');
        }
        
        this.elements.speechText.textContent = text;
    }
    
    // ==================== LAUNCHER ====================
    
    getLauncherPosition() {
        const rect = this.elements.launcher.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - 10,
            y: rect.top - 40
        };
    }
    
    animateLauncher() {
        this.elements.launcher.style.transform = 'translateX(-50%) scale(1.1)';
        setTimeout(() => {
            this.elements.launcher.style.transform = 'translateX(-50%) scale(1)';
        }, 100);
    }
    
    // ==================== MIC PERMISSION ====================
    
    setupMicPermissionButton(onClick) {
        if (this.elements.requestMicBtn) {
            this.elements.requestMicBtn.addEventListener('click', onClick);
        }
    }
}