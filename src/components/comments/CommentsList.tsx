import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/contexts/TranslationContext";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentsListProps {
  postId: string;
}

// Type for the comment data from the database
interface CommentRow {
  id: string;
  post_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  is_edited?: boolean;
}

// Type for the user profile data
interface ProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

// Type for the comment data we'll be working with
type CommentData = CommentRow & {
  profiles?: ProfileData | null;
};

const CommentsList: React.FC<CommentsListProps> = ({ postId }) => {
  const { t } = useTranslation();

  const { 
    data: comments = [], 
    isLoading, 
    error 
  } = useQuery<CommentData[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      try {
        // First, get the comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select('*')
          .eq("post_id", postId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (commentsError) throw commentsError;
        if (!commentsData) return [];

        // Get unique user IDs
        const userIds = Array.from(
          new Set(
            commentsData
              .map((comment) => comment.user_id)
              .filter((id): id is string => Boolean(id))
          )
        );

        // If no user IDs, return comments without profile data
        if (userIds.length === 0) {
          return commentsData.map((comment) => ({
            ...comment,
            profiles: null
          }));
        }

        // Get user profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select('id, display_name, avatar_url')
          .in('id', userIds) as { data: ProfileData[] | null, error: any };
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          return commentsData.map(comment => ({
            ...comment,
            profiles: null
          }));
        }
        
        // Create a map of user profiles
        const profilesMap = new Map(
          (profilesData || []).map((profile) => [profile.id, profile])
        );
        
        // Combine comments with their respective profiles
        return commentsData.map((comment) => ({
          ...comment,
          profiles: comment.user_id ? profilesMap.get(comment.user_id) || null : null
        }));
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Error loading comments:", error);
    return (
      <div className="text-red-500 p-4">
        {t("comments.errorLoading") || "Error loading comments. Please try again."}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-4">
        {t("comments.noComments") || "No comments yet. Be the first to comment!"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => {
        const displayName = comment.profiles?.display_name || comment.author_name || t("comments.anonymousUser") || "Anonymous";
        const avatarUrl = comment.profiles?.avatar_url || undefined;
        const profileLink = comment.user_id ? `/users/${comment.user_id}` : undefined;
        const isEdited = comment.is_edited || 
                        (comment.updated_at && 
                         comment.updated_at !== comment.created_at);
        const formattedDate = new Date(comment.created_at).toLocaleString();

        return (
          <div key={comment.id} className="group relative">
            <div className="flex gap-3">
              {profileLink ? (
                <Link to={profileLink} className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {profileLink ? (
                    <Link to={profileLink} className="font-medium hover:underline">
                      {displayName}
                    </Link>
                  ) : (
                    <span className="font-medium">{displayName}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formattedDate}
                    {isEdited && (
                      <span className="ml-1 text-xs text-muted-foreground italic">
                        (edited)
                      </span>
                    )}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentsList;