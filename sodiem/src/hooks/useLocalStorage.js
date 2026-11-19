import { useEffect, useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch (error) {
      console.warn(`Không thể đọc ${key} từ localStorage:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Không thể lưu ${key} vào localStorage:`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
