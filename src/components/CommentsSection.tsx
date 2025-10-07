import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, User as UserIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";
import { Tables } from "@/integrations/supabase/types";

// Define a more precise type for comments including the joined profile data
type CommentWithProfile = Tables<'comments'> & {
  profiles: Pick<Tables<'profiles'>, 'display_name' | 'avatar_url'> | null;
};

const commentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty." }).max(500, { message: "Comment is too long." }),
});

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState<Pick<Tables<'profiles'>, 'display_name' | 'avatar_url'> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUser(profile);
        } else if (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (profile) setUser(profile);
            else if (error) console.error("Error fetching profile on auth change:", error);
          });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const { data: comments, isLoading, error } = useQuery<CommentWithProfile[], Error>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles (display_name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as CommentWithProfile[]; // Added 'unknown' cast
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (newComment: { content: string; postId: string; userId: string; authorName: string }) => {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: newComment.postId,
          user_id: newComment.userId,
          content: newComment.content,
          author_name: newComment.authorName,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success(t("comments.postSuccess"));
      form.reset();
    },
    onError: (err) => {
      console.error("Error posting comment:", err);
      toast.error(t("comments.postError"));
    },
  });

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof commentSchema>) => {
    if (!isAuthenticated || !user) {
      toast.error(t("comments.signInRequired"));
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session && user.display_name) {
      addCommentMutation.mutate({
        content: values.content,
        postId,
        userId: session.user.id,
        authorName: user.display_name,
      });
    }
  };

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> {t("comments.title")} ({comments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("comments.writeComment")}
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={addCommentMutation.isPending}>
                {addCommentMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  t("comments.postComment")
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            {t("comments.signInToComment")}
          </p>
        )}

        <div className="mt-8 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">{t("common.loading")}</span>
            </div>
          ) : error ? (
            <p className="text-destructive text-center py-8">{t("common.error")}</p>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3 border-b pb-4 last:border-b-0 last:pb-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {comment.profiles?.display_name ? comment.profiles.display_name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">
                      {comment.profiles?.display_name || comment.author_name || "Anonymous"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t("comments.noComments")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;