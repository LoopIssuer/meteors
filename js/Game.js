/**
 * Game - Main game controller
 */
class Game {
    constructor() {
        this.db = new Database();
        this.ui = new UIManager();
        this.speech = new SpeechManager();
        this.particles = new ParticleSystem(document.getElementById('gameContainer'));
        
        this.container = document.getElementById('gameContainer');
        
        // Game state
        this.isRunning = false;
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.difficulty = 'easy';
        this.currentPlayer = null;
        this.players = [];
        
        // Streak system
        this.streakCount = 0;
        this.streakLevel = 0;
        
        // Fast meteor system
        this.lastFastMeteorScore = 0;
        this.nextFastMeteorScore = this._calculateNextFastMeteorScore();
        
        // Game objects
        this.meteors = [];
        this.rockets = [];
        
        // Timers
        this.meteorInterval = null;
        this.gameLoop = null;
        
        this._init();
    }
    
    async _init() {
        if (!this.speech.checkSupport()) {
            this.ui.showWarning();
            return;
        }
        
        this.particles.generateStars();
        
        this.speech.onResult = (number) => this._onSpeechResult(number);
        this.speech.onStatusChange = (status, text) => this.ui.updateSpeechStatus(status, text);
        this.speech.onPermissionChange = (granted) => this._onPermissionChange(granted);
        
        this.ui.setupDifficultyButtons((diff) => this.difficulty = diff);
        this.ui.setupMicPermissionButton(() => this._requestMicPermission());
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        
        await this._checkAndRequestMicPermission();
    }
    
    async _checkAndRequestMicPermission() {
        this.ui.showLoading();
        
        const permissionStatus = await this.speech.checkPermission();
        
        if (permissionStatus === 'granted') {
            await this.loadPlayers();
        } else if (permissionStatus === 'denied') {
            this.ui.showMicPermission();
        } else {
            this.ui.showMicPermission();
        }
    }
    
    async _requestMicPermission() {
        const granted = await this.speech.requestPermission();
        
        if (granted) {
            await this.loadPlayers();
        } else {
            alert('Dostęp do mikrofonu jest wymagany do gry. Zezwól na dostęp w ustawieniach przeglądarki.');
        }
    }
    
    _onPermissionChange(granted) {
        if (!granted && this.isRunning) {
            this._gameOver();
            alert('Dostęp do mikrofonu został odebrany. Gra została zakończona.');
        }
    }
    
    async loadPlayers() {
        this.ui.showLoading();
        
        try {
            this.players = await this.db.getPlayers();
            this.ui.renderPlayers(this.players, (player) => this._selectPlayer(player));
            this.ui.showMenu();
        } catch (error) {
            this.ui.showLoadingError(error.message);
        }
    }
    
    _selectPlayer(player) {
        this.currentPlayer = player;
        this.ui.updateStartButton(true, `▶️ GRAJ JAKO ${player.name.toUpperCase()}`);
    }
    
    start() {
        if (!this.currentPlayer) return;
        
        this.isRunning = true;
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.streakCount = 0;
        this.streakLevel = 0;
        this.lastFastMeteorScore = 0;
        this.nextFastMeteorScore = this._calculateNextFastMeteorScore();
        
        this.ui.showGame();
        this.ui.updateScore(0);
        this.ui.resetLives();
        this.ui.resetStreak();
        this.ui.updateDifficultyLabel(this.difficulty);
        
        const playerIndex = this.players.findIndex(p => p.id === this.currentPlayer.id);
        const avatar = CONFIG.AVATARS[playerIndex % CONFIG.AVATARS.length];
        this.ui.updateCurrentPlayer(avatar, this.currentPlayer.name);
        this.ui.updateLeaderboard(this.players, this.currentPlayer.id);
        
        const spawnRate = CONFIG.DIFFICULTY[this.difficulty].spawnRate;
        this.meteorInterval = setInterval(() => this._spawnMeteor(), spawnRate);
        this._spawnMeteor();
        
        this._gameLoop();
        this.speech.start();
    }
    
    _gameLoop() {
        if (!this.isRunning) return;
        
        this._updateMeteors();
        this._updateRockets();
        
        this.gameLoop = requestAnimationFrame(() => this._gameLoop());
    }
    
    _spawnMeteor() {
        if (!this.isRunning) return;
        const meteor = new Meteor(this.container, this.difficulty);
        this.meteors.push(meteor);
    }
    
    _spawnFastMeteor() {
        if (!this.isRunning) return;
        const meteor = new Meteor(this.container, this.difficulty, true);
        this.meteors.push(meteor);
        
        this.lastFastMeteorScore = this.score;
        this.nextFastMeteorScore = this._calculateNextFastMeteorScore();
    }
    
    _calculateNextFastMeteorScore() {
        const { min, max } = CONFIG.FAST_METEOR.spawnScoreInterval;
        const interval = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.lastFastMeteorScore + interval;
    }
    
