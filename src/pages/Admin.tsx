import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

type AdminTab = 'posts' | 'create' | 'edit';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Edit, Loader2, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/contexts/TranslationContext";
import BlogPostForm from "@/components/blog/BlogPostForm";
import { formatBlogPostDate } from "@/lib/blog-utils";
import { SEO } from "@/components/common/SEO";
import { BlogPost } from "@/types/supabase";
import Header from "@/components/layout/Header";

// Define the form values type
type BlogPostFormValues = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image?: string;
};

interface AdminProps {
  tab?: 'posts' | 'create' | 'edit';
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const navigate = useNavigate();
  const { tab: tabParam = 'posts', id } = useParams<{ tab?: AdminTab; id?: string }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>('posts');
  const { t } = useTranslation();

  useEffect(() => {
    const auth = localStorage.getItem("admin_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadPosts();
    }
  }, []);

  useEffect(() => {
    if (location.pathname.includes('edit/')) {
      setActiveTab('edit');
    } else if (tabParam && (tabParam === 'posts' || tabParam === 'create' || tabParam === 'edit')) {
      setActiveTab(tabParam);
    } else {
      navigate('/admin/posts', { replace: true });
    }
  }, [tabParam, location.pathname, navigate]);

  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get('tab') || 'posts';
      if (tab && (tab === 'posts' || tab === 'create' || tab === 'edit') && tab !== activeTab) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab]);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error(t("admin.errorLoadingPosts"), {
        description: t("admin.failedToLoadPosts"),
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
      await loadPosts();
      toast.success(t("admin.loginSuccess"), {
        description: t("admin.welcomeDashboard"),
      });
    } else {
      toast.error(t("admin.loginFailed"), {
        description: t("admin.invalidCredentials"),
      });
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
    setUsername("");
    setPassword("");
    setPosts([]);
    toast.info(t("admin.loggedOut"), {
      description: t("admin.loggedOutSuccessfully"),
    });
  };

  const handleCreateOrUpdatePost = async (values: BlogPostFormValues) => {
    setIsLoading(true);
    const slug = values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const now = new Date().toISOString();

    try {
      if (editingPost) {
        // Update existing post
        const { data, error } = await supabase
          .from('blog_posts')
          .update<Partial<BlogPost>>({
            title: values.title,
            excerpt: values.excerpt,
            content: values.content,
            category: values.category,
            cover_image: values.cover_image || null,
            slug,
            updated_at: now
          })
          .eq('id', editingPost.id)
          .select()
          .single();

        if (error) throw error;

        setPosts(posts.map(post => post.id === editingPost.id ? { ...post, ...data } : post));
        setEditingPost(null);
        toast.success(t("admin.postUpdated"), {
          description: t("admin.postUpdatedSuccess"),
        });
      } else {
        // Create new post
        const newPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> = {
          title: values.title,
          excerpt: values.excerpt,
          content: values.content,
          category: values.category,
          cover_image: values.cover_image || null,
          slug,
          read_time: "5 min read",
          author: "Sports Chronicle Team",
          language: "en"
        };

        const { data, error } = await supabase
          .from('blog_posts')
          .insert<typeof newPost>(newPost)
          .select()
          .single();

        if (error) throw error;

        setPosts([data as BlogPost, ...posts]);
        toast.success(t("admin.postCreated"), {
          description: t("admin.postCreatedSuccess"),
        });
      }
      setActiveTab("posts");
    } catch (error) {
      console.error(`Error ${editingPost ? 'updating' : 'creating'} post:`, error);
      toast.error(editingPost ? t("admin.errorUpdatingPost") : t("admin.errorCreatingPost"), {
        description: editingPost ? t("admin.failedToUpdatePost") : t("admin.failedToCreatePost"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingPost = (post: BlogPost) => {
    setEditingPost(post);
    navigate(`/admin/edit/${post.id}`);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    navigate('/admin/posts');
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast.success(t("admin.postDeleted"), {
        description: t("admin.postDeletedSuccess"),
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(t("admin.errorDeletingPost"), {
        description: t("admin.failedToDeletePost"),
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <SEO 
          title="Admin Dashboard - The Sports Chronicle"
          description="Manage blog posts, categories and site settings for The Sports Chronicle."
          canonicalUrl="https://thesportschronicle.com/admin"
          schemaType="WebPage"
        />
        <Header />
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <Link to="/">
                <Button variant="ghost" className="btn-hover-lift">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("common.backToSite")}
                </Button>
              </Link>
            </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t("admin.loginTitle")}</CardTitle>
              <CardDescription className="text-center">
                {t("admin.loginSubtitle")}
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">{t("admin.username")}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("admin.username")}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">{t("admin.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("admin.password")}
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t("admin.loggingIn") : t("admin.loginButton")}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Admin Dashboard - The Sports Chronicle"
        description="Manage blog posts, categories and site settings for The Sports Chronicle."
        canonicalUrl="https://thesportschronicle.com/admin"
        schemaType="WebPage"
      />
      <Header />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">{t("admin.dashboardTitle")}</h1>
            <p className="text-muted-foreground">{t("admin.dashboardSubtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" className="btn-hover-lift">
                <Home className="h-4 w-4 mr-2" />
                {t("common.backToSite")}
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              {t("admin.logout")}
            </Button>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value: string) => {
            if (value === 'edit') return; // Handle edit case separately
            navigate(`/admin/${value}`);
          }} 
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="posts">{t("admin.managePosts")}</TabsTrigger>
            <TabsTrigger value="create">
              {editingPost ? t("admin.editPost") : t("admin.createPost")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.blogPosts")}</CardTitle>
                <CardDescription>
                  {t("admin.manageExistingPosts")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">{t("admin.loadingPosts")}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{post.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatBlogPostDate(post.created_at)} • {post.read_time || "5 min read"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditingPost(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingPost ? t("admin.editPost") : t("admin.createPost")}
                </CardTitle>
                <CardDescription>
                  {editingPost
                    ? t("admin.updatePostDetails")
                    : t("admin.addNewPost")
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlogPostForm
                  initialData={editingPost}
                  onSubmit={handleCreateOrUpdatePost}
                  onCancel={editingPost ? handleCancelEdit : undefined}
                  isSubmitting={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('Admin render error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-xl font-semibold mb-2">An error occurred while rendering this page.</h2>
          <pre className="text-sm whitespace-pre-wrap break-words bg-muted p-3 rounded">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default function AdminWithBoundary() {
  return (
    <ErrorBoundary>
      <Admin />
    </ErrorBoundary>
  );
}
