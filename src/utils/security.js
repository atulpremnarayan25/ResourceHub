/**
 * Validates that a given URL uses safe web schemes (https: or blob:)
 * and originates from trusted resource hosts (Google Docs Viewer, Supabase Storage, or local origin).
 * Guards against DOM XSS vectors, phishing, and unrestricted iframe embedding.
 */
export const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const base = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://localhost';
    const parsed = new URL(url, base);
    if (parsed.protocol === 'blob:') return true;
    if (parsed.protocol === 'data:') {
      const safeDataPrefixes = [
        'data:application/pdf',
        'data:application/vnd.openxmlformats-officedocument',
        'data:application/msword',
        'data:application/vnd.ms-powerpoint'
      ];
      return safeDataPrefixes.some((prefix) => url.startsWith(prefix));
    }
    if (parsed.protocol === 'https:') {
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === 'docs.google.com' ||
        hostname.endsWith('.supabase.co') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        (typeof window !== 'undefined' && window.location && hostname === window.location.hostname)
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Sanitizes a filename to prevent path traversal and strip illegal characters.
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return 'document';
  // Strip any leading directory path components first
  const basename = filename.split(/[/\\]/).pop() || '';
  return (
    basename
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/^\.+/, '')
      .replace(/\.{2,}/g, '.')
      .trim() || 'document'
  );
};

/**
 * Safely triggers download of an asset via binary blob or client-side anchor element.
 * Resolves cross-origin storage URLs to native blob objects to guarantee file download
 * rather than in-tab browser navigation.
 */
export const downloadFile = async (url, filename) => {
  if (!isSafeUrl(url)) {
    console.warn('Blocked download of untrusted URL:', url);
    return;
  }

  const safeName = sanitizeFilename(filename);

  // If cross-origin HTTPS URL, fetch as blob to enforce native browser download dialog
  if (typeof url === 'string' && url.startsWith('https://')) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = safeName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      }
    } catch (e) {
      console.warn('Cross-origin blob fetch failed, falling back to direct anchor download:', e);
    }
  }

  // Same-origin, blob:, data:, or fallback
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Inspects binary magic bytes of an uploaded file to verify file integrity.
 * Prevents disguised files (e.g., HTML/EXE renamed to .pdf) from executing.
 */
export const validateFileHeader = async (file) => {
  if (!file || typeof file.slice !== 'function') {
    return { valid: false, reason: 'Invalid file reference.' };
  }
  try {
    const slice = file.slice(0, 8);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { valid: true, type: 'PDF' };
    }

    // DOCX / PPTX / Office Open XML (ZIP container): PK\x03\x04 (0x50 0x4B 0x03 0x04)
    if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
      return { valid: true, type: 'OOXML' };
    }

    // Legacy DOC / PPT / OLE Compound Document: D0 CF 11 E0 A1 B1 1A E1
    if (
      bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0 &&
      bytes[4] === 0xA1 && bytes[5] === 0xB1 && bytes[6] === 0x1A && bytes[7] === 0xE1
    ) {
      return { valid: true, type: 'OLE' };
    }

    return { valid: false, reason: 'File content does not match genuine PDF, Word, or PowerPoint binary signatures.' };
  } catch {
    return { valid: false, reason: 'Unable to inspect file binary header.' };
  }
};

/**
 * Computes SHA-256 cryptographic hash of a given string using the Web Crypto API.
 * Compatible with modern browsers and Node.js.
 *
 * @param {string} text - Plaintext string to hash
 * @returns {Promise<string>} Hexadecimal SHA-256 hash string
 */
export const hashPassword = async (text) => {
  if (typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const cryptoObj = typeof crypto !== 'undefined' && crypto.subtle
    ? crypto
    : (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle ? globalThis.crypto : null);

  if (cryptoObj && cryptoObj.subtle) {
    const encoded = new TextEncoder().encode(trimmed);
    const buffer = await cryptoObj.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  throw new Error('Cryptographic hashing engine (crypto.subtle) is unavailable in this environment.');
};

// SHA-256 hash of authorized administrator password
export const ADMIN_PASSWORD_HASH = '1f3d10477ff4b02ceeb0e3b177e52d338319db885cbb1d6402a39043a6023483';
