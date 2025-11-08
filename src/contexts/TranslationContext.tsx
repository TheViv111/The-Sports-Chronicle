import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Error Boundary for translations
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Translation Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-600">Error loading translations. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

// Language configuration
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
};

export type LanguageCode = keyof typeof supportedLanguages;

interface TranslationContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  currentPath: string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('language');
    return (saved as LanguageCode) || 'en';
  });

  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    // Update document direction for RTL languages
    const direction = supportedLanguages[currentLanguage].direction;
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const loadTranslations = useCallback(async (language: LanguageCode) => {
    try {
      setIsLoading(true);
      
      // Direct import with type assertion
      try {
        const module = await import(
          /* @vite-ignore */
          `../data/translations/${language}.json`
        );
        setTranslations(module);
      } catch (error) {
        console.warn(`Failed to load translations for ${language}, falling back to English`, error);
        
        if (language !== 'en') {
          try {
            const fallbackModule = await import(
              /* @vite-ignore */
              '../data/translations/en.json'
            );
            setTranslations(fallbackModule);
          } catch (fallbackError) {
            console.error('Failed to load fallback English translations:', fallbackError);
            setTranslations({});
          }
        } else {
          setTranslations({});
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = (language: LanguageCode) => {
    if (language !== currentLanguage) {
      // Save current scroll position
      const scrollPosition = window.scrollY;
      
      // Update language
      setCurrentLanguage(language);
      localStorage.setItem('language', language);
      
      // Update the URL without causing a page reload
      const newUrl = `${window.location.pathname}?lang=${language}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
      
      // Restore scroll position after a small delay
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 0);
    }
  };

  const getTranslation = (key: string, fallback?: string): string => {
    // If translations are still loading, return the key as is
    if (isLoading) return key;
    
    // If no translations are loaded, return the fallback or key
    if (Object.keys(translations).length === 0) {
      return fallback || key;
    }

    // Try to get the translation
    try {
      const value = key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), translations);
      return value !== undefined ? value : (fallback || key);
    } catch (error) {
      console.warn(`Error accessing translation key '${key}':`, error);
      return fallback || key;
    }
  };

  const t = (key: string, fallback?: string): string => {
    return getTranslation(key, fallback);
  };

  const isRTL = supportedLanguages[currentLanguage].direction === 'rtl';

  // Update current path when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const value: TranslationContextType = {
    currentLanguage,
    setLanguage,
    t,
    isRTL,
    currentPath
  };

  // Show loading state while translations are being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TranslationContext.Provider value={value}>
        {children}
      </TranslationContext.Provider>
    </ErrorBoundary>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}