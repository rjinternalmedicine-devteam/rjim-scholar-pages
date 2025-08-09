const fs = require('fs');

// Prefer global fetch; fallback to undici if missing
const fetchFn = globalThis.fetch || require('undici').fetch;

const API_URL = 'https://www.rjmedicine.org/_functions/articles';

(async () => {
  try {
    const res = await fetchFn(API_URL);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    const articles = await res.json();

    if (!fs.existsSync('articles')) fs.mkdirSync('articles');

    for (const article of articles) {
      const { id, title, authors, pubDate, doi, pdfUrl, wixUrl, abstract } = article;

      const safeTitle = String(title || '').replace(/"/g, '\\"');
      const authorList = Array.isArray(authors)
        ? authors
        : String(authors || '').split(';').map(s => s.trim()).filter(Boolean);

      const frontMatter = `---
layout: article.njk
title: "${safeTitle}"
authors:
${authorList.map(a => `  - ${a}`).join('\n')}
pubDate: ${pubDate}
journal: "Researchers’ Journal of Internal Medicine"
doi: ${doi}
pdfUrl: ${pdfUrl}
wixUrl: ${wixUrl}
---`;

      const body = `${abstract || ''}\n`;

      const filename = `articles/${id}.md`;
      fs.writeFileSync(filename, `${frontMatter}\n\n${body}`, 'utf8');
      console.log(`✅ Created ${filename}`);
    }

    console.log(`Done. Created ${articles.length} file(s).`);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
