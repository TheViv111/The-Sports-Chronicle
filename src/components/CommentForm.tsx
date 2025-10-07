import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSession } from '@/components/SessionContextProvider';

const commentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty." }).max(500, { message: "Comment must not be longer than 500 characters." }),
});

interface CommentFormProps {
  postId: string;
  onCommentPosted?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentPosted }) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  const postCommentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof commentSchema>) => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated.");
      }
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: session.user.id,
          content: values.content,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      form.reset();
      toast.success(t("comments.postSuccess"));
      queryClient.invalidateQueries({ queryKey: ['comments', postId] }); // Invalidate to refetch comments
      onCommentPosted?.();
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
      toast.error(t("comments.postError"), {
        description: error.message || t("common.error"),
      });
    },
  });

  const onSubmit = (values: z.infer<typeof commentSchema>) => {
    postCommentMutation.mutate(values);
  };

  if (!session) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t("comments.signInToComment")}
      </div>
    );
  }

  return (
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
                  disabled={postCommentMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={postCommentMutation.isPending}>
          {postCommentMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {t("comments.postComment")}
        </Button>
      </form>
    </Form>
  );
};

export default CommentForm;