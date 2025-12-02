import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export const supportedLanguages = {
  // European Languages
  en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', direction: 'ltr' },
  de: { name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
  pt: { name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
  ru: { name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
  pl: { name: 'Polish', nativeName: 'Polski', direction: 'ltr' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr' },
  sv: { name: 'Swedish', nativeName: 'Svenska', direction: 'ltr' },
  no: { name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr' },
  da: { name: 'Danish', nativeName: 'Dansk', direction: 'ltr' },
  fi: { name: 'Finnish', nativeName: 'Suomi', direction: 'ltr' },
  
  // East Asian Languages
  zh: { name: 'Chinese (Simplified)', nativeName: '中文 (简体)', direction: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  ko: { name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  
  // South Asian Languages
  hi: { name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr' },
  mr: { name: 'Marathi', nativeName: 'मराठी', direction: 'ltr' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr' },
  
  // Middle Eastern Languages
  ar: { name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  he: { name: 'Hebrew', nativeName: 'עברית', direction: 'rtl' },
  fa: { name: 'Persian', nativeName: 'فارسی', direction: 'rtl' },
  
  // Other Languages
  tr: { name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr' },
  th: { name: 'Thai', nativeName: 'ไทย', direction: 'ltr' }
} as const;

export type LanguageCode = keyof typeof supportedLanguages;

type TranslationContextType = {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const DEFAULT_LANGUAGE = 'en';

async function loadTranslations(lang: string) {
  try {
    const url = `translations/${lang}.json`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to load translations from: ${url}`);
      throw new Error(`Failed to load translations for ${lang} (status ${response.status}) at ${url}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const preview = await response.text();
      throw new SyntaxError(`Unexpected content-type '${contentType}' at ${url}. First chars: ${preview.slice(0, 60)}`);
    }

    const data = await response.json();
    console.log(`Loaded ${Object.keys(data).length} translations for ${lang}`);
    return data;
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    return {};
  }
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when the language changes
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await loadTranslations(currentLanguage);
        setTranslations(data);
      } catch (error) {
        console.error('Error loading translations:', error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [currentLanguage]);

  // Translation function
  const t = (key: string, fallback: string = key): string => {
    if (isLoading) return fallback;
    const translation = translations[key];
    
    if (translation === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return fallback;
    }
    
    return translation || fallback;
  };

  // Set language function
  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  return (
    <TranslationContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        isLoading,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
