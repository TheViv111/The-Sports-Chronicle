export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string;
          author: string;
          category: string;
          content: string | null;
          cover_image: string | null;
          created_at: string;
          excerpt: string;
          language: string;
          read_time: string | null;
          slug: string;
          title: string;
          updated_at: string;
          translations: Json | null;
          status: string;
          published_at: string | null;
          scheduled_publish_at: string | null;
        };
        Insert: {
          id?: string;
          author?: string;
          category: string;
          content?: string | null;
          cover_image?: string | null;
          created_at?: string;
          excerpt: string;
          language?: string;
          read_time?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
          translations?: Json | null;
          status?: string;
          published_at?: string | null;
          scheduled_publish_at?: string | null;
        };
        Update: {
          id?: string;
          author?: string;
          category?: string;
          content?: string | null;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string;
          language?: string;
          read_time?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
          translations?: Json | null;
          status?: string;
          published_at?: string | null;
          scheduled_publish_at?: string | null;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string | null;
          author_name: string;
          content: string;
          created_at: string;
          updated_at: string | null;
          deleted_at: string | null;
          is_edited: boolean;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string | null;
          author_name: string;
          content: string;
          created_at?: string;
          updated_at?: string | null;
          deleted_at?: string | null;
          is_edited?: boolean;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string | null;
          author_name?: string;
          content?: string;
          created_at?: string;
          updated_at?: string | null;
          deleted_at?: string | null;
          is_edited?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "blog_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_translations: {
        Row: {
          blog_id: string
          category: string
          content: string | null
          created_at: string
          excerpt: string
          id: string
          is_auto_translated: boolean | null
          language: string
          title: string
          translated_at: string | null
          translation_quality_score: number | null
          translation_status: string | null
          translation_version: number | null
          translator_notes: string | null
          updated_at: string
          word_count: number | null
        }
        Insert: {
          blog_id: string
          category: string
          content?: string | null
          created_at?: string
          excerpt: string
          id?: string
          is_auto_translated?: boolean | null
          language: string
          title: string
          translated_at?: string | null
          translation_quality_score?: number | null
          translation_status?: string | null
          translation_version?: number | null
          translator_notes?: string | null
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          blog_id?: string
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_auto_translated?: boolean | null
          language?: string
          title?: string
          translated_at?: string | null
          translation_quality_score?: number | null
          translation_status?: string | null
          translation_version?: number | null
          translator_notes?: string | null
          updated_at?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_translations_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_cache: {
        Row: {
          created_at: string
          id: string
          last_used_at: string
          source_language: string
          source_text_hash: string
          target_language: string
          translated_text: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_used_at?: string
          source_language: string
          source_text_hash: string
          target_language: string
          translated_text: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_used_at?: string
          source_language?: string
          source_text_hash?: string
          target_language?: string
          translated_text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      translation_jobs: {
        Row: {
          blog_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_duration_minutes: number | null
          id: string
          job_status: string | null
          priority: number | null
          retry_count: number | null
          source_language: string
          started_at: string | null
          target_language: string
          updated_at: string
        }
        Insert: {
          blog_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          job_status?: string | null
          priority?: number | null
          retry_count?: number | null
          source_language?: string
          started_at?: string | null
          target_language: string
          updated_at?: string
        }
        Update: {
          blog_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          job_status?: string | null
          priority?: number | null
          retry_count?: number | null
          source_language?: string
          started_at?: string | null
          target_language?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_jobs_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_segments: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          original_text: string
          quality_score: number | null
          segment_order: number | null
          segment_type: string
          translated_text: string | null
          translation_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          original_text: string
          quality_score?: number | null
          segment_order?: number | null
          segment_type: string
          translated_text?: string | null
          translation_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          original_text?: string
          quality_score?: number | null
          segment_order?: number | null
          segment_type?: string
          translated_text?: string | null
          translation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_segments_translation_id_fkey"
            columns: ["translation_id"]
            isOneToOne: false
            referencedRelation: "blog_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_email: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

// Profile type for user data
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}

// Comment with profile data
export type CommentWithProfile = Tables<'comments'> & {
  profiles?: Profile | null;
};

export const Constants = {
  public: {
    Enums: {},
  },
} as const