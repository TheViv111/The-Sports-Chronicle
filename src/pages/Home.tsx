import { useState, useEffect, Suspense, lazy, memo } from "react";
import { useQuery } from "@tanstack/react-query";
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
const FloodlightBackground = lazy(() => import("@/components/common/FloodlightBackground"));

const HeroSection = memo(({ t, showParticles, isDarkMode }: { t: (key: string) => string, showParticles: boolean, isDarkMode: boolean }) => (
  <section className="relative py-12 sm:py-16 md:py-20 text-center px-4 min-h-[500px] overflow-hidden">
    {/* Floodlight Background - confined exactly to the hero bounds */}
    {showParticles && isDarkMode && (
      <Suspense fallback={null}>
        <FloodlightBackground imagePath="/images/green-turf.png" />
      </Suspense>
    )}
    
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
        <Button size="lg" variant="brand" className="group">
          {t("hero.readLatest")}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
    {/* Gradient fade — bridges hero dark background to carousel section */}
    <div
      className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
      style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(var(--secondary) / 0.2) 100%)" }}
    />
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
          <Button variant="outline" size="lg" className="group hover:border-brand hover:text-brand">
            {t("latestPosts.viewAll")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    )}
  </section>
));

BlogSection.displayName = 'BlogSection';

const PhilosophySection = memo(({ showParticles, isDarkMode }: { showParticles: boolean, isDarkMode: boolean }) => (
  <section className="relative py-24 sm:py-32 px-4 border-t border-border/10 overflow-hidden min-h-[600px]">
    {/* Floodlight Background - confined exactly to the philosophy section bounds with a distinct image */}
    {showParticles && isDarkMode && (
      <Suspense fallback={null}>
        <FloodlightBackground imagePath="/images/tactics-board.png" />
      </Suspense>
    )}

    <div className="relative z-10 max-w-4xl mx-auto text-center">
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-8 drop-shadow-lg">
        We don't just report the scores.<br className="hidden sm:block" />
        <span className="text-brand">We dissect the game.</span>
      </h2>
      
      <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground leading-relaxed drop-shadow-md">
        <p>
          At <strong>The Sports Chronicle</strong>, we believe that true athletic excellence is found in the details—the intricate coordination of a 4-3-3 setup, the geometry of the half-space, and the biomechanics of a perfect breakaway. 
        </p>
        <p className="mt-6">
          Founded by <strong>Vivaan Handa</strong>—an IB student, Box-to-Box Midfielder, and hybrid athlete—this platform was built to bridge the gap between raw athleticism and high-level tactical analysis. From the chemistry of athletic recovery to predicting expected goals (xG), we bring you the science, the tactics, and the relentless passion behind the sports we love.
        </p>
      </div>
    </div>
  </section>
));
PhilosophySection.displayName = 'PhilosophySection';

const Home = () => {
  const { t, currentLanguage } = useTranslation();
  const { theme } = useTheme();

  // Determine if dark mode is active
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Defer heavy particle effects significantly - only after page is fully loaded
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
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
  }, []);

  const { data: latestPosts = [], isLoading: loadingLatestPosts } = useQuery({
    queryKey: ['latestPosts', currentLanguage],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image, category, created_at, translations')
        .or(`status.eq.published,and(status.eq.scheduled,scheduled_publish_at.lte.${now})`)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data ? data.map((p) => transformBlogPostForDisplay(p as any, currentLanguage)) : [];
    }
  });

  return (
    <>
      <SEO
        title="The Sports Chronicle - Sports News, Analysis & Blog"
        description="The Sports Chronicle: Your trusted source for expert sports analysis, tactical insights, and in-depth coverage of basketball and football."
        schemaType="WebSite"
        canonicalUrl="https://the-sports-chronicle.vercel.app/"
      />
      <div className="min-h-screen relative overflow-hidden">
        <HeroSection t={t} showParticles={showParticles} isDarkMode={isDarkMode} />
        <PhilosophySection showParticles={showParticles} isDarkMode={isDarkMode} />
        <BlogSection t={t} latestPosts={latestPosts} loadingLatestPosts={loadingLatestPosts} />
      </div>
    </>
  );
};

export default Home;
