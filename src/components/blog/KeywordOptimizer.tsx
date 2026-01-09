import { useEffect } from 'react';
import { Tables } from '@/integrations/supabase/types';

interface KeywordOptimizerProps {
  post: Tables<'blog_posts'>;
}

const sportsKeywords = {
  basketball: ['NBA', 'basketball', 'hoops', 'court', 'dribble', 'slam dunk', 'three-pointer', 'free throw', 'layup', 'rebound', 'assists', 'points', 'playoffs', 'championship', 'MVP', 'all-star', 'coach', 'team', 'defense', 'offense'],
  football: ['soccer', 'football', 'goal', 'penalty', 'free kick', 'corner kick', 'offside', 'dribbling', 'passing', 'shooting', 'goalkeeper', 'defender', 'midfielder', 'forward', 'referee', 'yellow card', 'red card', 'extra time', 'World Cup', 'Premier League', 'Champions League']
};

const generateKeywords = (post: Tables<'blog_posts'>): string[] => {
  const keywords = new Set<string>();
  
  // Add base keywords
  keywords.add('sports news');
  keywords.add('sports analysis');
  keywords.add('The Sports Chronicle');
  keywords.add('sports blog');
  
  // Add category-specific keywords
  const category = post.category?.toLowerCase();
  if (category && sportsKeywords[category as keyof typeof sportsKeywords]) {
    sportsKeywords[category as keyof typeof sportsKeywords].forEach(keyword => {
      keywords.add(keyword);
    });
  }
  
  // Extract keywords from title
  if (post.title) {
    const titleWords = post.title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    titleWords.forEach(word => keywords.add(word));
  }
  
  // Extract keywords from excerpt
  if (post.excerpt) {
    const excerptWords = post.excerpt.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    excerptWords.forEach(word => keywords.add(word));
  }
  
  // Add time-based keywords
  const currentYear = new Date().getFullYear();
  keywords.add(`${currentYear} sports`);
  keywords.add(`${category} ${currentYear}`);
  
  return Array.from(keywords).slice(0, 15); // Limit to 15 most important keywords
};

const KeywordOptimizer = ({ post }: KeywordOptimizerProps) => {
  useEffect(() => {
    // Update page keywords dynamically
    const keywords = generateKeywords(post);
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', keywords.join(', '));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords.join(', ');
      document.head.appendChild(meta);
    }
    
    // Add structured data for article
    const existingScript = document.querySelector('script[type="application/ld+json"][data-article-structured]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-article-structured', 'true');
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: post.title,
      description: post.excerpt,
      image: post.cover_image,
      datePublished: post.created_at,
      dateModified: post.updated_at || post.created_at,
      author: {
        '@type': 'Person',
        name: post.author || 'The Sports Chronicle'
      },
      publisher: {
        '@type': 'Organization',
        name: 'The Sports Chronicle',
        logo: {
          '@type': 'ImageObject',
          url: 'https://the-sports-chronicle.vercel.app/og-image.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://the-sports-chronicle.vercel.app/blog/${post.slug}`
      },
      keywords: keywords.join(', '),
      articleSection: post.category,
      about: post.category
    });
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      const keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (keywordsMeta) keywordsMeta.remove();
      
      const structuredScript = document.querySelector('script[data-article-structured]');
      if (structuredScript) structuredScript.remove();
    };
  }, [post]);
  
  return null; // This component doesn't render anything
};

export default KeywordOptimizer;