    _updateMeteors() {
        const limitY = window.innerHeight - CONFIG.LAUNCHER_Y_OFFSET;
        
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];
            meteor.update();
            
            if (meteor.hasReachedBottom(limitY)) {
                meteor.destroy();
                this.meteors.splice(i, 1);
                this._loseLife();
            }
        }
    }
    
    _updateRockets() {
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            const result = rocket.update();
            
            if (result.hitTarget) {
                const target = rocket.target;
                const center = target.getCenter();
                const isFastMeteor = target.isFast;
                
                this.particles.createExplosion(center.x, center.y);
                
                target.destroy();
                rocket.destroy();
                
                const meteorIndex = this.meteors.indexOf(target);
                if (meteorIndex > -1) this.meteors.splice(meteorIndex, 1);
                this.rockets.splice(i, 1);
                
                this._addScore(isFastMeteor);
                this._incrementStreak();
            } else if (!result.active) {
                rocket.destroy();
                this.rockets.splice(i, 1);
            }
        }
    }
    
    _onSpeechResult(number) {
        for (const meteor of this.meteors) {
            if (meteor.result === number) {
                const alreadyTargeted = this.rockets.some(r => r.target === meteor);
                if (!alreadyTargeted) {
                    this._fireRocket(meteor);
                    break;
                }
            }
        }
    }
    
    _fireRocket(target) {
        const pos = this.ui.getLauncherPosition();
        const rocket = new Rocket(this.container, pos.x, pos.y, target);
        this.rockets.push(rocket);
        this.ui.animateLauncher();
    }
    
    _addScore(isFastMeteor = false) {
        let points = CONFIG.DIFFICULTY[this.difficulty].points;
        
        if (isFastMeteor) {
            points += CONFIG.FAST_METEOR.bonusPoints;
        }
        
        this.score += points;
        this.ui.updateScore(this.score);
        
        if (this.score >= this.nextFastMeteorScore) {
            this._spawnFastMeteor();
        }
    }
    
    _incrementStreak() {
        this.streakCount++;
        
        const nextBonus = CONFIG.STREAK_BASE_BONUS + (this.streakLevel * CONFIG.STREAK_BONUS_INCREMENT);
        this.ui.updateStreak(this.streakCount, CONFIG.STREAK_TARGET, nextBonus);
        
        if (this.streakCount >= CONFIG.STREAK_TARGET) {
            this._awardStreakBonus();
        }
    }
    
    _awardStreakBonus() {
        const bonusPoints = CONFIG.STREAK_BASE_BONUS + (this.streakLevel * CONFIG.STREAK_BONUS_INCREMENT);
        
        this.score += bonusPoints;
        this.ui.updateScore(this.score);
        this.ui.showBonusPopup(bonusPoints);
        
        this.streakLevel++;
        this.streakCount = 0;
        
        const nextBonus = CONFIG.STREAK_BASE_BONUS + (this.streakLevel * CONFIG.STREAK_BONUS_INCREMENT);
        this.ui.updateStreak(0, CONFIG.STREAK_TARGET, nextBonus);
    }
    
    _loseLife() {
        this.lives--;
        this.ui.updateLives(this.lives);
        
        this.streakCount = 0;
        this.streakLevel = 0;
        this.ui.resetStreak();
        
        if (this.lives <= 0) {
            this._gameOver();
        }
    }
    
    async _gameOver() {
        this.isRunning = false;
        
        clearInterval(this.meteorInterval);
        cancelAnimationFrame(this.gameLoop);
        
        this.speech.stop();
        this.ui.hideGame();
        
        this.meteors.forEach(m => m.destroy());
        this.rockets.forEach(r => r.destroy());
        this.meteors = [];
        this.rockets = [];
        
        const isNewHighscore = this.score > this.currentPlayer.highscore;
        if (isNewHighscore) {
            await this.db.updateHighscore(this.currentPlayer.id, this.score);
            this.currentPlayer.highscore = this.score;
            
            const playerIndex = this.players.findIndex(p => p.id === this.currentPlayer.id);
            if (playerIndex > -1) {
                this.players[playerIndex].highscore = this.score;
            }
        }
        
        const playerIndex = this.players.findIndex(p => p.id === this.currentPlayer.id);
        const avatar = CONFIG.AVATARS[playerIndex % CONFIG.AVATARS.length];
        
        this.ui.showGameOver(
            this.currentPlayer.name,
            avatar,
            this.score,
            isNewHighscore,
            this.currentPlayer.highscore,
            this.difficulty
        );
    }
    
    restart() {
        this.start();
    }
    
    async backToMenu() {
        this.currentPlayer = null;
        this.ui.updateStartButton(false, '▶️ WYBIERZ GRACZA');
        await this.loadPlayers();
    }
}
