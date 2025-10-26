import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/contexts/TranslationContext';

interface CommentItemProps {
  comment: Tables<'comments'>;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const { t } = useTranslation();

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['profile', comment.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', comment.user_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!comment.user_id,
  });

  const formattedDate = new Date(comment.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isProfileLoading) {
    return (
      <div className="flex items-center space-x-3 p-4 border-b last:border-b-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (profileError) {
    console.error("Error fetching profile for comment:", profileError);
    return (
      <div className="flex items-start space-x-3 p-4 border-b last:border-b-0 text-destructive">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            <UserIcon className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{t("common.error")}</p>
          <p className="text-xs text-muted-foreground">Failed to load commenter info.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3 p-4 border-b last:border-b-0">
      <Avatar className="h-10 w-10">
        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User Avatar"} />
        <AvatarFallback>
          {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">{profile?.display_name || t("comments.anonymousUser")}</p>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        <p className="text-sm mt-1 text-foreground">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentItem;