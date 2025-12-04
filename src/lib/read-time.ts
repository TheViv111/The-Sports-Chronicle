/**
 * Utility functions for calculating blog post read time
 * Based on average reading speed and content analysis
 */

/**
 * Calculate estimated read time for blog content
 * Algorithm:
 * - Average reading speed: 225 words per minute
 * - Add 12 seconds per image (first 10 images only)
 * - Minimum read time: 1 minute
 * - Round to nearest minute
 * 
 * @param content - HTML content string
 * @returns Formatted read time string (e.g., "5 min read")
 */
export function calculateReadTime(content: string): string {
    if (!content) return '1 min read';

    // Strip HTML tags to get plain text
    const plainText = content.replace(/<[^>]*>/g, ' ');

    // Count words (split by whitespace and filter empty strings)
    const words = plainText
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);

    const wordCount = words.length;

    // Count images in content (limit to first 10 for calculation)
    const imageMatches = content.match(/<img[^>]*>/g);
    const imageCount = imageMatches ? Math.min(imageMatches.length, 10) : 0;

    // Calculate time
    const WORDS_PER_MINUTE = 225;
    const SECONDS_PER_IMAGE = 12;

    const wordReadTime = wordCount / WORDS_PER_MINUTE;
    const imageReadTime = (imageCount * SECONDS_PER_IMAGE) / 60;

    const totalMinutes = Math.max(1, Math.round(wordReadTime + imageReadTime));

    return `${totalMinutes} min read`;
}

/**
 * Calculate word count from HTML content
 * Strips HTML tags and counts actual words
 * 
 * @param content - HTML content string
 * @returns Word count
 */
export function getWordCount(content: string): number {
    if (!content) return 0;

    // Strip HTML tags to get plain text
    const plainText = content.replace(/<[^>]*>/g, ' ');

    // Count words (split by whitespace and filter empty strings)
    const words = plainText
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);

    return words.length;
}

/**
 * Get detailed reading statistics for content
 * Useful for analytics and debugging
 * 
 * @param content - HTML content string
 * @returns Object with detailed stats
 */
export function getReadingStats(content: string) {
    const wordCount = getWordCount(content);
    const imageMatches = content.match(/<img[^>]*>/g);
    const imageCount = imageMatches ? imageMatches.length : 0;
    const readTime = calculateReadTime(content);

    return {
        wordCount,
        imageCount,
        readTime,
        estimatedMinutes: parseInt(readTime.split(' ')[0])
    };
}
