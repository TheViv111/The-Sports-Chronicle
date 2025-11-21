// Build script to generate sitemap.xml from Supabase posts
// Run this after your main build process

const { writeFileSync } = require('fs');
const { resolve } = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const DOMAIN = 'https://the-sports-chronicle.vercel.app';
const today = new Date().toISOString().split('T')[0];

// Static pages
const staticPages = [
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

async function fetchBlogPosts() {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not found. Generating sitemap with static pages only.');
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching posts:', error.message);
      return [];
    }

    console.log(`✅ Fetched ${posts?.length || 0} blog posts from Supabase`);
    return posts || [];
  } catch (error) {
    console.error('❌ Failed to fetch blog posts:', error.message);
    return [];
  }
}

function generateSitemapXML(entries) {
  const urls = entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

async function generateSitemap() {
  try {
    // Fetch blog posts
    const posts = await fetchBlogPosts();

    // Convert posts to sitemap entries
    const postEntries = posts.map(post => ({
      url: `${DOMAIN}/blog/${post.slug}`,
      lastmod: post.updated_at ? post.updated_at.split('T')[0] : post.created_at.split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    }));

    // Combine static pages and blog posts
    const allEntries = [...staticPages, ...postEntries];

    const xmlContent = generateSitemapXML(allEntries);

    // Write to public directory
    const publicPath = resolve(__dirname, '../public/sitemap.xml');
    writeFileSync(publicPath, xmlContent, 'utf8');

    console.log('✅ Sitemap generated successfully!');
    console.log(`📄 Generated: ${publicPath}`);
    console.log(`📊 Total URLs: ${allEntries.length} (${staticPages.length} static + ${postEntries.length} blog posts)`);

  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();
