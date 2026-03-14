import crypto from 'crypto';

// ENCRYPTION_KEY must be a securely generated 32-byte (256-bit) base64 or hex string
// If not set, we'll fall back to plain text for local dev, but warn loudly.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : null;

if (process.env.NODE_ENV === 'production' && !ENCRYPTION_KEY) {
    throw new Error('CRITICAL SECURITY ERROR: ENCRYPTION_KEY environment variable is missing.');
}

const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error("Missing ENCRYPTION_KEY");
        }
        return text;
    }

    try {
        const iv = crypto.randomBytes(12); // GCM standard IV length is 12 bytes
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag();

        // Format: base64(iv):base64(authTag):base64(encryptedText)
        return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
    } catch (err) {
        console.error('Encryption failed:', err);
        return text; // Fallback to plain text on error so we don't lose data
    }
}

export function decrypt(encryptedData: string): string {
    if (!ENCRYPTION_KEY) return encryptedData; // Fallback if no key is set

    // If the data doesn't match our format, it might be legacy unencrypted data
    if (!encryptedData.includes(':')) return encryptedData;

    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) return encryptedData;

        const [ivString, authTagString, encryptedText] = parts;
        const iv = Buffer.from(ivString, 'base64');
        const authTag = Buffer.from(authTagString, 'base64');

        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.error('Decryption failed:', err);
        // If decryption fails (e.g. wrong key), return the raw string rather than crashing
        return encryptedData;
    }
}

// ==========================================
// API Key Secure Hashing (Scrypt + Salt)
// ==========================================

export async function hashApiKey(key: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
        crypto.scrypt(key, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

export async function verifyApiKey(key: string, hash: string): Promise<boolean> {
    const parts = hash.split(':');
    if (parts.length !== 2) return false;
    const [salt, keyHash] = parts;

    return new Promise((resolve, reject) => {
        crypto.scrypt(key, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            const derivedKeyHex = derivedKey.toString('hex');
            if (derivedKeyHex.length !== keyHash.length) return resolve(false);
            resolve(crypto.timingSafeEqual(Buffer.from(derivedKeyHex), Buffer.from(keyHash)));
        });
    });
}
