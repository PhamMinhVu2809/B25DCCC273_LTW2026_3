import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  const [notice, setNotice] = useState({ text: '', version: 0 });

  const showNotice = useCallback((text) => {
    // version luôn tăng, kể cả khi nội dung thông báo mới giống hệt thông báo cũ.
    setNotice((current) => ({ text, version: current.version + 1 }));
  }, []);

  useEffect(() => {
    if (notice.version === 0) return undefined;
    const timer = setTimeout(() => {
      setNotice((current) => ({ ...current, text: '' }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [notice.version]);

  return (
    <NoticeContext.Provider value={showNotice}>
      {notice.text && (
        <div className="notice" role="status" aria-live="polite">
          <span className="notice-check">✓</span>
          {notice.text}
        </div>
      )}
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotice = () => {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error('useNotice phải được sử dụng bên trong NoticeProvider');
  }
  return context;
};
