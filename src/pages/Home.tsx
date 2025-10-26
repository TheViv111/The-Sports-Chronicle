import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCarousel from "@/components/blog/BlogCarousel";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import { transformBlogPostForDisplay, BlogPostWithDisplay } from "@/lib/blog-utils";
import LoadingScreen from "@/components/common/LoadingScreen";
import useScrollReveal from "@/hooks/useScrollReveal";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import { SEO } from "@/components/common/SEO";

const Home = () => {
  const [latestPosts, setLatestPosts] = useState<BlogPostWithDisplay[]>([]);
  const [loadingLatestPosts, setLoadingLatestPosts] = useState(true);
  const { t } = useTranslation();

  useScrollReveal('.reveal-on-scroll');

  useEffect(() => {
    loadLatestPosts();
  }, []);

  const loadLatestPosts = async () => {
    try {
      setLoadingLatestPosts(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setLatestPosts(data ? data.map(transformBlogPostForDisplay) : []);
    } catch (error) {
      console.error('Error loading latest posts:', error);
    } finally {
      setLoadingLatestPosts(false);
    }
  };

  return (
    <>
      <SEO 
        schemaType="WebSite"
        canonicalUrl="https://thesportschronicle.com/"
      />
      <div className="min-h-screen">
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground uppercase text-sm tracking-wide mb-4 reveal-on-scroll">
              {t("hero.welcome")}
            </p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight reveal-on-scroll">
              {t("hero.title")}
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto reveal-on-scroll">
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

      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center reveal-on-scroll">
            {t("latestPosts.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12 text-center reveal-on-scroll">
            {t("latestPosts.subtitle")}
          </p>

          {loadingLatestPosts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <BlogCarousel posts={latestPosts} />
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
