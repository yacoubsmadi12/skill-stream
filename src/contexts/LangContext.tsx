import React, { createContext, useContext, useEffect } from 'react';
import { t } from '@/lib/translations';

interface LangContextType {
  lang: 'en';
  setLang: (l: 'en') => void;
  T: typeof t['en'];
  isRTL: false;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  return (
    <LangContext.Provider value={{ lang: 'en', setLang: () => {}, T: t['en'], isRTL: false }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
