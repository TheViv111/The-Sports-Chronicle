/**
 * Utility functions for handling translations
 */

export const getTranslation = (translations: any, field: string, lang: string, fallback: string | null) => {
  if (!translations || typeof translations !== 'object') return fallback;
  
  // Handle different possible translation structures
  if (translations[field]?.[lang]) {
    return translations[field][lang];
  }
  
  // Fallback to direct field access
  return translations[field] || fallback;
};

export const getTranslationWithEnglishFallback = (translations: any, field: string, lang: string, fallback: string | null) => {
  // Try to get translation in the requested language
  const translation = getTranslation(translations, field, lang, null);
  if (translation) return translation;
  
  // Fallback to English if available
  const englishTranslation = getTranslation(translations, field, 'en', null);
  if (englishTranslation) return englishTranslation;
  
  // Final fallback to the original content
  return fallback;
};
