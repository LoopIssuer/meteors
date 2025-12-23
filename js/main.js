/**
 * Main entry point
 */
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    
    // Make game globally accessible for button callbacks
    window.game = game;
});