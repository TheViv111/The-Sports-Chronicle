import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Generate sitemap XML content
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

    const urls = sitemapEntries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    // Set content type and serve the XML
    document.documentElement.innerHTML = xmlContent;
    document.title = 'sitemap.xml';
    
    // Set the response headers (client-side approximation)
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Type';
    meta.content = 'application/xml; charset=utf-8';
    document.head.appendChild(meta);
  }, []);

  return null; // We're replacing the entire document content
};

export default Sitemap;
