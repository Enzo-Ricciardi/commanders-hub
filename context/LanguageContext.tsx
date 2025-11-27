import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'it' | 'fr' | 'es' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem('preferred_language');
    return (saved as Language) || 'en';
  });
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        console.log(`[LanguageContext] Loading translations for: ${language}`);
        // Use a relative path for fetch, which resolves correctly from the page's location.
        const response = await fetch(`/locales/${language}.json`);
        console.log(`[LanguageContext] Response status for ${language}:`, response.status);
        if (!response.ok) {
          throw new Error(`Failed to load translation file for ${language}`);
        }
        const data = await response.json();
        console.log(`[LanguageContext] Loaded ${Object.keys(data).length} translations for ${language}`);
        console.log(`[LanguageContext] Sample translations:`, {
          appTitle: data.appTitle,
          loginFrontier: data.loginFrontier,
          loginDescription: data.loginDescription
        });
        setTranslations(data);
      } catch (error) {
        console.error(`[LanguageContext] Error loading translation file for ${language}:`, error);
        // Fallback to empty object on error
        setTranslations({});
      }
    };

    fetchTranslations();
  }, [language]);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
