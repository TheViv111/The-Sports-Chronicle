import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquare } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/contexts/TranslationContext';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [realtimeComments, setRealtimeComments] = useState<Tables<'comments'>[]>([]);

  const { data: initialComments, isLoading, error } = useQuery<Tables<'comments'>[], Error>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (initialComments) {
      setRealtimeComments(initialComments);
    }
  }, [initialComments]);

  useEffect(() => {
    const channel = supabase
      .channel(`comments_for_post_${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const newComment = payload.new as Tables<'comments'>;
          setRealtimeComments((prevComments) => [newComment, ...prevComments]);
          queryClient.invalidateQueries({ queryKey: ['comments', postId] }); // Keep cache fresh
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t("comments.loadingComments")}</span>
      </div>
    );
  }

  if (error) {
    console.error("Error loading comments:", error);
    return (
      <div className="text-center py-8 text-destructive">
        <p>{t("common.error")}: {error.message}</p>
      </div>
    );
  }

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> {t("comments.title")} ({realtimeComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CommentForm postId={postId} />

        <div className="mt-8 border-t pt-4">
          {realtimeComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("comments.noComments")}
            </p>
          ) : (
            <div className="space-y-4">
              {realtimeComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;