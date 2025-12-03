import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const translationsDir = path.resolve(__dirname, '../src/data/translations');
const files = fs.readdirSync(translationsDir).filter(file => file.endsWith('.json') && file !== 'consolidated.json');

const enFilePath = path.join(translationsDir, 'en.json');
const enContent = fs.readFileSync(enFilePath, 'utf-8');
const enKeys = Object.keys(JSON.parse(enContent));

const missingKeys = {};

files.forEach(file => {
  if (file === 'en.json') return;

  const filePath = path.join(translationsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const translations = JSON.parse(content);
  const keys = Object.keys(translations);
  const fileMissingKeys = enKeys.filter(key => !keys.includes(key));

  if (fileMissingKeys.length > 0) {
    missingKeys[file] = fileMissingKeys;
  }
});

console.log('Missing Keys Report:');
console.log(JSON.stringify(missingKeys, null, 2));
