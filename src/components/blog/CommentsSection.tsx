import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquare } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/contexts/TranslationContext';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

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
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> {t("comments.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" /> {/* Comment form skeleton */}
            <div className="flex items-center space-x-3 p-4 border-b last:border-b-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border-b last:border-b-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
    <Card className="mt-12 reveal-on-scroll">
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