import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIG
const BASE_URL = 'https://codex-ecclesia.org';
const CODEX_PATH = path.join(__dirname, '../codex.json');
const FEED_PATH = path.join(__dirname, '../scrolls-feed.xml');

async function generateFeed() {
  try {
    const codex = await fs.readJson(CODEX_PATH);

    if (!Array.isArray(codex.scrolls)) {
      throw new Error('codex.json must contain a "scrolls" array');
    }

    const items = codex.scrolls.map(entry => {
      const url = `${BASE_URL}/${entry.url.replace(/^\//, '')}`;
      const pubDate = new Date(entry.created).toUTCString();
      const description = entry.category
        ? `Category: ${entry.category}`
        : 'Codex Ecclesia Scroll';
      return `
  <item>
    <title><![CDATA[${entry.title}]]></title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${description}]]></description>
  </item>`;
    });

    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Codex Ecclesia Scrolls</title>
  <link>${BASE_URL}</link>
  <description>New scrolls from the Codex Ecclesia</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join('\n')}
</channel>
</rss>`;

    await fs.writeFile(FEED_PATH, feed.trim());
    console.log(`✅ RSS feed generated with ${items.length} scrolls.`);
  } catch (err) {
    console.error('❌ Failed to generate RSS feed:', err.message);
    process.exit(1);
  }
}

generateFeed();
