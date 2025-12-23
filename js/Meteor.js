/**
 * Meteor - Represents a single meteor
 */
class Meteor {
    constructor(container, difficulty) {
        this.container = container;
        this.difficulty = difficulty;
        this.element = null;
        this.result = 0;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.isDestroyed = false;
        
        this._create();
    }
    
    /**
     * Create meteor element
     * @private
     */
    _create() {
        const settings = CONFIG.DIFFICULTY[this.difficulty];
        const problem = this._generateProblem();
        
        this.result = problem.result;
        this.speed = settings.speedBase + Math.random() * settings.speedVariance;
        
        const size = settings.meteorSize;
        this.x = Math.random() * (window.innerWidth - size);
        this.y = -size;
        
        this.element = document.createElement('div');
        this.element.className = 'meteor';
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'meteor-text';
        textSpan.textContent = problem.text;
        this.element.appendChild(textSpan);
        
        this.container.appendChild(this.element);
    }
    
    /**
     * Generate math problem
     * @private
     * @returns {Object} Problem object with a, b, result, text
     */
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
    
    /**
     * Generate random integer
     * @private
     */
    _randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Update meteor position
     * @returns {boolean} True if meteor is still active
     */
    update() {
        if (this.isDestroyed) return false;
        
        this.y += this.speed;
        this.element.style.top = this.y + 'px';
        
        return true;
    }
    
    /**
     * Check if meteor reached the bottom
     * @param {number} limitY - Y position limit
     * @returns {boolean}
     */
    hasReachedBottom(limitY) {
        return this.y > limitY;
    }
    
    /**
     * Get center position
     * @returns {Object} {x, y}
     */
    getCenter() {
        const size = parseFloat(this.element.style.width);
        return {
            x: this.x + size / 2,
            y: this.y + size / 2
        };
    }
    
    /**
     * Destroy meteor
     */
    destroy() {
        this.isDestroyed = true;
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
    }
}