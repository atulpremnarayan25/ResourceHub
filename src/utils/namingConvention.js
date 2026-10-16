/**
 * Generate formatted stored filename following the academic convention:
 * <username>_<YYYYMMDD>_<HHMM>_<resource-slug>.<extension>
 * Example: atul_20261016_1530_react-hooks.pdf
 */
export const generateStoredFilename = (username, title, extension, timestamp = new Date()) => {
  const cleanUser = (username || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');

  const dateObj = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${dateObj.getFullYear()}${pad(dateObj.getMonth() + 1)}${pad(dateObj.getDate())}`;
  const timeStr = `${pad(dateObj.getHours())}${pad(dateObj.getMinutes())}`;

  const slug = (title || 'untitled')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  const cleanExt = (extension || 'pdf').toLowerCase().replace(/^\./, '');

  return `${cleanUser}_${dateStr}_${timeStr}_${slug}.${cleanExt}`;
};

/**
 * Format a human-readable upload timestamp.
 */
export const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Converts a raw filename into a title-cased readable resource title.
 * Example: 'cloud_infra_intro.pdf' -> 'Cloud Infra Intro'
 */
export const formatTitleFromFilename = (filename) => {
  if (!filename) return '';
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  return nameWithoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

