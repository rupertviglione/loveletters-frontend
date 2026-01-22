import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ll-lang') || 'pt';
  });

  const toggleLanguage = () => {
    const newLang = language === 'pt' ? 'en' : 'pt';
    setLanguage(newLang);
    localStorage.setItem('ll-lang', newLang);
  };

  const t = (pt, en) => {
    return language === 'pt' ? pt : en;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};