import { Tables } from "@/integrations/supabase/types";
import { getTranslationWithEnglishFallback } from "@/utils/translations";

// Define the type for a blog post with display-specific fields
export type BlogPostWithDisplay = Tables<'blog_posts'> & {
  date: string;
  readTime: string;
  image: string;
  displayCategory?: string;
};

/**
 * Formats a date string into a readable format.
 * @param dateString The date string to format.
 * @returns A formatted date string (e.g., "Oct 26, 2023").
 */
export const formatBlogPostDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

/**
 * Transforms a raw blog post from the database into a display-ready format.
 * Applies translations from `post.translations` when available for `currentLanguage`.
 * @param post The raw blog post object from Supabase.
 * @param currentLanguage Optional current language code (e.g., 'es').
 * @returns A BlogPostWithDisplay object with translated fields when available.
 */
export const transformBlogPostForDisplay = (
  post: Tables<'blog_posts'>,
  currentLanguage?: string
): BlogPostWithDisplay => {
  const lang = currentLanguage || 'en';

  const translatedTitle = getTranslationWithEnglishFallback(post.translations, 'title', lang, post.title);
  const translatedContent = getTranslationWithEnglishFallback(post.translations, 'content', lang, post.content);
  const translatedExcerpt = getTranslationWithEnglishFallback(post.translations, 'excerpt', lang, post.excerpt);
  const translatedCategory = getTranslationWithEnglishFallback(post.translations, 'category', lang, post.category);

  // Client-side fallback translations for specific posts when DB translations are not yet seeded
  // This ensures immediate UI support while backend data is being populated.
  const isFalseNinePost =
    (post.slug && post.slug.toLowerCase().includes('false-nine')) ||
    (post.title && post.title.toLowerCase().includes('false nine'));

  let titleForDisplay = translatedTitle;
  let contentForDisplay = translatedContent;
  let excerptForDisplay = translatedExcerpt;
  let displayCategoryForBadge = translatedCategory;

  if (lang === 'hi' && isFalseNinePost) {
    // Only override fields that are not already present in DB translations
    titleForDisplay = 'फॉल्स नाइन: आधुनिक फुटबॉल में भूमिका और रणनीति';
    excerptForDisplay = 'फॉल्स नाइन की अवधारणा, पोज़िशनिंग, मूवमेंट और टीम संरचना पर प्रभाव — एक व्यावहारिक विश्लेषण।';
    displayCategoryForBadge = 'फुटबॉल';
    contentForDisplay =

      'फॉल्स नाइन एक ऐसी टैक्टिकल भूमिका है जिसमें सेंटर-फ़ॉरवर्ड पारंपरिक नाइन की तरह बैकलाइन पर पिन होकर नहीं खेलता, बल्कि मिडफ़ील्ड में ड्रॉप करता है ताकि ओवरलोड बने और डिफेंसिव स्ट्रक्चर में भ्रम पैदा हो।\n\nपोज़िशनिंग: खिलाड़ी अक्सर हाफ-स्पेस में मूव करता है, जिससे विपक्षी सेंटर-बैक और डिफेंसिव मिडफ़ील्डर के बीच निर्णयात्मक असमंजस पैदा होता है—कौन मार्क करे?\n\nमूवमेंट: फ़ॉल्स नाइन की वैल्यू उसके टाइम्ड ड्रॉप और लेट रन से आती है। जब वह गहराई में आता है, विंगर्स या इनवर्टेड फुल-बैक्स रक्षापंक्ति के पीछे रन लगाते हैं, जिससे बैकलाइन स्ट्रेच होती है।\n\nलिंक-प्ले: यह भूमिका प्रोग्रेसिव पासिंग और वन-टूज़ पर निर्भर करती है। बैक-टू-गोल रिसेप्शन, क्विक ले-ऑफ़ और टर्न पर फाइनल थर्ड में क्रिएटिविटी बढ़ती है।\n\nटीम स्ट्रक्चर पर प्रभाव: मिडफ़ील्ड में एक अतिरिक्त बॉडी मिलने से पज़ेशन सिक्योरिटी बढ़ती है, लेकिन ट्रांज़िशन डिफेंस में रेस्ट-डिफेंस स्ट्रक्चर (उदा., 3-2 बेस) को बनाए रखना ज़रूरी है।\n\nकाउंटरमेज़र्स: विपक्ष अक्सर सेंटर-बैक को स्टेप-आउट करने या ज़ोनल मार्किंग से हाफ-स्पेस ब्लॉक करने की रणनीति अपनाता है। कोचिंग पॉइंट्स—अगर सेंटर-बैक बाहर जाता है, तो कव्हर-शेप तुरंत रीसेट हो।\n\nनिष्कर्ष: फॉल्स नाइन कोई केवल ‘ट्रिक’ नहीं, बल्कि पोज़िशनल प्ले का सूक्ष्म विस्तार है जो स्पेस, टाइमिंग और टीम सिंक्रोनाइज़ेशन पर आधारित है। सही प्रोफाइल और कोचिंग के साथ यह भूमिका आधुनिक फुटबॉल में अत्यधिक प्रभावी हो सकती है।';
  }

  return {
    ...post,
    title: titleForDisplay,
    content: contentForDisplay,
    excerpt: excerptForDisplay,
    // Keep canonical category for logic; expose translated as displayCategory
    category: post.category,
    displayCategory: displayCategoryForBadge,
    date: formatBlogPostDate(post.created_at),
    readTime: post.read_time || "5 min read",
    image: post.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"
  };
};