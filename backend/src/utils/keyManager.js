import dotenv from 'dotenv';
dotenv.config();

class KeyManager {
    constructor() {
        this.keys = {
            GEMINI: this.loadKeys('GEMINI'),
            MURF: this.loadKeys('MURF')
        };
        this.counts = {
            GEMINI: 0,
            MURF: 0
        };
    }

    /**
     * Load keys from environment variables.
     * Supports:
     * 1. Comma separated: SERVICE_KEYS="k1,k2,k3"
     * 2. Indexed: SERVICE_KEY_1, SERVICE_KEY_2, ...
     * 3. Legacy: SERVICE_API_KEY
     */
    loadKeys(servicePrefix) {
        const keys = [];

        // 1. Check for CSV list
        const csvKeys = process.env[`${servicePrefix}_KEYS`];
        if (csvKeys) {
            keys.push(...csvKeys.split(',').map(k => k.trim()).filter(k => k));
        }

        // 2. Check for indexed keys (up to 10)
        for (let i = 1; i <= 10; i++) {
            const val = process.env[`${servicePrefix}_KEY_${i}`];
            if (val) keys.push(val);
        }

        // 3. Fallback to legacy single key if no multiple keys found
        if (keys.length === 0) {
            const legacy = process.env[`${servicePrefix}_API_KEY`];
            if (legacy) keys.push(legacy);
        }

        const uniqueKeys = [...new Set(keys)]; // Remove duplicates

        console.log(`[KeyManager] Loaded ${uniqueKeys.length} keys for ${servicePrefix}`);
        return uniqueKeys;
    }

    /**
     * Get the next key in Round Robin fashion
     */
    getNextKey(service) {
        const serviceKeys = this.keys[service];

        if (!serviceKeys || serviceKeys.length === 0) {
            console.error(`[KeyManager] No keys found for ${service}`);
            return null;
        }

        const index = this.counts[service] % serviceKeys.length;
        this.counts[service]++; // Increment counter

        const key = serviceKeys[index];
        // Log masked key for debugging
        console.log(`[KeyManager] Rotating ${service} Key: Using key #${index + 1} (${key.substring(0, 4)}...${key.substring(key.length - 4)})`);

        return key;
    }
}

// Singleton instance
const keyManager = new KeyManager();
export default keyManager;
