/**
 * Meteor - Represents a single meteor
 */
class Meteor {
    constructor(container, difficulty, isFast = false) {
        this.container = container;
        this.difficulty = difficulty;
        this.isFast = isFast;
        this.element = null;
        this.result = 0;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.isDestroyed = false;
        
        this._create();
    }
    
    _create() {
        const settings = CONFIG.DIFFICULTY[this.difficulty];
        const problem = this._generateProblem();
        
        this.result = problem.result;
        this.speed = settings.speedBase + Math.random() * settings.speedVariance;
        
        // Apply fast meteor speed multiplier
        if (this.isFast) {
            this.speed *= CONFIG.FAST_METEOR.speedMultiplier;
        }
        
        const size = settings.meteorSize;
        this.x = Math.random() * (window.innerWidth - size);
        this.y = -size;
        
        this.element = document.createElement('div');
        this.element.className = this.isFast ? 'meteor fast' : 'meteor';
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'meteor-text';
        textSpan.textContent = problem.text;
        this.element.appendChild(textSpan);
        
        // Add fast indicator
        if (this.isFast) {
            const fastIndicator = document.createElement('div');
            fastIndicator.className = 'fast-indicator';
            fastIndicator.textContent = '⚡';
            this.element.appendChild(fastIndicator);
        }
        
        this.container.appendChild(this.element);
    }
    
    _generateProblem() {
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
    
    destroy() {
        this.isDestroyed = true;
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
    }
}
