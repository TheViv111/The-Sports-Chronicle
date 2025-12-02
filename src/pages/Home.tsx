import { useState, useCallback, useEffect, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCarousel from "@/components/blog/BlogCarousel";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import { transformBlogPostForDisplay, BlogPostWithDisplay } from "@/lib/blog-utils";
import useScrollReveal from "@/hooks/useScrollReveal";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import { SEO } from "@/components/common/SEO";
const Spline = lazy(() => import("@splinetool/react-spline"));
import { useTheme } from "@/components/common/ThemeProvider";

const Home = () => {
  const [latestPosts, setLatestPosts] = useState<BlogPostWithDisplay[]>([]);
  const [loadingLatestPosts, setLoadingLatestPosts] = useState(true);
  const { t, currentLanguage } = useTranslation();
  const { theme } = useTheme();

  // Determine if dark mode is active
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [showSpline, setShowSpline] = useState(false);

  useScrollReveal('.reveal-on-scroll');



  useEffect(() => {
    const schedule = () => {
      loadLatestPosts();
      setShowSpline(true);
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(schedule);
    } else {
      setTimeout(schedule, 300);
    }
  }, [currentLanguage]);

  const loadLatestPosts = useCallback(async () => {
    try {
      setLoadingLatestPosts(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setLatestPosts(data ? data.map((p) => transformBlogPostForDisplay(p, currentLanguage)) : []);
    } catch (error) {
      console.error('Error loading latest posts:', error);
    } finally {
      setLoadingLatestPosts(false);
    }
  }, [currentLanguage]);

  return (
    <>
      <SEO
        schemaType="WebSite"
        canonicalUrl="https://thesportschronicle.com/"
      />
      <div className="min-h-screen">
        <section className="relative py-12 sm:py-16 md:py-20 text-center px-4 min-h-[600px] overflow-hidden">
          {/* Spline 3D Background - Only visible in dark mode */}
          {isDarkMode && showSpline && (
            <div className="absolute inset-0 -z-10 opacity-60">
              <Suspense fallback={null}>
                <Spline scene="https://prod.spline.design/6d4ygri42yVcAJ02/scene.splinecode" />
              </Suspense>
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto">
            <p className="text-muted-foreground uppercase text-xs sm:text-sm tracking-wide mb-3 sm:mb-4 reveal-on-scroll">
              {t("hero.welcome")}
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 max-w-4xl mx-auto leading-tight reveal-on-scroll">
              {t("hero.title")}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto reveal-on-scroll">
              {t("hero.subtitle")}
            </p>



            <div className="reveal-on-scroll">
              <Link to="/blog">
                <Button size="lg" className="group btn-hover-lift">
                  {t("hero.readLatest")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center reveal-on-scroll">
              {t("latestPosts.title")}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-12 text-center reveal-on-scroll">
              {t("latestPosts.subtitle")}
            </p>

            {loadingLatestPosts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {[...Array(3)].map((_, index) => (
                  <BlogCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {[...Array(3)].map((_, index) => (
                    <BlogCardSkeleton key={index} />
                  ))}
                </div>
              }>
                <BlogCarousel posts={latestPosts} />
              </Suspense>
            )}

            {latestPosts.length > 0 && (
              <div className="text-center mt-12 reveal-on-scroll">
                <Link to="/blog">
                  <Button variant="outline" size="lg" className="group btn-hover-lift">
                    {t("latestPosts.viewAll")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
