import { useEffect, useState } from 'react';

/**
 * Debounce a changing value. Useful for typeahead and API queries.
 * Example:
 *   const debouncedQuery = useDebounce(query, 300);
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
