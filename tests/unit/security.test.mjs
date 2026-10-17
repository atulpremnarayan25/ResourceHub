import assert from 'assert';
import {
  isSafeUrl,
  sanitizeFilename,
  hashPassword,
  validateFileHeader,
  ADMIN_PASSWORD_HASH
} from '../../src/utils/security.js';

console.log('🧪 Running Unit Tests: security.js');

// Test 1: isSafeUrl allowlisting & protocol checks
{
  // Trusted HTTPS hosts
  assert.strictEqual(isSafeUrl('https://docs.google.com/viewer?url=test'), true, 'docs.google.com should be allowed');
  assert.strictEqual(isSafeUrl('https://abcxyz.supabase.co/storage/v1/object/public/file.pdf'), true, 'supabase.co subdomain should be allowed');
  assert.strictEqual(isSafeUrl('https://localhost:5173/resource.pdf'), true, 'localhost should be allowed');
  assert.strictEqual(isSafeUrl('https://127.0.0.1:5173/resource.pdf'), true, '127.0.0.1 should be allowed');

  // Blob URLs
  assert.strictEqual(isSafeUrl('blob:http://localhost:5173/9384-2394'), true, 'blob URLs should be allowed');

  // Safe Data URLs
  assert.strictEqual(isSafeUrl('data:application/pdf;base64,JVBERi0xLjQK'), true, 'data:application/pdf should be allowed');
  assert.strictEqual(isSafeUrl('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBA'), true, 'safe data: DOCX should be allowed');

  // Dangerous / Untrusted hosts and protocols
  assert.strictEqual(isSafeUrl('https://evil-phishing.com/exploit.pdf'), false, 'Arbitrary domains must be rejected');
  assert.strictEqual(isSafeUrl('http://insecure-site.com/file.pdf'), false, 'Plain http must be rejected');
  assert.strictEqual(isSafeUrl('javascript:alert(document.cookie)'), false, 'javascript: scheme must be rejected');
  assert.strictEqual(isSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), false, 'data:text/html XSS vectors must be rejected');
  assert.strictEqual(isSafeUrl(null), false, 'Null URL should be rejected');
  assert.strictEqual(isSafeUrl(''), false, 'Empty URL should be rejected');

  console.log('  ✓ isSafeUrl enforces strict protocol & host boundaries');
}

// Test 2: sanitizeFilename path traversal & illegal character neutralization
{
  assert.strictEqual(sanitizeFilename('../../etc/passwd'), 'passwd', 'Path traversal dots and slashes must be neutralized');
  assert.strictEqual(sanitizeFilename('..\\..\\windows\\system32'), 'system32', 'Backslashes and path segments must be neutralized');
  assert.strictEqual(sanitizeFilename('lecture:notes*version?1<final>.pdf'), 'lecture_notes_version_1_final_.pdf', 'Reserved filesystem characters must be replaced');
  assert.strictEqual(sanitizeFilename('...hidden.doc'), 'hidden.doc', 'Leading dots must be stripped');
  assert.strictEqual(sanitizeFilename(''), 'document', 'Empty filename should fall back to document');
  assert.strictEqual(sanitizeFilename(null), 'document', 'Null filename should fall back to document');

  console.log('  ✓ sanitizeFilename prevents path traversal and cleans unsafe filenames');
}

// Test 3: hashPassword cryptographic integrity
async function testHashing() {
  const hash1 = await hashPassword('atul1234');
  assert.strictEqual(hash1, ADMIN_PASSWORD_HASH, 'hashPassword(atul1234) must match ADMIN_PASSWORD_HASH constant');

  const hash2 = await hashPassword('  atul1234  ');
  assert.strictEqual(hash2, ADMIN_PASSWORD_HASH, 'hashPassword must trim whitespace before hashing');

  const hashEmpty = await hashPassword('');
  assert.strictEqual(hashEmpty, '', 'Empty password should return empty string');

  const hashNull = await hashPassword(null);
  assert.strictEqual(hashNull, '', 'Null password should return empty string');

  console.log('  ✓ hashPassword produces deterministic SHA-256 hashes matching admin credentials');
}

// Test 4: validateFileHeader magic bytes detection
async function testFileHeaders() {
  // Mock file object generator with slice() and arrayBuffer()
  const createMockFile = (bytes) => ({
    slice: () => ({
      arrayBuffer: async () => new Uint8Array(bytes).buffer
    })
  });

  // PDF Magic Bytes: %PDF (0x25 0x50 0x44 0x46)
  const pdfFile = createMockFile([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
  const pdfResult = await validateFileHeader(pdfFile);
  assert.strictEqual(pdfResult.valid, true);
  assert.strictEqual(pdfResult.type, 'PDF');

  // OOXML / ZIP Magic Bytes: PK\x03\x04 (0x50 0x4B 0x03 0x04)
  const ooxmlFile = createMockFile([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
  const ooxmlResult = await validateFileHeader(ooxmlFile);
  assert.strictEqual(ooxmlResult.valid, true);
  assert.strictEqual(ooxmlResult.type, 'OOXML');

  // Legacy OLE Magic Bytes: D0 CF 11 E0 A1 B1 1A E1
  const oleFile = createMockFile([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
  const oleResult = await validateFileHeader(oleFile);
  assert.strictEqual(oleResult.valid, true);
  assert.strictEqual(oleResult.type, 'OLE');

  // Spoofed file: HTML content renamed to .pdf (<html...)
  const fakePdf = createMockFile([0x3C, 0x21, 0x44, 0x4F, 0x43, 0x54, 0x59, 0x50]);
  const fakeResult = await validateFileHeader(fakePdf);
  assert.strictEqual(fakeResult.valid, false, 'Spoofed file without valid magic bytes must be rejected');

  console.log('  ✓ validateFileHeader accurately identifies PDF, OOXML, and OLE signatures');
}

async function runAll() {
  await testHashing();
  await testFileHeaders();
  console.log('🎉 All security.js unit tests passed successfully!\n');
}

runAll().catch((err) => {
  console.error('❌ Unit Test Failure:', err);
  process.exit(1);
});
