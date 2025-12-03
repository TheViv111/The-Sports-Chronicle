#!/usr/bin/env node

/**
 * Translation Analysis Tool
 * Compares all language translation files against the English reference
 * and identifies missing translation keys
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, 'src', 'data', 'translations');
const OUTPUT_FILE = path.join(__dirname, 'translation-analysis.json');
const OUTPUT_TXT = path.join(__dirname, 'translation-analysis.txt');

// Get all keys from a nested object
function getAllKeys(obj, prefix = '') {
    const keys = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            keys.push(...getAllKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

// Main analysis function
function analyzeTranslations() {
    console.log('🔍 Starting translation analysis...\n');

    // Read English reference file
    const enPath = path.join(TRANSLATIONS_DIR, 'en.json');
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const enKeys = getAllKeys(enContent).sort();

    console.log(`📚 English reference has ${enKeys.length} keys\n`);

    // Get all translation files
    const files = fs.readdirSync(TRANSLATIONS_DIR)
        .filter(f => f.endsWith('.json') && f !== 'en.json' && f !== 'consolidated.json' && f !== 'about.json');

    const results = {};
    const summary = [];

    // Analyze each language file
    for (const file of files) {
        const langCode = file.replace('.json', '');
        const filePath = path.join(TRANSLATIONS_DIR, file);

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const langKeys = getAllKeys(content).sort();

            const missingKeys = enKeys.filter(key => !langKeys.includes(key));
            const extraKeys = langKeys.filter(key => !enKeys.includes(key));

            results[langCode] = {
                totalKeys: langKeys.length,
                expectedKeys: enKeys.length,
                missingKeys: missingKeys,
                missingCount: missingKeys.length,
                extraKeys: extraKeys,
                extraCount: extraKeys.length,
                completionPercentage: ((langKeys.length / enKeys.length) * 100).toFixed(2)
            };

            const status = missingKeys.length === 0 ? '✅' : '❌';
            console.log(`${status} ${langCode}: ${langKeys.length}/${enKeys.length} keys (${results[langCode].completionPercentage}%)`);

            summary.push({
                language: langCode,
                status: missingKeys.length === 0 ? 'Complete' : `Missing ${missingKeys.length} keys`,
                completion: results[langCode].completionPercentage + '%'
            });

        } catch (error) {
            console.error(`❌ Error processing ${langCode}:`, error.message);
            results[langCode] = { error: error.message };
        }
    }

    // Write JSON output
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n✅ Detailed results saved to: ${OUTPUT_FILE}`);

    // Write human-readable text output
    let textOutput = '=== TRANSLATION ANALYSIS REPORT ===\n';
    textOutput += `Generated: ${new Date().toISOString()}\n\n`;
    textOutput += `English Reference: ${enKeys.length} keys\n\n`;

    textOutput += '=== SUMMARY ===\n';
    for (const lang of Object.keys(results).sort()) {
        if (results[lang].error) {
            textOutput += `${lang}: ERROR - ${results[lang].error}\n`;
        } else {
            const status = results[lang].missingCount === 0 ? '✓ Complete' : `✗ Missing ${results[lang].missingCount} keys`;
            textOutput += `${lang}: ${status} (${results[lang].completionPercentage}% complete)\n`;
        }
    }

    textOutput += '\n=== DETAILED ANALYSIS ===\n\n';

    for (const lang of Object.keys(results).sort()) {
        if (results[lang].error) continue;

        textOutput += `--- ${lang.toUpperCase()} ---\n`;
        textOutput += `Total keys: ${results[lang].totalKeys}\n`;
        textOutput += `Expected keys: ${results[lang].expectedKeys}\n`;
        textOutput += `Missing keys: ${results[lang].missingCount}\n`;
        textOutput += `Extra keys: ${results[lang].extraCount}\n`;
        textOutput += `Completion: ${results[lang].completionPercentage}%\n`;

        if (results[lang].missingCount > 0) {
            textOutput += '\nMissing translation keys:\n';
            results[lang].missingKeys.forEach(key => {
                textOutput += `  - ${key}\n`;
            });
        }

        if (results[lang].extraCount > 0) {
            textOutput += '\nExtra keys (not in English):\n';
            results[lang].extraKeys.forEach(key => {
                textOutput += `  + ${key}\n`;
            });
        }

        textOutput += '\n';
    }

    fs.writeFileSync(OUTPUT_TXT, textOutput);
    console.log(`✅ Human-readable report saved to: ${OUTPUT_TXT}`);

    // Print languages needing most work
    console.log('\n📊 Languages needing most translations:');
    const needWork = Object.entries(results)
        .filter(([_, data]) => !data.error && data.missingCount > 0)
        .sort((a, b) => b[1].missingCount - a[1].missingCount)
        .slice(0, 10);

    needWork.forEach(([lang, data]) => {
        console.log(`   ${lang}: ${data.missingCount} missing keys`);
    });

    console.log('\n✨ Analysis complete!\n');
}

// Run the analysis
try {
    analyzeTranslations();
} catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
}
