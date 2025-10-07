import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import LoadingScreen from "@/components/LoadingScreen"; // Import LoadingScreen

type BlogPostType = Tables<'blog_posts'>;

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
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
    { id: "soccer", name: t("category.soccer") },
    { id: "swimming", name: t("category.swimming") || "Swimming" },
  ];

  const filteredPosts = posts
    .filter(post => selectedCategory === "all" || post.category.toLowerCase() === selectedCategory.toLowerCase())
    .filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            {t("blog.title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {t("blog.subtitle")}
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("blog.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="category-pill"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Count */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            {filteredPosts.length} {filteredPosts.length === 1 ? t("blog.articleFound") : t("blog.articlesFound")}
          </p>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <LoadingScreen message={t("latestPosts.loading")} />
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogCard 
                key={post.id} 
                post={{
                  ...post,
                  date: new Date(post.created_at).toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "short", 
                    day: "numeric" 
                  }),
                  readTime: post.read_time || "5 min read",
                  image: post.cover_image || "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg"
                }} 
              />
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
  );
};

export default Blog;