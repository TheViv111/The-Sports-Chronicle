import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
  images?: Array<{ loc: string; caption?: string; title?: string }>;
}

const Sitemap = () => {
  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const DOMAIN = 'https://the-sports-chronicle.vercel.app';
        const today = new Date().toISOString().split('T')[0];
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

        // Fetch blog posts from Supabase
        const { data: posts, error } = await supabase
          .from('blog_posts')
          .select('slug, updated_at, cover_image, title, excerpt')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Static pages
        const staticPages: SitemapEntry[] = [
          {
            url: `${DOMAIN}/`,
            lastmod: today,
            changefreq: 'daily',
            priority: 1.0,
            images: [{
              loc: `${DOMAIN}/og-image.png`,
              title: 'The Sports Chronicle - Sports News, Analysis & Blog',
              caption: 'Your trusted source for sports news and analysis'
            }]
          },
          {
            url: `${DOMAIN}/blog`,
            lastmod: today,
            changefreq: 'hourly',
            priority: 0.9
          },
          {
            url: `${DOMAIN}/about`,
            lastmod: '2025-01-01', // Set to your last content update
            changefreq: 'monthly',
            priority: 0.8
          },
          {
            url: `${DOMAIN}/contact`,
            lastmod: '2025-01-01', // Set to your last content update
            changefreq: 'monthly',
            priority: 0.7
          }
        ];

        // Dynamic blog posts
        const blogPosts: SitemapEntry[] = (posts || []).map(post => ({
          url: `${DOMAIN}/blog/${post.slug}`,
          lastmod: post.updated_at?.split('T')[0] || today,
          changefreq: post.updated_at > oneWeekAgoStr ? 'daily' : 'weekly',
          priority: 0.8,
          images: post.cover_image ? [{
            loc: post.cover_image.startsWith('http') ? post.cover_image : `${DOMAIN}${post.cover_image}`,
            title: post.title,
            caption: post.excerpt
          }] : []
        }));

        // Combine all URLs
        const allUrls = [...staticPages, ...blogPosts];

        // Generate XML
        const urls = allUrls.map(entry => {
          const imageTags = entry.images?.map(img => 
            `    <image:image>
       <image:loc>${img.loc}</image:loc>
       ${img.title ? `<image:title><![CDATA[${img.title}]]></image:title>` : ''}
       ${img.caption ? `<image:caption><![CDATA[${img.caption}]]></image:caption>` : ''}
     </image:image>`
          ).join('\n') || '';

          return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    ${imageTags}
  </url>`;
        }).join('\n');

        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
>
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
      } catch (error) {
        console.error('Error generating sitemap:', error);
        // Fallback to basic sitemap on error
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://the-sports-chronicle.vercel.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        document.documentElement.innerHTML = fallbackXml;
      }
    };

    generateSitemap();
  }, []);

  return null; // We're replacing the entire document content
};

export default Sitemap;
