import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import { transformBlogPostForDisplay, BlogPostWithDisplay } from "@/lib/blog-utils";
import useScrollReveal from "@/hooks/useScrollReveal";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import { SEO } from "@/components/common/SEO";
import { getTranslationWithEnglishFallback } from "@/utils/translations";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPostWithDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, currentLanguage } = useTranslation();

  useScrollReveal('.reveal-on-scroll');
  useScrollReveal('.staggered-grid > .reveal-on-scroll', { threshold: 0.1 });

  useEffect(() => {
    loadPosts();
  }, [currentLanguage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data ? data.map((p) => transformBlogPostForDisplay(p, currentLanguage)) : []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const categories = [
    { id: "all", name: t("category.all") || "All" },
    { id: "basketball", name: t("category.basketball") },
    { id: "football", name: t("category.football") || "Football" },
  ];

  const filteredPosts = posts
    .filter(post => selectedCategory === "all" || post.category.toLowerCase() === selectedCategory.toLowerCase())
    .filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <>
      <SEO
        title="Sports Chronicle Blog - Latest Sports News & Analysis"
        description="The Sports Chronicle Blog: Expert sports analysis, training guides, and latest news covering basketball, soccer, swimming, football and more sports worldwide."
        canonicalUrl="https://the-sports-chronicle.vercel.app/blog"
        schemaType="WebPage"
      />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 reveal-on-scroll">
              {t("blog.title")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 reveal-on-scroll">
              {t("blog.subtitle")}
            </p>

            <div className="relative max-w-md mx-auto mb-8 reveal-on-scroll">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("blog.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2 reveal-on-scroll">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="category-pill btn-hover-lift"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-8 reveal-on-scroll">
            <p className="text-muted-foreground">
              {filteredPosts.length} {filteredPosts.length === 1 ? t("blog.articleFound") : t("blog.articlesFound")}
            </p>
          </div>

          {/* Blog Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t("blog.noArticles")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
