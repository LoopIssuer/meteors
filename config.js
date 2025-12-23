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
    
    // Streak system
    STREAK_TARGET: 10,           // Co ile meteorów bonus
    STREAK_BASE_BONUS: 50,       // Bazowy bonus za pierwszą serię
    STREAK_BONUS_INCREMENT: 50,  // O ile wzrasta bonus przy każdej kolejnej serii
    
    // Difficulty settings
    DIFFICULTY: {
        easy: {
            spawnRate: 3500,
            meteorSize: 80,
            speedBase: 0.4,
            speedVariance: 0.2,
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
    
    // Fast meteor settings
    FAST_METEOR: {
        speedMultiplier: 2.5,        // Szybkość 2.5x większa niż normalny meteoryt
        bonusPoints: 25,              // Dodatkowe punkty za zestrzelenie
        spawnScoreInterval: { min: 50, max: 100 }  // Co ile punktów się pojawia
    },
    
    // Bomb meteor settings
    BOMB_METEOR: {
        minScore: 200,                // Minimalna liczba punktów do pojawienia się
        spawnChance: 0.15,            // 15% szansy przy każdym spawnie po przekroczeniu minScore
        explosionRadius: 200,         // Promień wybuchu w pikselach
        bonusPoints: 50,              // Dodatkowe punkty
        speedMultiplier: 0.7          // Wolniejszy niż normalny
    },
    
    // Splitting meteor settings
    SPLITTING_METEOR: {
        minScore: 250,                // Minimalna liczba punktów
        spawnChance: 0.12,            // 12% szansy
        bonusPoints: 40,              // Punkty za rodzica
        childBonusPoints: 15,         // Punkty za każde dziecko
        childSizeMultiplier: 0.6,     // Rozmiar dzieci (60% rodzica)
        speedMultiplier: 0.8          // Trochę wolniejszy
    },
    
    // Multiply meteor settings
    MULTIPLY_METEOR: {
        minScore: 300,                // Minimalna liczba punktów
        spawnChance: 0.10,            // 10% szansy
        bonusPoints: 60,              // Dodatkowe punkty
        maxResults: {                 // Maksymalne wyniki dla poziomów
            easy: 20,
            medium: 50,
            hard: 100
        },
        speedMultiplier: 0.9
    },
    
    // Boss meteor settings
    BOSS_METEOR: {
        firstSpawn: 500,              // Pierwszy boss przy 500 punktach
        spawnInterval: 500,           // Kolejne co 500 punktów
        phases: 5,                    // Liczba faz (działań do rozwiązania)
        size: 150,                    // Duży rozmiar
        speedMultiplier: 0.3,         // Bardzo wolny
        bonusPoints: 200,             // Duża nagroda
        healthBarHeight: 8            // Wysokość paska zdrowia
    },
    
    // Powerup settings
    POWERUP: {
        spawnInterval: 100,           // Co ile punktów pojawia się powerup
        size: 70,                     // Rozmiar meteorytu powerup
        speedMultiplier: 0.6,         // Wolniejszy niż normalny
        types: [
            {
                id: 'doublePoints',
                name: 'Podwójne Punkty',
                icon: '⭐',
                duration: 30000,      // 30 sekund
                color: '#FFD700'
            },
            {
                id: 'slowTime',
                name: 'Spowolnienie',
                icon: '🕐',
                duration: 10000,      // 10 sekund
                slowFactor: 0.3,      // 30% wolniej (70% normalnej prędkości)
                color: '#00BCD4'
            },
            {
                id: 'megaBomb',
                name: 'Megabomba',
                icon: '💣',
                duration: 0,          // Instant
                color: '#FF5722'
            }
        ]
    },
    
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
