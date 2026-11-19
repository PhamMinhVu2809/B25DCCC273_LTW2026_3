import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [storedTheme, setStoredTheme] = useLocalStorage('ltw_sodiem_theme', 'light');
  const theme = storedTheme === 'dark' ? 'dark' : 'light';

  const toggleTheme = useCallback(() => {
    setStoredTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, [setStoredTheme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme phải được sử dụng bên trong ThemeProvider');
  }
  return context;
};
