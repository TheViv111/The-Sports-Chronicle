// Build script to generate sitemap.xml from sitemap.ts
// Run this after your main build process

const { writeFileSync } = require('fs');
const { resolve } = require('path');

// Simple sitemap data (mirroring the TypeScript version)
const DOMAIN = 'https://the-sports-chronicle.vercel.app';
const today = new Date().toISOString().split('T')[0];

const sitemapEntries = [
  {
    url: `${DOMAIN}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: 1.0
  },
  {
    url: `${DOMAIN}/blog`,
    lastmod: today,
    changefreq: 'daily',
    priority: 0.9
  },
  {
    url: `${DOMAIN}/about`,
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    url: `${DOMAIN}/contact`,
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.7
  }
];

function generateSitemapXML() {
  const urls = sitemapEntries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

try {
  const xmlContent = generateSitemapXML();
  
  // Write to public directory
  const publicPath = resolve(__dirname, '../public/sitemap.xml');
  writeFileSync(publicPath, xmlContent, 'utf8');
  
  console.log('✅ Sitemap generated successfully!');
  console.log(`📄 Generated: ${publicPath}`);
  
} catch (error) {
  console.error('❌ Failed to generate sitemap:', error.message);
  process.exit(1);
}
