import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIG
const BASE_URL = 'https://codex-ecclesia.org';
const SCROLLS_PATH = path.join(__dirname, 'scrolls.json');
const FEED_PATH = path.join(__dirname, 'scrolls-feed.xml');

async function generateFeed() {
  try {
    const scrolls = await fs.readJson(SCROLLS_PATH);

    if (!Array.isArray(scrolls)) {
      throw new Error('scrolls.json must be an array');
    }

    const items = scrolls.map(entry => {
      const url = `${BASE_URL}/${entry.path.replace(/^\//, '')}`;
      const pubDate = new Date(entry.date).toUTCString();
      return `
  <item>
    <title><![CDATA[${entry.title}]]></title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${entry.summary}]]></description>
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
