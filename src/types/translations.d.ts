// Type definitions for JSON modules
declare module '*.json' {
  const value: Record<string, any>;
  export default value;
}



// Type for the translations object
type TranslationObject = {
  [key: string]: string | TranslationObject;
};

declare global {
  // Augment the Window interface to include any global variables you might add
  interface Window {
    __TRANSLATIONS_LOADED__?: boolean;
  }
}
