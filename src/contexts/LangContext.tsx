import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lang, t } from '@/lib/translations';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  T: typeof t['en'];
  isRTL: boolean;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('ztube_lang') as Lang) || 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('ztube_lang', l);
  };

  const T = t[lang];

  useEffect(() => {
    document.documentElement.dir = T.dir;
    document.documentElement.lang = lang;
  }, [lang, T.dir]);

  return (
    <LangContext.Provider value={{ lang, setLang, T, isRTL: lang === 'ar' }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
