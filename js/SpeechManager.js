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
        
        this.onResult = null;
        this.onStatusChange = null;
        this.onPermissionChange = null;
        
        this._loadPermissionState();
    }
    
    checkSupport() {
        return this.isSupported;
    }
    
    _loadPermissionState() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.MICROPHONE_GRANTED);
        this.permissionGranted = saved === 'true';
    }
    
    _savePermissionState(granted) {
        this.permissionGranted = granted;
        localStorage.setItem(CONFIG.STORAGE_KEYS.MICROPHONE_GRANTED, granted.toString());
    }
    
    async checkPermission() {
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'microphone' });
                return result.state;
            }
        } catch (e) {
            console.log('Permissions API not available, falling back to saved state');
        }
        
        return this.permissionGranted ? 'granted' : 'prompt';
    }
    
    async requestPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            
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
    
    async needsPermissionRequest() {
        const status = await this.checkPermission();
        return status === 'prompt' || status === 'denied';
    }
    
    start() {
        if (!this.isSupported || this.isListening) return;
        
        this.recognition = new this.SpeechRecognition();
        this.recognition.lang = 'pl-PL';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this._savePermissionState(true);
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
    
    _updateStatus(status, text) {
        if (this.onStatusChange) {
            this.onStatusChange(status, text);
        }
    }
    
    _parsePolishNumber(text) {
        const directNum = parseInt(text);
        if (!isNaN(directNum)) return directNum;
        
        text = text.toLowerCase().trim();
        
        if (CONFIG.POLISH_NUMBERS[text] !== undefined) {
            return CONFIG.POLISH_NUMBERS[text];
        }
        
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
