import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTranslation } from "../contexts/TranslationContext";
import { BlogPost } from "../types/supabase";
import { formatBlogPostDate } from "../lib/blog-utils";
import { toast } from "sonner";
import { Trash2, Edit, Loader2, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import BlogPostForm from "../components/blog/BlogPostForm";
import { SEO } from "../components/common/SEO";
import Header from "../components/layout/Header";
import { calculateReadTime, getWordCount } from "../lib/read-time";

type AdminTab = 'posts' | 'create' | 'edit';

// Define the form values type
type BlogPostFormValues = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image?: string;
  author_id: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_publish_at?: string | null;
};

// Admin component handles its own tab state

const Admin = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const navigate = useNavigate();
  const { tab: tabParam = 'posts' } = useParams<{ tab?: AdminTab }>();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>('posts');
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        loadPosts();
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadPosts();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadPosts();
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    // Hardcoded team members from About page
    const teamMembers = [
      {
        id: 'team',
        full_name: 'The Sports Chronicle Team',
        username: 'team',
        email: 'team'
      },
      {
        id: 'vivaan-handa',
        full_name: 'Vivaan Handa',
        username: 'vivaan',
        email: 'vivaan'
      },
      {
        id: 'ved-mehta',
        full_name: 'Ved Mehta',
        username: 'ved',
        email: 'ved'
      },
      {
        id: 'shourya-gupta',
        full_name: 'Shourya Gupta',
        username: 'shourya',
        email: 'shourya'
      },
      {
        id: 'shaurya-gupta',
        full_name: 'Shaurya Gupta',
        username: 'shaurya2',
        email: 'shaurya2'
      }
    ];
    setAuthors(teamMembers);
  };

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
        setActiveTab(tab as AdminTab);
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

  const handleCreatePost = async (values: BlogPostFormValues) => {
    const slug = values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const now = new Date().toISOString();
    const readTime = calculateReadTime(values.content);
    const wordCount = getWordCount(values.content);

    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: values.title,
          excerpt: values.excerpt,
          content: values.content,
          category: values.category,
          cover_image: values.cover_image || null,
          slug,
          read_time: readTime,
          word_count: wordCount,
          author_id: values.author_id,
          status: values.status,
          published_at: values.status === 'published' ? now : null,
          scheduled_publish_at: values.scheduled_publish_at || null,
          created_at: now,
          updated_at: now
        } as any);

      if (error) throw error;

      toast.success(t("admin.postCreated"), {
        description: t("admin.postCreatedSuccess"),
      });
      loadPosts();
      setActiveTab('posts');
      navigate('/admin/posts');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(t("admin.errorCreatingPost"), {
        description: t("admin.failedToCreatePost"),
      });
    }
  };

  const handleUpdatePost = async (values: BlogPostFormValues) => {
    if (!editingPost) return; // Only allow updates, not creation

    const slug = values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const now = new Date().toISOString();

    // Calculate read time and word count
    const readTime = calculateReadTime(values.content);
    const wordCount = getWordCount(values.content);

    try {
      // Update existing post
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          title: values.title,
          excerpt: values.excerpt,
          content: values.content,
          category: values.category,
          cover_image: values.cover_image || null,
          slug,
          read_time: readTime,
          word_count: wordCount,
          author_id: values.author_id,
          status: values.status,
          published_at: values.status === 'published' && editingPost.status !== 'published' ? now : editingPost.published_at,
          scheduled_publish_at: values.scheduled_publish_at || null,
          updated_at: now
        } as any)
        .eq('id', editingPost.id)
        .select()
        .single();

      if (error) throw error;

      setPosts(posts.map(post => post.id === editingPost.id ? { ...post, ...data } : post));
      setEditingPost(null);
      toast.success(t("admin.postUpdated"), {
        description: t("admin.postUpdatedSuccess"),
      });
      setActiveTab("posts");
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(t("admin.errorUpdatingPost"), {
        description: t("admin.failedToUpdatePost"),
      });
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t("admin.accessDenied")}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t("admin.signInRequired")}
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <Button
              onClick={() => navigate('/signin')}
              className="w-full"
            >
              {t("auth.signIn")}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              {t("common.backToHome")}
            </Button>
          </div>
        </div>
      </div>
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
      <div className="min-h-screen pt-16 admin-page">
        <div className="container mx-auto px-4 py-12">
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
              <TabsTrigger value="create">{t("admin.createPost")}</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.createNewPost")}</CardTitle>
                  <CardDescription>
                    {t("admin.enterPostDetails")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BlogPostForm
                    onSubmit={handleCreatePost}
                    isSubmitting={false}
                    authors={authors}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{t("admin.blogPosts")}</CardTitle>
                      <CardDescription>
                        {t("admin.manageExistingPosts")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                      >
                        All
                      </Button>
                      <Button
                        variant={filterStatus === 'published' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('published')}
                      >
                        Published
                      </Button>
                      <Button
                        variant={filterStatus === 'draft' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('draft')}
                      >
                        Drafts
                      </Button>
                      <Button
                        variant={filterStatus === 'scheduled' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('scheduled')}
                      >
                        Scheduled
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingPosts ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">{t("admin.loadingPosts")}</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts
                        .filter(post => filterStatus === 'all' || post.status === filterStatus)
                        .map((post) => (
                          <div key={post.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{post.title}</h3>
                                  <Badge variant={
                                    post.status === 'published' ? 'default' :
                                      post.status === 'scheduled' ? 'secondary' : 'outline'
                                  }>
                                    {post.status || 'draft'}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground text-sm mb-2">
                                  {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{post.category}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {post.created_at ? formatBlogPostDate(post.created_at) : ''} • {post.read_time || "5 min read"}
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
                                  onClick={() => post.id && handleDeletePost(post.id)}
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

            {editingPost && (
              <TabsContent value="edit">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("admin.editPost")}</CardTitle>
                    <CardDescription>
                      {t("admin.updatePostDetails")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BlogPostForm
                      initialData={editingPost}
                      onSubmit={handleUpdatePost}
                      onCancel={handleCancelEdit}
                      isSubmitting={false}
                      authors={authors}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
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
