import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User as UserIcon, Mail, Edit, Save, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner"; // Using sonner for toasts
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";
import { useSession } from "@/components/SessionContextProvider";
import { Tables } from "@/integrations/supabase/types";
import LoadingScreen from "@/components/LoadingScreen"; // Import LoadingScreen

const profileSchema = z.object({
  display_name: z.string().min(2, { message: "Display name must be at least 2 characters." }).max(50, { message: "Display name must not be longer than 50 characters." }).optional(),
  bio: z.string().max(500, { message: "Bio must not be longer than 500 characters." }).optional(),
  avatar_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { t } = useTranslation();
  const { session, isLoading: isSessionLoading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  // Redirect if not authenticated and session is loaded
  React.useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate("/signin");
      toast.error("You must be logged in to view your profile.");
    }
  }, [session, isSessionLoading, navigate]);

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery<Tables<'profiles'> | null, Error>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // Changed to maybeSingle()

      if (error) throw error;
      return data; // data will be null if no profile found
    },
    enabled: !!userId, // Only run query if userId is available
  });

  const createProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          display_name: values.display_name || userEmail?.split('@')[0] || "New User",
          bio: values.bio,
          avatar_url: values.avatar_url,
          first_name: values.display_name?.split(' ')[0] || null,
          last_name: values.display_name?.split(' ').slice(1).join(' ') || null,
          preferred_language: 'en', // Default language
        })
        .select()
        .single();

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Profile created successfully!");
      setIsEditing(false);
    },
    onError: (err) => {
      console.error("Error creating profile:", err);
      toast.error("Failed to create profile. Please try again.");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: (err) => {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile. Please try again.");
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      bio: "",
      avatar_url: "",
    },
    mode: "onChange",
  });

  // Use useEffect to reset form values when profile data changes
  React.useEffect(() => {
    if (profile) {
      form.reset({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile, form.reset]);

  const [isEditing, setIsEditing] = React.useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    } else {
      toast.success("You have been signed out.");
      navigate("/signin");
    }
  };

  const onSubmit = (values: ProfileFormValues) => {
    if (!profile) {
      createProfileMutation.mutate(values);
    } else {
      updateProfileMutation.mutate(values);
    }
  };

  if (isSessionLoading || isProfileLoading) {
    return <LoadingScreen message={t("common.loading")} />;
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{t("common.error")}: {profileError.message}</p>
      </div>
    );
  }

  // If no profile exists for the user, show a message and allow creation
  if (!profile && !isProfileLoading && session) {
    return (
      <React.Fragment>
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-2xl font-bold">
                {t("profile.noProfileTitle")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t("profile.noProfileDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.displayName")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("profile.yourDisplayName")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.bio")}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t("profile.yourBio")} {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.avatarUrl")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("profile.yourAvatarUrl")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createProfileMutation.isPending}>
                    {createProfileMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {t("profile.createProfile")}
                  </Button>
                </form>
              </Form>
              <div className="mt-8 pt-6 border-t flex justify-end">
                <Button variant="destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.signOut")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card>
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || "User Avatar"} />
              <AvatarFallback>
                {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12 text-muted-foreground" />}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="font-heading text-3xl font-bold">
              {profile.display_name || userEmail}
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> {userEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.displayName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("profile.yourDisplayName")} {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.bio")}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t("profile.yourBio")} {...field} disabled={!isEditing} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile.avatarUrl")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("profile.yourAvatarUrl")} {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => { setIsEditing(false); form.reset(profile); }}>
                        {t("common.cancel")}
                      </Button>
                      <Button type="submit" disabled={updateProfileMutation.isPending || !form.formState.isDirty}>
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        {t("common.save")}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("common.edit")}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
            <div className="mt-8 pt-6 border-t flex justify-end">
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.signOut")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;