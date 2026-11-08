'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, translations, TranslationDictionary } from './dictionary';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  isTelugu: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
  isTelugu: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    // Read user saved preference from localStorage
    const saved = localStorage.getItem('safeguard_lang') as SupportedLanguage | null;
    if (saved && (saved === 'en' || saved === 'te')) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('safeguard_lang', lang);
    document.documentElement.lang = lang;
  };

  const isTelugu = language === 'te';
  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTelugu }}>
      <div className={isTelugu ? 'font-telugu' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

