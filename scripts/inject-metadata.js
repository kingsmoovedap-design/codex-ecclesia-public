const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const CORE_DIR = path.join(__dirname, '..', 'core');
const DEFAULT_DATE = '2025-01-01';

function injectMetadata(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  const fileName = path.basename(filePath, path.extname(filePath));
  const titleText = $('title').text().trim() || fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (!$('title').length) {
    $('head').prepend(`<title>${titleText}</title>`);
  }

  if (!$('meta[name="description"]').length) {
    $('head').append(`<meta name="description" content="Placeholder summary for ${titleText}.">`);
  }

  if (!$('meta[name="keywords"]').length) {
    const tags = fileName.toLowerCase().split(/[-_]/).join(', ');
    $('head').append(`<meta name="keywords" content="${tags}">`);
  }

  if (!$('meta[name="date"]').length) {
    $('head').append(`<meta name="date" content="${DEFAULT_DATE}">`);
  }

  fs.writeFileSync(filePath, $.html(), 'utf8');
  console.log(`✅ Injected metadata into: ${filePath}`);
}

function processCoreScrolls() {
  const files = fs.readdirSync(CORE_DIR).filter(f => f.endsWith('.html') || f.endsWith('.htm'));
  files.forEach(file => {
    const fullPath = path.join(CORE_DIR, file);
    injectMetadata(fullPath);
  });
}

processCoreScrolls();
