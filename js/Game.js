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
        
        // Game objects
        this.meteors = [];
        this.rockets = [];
        
        // Timers
        this.meteorInterval = null;
        this.gameLoop = null;
        
        this._init();
    }
    
    /**
     * Initialize game
     * @private
     */
    _init() {
        // Check speech support
        if (!this.speech.checkSupport()) {
            this.ui.showWarning();
            return;
        }
        
        // Generate stars
        this.particles.generateStars();
        
        // Setup speech callbacks
        this.speech.onResult = (number) => this._onSpeechResult(number);
        this.speech.onStatusChange = (status, text) => this.ui.updateSpeechStatus(status, text);
        
        // Setup UI callbacks
        this.ui.setupDifficultyButtons((diff) => this.difficulty = diff);
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        
        // Load players
        this.loadPlayers();
    }
    
    /**
     * Load players from database
     */
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
    
    /**
     * Select a player
     * @private
     */
    _selectPlayer(player) {
        this.currentPlayer = player;
        this.ui.updateStartButton(true, `▶️ GRAJ JAKO ${player.name.toUpperCase()}`);
    }
    
    /**
     * Start the game
     */
    start() {
        if (!this.currentPlayer) return;
        
        this.isRunning = true;
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        
        // Update UI
        this.ui.showGame();
        this.ui.updateScore(0);
        this.ui.resetLives();
        
        const playerIndex = this.players.findIndex(p => p.id === this.currentPlayer.id);
        const avatar = CONFIG.AVATARS[playerIndex % CONFIG.AVATARS.length];
        this.ui.updateCurrentPlayer(avatar, this.currentPlayer.name);
        this.ui.updateLeaderboard(this.players, this.currentPlayer.id);
        
        // Start spawning meteors
        const spawnRate = CONFIG.DIFFICULTY[this.difficulty].spawnRate;
        this.meteorInterval = setInterval(() => this._spawnMeteor(), spawnRate);
        this._spawnMeteor();
        
        // Start game loop
        this._gameLoop();
        
        // Start speech recognition
        this.speech.start();
    }
    
    /**
     * Main game loop
     * @private
     */
    _gameLoop() {
        if (!this.isRunning) return;
        
        this._updateMeteors();
        this._updateRockets();
        
        this.gameLoop = requestAnimationFrame(() => this._gameLoop());
    }
    
    /**
     * Spawn a new meteor
     * @private
     */
    _spawnMeteor() {
        if (!this.isRunning) return;
        const meteor = new Meteor(this.container, this.difficulty);
        this.meteors.push(meteor);
    }
    
    /**
     * Update all meteors
     * @private
     */
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
    
    /**
     * Update all rockets
     * @private
     */
    _updateRockets() {
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            const result = rocket.update();
            
            if (result.hitTarget) {
                const target = rocket.target;
                const center = target.getCenter();
                
                // Create explosion
                this.particles.createExplosion(center.x, center.y);
                
                // Destroy meteor and rocket
                target.destroy();
                rocket.destroy();
                
                // Remove from arrays
                const meteorIndex = this.meteors.indexOf(target);
                if (meteorIndex > -1) this.meteors.splice(meteorIndex, 1);
                this.rockets.splice(i, 1);
                
                // Add score
                this._addScore();
            } else if (!result.active) {
                rocket.destroy();
                this.rockets.splice(i, 1);
            }
        }
    }
    
    /**
     * Handle speech result
     * @private
     */
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
    
    /**
     * Fire a rocket at target
     * @private
     */
    _fireRocket(target) {
        const pos = this.ui.getLauncherPosition();
        const rocket = new Rocket(this.container, pos.x, pos.y, target);
        this.rockets.push(rocket);
        this.ui.animateLauncher();
    }
    
    /**
     * Add score
     * @private
     */
    _addScore() {
        const points = CONFIG.DIFFICULTY[this.difficulty].points;
        this.score += points;
        this.ui.updateScore(this.score);
    }
    
    /**
     * Lose a life
     * @private
     */
    _loseLife() {
        this.lives--;
        this.ui.updateLives(this.lives);
        
        if (this.lives <= 0) {
            this._gameOver();
        }
    }
    
    /**
     * End the game
     * @private
     */
    async _gameOver() {
        this.isRunning = false;
        
        // Stop timers
        clearInterval(this.meteorInterval);
        cancelAnimationFrame(this.gameLoop);
        
        // Stop speech
        this.speech.stop();
        
        // Hide game UI
        this.ui.hideGame();
        
        // Clean up game objects
        this.meteors.forEach(m => m.destroy());
        this.rockets.forEach(r => r.destroy());
        this.meteors = [];
        this.rockets = [];
        
        // Check for new highscore
        const isNewHighscore = this.score > this.currentPlayer.highscore;
        if (isNewHighscore) {
            await this.db.updateHighscore(this.currentPlayer.id, this.score);
            this.currentPlayer.highscore = this.score;
            
            // Update local players array
            const playerIndex = this.players.findIndex(p => p.id === this.currentPlayer.id);
            if (playerIndex > -1) {
                this.players[playerIndex].highscore = this.score;
            }
        }
        
        // Show game over screen
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
    
    /**
     * Restart the game
     */
    restart() {
        this.start();
    }
    
    /**
     * Go back to menu
     */
    async backToMenu() {
        this.currentPlayer = null;
        this.ui.updateStartButton(false, '▶️ WYBIERZ GRACZA');
        await this.loadPlayers();
    }
}