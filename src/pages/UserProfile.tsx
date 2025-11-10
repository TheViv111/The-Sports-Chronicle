import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SEO } from "@/components/common/SEO";

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: profile, isLoading, error } = useQuery<Tables<'profiles'> | null>({
    queryKey: ["publicProfile", id],
    queryFn: async (): Promise<Tables<'profiles'> | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <>
      <SEO 
        title={`${profile?.display_name || 'User'} - Profile`}
        description="View user profile details on The Sports Chronicle."
        canonicalUrl={`https://thesportschronicle.com/users/${id}`}
        schemaType="ProfilePage"
      />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog">
            <Button variant="ghost" className="group btn-hover-lift mb-6">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </Button>
          </Link>
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User Avatar"} />
                <AvatarFallback>
                  {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12 text-muted-foreground" />}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="font-heading text-3xl font-bold">
                {profile?.display_name || "Unknown User"}
              </CardTitle>
              {error && (
                <CardDescription className="text-red-500">Failed to load profile.</CardDescription>
              )}
              {!profile && !error && (
                <CardDescription className="text-muted-foreground">User not found.</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {profile?.bio && (
                <p className="text-muted-foreground text-center">{profile.bio}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserProfile;