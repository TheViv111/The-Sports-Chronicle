// scripts/update_translations_all.js
const fs = require('fs');
const path = require('path');

const translationsDir = path.resolve(__dirname, '../src/data/translations');
const missingKeys = {
    "comments.signInRequired": "Sign in to post a comment.",
    "comments.errorLoading": "Error loading comments. Please try again.",
    "common.posting": "Posting..."
};

fs.readdirSync(translationsDir).forEach(file => {
    if (!file.endsWith('.json')) return;
    const filePath = path.join(translationsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = false;
    for (const [key, value] of Object.entries(missingKeys)) {
        if (!(key in content)) {
            content[key] = value;
            updated = true;
        }
    }
    if (updated) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
        console.log(`Updated ${file}`);
    }
});
