/**
 * Utility functions for handling translations
 */

export const getTranslation = (translations: any, field: string, lang: string, fallback: string | null) => {
  if (!translations || typeof translations !== 'object') {
    return fallback;
  }

  // Try structure: translations[lang][field] (Supabase Edge Function format)
  const langFirst = translations?.[lang]?.[field];
  if (langFirst !== undefined && langFirst !== null) {
    return langFirst;
  }

  // Fallback: try structure translations[field][lang] (alternative format)
  const fieldFirst = translations?.[field]?.[lang];
  if (fieldFirst !== undefined && fieldFirst !== null) {
    return fieldFirst;
  }

  return fallback;
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
