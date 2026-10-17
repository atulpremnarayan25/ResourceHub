import { initialMockData } from '../data/mockData';

const DB_KEY = 'resourcehub_db_v3_clean';

/**
 * Get active database snapshot from localStorage or initialize with clean admin data.
 */
export const getDatabase = () => {
  try {
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
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      throw new Error('Browser local storage quota exceeded. Please clear some uploaded resources or switch to cloud storage.');
    }
    console.error('Failed to persist database to localStorage:', err);
    throw err;
  }
};

