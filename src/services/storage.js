import { initialMockData } from '../data/mockData';

const DB_KEY = 'resourcehub_db_v1';

/**
 * Get active database snapshot from localStorage or initialize with seed data.
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
    console.error('Failed to persist database to localStorage:', err);
  }
};

/**
 * Reset database to initial seed data.
 */
export const resetDatabase = () => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(initialMockData));
    localStorage.removeItem('resourcehub_active_user');
  } catch (err) {
    console.error('Failed to reset database:', err);
  }
};
