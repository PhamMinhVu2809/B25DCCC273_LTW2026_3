import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const showNotice = useCallback((text) => setMessage(text), []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <NoticeContext.Provider value={showNotice}>
      {message && <div className="notice-toast" role="status">♡ {message}</div>}
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotice = () => {
  const context = useContext(NoticeContext);
  if (!context) throw new Error('useNotice phải được dùng bên trong NoticeProvider');
  return context;
};
