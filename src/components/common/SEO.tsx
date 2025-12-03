import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  imageUrl?: string;
  schemaType?: 'Organization' | 'WebSite' | 'WebPage' | 'Article' | 'NewsArticle' | 'BlogPosting' | 'ContactPage' | 'ProfilePage';
  articleData?: {
    headline?: string;
    datePublished?: string;
    dateModified?: string;
    author?: string | { "@type": string; name: string };
    image?: string;
    category?: string;
    tags?: string[];
    keywords?: string;
    articleSection?: string;
  };
  noindex?: boolean;
  additionalSchema?: object;
}

export function SEO({
  title = 'The Sports Chronicle - Sports News & Analysis',
  description = 'Your ultimate destination for sports news, analysis, and insights. Covering basketball, soccer, swimming, and more sports worldwide.',
  canonicalUrl = 'https://the-sports-chronicle.vercel.app',
  type = 'website',
  imageUrl = '/og-image.png',
  schemaType = 'WebSite',
  articleData,
  noindex = false,
  additionalSchema,
}: SEOProps) {
  // Base schema for all pages
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Sports Chronicle',
    url: 'https://the-sports-chronicle.vercel.app',
    logo: 'https://the-sports-chronicle.vercel.app/og-image.png',
    sameAs: [
      'https://facebook.com/thesportschronicle',
      'https://instagram.com/thesportschronicle'
    ]
  };

  // Website schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Sports Chronicle',
    url: canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${canonicalUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // WebPage schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: canonicalUrl,
    name: title,
    description: description,
    isPartOf: {
      '@type': 'WebSite',
      name: 'The Sports Chronicle',
      url: 'https://the-sports-chronicle.vercel.app'
    }
  };

  // ProfilePage schema
  const profilePageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: canonicalUrl,
    name: title,
    description: description,
    isPartOf: {
      '@type': 'WebSite',
      name: 'The Sports Chronicle',
      url: 'https://the-sports-chronicle.vercel.app'
    }
  };

  // Article schema (for blog posts)
  const articleSchema = articleData ? {
    '@context': 'https://schema.org',
    '@type': schemaType === 'NewsArticle' ? 'NewsArticle' : 'BlogPosting',
    headline: articleData.headline || title,
    image: [articleData.image || imageUrl],
    datePublished: articleData.datePublished,
    dateModified: articleData.dateModified || articleData.datePublished,
    author: {
      '@type': 'Person',
      name: typeof articleData.author === 'string' ? articleData.author : articleData.author?.name || 'The Sports Chronicle'
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Sports Chronicle',
      logo: {
        '@type': 'ImageObject',
        url: 'https://the-sports-chronicle.vercel.app/og-image.png'
      }
    },
    description: description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    keywords: articleData.tags?.join(', '),
    articleSection: articleData.articleSection || articleData.category,
    ...(articleData.keywords && { keywords: articleData.keywords })
  } : null;

  // Determine which schema to use based on the page type
  let schemaMarkup;
  if (schemaType === 'Organization') {
    schemaMarkup = baseSchema;
  } else if (schemaType === 'WebSite') {
    schemaMarkup = websiteSchema;
  } else if (schemaType === 'WebPage') {
    schemaMarkup = webPageSchema;
  } else if (schemaType === 'ProfilePage') {
    schemaMarkup = profilePageSchema;
  } else if (['Article', 'NewsArticle', 'BlogPosting'].includes(schemaType) && articleData) {
    schemaMarkup = articleSchema;
  } else {
    schemaMarkup = webPageSchema;
  }

  // Combine main schema with additional schema if provided
  const allSchemas = additionalSchema ? [schemaMarkup, additionalSchema] : [schemaMarkup];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://whgjiirmcbsiqhjzgldy.supabase.co" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* JSON-LD structured data */}
      {allSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}