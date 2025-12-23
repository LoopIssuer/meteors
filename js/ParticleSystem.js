
/**
 * ParticleSystem - Handles visual effects
 */
class ParticleSystem {
    constructor(container) {
        this.container = container;
    }
    
    /**
     * Create explosion at position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = x + 'px';
        explosion.style.top = y + 'px';
        
        const { particleCount, colors, duration } = CONFIG.EXPLOSION;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 30 + Math.random() * 50;
            
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            particle.style.width = particle.style.height = Math.random() * 10 + 5 + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            explosion.appendChild(particle);
        }
        
        this.container.appendChild(explosion);
        
        setTimeout(() => explosion.remove(), duration);
    }
    
    /**
     * Generate background stars
     */
    generateStars() {
        const starsContainer = document.getElementById('stars');
        if (!starsContainer) return;
        
        for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = star.style.height = Math.random() * 3 + 1 + 'px';
            star.style.animationDelay = Math.random() * 2 + 's';
            starsContainer.appendChild(star);
        }
    }
}