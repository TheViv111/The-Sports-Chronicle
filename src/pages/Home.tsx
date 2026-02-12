import { useState, useCallback, useEffect, Suspense, lazy, memo, startTransition } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCarousel from "@/components/blog/BlogCarousel";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import { transformBlogPostForDisplay, BlogPostWithDisplay } from "@/lib/blog-utils";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import { SEO } from "@/components/common/SEO";
import { useTheme } from "@/components/common/ThemeProvider";

// Lazy load heavy components
const ParticleBackground = lazy(() => import("@/components/common/ParticleBackground"));

// Static hero section - no floating animations to prevent CLS
const HeroSection = memo(({ t }: { t: (key: string) => string }) => (
  <section className="relative py-12 sm:py-16 md:py-20 text-center px-4 min-h-[500px] overflow-hidden">
    <div className="relative z-10 max-w-7xl mx-auto">
      {/* Static content - no animations that cause layout shifts */}
      <p className="text-muted-foreground uppercase text-xs sm:text-sm tracking-wide mb-3 sm:mb-4">
        {t("hero.welcome")}
      </p>

      <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 max-w-4xl mx-auto leading-tight">
        {t("hero.title")}
      </h1>

      <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
        {t("hero.subtitle")}
      </p>

      <Link to="/blog">
        <Button size="lg" className="group">
          {t("hero.readLatest")}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  </section>
));

HeroSection.displayName = 'HeroSection';

// Blog section with fixed height skeleton to prevent CLS
const BlogSection = memo(({ t, latestPosts, loadingLatestPosts }: {
  t: (key: string) => string;
  latestPosts: BlogPostWithDisplay[];
  loadingLatestPosts: boolean
}) => (
  <section className="py-12 sm:py-16 bg-secondary/20 relative">
    <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
      {t("latestPosts.title")}
    </h2>

    <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-12 text-center">
      {t("latestPosts.subtitle")}
    </p>

    {/* Fixed height container to prevent CLS during loading */}
    <div className="min-h-[400px]">
      {loadingLatestPosts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          {[...Array(3)].map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <BlogCarousel posts={latestPosts} />
      )}
    </div>

    {!loadingLatestPosts && latestPosts.length > 0 && (
      <div className="text-center mt-12">
        <Link to="/blog">
          <Button variant="outline" size="lg" className="group">
            {t("latestPosts.viewAll")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    )}
  </section>
));

BlogSection.displayName = 'BlogSection';

const Home = () => {
  const [latestPosts, setLatestPosts] = useState<BlogPostWithDisplay[]>([]);
  const [loadingLatestPosts, setLoadingLatestPosts] = useState(true);
  const { t, currentLanguage } = useTranslation();
  const { theme } = useTheme();

  // Determine if dark mode is active
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Defer heavy particle effects significantly - only after page is fully loaded
  const [showParticles, setShowParticles] = useState(false);

  // Load blog posts after first contentful paint - use startTransition for non-urgent updates
  useEffect(() => {
    // Immediate FCP - just render the static content first
    const loadDataDeferred = () => {
      startTransition(() => {
        loadLatestPosts();
      });
    };

    // Use requestIdleCallback for data loading to not block main thread
    // Wait for page to be interactive
    const loadWhenReady = () => {
      if (document.readyState === 'complete') {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(loadDataDeferred, { timeout: 1000 });
        } else {
          setTimeout(loadDataDeferred, 100);
        }
      } else {
        window.addEventListener('load', () => {
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(loadDataDeferred, { timeout: 1000 });
          } else {
            setTimeout(loadDataDeferred, 100);
          }
        }, { once: true });
      }
    };

    loadWhenReady();

    // Defer heavy particle effects significantly - only after page is fully loaded
    const deferredEffectsTimer = setTimeout(() => {
      if (document.readyState === 'complete') {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            setShowParticles(true);
          }, { timeout: 5000 });
        } else {
          setShowParticles(true);
        }
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            if ('requestIdleCallback' in window) {
              (window as any).requestIdleCallback(() => {
                setShowParticles(true);
              }, { timeout: 5000 });
            } else {
              setShowParticles(true);
            }
          }, 2000);
        }, { once: true });
      }
    }, 2000);

    return () => clearTimeout(deferredEffectsTimer);
  }, [currentLanguage]);

  const loadLatestPosts = useCallback(async () => {
    try {
      // Only select required fields to reduce payload
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image, category, created_at, translations')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      startTransition(() => {
        setLatestPosts(data ? data.map((p) => transformBlogPostForDisplay(p as any, currentLanguage)) : []);
        setLoadingLatestPosts(false);
      });
    } catch (error) {
      console.error('Error loading latest posts:', error);
      setLoadingLatestPosts(false);
    }
  }, [currentLanguage]);

  return (
    <>
      <SEO
        title="The Sports Chronicle - Sports News, Analysis & Blog"
        description="The Sports Chronicle: Your trusted source for expert sports analysis, tactical insights, and in-depth coverage of basketball and football."
        schemaType="WebSite"
        canonicalUrl="https://the-sports-chronicle.vercel.app/"
      />
      <div className="min-h-screen relative">
        {/* Particle Background - heavily deferred */}
        {showParticles && !isDarkMode && (
          <Suspense fallback={null}>
            <ParticleBackground
              enabled={true}
              particleCount={20}
              speed={0.2}
              colors={['rgba(59, 130, 246, 0.08)', 'rgba(147, 51, 234, 0.08)', 'rgba(236, 72, 153, 0.08)']}
            />
          </Suspense>
        )}

        <HeroSection t={t} />
        <BlogSection t={t} latestPosts={latestPosts} loadingLatestPosts={loadingLatestPosts} />
      </div>
    </>
  );
};

export default Home;
