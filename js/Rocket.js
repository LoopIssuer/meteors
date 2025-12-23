/**
 * Rocket - Represents a homing rocket
 */
class Rocket {
    constructor(container, startX, startY, target) {
        this.container = container;
        this.target = target;
        this.x = startX;
        this.y = startY;
        this.speed = CONFIG.ROCKET_SPEED;
        this.element = null;
        this.isDestroyed = false;
        
        this._create();
    }
    
    /**
     * Create rocket element
     * @private
     */
    _create() {
        this.element = document.createElement('div');
        this.element.className = 'rocket';
        this.element.innerHTML = `
            <div class="rocket-tip"></div>
            <div class="rocket-body"></div>
            <div class="rocket-flame"></div>
        `;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        this.container.appendChild(this.element);
    }
    
    /**
     * Update rocket position
     * @returns {Object} { active: boolean, hitTarget: boolean }
     */
    update() {
        if (this.isDestroyed || !this.target || this.target.isDestroyed) {
            this.destroy();
            return { active: false, hitTarget: false };
        }
        
        const targetCenter = this.target.getCenter();
        const dx = targetCenter.x - this.x;
        const dy = targetCenter.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Check for hit
        if (dist < CONFIG.ROCKET_HIT_DISTANCE) {
            return { active: false, hitTarget: true };
        }
        
        // Move towards target
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Rotate towards target
        const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        this.element.style.transform = `rotate(${angle}deg)`;
        
        return { active: true, hitTarget: false };
    }
    
    /**
     * Destroy rocket
     */
    destroy() {
        this.isDestroyed = true;
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
    }
}