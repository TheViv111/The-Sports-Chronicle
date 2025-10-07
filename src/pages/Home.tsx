import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import LoadingScreen from "@/components/LoadingScreen";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay'; // Import Autoplay plugin

type BlogPostType = Tables<'blog_posts'>;

const Home = () => {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const { t } = useTranslation();

  // Initialize Embla Carousel with Autoplay plugin
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true, stopOnLastSnap: false })]
  );

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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

      {/* Latest Posts Section with Carousel */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold mb-8 text-center reveal-on-scroll">
            {t("latestPosts.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12 text-center reveal-on-scroll">
            {t("latestPosts.subtitle")}
          </p>

          {loadingPosts ? (
            <LoadingScreen message={t("latestPosts.loading")} />
          ) : posts.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4">
                  {posts.map((blogPost) => (
                    <div key={blogPost.id} className="flex-none w-full sm:w-1/2 lg:w-1/3 pl-4">
                      <BlogCard 
                        post={{
                          ...blogPost,
                          date: new Date(blogPost.created_at).toLocaleDateString("en-US", { 
                            year: "numeric", 
                            month: "short", 
                            day: "numeric" 
                          }),
                          readTime: blogPost.read_time || "5 min read",
                          image: blogPost.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"
                        }} 
                        className="scroll-reveal"
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Removed manual navigation buttons as autoplay is enabled */}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("latestPosts.noPosts")}
            </p>
          )}

          {posts.length > 0 && (
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
  );
};

export default Home;