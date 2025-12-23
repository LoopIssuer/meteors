/**
 * Meteor - Represents a single meteor
 */
class Meteor {
    constructor(container, difficulty, type = 'normal', powerupType = null) {
        this.container = container;
        this.difficulty = difficulty;
        this.type = type; // 'normal', 'fast', 'bomb', 'splitting', 'multiply', 'boss', 'powerup'
        this.element = null;
        this.result = 0;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.isDestroyed = false;
        
        // Boss-specific properties
        this.currentPhase = 0;
        this.maxPhases = 0;
        this.phases = [];
        
        // Powerup-specific properties
        this.powerupType = powerupType;
        
        this._create();
    }
    
    _create() {
        const settings = CONFIG.DIFFICULTY[this.difficulty];
        
        // Generate problem(s) based on type
        if (this.type === 'boss') {
            this._createBoss(settings);
            return;
        }
        
        if (this.type === 'powerup') {
            this._createPowerup(settings);
            return;
        }
        
        const problem = this._generateProblem();
        this.result = problem.result;
        this.speed = settings.speedBase + Math.random() * settings.speedVariance;
        
        // Apply speed multipliers
        if (this.type === 'fast') {
            this.speed *= CONFIG.FAST_METEOR.speedMultiplier;
        } else if (this.type === 'bomb') {
            this.speed *= CONFIG.BOMB_METEOR.speedMultiplier;
        } else if (this.type === 'splitting') {
            this.speed *= CONFIG.SPLITTING_METEOR.speedMultiplier;
        } else if (this.type === 'multiply') {
            this.speed *= CONFIG.MULTIPLY_METEOR.speedMultiplier;
        }
        
        const size = settings.meteorSize;
        this.x = Math.random() * (window.innerWidth - size);
        this.y = -size;
        
        this.element = document.createElement('div');
        this.element.className = `meteor ${this.type}`;
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'meteor-text';
        textSpan.textContent = problem.text;
        this.element.appendChild(textSpan);
        
        // Add type indicators
        if (this.type === 'fast') {
            const indicator = document.createElement('div');
            indicator.className = 'type-indicator';
            indicator.textContent = '⚡';
            this.element.appendChild(indicator);
        } else if (this.type === 'bomb') {
            const indicator = document.createElement('div');
            indicator.className = 'type-indicator';
            indicator.textContent = '💣';
            this.element.appendChild(indicator);
        } else if (this.type === 'splitting') {
            const indicator = document.createElement('div');
            indicator.className = 'type-indicator';
            indicator.textContent = '💥';
            this.element.appendChild(indicator);
        } else if (this.type === 'multiply') {
            const indicator = document.createElement('div');
            indicator.className = 'type-indicator';
            indicator.textContent = '✖️';
            this.element.appendChild(indicator);
        }
        
        this.container.appendChild(this.element);
    }
    
    _createBoss(settings) {
        const bossConfig = CONFIG.BOSS_METEOR;
        this.maxPhases = bossConfig.phases;
        this.currentPhase = 0;
        
        // Generate 5 problems for boss
        for (let i = 0; i < this.maxPhases; i++) {
            const problem = this._generateProblem();
            this.phases.push(problem);
        }
        
        this.result = this.phases[0].result;
        this.speed = settings.speedBase * bossConfig.speedMultiplier;
        
        const size = bossConfig.size;
        this.x = Math.random() * (window.innerWidth - size);
        this.y = -size;
        
        this.element = document.createElement('div');
        this.element.className = 'meteor boss';
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Boss indicator
        const bossLabel = document.createElement('div');
        bossLabel.className = 'boss-label';
        bossLabel.textContent = '👑 BOSS 👑';
        this.element.appendChild(bossLabel);
        
        // Problem text
        const textSpan = document.createElement('span');
        textSpan.className = 'meteor-text';
        textSpan.textContent = this.phases[0].text;
        this.element.appendChild(textSpan);
        
        // Health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'boss-health-bar';
        const healthFill = document.createElement('div');
        healthFill.className = 'boss-health-fill';
        healthFill.style.width = '100%';
        healthBar.appendChild(healthFill);
        this.element.appendChild(healthBar);
        
        this.container.appendChild(this.element);
    }
    
