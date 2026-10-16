/**
 * Validates that a given URL uses safe web schemes (https: or blob:)
 * Guards against DOM XSS vectors like javascript: and data: URIs.
 */
export const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const base = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://localhost';
    const parsed = new URL(url, base);
    return parsed.protocol === 'https:' || parsed.protocol === 'blob:';
  } catch {
    return false;
  }
};

/**
 * Sanitizes a filename to prevent path traversal and strip illegal characters.
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return 'document';
  return (
    filename
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/^\.+/, '')
      .trim() || 'document'
  );
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

    // PPTX / Office Open XML (ZIP container): PK\x03\x04 (0x50 0x4B 0x03 0x04)
    if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
      return { valid: true, type: 'PPTX' };
    }

    // Legacy PPT / OLE Compound Document: D0 CF 11 E0 A1 B1 1A E1
    if (
      bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0 &&
      bytes[4] === 0xA1 && bytes[5] === 0xB1 && bytes[6] === 0x1A && bytes[7] === 0xE1
    ) {
      return { valid: true, type: 'PPT' };
    }

    return { valid: false, reason: 'File content does not match genuine PDF or PowerPoint binary signatures.' };
  } catch {
    return { valid: false, reason: 'Unable to inspect file binary header.' };
  }
};
