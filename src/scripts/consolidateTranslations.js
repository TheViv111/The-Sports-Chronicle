// Script to consolidate all translation files into one
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to translations directory
const translationsDir = path.join(__dirname, '../data/translations');

// Get all language files (files with language codes as names)
const languageFiles = fs.readdirSync(translationsDir)
  .filter(file => 
    file.match(/^[a-z]{2}\.json$/) && // Match language code files like en.json, fr.json
    fs.statSync(path.join(translationsDir, file)).isFile()
  );

// Get all section files (files that aren't language codes)
const sectionFiles = fs.readdirSync(translationsDir)
  .filter(file => 
    file.endsWith('.json') && 
    !file.match(/^[a-z]{2}\.json$/) && // Exclude language code files
    file !== 'consolidated.json' && // Exclude the output file
    file !== 'languages.json' && // Exclude language config
    fs.statSync(path.join(translationsDir, file)).isFile()
  );

// Initialize the consolidated translations object
const consolidated = {};

// Process each language file
languageFiles.forEach(langFile => {
  const langCode = langFile.replace('.json', '');
  const langData = JSON.parse(fs.readFileSync(path.join(translationsDir, langFile), 'utf8'));
  
  // Initialize language in consolidated object
  consolidated[langCode] = {};
  
  // Add all translations from the language file
  Object.keys(langData).forEach(key => {
    consolidated[langCode][key] = langData[key];
  });
});

// Process each section file for additional translations
sectionFiles.forEach(sectionFile => {
  const sectionData = JSON.parse(fs.readFileSync(path.join(translationsDir, sectionFile), 'utf8'));
  
  // For each language in the section file
  Object.keys(sectionData).forEach(langCode => {
    // Initialize language in consolidated object if it doesn't exist
    if (!consolidated[langCode]) {
      consolidated[langCode] = {};
    }
    
    // Add all translations from this section for this language
    Object.keys(sectionData[langCode]).forEach(key => {
      consolidated[langCode][key] = sectionData[langCode][key];
    });
  });
});

// Write the consolidated file
fs.writeFileSync(
  path.join(translationsDir, 'consolidated.json'),
  JSON.stringify(consolidated, null, 2)
);

// Translations consolidated successfully