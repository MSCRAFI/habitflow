import { useState, useEffect } from 'react';

/**
 * Persist simple state to localStorage with a stable API.
 * Example:
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export default function useLocalStorage(key, initialValue) {
  const read = () => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [state, setState] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write errors in private mode
    }
  }, [key, state]);

  return [state, setState];
}
