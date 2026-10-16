import { initialMockData } from '../data/mockData';

const DB_KEY = 'resourcehub_db_v3_clean';

/**
 * Get active database snapshot from localStorage or initialize with clean admin data.
 */
export const getDatabase = () => {
  try {
    // Clean up any legacy mockup databases from localStorage
    if (localStorage.getItem('resourcehub_db_v1') || localStorage.getItem('resourcehub_db_v2')) {
      localStorage.removeItem('resourcehub_db_v1');
      localStorage.removeItem('resourcehub_db_v2');
      localStorage.removeItem('resourcehub_active_user');
      localStorage.setItem(DB_KEY, JSON.stringify(initialMockData));
      return initialMockData;
    }

    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialMockData));
      return initialMockData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read database from localStorage:', err);
    return initialMockData;
  }
};

/**
 * Persist database snapshot to localStorage.
 */
export const saveDatabase = (db) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to persist database to localStorage:', err);
  }
};

/**
 * Reset database to clean initial state with only admin account.
 */
export const resetDatabase = () => {
  try {
    localStorage.removeItem('resourcehub_db_v1');
    localStorage.removeItem('resourcehub_db_v2');
    localStorage.removeItem('resourcehub_active_user');
    localStorage.setItem(DB_KEY, JSON.stringify(initialMockData));
  } catch (err) {
    console.error('Failed to reset database:', err);
  }
};
