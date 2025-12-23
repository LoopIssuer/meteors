/**
 * SpeechManager - Handles speech recognition
 */
class SpeechManager {
    constructor() {
        this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = null;
        this.isSupported = !!this.SpeechRecognition;
        this.isListening = false;
        this.onResult = null;
        this.onStatusChange = null;
    }
    
    /**
     * Check if speech recognition is supported
     * @returns {boolean}
     */
    checkSupport() {
        return this.isSupported;
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
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
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
        
        this.recognition.start();
    }
    
    /**
     * Stop listening
     */
    stop() {
        this.isListening = false;
        if (this.recognition) {
            this.recognition.stop();
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