/**
 * UIManager - Handles all UI updates
 */
class UIManager {
    constructor() {
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
            warning: document.getElementById('warning'),
            streakContainer: document.getElementById('streakContainer'),
            streakCount: document.getElementById('streakCount'),
            streakProgress: document.getElementById('streakProgress'),
            streakProgressText: document.getElementById('streakProgressText'),
            nextBonus: document.getElementById('nextBonus')
        };
    }
    
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
        this.elements.streakContainer.classList.remove('hidden');
    }
    
    hideGame() {
        this.elements.uiPanel.classList.add('hidden');
        this.elements.launcher.classList.add('hidden');
        this.elements.speechIndicator.classList.add('hidden');
        this.elements.leaderboard.classList.add('hidden');
        this.elements.streakContainer.classList.add('hidden');
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
    
    updateStreak(current, target, nextBonus) {
        this.elements.streakCount.textContent = current;
        this.elements.nextBonus.textContent = nextBonus;
        
        const percentage = (current / target) * 100;
        this.elements.streakProgress.style.width = percentage + '%';
        this.elements.streakProgressText.textContent = `${current}/${target}`;
    }
    
    resetStreak() {
        this.updateStreak(0, CONFIG.STREAK_TARGET, CONFIG.STREAK_BASE_BONUS);
    }
    
    showBonusPopup(bonusPoints) {
        const popup = document.createElement('div');
        popup.className = 'bonus-popup';
        popup.textContent = `+${bonusPoints} BONUS!`;
        
        document.getElementById('gameContainer').appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1500);
    }
    
    updateDifficultyLabel(difficulty) {
        const label = this.elements.difficultyLabel;
        const settings = CONFIG.DIFFICULTY[difficulty];
        
        label.classList.remove('easy', 'medium', 'hard');
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
    
    updateLeaderboard(players, currentPlayerId) {
        const sorted = [...players].sort((a, b) => b.highscore - a.highscore);
        this.elements.leaderboardList.innerHTML = sorted.map(player => `
            <div class="leaderboard-entry ${player.id === currentPlayerId ? 'current-player' : ''}">
                <span>${player.name}</span>
                <span>${player.highscore}</span>
            </div>
        `).join('');
    }
    
    updateSpeechStatus(status, text) {
        this.elements.speechIndicator.classList.remove('listening', 'heard');
        
        if (status === 'listening') {
            this.elements.speechIndicator.classList.add('listening');
        } else if (status === 'heard') {
            this.elements.speechIndicator.classList.add('heard');
        }
        
        this.elements.speechText.textContent = text;
    }
    
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
    
    setupMicPermissionButton(onClick) {
        if (this.elements.requestMicBtn) {
            this.elements.requestMicBtn.addEventListener('click', onClick);
        }
    }
    
    // ==================== POWERUPS ====================
    
    /**
     * Show powerup notification
     */
    showPowerupNotification(name, icon) {
        const notification = document.createElement('div');
        notification.className = 'powerup-notification';
        notification.innerHTML = `
            <div class="powerup-notification-icon">${icon}</div>
            <div class="powerup-notification-text">${name}</div>
        `;
        
        document.getElementById('gameContainer').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Add active powerup indicator
     */
    addActivePowerup(id, name, icon, duration) {
        let container = document.getElementById('activePowerupsContainer');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'activePowerupsContainer';
            container.className = 'active-powerups-container';
            document.getElementById('gameContainer').appendChild(container);
        }
        
        // Remove existing if present
        const existing = container.querySelector(`[data-powerup-id="${id}"]`);
        if (existing) existing.remove();
        
        const powerupEl = document.createElement('div');
        powerupEl.className = 'active-powerup';
        powerupEl.dataset.powerupId = id;
        
        if (duration > 0) {
            const endTime = Date.now() + duration;
            powerupEl.innerHTML = `
                <div class="active-powerup-icon">${icon}</div>
                <div class="active-powerup-timer" data-end-time="${endTime}">
                    ${Math.ceil(duration / 1000)}s
                </div>
            `;
            
            // Update timer
            const interval = setInterval(() => {
                const remaining = endTime - Date.now();
                const timerEl = powerupEl.querySelector('.active-powerup-timer');
                
                if (remaining <= 0 || !timerEl) {
                    clearInterval(interval);
                    return;
                }
                
                timerEl.textContent = Math.ceil(remaining / 1000) + 's';
            }, 100);
        } else {
            powerupEl.innerHTML = `
                <div class="active-powerup-icon">${icon}</div>
            `;
        }
        
        container.appendChild(powerupEl);
    }
    
    /**
     * Remove active powerup indicator
     */
    removeActivePowerup(id) {
        const container = document.getElementById('activePowerupsContainer');
        if (!container) return;
        
        const powerup = container.querySelector(`[data-powerup-id="${id}"]`);
        if (powerup) {
            powerup.classList.add('fade-out');
            setTimeout(() => powerup.remove(), 300);
        }
    }
    
    /**
     * Clear all active powerups
     */
    clearActivePowerups() {
        const container = document.getElementById('activePowerupsContainer');
        if (container) {
            container.remove();
        }
    }
}
