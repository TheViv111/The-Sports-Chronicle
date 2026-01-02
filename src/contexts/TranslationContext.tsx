import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

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
  let langData: Record<string, string> = {};

  // 1. Load per-language file
  try {
    const langUrl = `/translations/${lang}.json`;
    const langResp = await fetch(langUrl);

    if (langResp.ok) {
      const ct = langResp.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        langData = await langResp.json();
      } else {
        console.warn(`Non-JSON response for translations '${lang}' at ${langUrl}`);
      }
    } else {
      console.warn(`Failed to load translations from: ${langUrl} (status ${langResp.status})`);
    }
  } catch (e) {
    console.warn(`Error loading language file for ${lang}:`, e);
    // Continue with empty langData
  }

  // 2. Load consolidated translations
  let consolidatedData: Record<string, Record<string, string>> = {};
  try {
    const consolidatedUrl = `/translations/consolidated.json`;
    const consResp = await fetch(consolidatedUrl);
    if (consResp.ok) {
      consolidatedData = await consResp.json();
    }
  } catch (e) {
    console.warn('Error loading consolidated translations:', e);
  }

  try {
    const overlay = consolidatedData[lang] || {};
    const merged = { ...overlay, ...langData };
    console.log(`Loaded ${Object.keys(merged).length} translations for ${lang} (merged with consolidated)`);
    return merged;
  } catch (error) {
    console.error(`Error merging translations for ${lang}:`, error);
    return {};
  }
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      const savedLang = localStorage.getItem('preferredLanguage') as LanguageCode;
      const langToLoad = savedLang && supportedLanguages[savedLang] ? savedLang : DEFAULT_LANGUAGE;

      setIsLoading(true);
      try {
        const data = await loadTranslations(langToLoad);
        setTranslations(data);
        setCurrentLanguage(langToLoad);
      } catch (error) {
        console.error('Error loading initial translations:', error);
        // Fallback to empty or default if needed
      } finally {
        setIsLoading(false);
      }
    };

    loadInitial();
  }, []);

  // Translation function
  const t = (key: string, fallback: string = key): string => {
    // During initial load, we might want to return fallback or nothing
    // But during language switch, we want to keep showing old translations until new ones are ready
    // so we don't check isLoading here for the switch case
    const translation = translations[key];

    if (translation === undefined) {
      // Only warn if we're not in the very first loading state
      if (!isLoading) {
        console.warn(`Translation key not found: ${key}`);
      }
      return fallback;
    }

    return translation || fallback;
  };

  // Set language function with pre-fetching
  const setLanguage = async (lang: LanguageCode) => {
    if (lang === currentLanguage) return;

    // Don't set isLoading(true) here to avoid flashing raw keys
    // We keep displaying the old language until the new one is ready

    try {
      const data = await loadTranslations(lang);

      // Update state atomically
      setTranslations(data);
      setCurrentLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
    } catch (error) {
      console.error(`Error switching to language ${lang}:`, error);
      // If error, we just stay on the current language
    }
  };

  // Show loading screen during initial translation load to prevent translation keys from flashing
  if (isLoading) {
    return <LoadingScreen message="Initializing translations..." />;
  }

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
