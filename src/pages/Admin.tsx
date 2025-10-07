import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Using sonner for toasts
import { Trash2, Edit, Plus, Loader2, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types"; // Import Supabase types

type BlogPost = Tables<'blog_posts'>; // Use Supabase type for blog posts

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Check if already authenticated on component mount
  useEffect(() => {
    const auth = localStorage.getItem("admin_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadPosts();
    }
  }, []);

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
      toast.error("Error loading posts", {
        description: "Failed to load blog posts from database.",
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
      await loadPosts();
      toast.success("Login successful!", {
        description: "Welcome to the admin dashboard.",
      });
    } else {
      toast.error("Login failed", {
        description: "Invalid username or password.",
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
    toast.info("Logged out", {
      description: "You have been logged out successfully.",
    });
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get("title") as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title,
          excerpt: formData.get("excerpt") as string,
          content: formData.get("content") as string,
          category: formData.get("category") as string,
          slug,
          read_time: "5 min read",
          author: "Sports Chronicle Team",
          language: "en"
        })
        .select()
        .single();

      if (error) throw error;

      setPosts([data, ...posts]);
      (e.target as HTMLFormElement).reset();
      setActiveTab("posts"); // Switch back to posts list
      
      toast.success("Post created!", {
        description: "Your blog post has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Error creating post", {
        description: "Failed to create blog post. Please try again.",
      });
    }
  };

  const handleUpdatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPost) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          title,
          excerpt: formData.get("excerpt") as string,
          content: formData.get("content") as string,
          category: formData.get("category") as string,
          slug,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPost.id)
        .select()
        .single();

      if (error) throw error;

      setPosts(posts.map(post => post.id === editingPost.id ? data : post));
      setEditingPost(null);
      setActiveTab("posts"); // Switch back to posts list
      
      toast.success("Post updated!", {
        description: "Your blog post has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error("Error updating post", {
        description: "Failed to update blog post. Please try again.",
      });
    }
  };

  const startEditingPost = (post: BlogPost) => {
    setEditingPost(post);
    setActiveTab("create"); // Switch to the create/edit tab
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast.success("Post deleted!", {
        description: "The blog post has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Error deleting post", {
        description: "Failed to delete blog post. Please try again.",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <Link to="/">
              <Button variant="ghost" className="btn-hover-lift">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-muted rounded text-sm text-muted-foreground">
              <p><strong>Demo credentials:</strong></p>
              <p>Username: admin</p>
              <p>Password: admin123</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your blog posts and content</p>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" className="btn-hover-lift">
                <Home className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="posts">Manage Posts</TabsTrigger>
            <TabsTrigger value="create">
              {editingPost ? "Edit Post" : "Create Post"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>
                  Manage your existing blog posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading posts...</span>
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
                              {new Date(post.created_at).toLocaleDateString("en-US", { 
                                year: "numeric", 
                                month: "short", 
                                day: "numeric" 
                              })} • {post.read_time || "5 min read"}
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
                  {editingPost ? "Edit Post" : "Create New Post"}
                </CardTitle>
                <CardDescription>
                  {editingPost 
                    ? "Update the details of your blog post"
                    : "Add a new blog post to your website"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form 
                  onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={editingPost?.title || ""}
                      placeholder="Enter post title"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingPost?.category || ""}
                      placeholder="e.g. Basketball, Soccer, Swimming"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      defaultValue={editingPost?.excerpt || ""}
                      placeholder="Brief description of the post"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      defaultValue={editingPost?.content || ""}
                      placeholder="Write your blog post content here..."
                      required
                      className="mt-1 min-h-[300px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Plus className="h-4 w-4 mr-2" />
                      {editingPost ? "Update Post" : "Create Post"}
                    </Button>
                    {editingPost && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setEditingPost(null);
                          setActiveTab("posts");
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;