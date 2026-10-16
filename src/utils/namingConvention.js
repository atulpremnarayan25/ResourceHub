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

  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;

  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const timeStr = `${hh}${min}`;

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
