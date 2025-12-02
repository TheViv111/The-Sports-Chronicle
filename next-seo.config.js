module.exports = {
  title: 'The Sports Chronicle - Sports News, Analysis & Insights',
  description: 'Your go-to source for the latest sports news, in-depth analysis, and expert insights across all major sports.',
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://the-sports-chronicle.vercel.app',
    site_name: 'The Sports Chronicle',
    images: [
      {
        url: 'https://the-sports-chronicle.vercel.app/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Sports Chronicle',
      },
    ],
  },
  twitter: {
    handle: '@sports_chronicle',
    site: '@sports_chronicle',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0',
    },
    {
      name: 'keywords',
      content: 'sports, news, analysis, football, basketball, soccer, baseball, nfl, nba, mlb, nhl, tennis, golf',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'canonical',
      href: 'https://the-sports-chronicle.vercel.app',
    },
  ],
};