    _createPowerup(settings) {
        const powerupConfig = this.powerupType;
        const size = CONFIG.POWERUP.size;
        
        // Generate simple problem
        const problem = this._generateProblem();
        this.result = problem.result;
        this.speed = settings.speedBase * CONFIG.POWERUP.speedMultiplier;
        
        this.x = Math.random() * (window.innerWidth - size);
        this.y = -size;
        
        this.element = document.createElement('div');
        this.element.className = 'meteor powerup';
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.setProperty('--powerup-color', powerupConfig.color);
        
        // Powerup icon
        const iconDiv = document.createElement('div');
        iconDiv.className = 'powerup-icon';
        iconDiv.textContent = powerupConfig.icon;
        this.element.appendChild(iconDiv);
        
        // Problem text
        const textSpan = document.createElement('span');
        textSpan.className = 'meteor-text';
        textSpan.textContent = problem.text;
        this.element.appendChild(textSpan);
        
        // Powerup label
        const label = document.createElement('div');
        label.className = 'powerup-label';
        label.textContent = powerupConfig.name;
        this.element.appendChild(label);
        
        this.container.appendChild(this.element);
    }
    
    _generateProblem() {
        // Special handling for multiply meteor
        if (this.type === 'multiply') {
            return this._generateMultiplyProblem();
        }
        
        const settings = CONFIG.DIFFICULTY[this.difficulty];
        const range = settings.numberRange;
        
        let a, b;
        
        if (this.difficulty === 'medium') {
            a = this._randomInt(range.min, range.max);
            b = this._randomInt(range.secondMin, range.secondMax);
        } else {
            a = this._randomInt(range.min, range.max);
            b = this._randomInt(range.min, range.max);
        }
        
        return {
            a,
            b,
            result: a + b,
            text: `${a} + ${b}`
        };
    }
    
    _generateMultiplyProblem() {
        const maxResult = CONFIG.MULTIPLY_METEOR.maxResults[this.difficulty];
        let a, b, result;
        
        // Generate numbers until we get a valid result
        do {
            a = this._randomInt(1, 9); // Single digit
            b = this._randomInt(1, 9); // Single digit
            result = a * b;
        } while (result >= maxResult);
        
        return {
            a,
            b,
            result: result,
            text: `${a} × ${b}`
        };
    }
    
    _randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    update() {
        if (this.isDestroyed) return false;
        
        this.y += this.speed;
        this.element.style.top = this.y + 'px';
        
        return true;
    }
    
    hasReachedBottom(limitY) {
        return this.y > limitY;
    }
    
    getCenter() {
        const size = parseFloat(this.element.style.width);
        return {
            x: this.x + size / 2,
            y: this.y + size / 2
        };
    }
    
    getBonusPoints() {
        if (this.type === 'fast') return CONFIG.FAST_METEOR.bonusPoints;
        if (this.type === 'bomb') return CONFIG.BOMB_METEOR.bonusPoints;
        if (this.type === 'splitting') return CONFIG.SPLITTING_METEOR.bonusPoints;
        if (this.type === 'multiply') return CONFIG.MULTIPLY_METEOR.bonusPoints;
        if (this.type === 'boss') return CONFIG.BOSS_METEOR.bonusPoints;
        if (this.type === 'powerup') return 0; // Powerupy nie dają punktów
        return 0;
    }
    
    getPowerupType() {
        if (this.type === 'powerup') {
            return this.powerupType;
        }
        return null;
    }
    
    advanceBossPhase() {
        if (this.type !== 'boss') return false;
        
        this.currentPhase++;
        
        if (this.currentPhase >= this.maxPhases) {
            return true; // Boss defeated
        }
        
        // Update to next phase
        this.result = this.phases[this.currentPhase].result;
        const textSpan = this.element.querySelector('.meteor-text');
        if (textSpan) {
            textSpan.textContent = this.phases[this.currentPhase].text;
        }
        
        // Update health bar
        const healthFill = this.element.querySelector('.boss-health-fill');
        if (healthFill) {
            const percentage = ((this.maxPhases - this.currentPhase) / this.maxPhases) * 100;
            healthFill.style.width = percentage + '%';
        }
        
        return false; // Boss still alive
    }
    
    destroy() {
        this.isDestroyed = true;
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
    }
}
