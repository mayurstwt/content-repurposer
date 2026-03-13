import crypto from 'crypto';

// ENCRYPTION_KEY must be a securely generated 32-byte (256-bit) base64 or hex string
// If not set, we'll fall back to plain text for local dev, but warn loudly.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : null;

const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) return text; // Fallback if no key is set

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
