const fs = require('fs');
const fetchFn = globalThis.fetch || require('undici').fetch;

const API_URL = 'https://www.rjmedicine.org/_functions/articles';

function toSlug(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
}

(async () => {
  const res = await fetchFn(API_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  const articles = await res.json();

  if (!fs.existsSync('articles')) fs.mkdirSync('articles');

  for (const a of articles) {
    const rawId = a.eLocator || a.id || a._id;
    const id = toSlug(rawId);
    if (!id) { console.warn('Skipping: missing eLocator/id', a); continue; }

    const safeTitle = String(a.title || '').replace(/"/g, '\\"');
    const authorList = Array.isArray(a.authors)
      ? a.authors
      : String(a.authors || '').split(';').map(s => s.trim()).filter(Boolean);

    const frontMatter = `---
layout: article.njk
title: "${safeTitle}"
authors:
${authorList.map(x => `  - ${x}`).join('\n')}
pubDate: ${a.pubDate}
journal: "Researchers’ Journal of Internal Medicine"
doi: ${a.doi}
pdfUrl: ${a.pdfUrl}
wixUrl: ${a.wixUrl || `https://www.rjmedicine.org/publications/${rawId}`}
permalink: "/articles/${id}/"
---`;

    const body = `${a.abstract || ''}\n`;
    const filename = `articles/${id}.md`;
    fs.writeFileSync(filename, `${frontMatter}\n\n${body}`, 'utf8');
    console.log(`✅ Created ${filename}`);
  }
  console.log(`Done. Created ${articles.length} file(s).`);
})();
