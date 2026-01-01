const fs = require('fs');
const path = require('path');

const MANIFEST_FILE = path.join(__dirname, '..', 'manifest.json');

function validateManifest() {
    if (!fs.existsSync(MANIFEST_FILE)) {
        console.error('❌ Manifest file not found!');
        return;
    }

    const data = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
    const items = data.items || [];
    let errors = 0;

    items.forEach(item => {
        const fullPath = path.join(__dirname, '..', item.path);
        
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ Broken link: ${item.path}`);
            errors++;
        }

        if (!item.title) {
            console.warn(`⚠️ Missing title for: ${item.path}`);
            errors++;
        }

        if (!item.summary) {
            console.warn(`⚠️ Missing summary for: ${item.path}`);
        }

        if (!item.tags || item.tags.length === 0) {
            console.warn(`⚠️ Missing tags for: ${item.path}`);
        }
    });

    if (errors === 0) {
        console.log('🛡️ Codex Integrity Verified: All paths and titles are valid.');
    } else {
        console.log(`🛡️ Guardian Report: Found ${errors} critical issues.`);
    }
}

validateManifest();
