import assert from 'assert';
import {
  generateStoredFilename,
  formatTimestamp,
  formatTitleFromFilename
} from '../../src/utils/namingConvention.js';

console.log('🧪 Running Unit Tests: namingConvention.js');

// Test 1: generateStoredFilename convention structure
{
  const fixedDate = new Date(2026, 9, 17, 14, 30); // 2026-10-17 14:30
  const result = generateStoredFilename('atul', 'React Hooks Deep Dive', 'pdf', fixedDate);
  assert.strictEqual(
    result,
    'atul_20261017_1430_react-hooks-deep-dive.pdf',
    'Generated stored filename must match academic format convention'
  );
  console.log('  ✓ generateStoredFilename generates correct academic format');
}

// Test 2: generateStoredFilename sanitization of special characters & extension
{
  const fixedDate = new Date(2026, 0, 5, 9, 5); // 2026-01-05 09:05 (zero padding)
  const result = generateStoredFilename('Prof. Sharma#1!', '---Special & Cool Title---', '.DOCX', fixedDate);
  assert.strictEqual(
    result,
    'profsharma1_20260105_0905_special-cool-title.docx',
    'Special characters should be stripped and padded cleanly'
  );
  console.log('  ✓ generateStoredFilename sanitizes special characters and normalizes extensions');
}

// Test 3: generateStoredFilename fallback handling
{
  const result = generateStoredFilename(null, null, null);
  assert(result.startsWith('user_'), 'Null username should fall back to user');
  assert(result.endsWith('_untitled.pdf'), 'Null title and extension should fall back to untitled.pdf');
  console.log('  ✓ generateStoredFilename handles null inputs with safe fallbacks');
}

// Test 4: formatTitleFromFilename
{
  assert.strictEqual(formatTitleFromFilename('advanced_database_systems.pdf'), 'Advanced Database Systems');
  assert.strictEqual(formatTitleFromFilename('cloud-native-devops.docx'), 'Cloud Native Devops');
  assert.strictEqual(formatTitleFromFilename('notes_cs303'), 'Notes Cs303');
  assert.strictEqual(formatTitleFromFilename(''), '');
  assert.strictEqual(formatTitleFromFilename(null), '');
  console.log('  ✓ formatTitleFromFilename formats readable titles from filenames');
}

// Test 5: formatTimestamp
{
  const formatted = formatTimestamp('2026-10-17T14:30:00.000Z');
  assert(typeof formatted === 'string' && formatted.length > 0, 'Formatted timestamp must be a non-empty string');
  assert.strictEqual(formatTimestamp(''), '', 'Empty ISO string should return empty string');
  assert.strictEqual(formatTimestamp(null), '', 'Null ISO string should return empty string');
  console.log('  ✓ formatTimestamp formats ISO timestamps cleanly');
}

console.log('🎉 All namingConvention.js unit tests passed successfully!\n');
