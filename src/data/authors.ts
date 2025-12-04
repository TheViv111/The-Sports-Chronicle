/**
 * Author data for blog post attribution
 * Team member information from About page
 */

import vivaanHandaImg from '@/assets/vivaan-handa-new.jpg';
import vedMehtaImg from '@/assets/ved-mehta-new.png';
import shouryaGuptaImg from '@/assets/shourya-gupta-new.jpg';
import shauryaGuptaImg from '@/assets/shaurya-gupta-new.jpg';

export interface Author {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl: string;
}

export const AUTHORS: Record<string, Author> = {
    'team': {
        id: 'team',
        name: 'The Sports Chronicle Team',
        title: 'Editorial Team',
        bio: 'We strive to be the most trusted source for sports news and analysis. Our commitment to journalistic integrity means we deliver factual, unbiased coverage you can rely on.',
        avatarUrl: '/logo-160.png' // Using the site logo for team
    },
    'sports-chronicle-team': {
        id: 'sports-chronicle-team',
        name: 'The Sports Chronicle Team',
        title: 'Editorial Team',
        bio: 'We strive to be the most trusted source for sports news and analysis. Our commitment to journalistic integrity means we deliver factual, unbiased coverage you can rely on.',
        avatarUrl: '/logo-160.png' // Using the site logo for team
    },
    'vivaan-handa': {
        id: 'vivaan-handa',
        name: 'Vivaan Handa',
        title: 'Research Head and Website Manager',
        bio: 'Leading our research initiatives and managing the digital platform with expertise in data analysis and web development.',
        avatarUrl: vivaanHandaImg
    },
    'ved-mehta': {
        id: 'ved-mehta',
        name: 'Ved Mehta',
        title: 'Blog Author and Skill Demonstrator',
        bio: 'Creating engaging content and showcasing sports techniques through detailed analysis and expert commentary.',
        avatarUrl: vedMehtaImg
    },
    'shourya-gupta': {
        id: 'shourya-gupta',
        name: 'Shourya Gupta',
        title: 'Social Media Administrator',
        bio: 'Managing our social media presence and community engagement across all digital platforms.',
        avatarUrl: shouryaGuptaImg
    },
    'shaurya-gupta': {
        id: 'shaurya-gupta',
        name: 'Shaurya Gupta',
        title: 'Feedback and Data Analytics',
        bio: 'Analyzing user feedback and performance metrics to continuously improve our platform and content quality.',
        avatarUrl: shauryaGuptaImg
    }
};

/**
 * Get author by ID
 * @param authorId - Author ID
 * @returns Author object or undefined
 */
export function getAuthorById(authorId: string): Author | undefined {
    return AUTHORS[authorId];
}

/**
 * Get all authors as an array
 * @returns Array of all authors
 */
export function getAllAuthors(): Author[] {
    return Object.values(AUTHORS);
}
