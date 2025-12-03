const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, 'src', 'data', 'translations');
const keysToRemove = [
    'about.baseballCoverage',
    'about.tennisCoverage',
    'about.olympicCoverage',
    'about.emergingSports',
    'about.olympicSports',
    'about.emergingSportsTitle',
    'admin.demoCredentials',
    'admin.usernameDemo',
    'admin.passwordDemo',
    'contact.advertising',
    'contact.advertisingOpportunities',
    'contact.editorial',
    'contact.editorialInquiries',
    'contact.newsroom',
    'contact.pressReleases'
];

fs.readdir(translationsDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(translationsDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const json = JSON.parse(content);
                let modified = false;

                keysToRemove.forEach(key => {
                    if (json.hasOwnProperty(key)) {
                        delete json[key];
                        modified = true;
                    }
                });

                if (modified) {
                    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
                    console.log(`Updated ${file}`);
                } else {
                    console.log(`No changes needed for ${file}`);
                }
            } catch (e) {
                console.error(`Error processing ${file}:`, e);
            }
        }
    });
});
