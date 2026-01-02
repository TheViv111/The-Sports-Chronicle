import React from "react";
import LogoLoader from "@/components/common/LogoLoader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/contexts/TranslationContext";
import { useSession } from "@/components/auth/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = React.useState("");

  // Fetch current user's profile for display_name
  const userId = session?.user?.id || null;
  const { data: profile } = useQuery<any | null>({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<any | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const insertMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        throw new Error("Not authenticated");
      }

      const authorName = profile?.display_name ||
        session.user.email?.split("@")[0] ||
        t("comments.anonymousUser") ||
        "Anonymous";

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          content: content.trim(),
          author_name: authorName,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          is_edited: false
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['comments', postId]) || [];

      // Return a context with the previous value
      return { previousComments };
    },
    onError: (err: Error, _: void, context) => {
      console.error("Failed to post comment", err);
      toast.error(t("comments.postError") || "Failed to post comment. Please try again.");

      // Rollback to previous comments on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onSuccess: () => {
      setContent("");
      toast.success(t("comments.postSuccess") || "Comment posted successfully!");
    },
  });

  if (!session?.user) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground mb-3">{t("comments.signInRequired")}</p>
        <Button onClick={() => (window.location.href = "/signin")}>
          {t("auth.signIn") || "Sign In"}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!content.trim()) {
          toast.error(t("comments.writeComment") || "Write a comment...");
          return;
        }
        insertMutation.mutate();
      }}
      className="space-y-3"
    >
      <Textarea
        placeholder={t("comments.writeComment") || "Write a comment..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex justify-between items-center">
        <div>
          {insertMutation.isError && (
            <p className="text-sm text-red-500">
              {t("comments.postError") || "Failed to post comment"}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={insertMutation.isPending || !content.trim()}
          className="btn-hover-lift min-w-[120px]"
        >
          {insertMutation.isPending ? (
            <div className="flex items-center gap-2">
              <LogoLoader size="xs" />
              <span>{t("common.posting") || "Posting..."}</span>
            </div>
          ) : (
            t("comments.postComment") || "Post Comment"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;