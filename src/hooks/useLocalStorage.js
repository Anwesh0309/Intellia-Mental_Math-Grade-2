import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Get stored value or use initial
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Standard session timeout check (24 hours = 86,400,000 ms)
        if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 86400000) {
          return parsed.value;
        } else {
          window.localStorage.removeItem(key);
        }
      }
      return initialValue;
    } catch (error) {
      console.error("localStorage get error:", error);
      return initialValue;
    }
  });

  // Persist to localStorage on change
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      const dataToSave = {
        value: valueToStore,
        timestamp: Date.now()
      };
      window.localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("localStorage set error:", error);
    }
  };

  return [storedValue, setValue];
}
