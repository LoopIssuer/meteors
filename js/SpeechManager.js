/**
 * SpeechManager - Handles speech recognition with permission management
 */
class SpeechManager {
    constructor() {
        this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = null;
        this.isSupported = !!this.SpeechRecognition;
        this.isListening = false;
        this.permissionGranted = false;
        
        // Callbacks
        this.onResult = null;
        this.onStatusChange = null;
        this.onPermissionChange = null;
        
        // Check saved permission state
        this._loadPermissionState();
    }
    
    /**
     * Check if speech recognition is supported
     * @returns {boolean}
     */
    checkSupport() {
        return this.isSupported;
    }
    
    /**
     * Load permission state from localStorage
     * @private
     */
    _loadPermissionState() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.MICROPHONE_GRANTED);
        this.permissionGranted = saved === 'true';
    }
    
    /**
     * Save permission state to localStorage
     * @private
     */
    _savePermissionState(granted) {
        this.permissionGranted = granted;
        localStorage.setItem(CONFIG.STORAGE_KEYS.MICROPHONE_GRANTED, granted.toString());
    }
    
    /**
     * Check current microphone permission status
     * @returns {Promise<string>} 'granted', 'denied', or 'prompt'
     */
    async checkPermission() {
        try {
            // Try using Permissions API first (not supported in all browsers)
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'microphone' });
                return result.state;
            }
        } catch (e) {
            console.log('Permissions API not available, falling back to saved state');
        }
        
        // Fallback to saved state
        return this.permissionGranted ? 'granted' : 'prompt';
    }
    
    /**
     * Request microphone permission
     * @returns {Promise<boolean>} Whether permission was granted
     */
    async requestPermission() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Stop all tracks immediately (we just needed permission)
            stream.getTracks().forEach(track => track.stop());
            
            // Permission granted
            this._savePermissionState(true);
            
            if (this.onPermissionChange) {
                this.onPermissionChange(true);
            }
            
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            this._savePermissionState(false);
            
            if (this.onPermissionChange) {
                this.onPermissionChange(false);
            }
            
            return false;
        }
    }
    
    /**
     * Check if we need to request permission
     * @returns {Promise<boolean>}
     */
    async needsPermissionRequest() {
        const status = await this.checkPermission();
        return status === 'prompt' || status === 'denied';
    }
    
    /**
     * Start listening for speech
     */
    start() {
        if (!this.isSupported || this.isListening) return;
        
        this.recognition = new this.SpeechRecognition();
        this.recognition.lang = 'pl-PL';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this._savePermissionState(true); // If we got here, permission is granted
            this._updateStatus('listening', 'Słucham...');
        };
        
        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript.trim();
            
            this._updateStatus('heard', `"${transcript}"`);
            
            const number = this._parsePolishNumber(transcript);
            if (number !== null && this.onResult) {
                this.onResult(number);
            }
            
            setTimeout(() => {
                if (this.isListening) {
                    this._updateStatus('listening', 'Słucham...');
                }
            }, 500);
        };
        
        this.recognition.onerror = (event) => {
            console.log('Speech error:', event.error);
            
            if (event.error === 'not-allowed') {
                this._savePermissionState(false);
                if (this.onPermissionChange) {
                    this.onPermissionChange(false);
                }
            } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
                this._updateStatus('error', 'Błąd - ponawiam...');
            }
        };
        
        this.recognition.onend = () => {
            if (this.isListening) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.log('Recognition restart error:', e);
                    }
                }, 100);
            }
        };
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    }
    
    /**
     * Stop listening
     */
    stop() {
        this.isListening = false;
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('Error stopping recognition:', e);
            }
            this.recognition = null;
        }
    }
    
    /**
     * Update status callback
     * @private
     */
    _updateStatus(status, text) {
        if (this.onStatusChange) {
            this.onStatusChange(status, text);
        }
    }
    
    /**
     * Parse Polish number from text
     * @private
     * @param {string} text - Text to parse
     * @returns {number|null} Parsed number or null
     */
    _parsePolishNumber(text) {
        // Try direct number parsing
        const directNum = parseInt(text);
        if (!isNaN(directNum)) return directNum;
        
        text = text.toLowerCase().trim();
        
        // Check exact match
        if (CONFIG.POLISH_NUMBERS[text] !== undefined) {
            return CONFIG.POLISH_NUMBERS[text];
        }
        
        // Parse compound numbers
        let total = 0;
        const words = text.split(/\s+/);
        
        for (const word of words) {
            if (CONFIG.POLISH_NUMBERS[word] !== undefined) {
                total += CONFIG.POLISH_NUMBERS[word];
            }
        }
        
        return total > 0 ? total : null;
    }
}