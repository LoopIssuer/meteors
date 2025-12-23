/**
 * Game Configuration
 */
const CONFIG = {
    // Supabase
    SUPABASE_URL: "https://hfdhqvesvxbrzgpgzawa.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZGhxdmVzdnhicnpncGd6YXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDE4MzQsImV4cCI6MjA4MDc3NzgzNH0.K7Dt7gQbXO8zvA60HVlDHV4nNRF3Q6jKfJsqjzuW3uE",
    
    // Game settings
    INITIAL_LIVES: 3,
    LAUNCHER_Y_OFFSET: 110,
    
    // Difficulty settings
    DIFFICULTY: {
        easy: {
            spawnRate: 3500,        // Wolniejsze pojawianie się
            meteorSize: 80,
            speedBase: 0.4,         // ZMNIEJSZONE z 0.8 na 0.4
            speedVariance: 0.2,     // Mniejsza wariancja
            points: 10,
            numberRange: { min: 1, max: 9 },
            label: 'Łatwy'
        },
        medium: {
            spawnRate: 2500,
            meteorSize: 90,
            speedBase: 1.0,
            speedVariance: 0.4,
            points: 25,
            numberRange: { min: 10, max: 99, secondMin: 1, secondMax: 9 },
            label: 'Średni'
        },
        hard: {
            spawnRate: 2000,
            meteorSize: 100,
            speedBase: 1.4,
            speedVariance: 0.5,
            points: 50,
            numberRange: { min: 10, max: 99 },
            label: 'Trudny'
        }
    },
    
    // Rocket settings
    ROCKET_SPEED: 8,
    ROCKET_HIT_DISTANCE: 30,
    
    // Player avatars
    AVATARS: ['🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐯', '🦄', '🐲', '🦋'],
    
    // Polish number words
    POLISH_NUMBERS: {
        'zero': 0, 'jeden': 1, 'jedna': 1, 'jedno': 1,
        'dwa': 2, 'dwie': 2, 'trzy': 3, 'cztery': 4,
        'pięć': 5, 'sześć': 6, 'siedem': 7, 'osiem': 8,
        'dziewięć': 9, 'dziesięć': 10, 'jedenaście': 11,
        'dwanaście': 12, 'trzynaście': 13, 'czternaście': 14,
        'piętnaście': 15, 'szesnaście': 16, 'siedemnaście': 17,
        'osiemnaście': 18, 'dziewiętnaście': 19, 'dwadzieścia': 20,
        'trzydzieści': 30, 'czterdzieści': 40, 'pięćdziesiąt': 50,
        'sześćdziesiąt': 60, 'siedemdziesiąt': 70, 'osiemdziesiąt': 80,
        'dziewięćdziesiąt': 90, 'sto': 100, 'dwieście': 200
    },
    
    // Explosion settings
    EXPLOSION: {
        particleCount: 20,
        colors: ['#ff6600', '#ff9900', '#ffcc00', '#ff3300', '#ffffff'],
        duration: 500
    },
    
    // Stars
    STAR_COUNT: 100,
    
    // Local storage keys
    STORAGE_KEYS: {
        MICROPHONE_GRANTED: 'meteor_game_mic_granted'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.DIFFICULTY);
Object.freeze(CONFIG.POLISH_NUMBERS);
Object.freeze(CONFIG.EXPLOSION);
Object.freeze(CONFIG.STORAGE_KEYS);