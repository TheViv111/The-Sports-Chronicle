import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const translationsPath = join(__dirname, '../src/data/translations.txt');
const outputDir = join(__dirname, '../public/locales');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Read the translations file
console.log('Reading translations file...');
const content = fs.readFileSync(translationsPath, 'utf-8');

// Parse the translations file
function parseTranslations(content) {
  const result = {};
  
  // Extract all language groups (eastAsianLanguages, europeanLanguages, etc.)
  const languageGroups = content.match(/export const \w+ = \{([\s\S]*?)\};/g) || [];
  
  languageGroups.forEach(group => {
    // Extract language code and its content
    const langMatches = group.match(/([a-z]{2}):\s*\{([\s\S]*?)(?=},?\s*\w+:?|\s*\})/g);
    
    if (langMatches) {
      langMatches.forEach(langMatch => {
        const [langCode, ...rest] = langMatch.split(':');
        const cleanLangCode = langCode.trim();
        const langContent = rest.join(':');
        
        if (!result[cleanLangCode]) {
          result[cleanLangCode] = {};
        }
        
        // Extract key-value pairs, handling both single and double quotes
        const entries = langContent.match(/(?:'|")([^'"]+)(?:'|")\s*:\s*(?:'|")([^'"]*)(?:'|")(?=,|\s*\})/g) || [];
        
        entries.forEach(entry => {
          try {
            // Clean up the entry and parse it
            const cleanEntry = entry
              .replace(/([^\\])'/g, '$1"')  // Replace single quotes with double quotes
              .replace(/\\'/g, "'");         // Handle escaped quotes
              
            const [key, value] = cleanEntry.split(/:\s*"|"\s*:"|"\s*,\s*"/).filter(Boolean);
            if (key && value !== undefined) {
              // Remove single quotes from the key if present
              const cleanKey = key.replace(/^['"]|['"]$/g, '');
              result[cleanLangCode][cleanKey] = value.replace(/^['"]|['"]$/g, '');
            }
          } catch (e) {
            console.warn(`Failed to parse entry: ${entry}`, e);
          }
        });
      });
    }
  });
  
  return result;
}

// Generate the language files
function generateLanguageFiles() {
  try {
    console.log('Parsing translations...');
    const translations = parseTranslations(content);
    
    console.log(`\nFound ${Object.keys(translations).length} languages:`);
    console.log(Object.keys(translations).join(', '));
    
    // Write each language to a separate file
    Object.entries(translations).forEach(([langCode, data]) => {
      const filePath = join(outputDir, `${langCode}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Generated: ${filePath} (${Object.keys(data).length} translations)`);
    });
    
    console.log('\n🎉 Successfully generated all language files!');
    console.log(`Location: ${outputDir}`);
  } catch (error) {
    console.error('❌ Error generating language files:', error);
    process.exit(1);
  }
}

// Run the script
generateLanguageFiles();
