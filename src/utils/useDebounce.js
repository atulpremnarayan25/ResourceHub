import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapidly changing values (e.g. search input).
 *
 * @param {*} value - The input value to debounce
 * @param {number} delayMs - Debounce latency in milliseconds (default: 300)
 * @returns {*} The debounced value
 */
export const useDebounce = (value, delayMs = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
};
