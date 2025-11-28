/**
 * Safe localStorage wrapper that handles tracking prevention and storage blocking
 */

class StorageService {
    private memoryStorage: Map<string, string> = new Map();
    private isLocalStorageAvailable: boolean;

    constructor() {
        this.isLocalStorageAvailable = this.checkLocalStorage();
    }

    private checkLocalStorage(): boolean {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage is not available, using memory storage fallback', e);
            return false;
        }
    }

    setItem(key: string, value: string): void {
        try {
            if (this.isLocalStorageAvailable) {
                localStorage.setItem(key, value);
            } else {
                this.memoryStorage.set(key, value);
            }
        } catch (e) {
            console.error('Failed to save to storage:', e);
            // Fallback to memory storage
            this.memoryStorage.set(key, value);
        }
    }

    getItem(key: string): string | null {
        try {
            if (this.isLocalStorageAvailable) {
                return localStorage.getItem(key);
            } else {
                return this.memoryStorage.get(key) || null;
            }
        } catch (e) {
            console.error('Failed to read from storage:', e);
            return this.memoryStorage.get(key) || null;
        }
    }

    removeItem(key: string): void {
        try {
            if (this.isLocalStorageAvailable) {
                localStorage.removeItem(key);
            }
            this.memoryStorage.delete(key);
        } catch (e) {
            console.error('Failed to remove from storage:', e);
            this.memoryStorage.delete(key);
        }
    }

    clear(): void {
        try {
            if (this.isLocalStorageAvailable) {
                localStorage.clear();
            }
            this.memoryStorage.clear();
        } catch (e) {
            console.error('Failed to clear storage:', e);
            this.memoryStorage.clear();
        }
    }
}

export const storage = new StorageService();
