// Database types for Supabase
// These types mirror the database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string | null
          ens_name: string | null
          email: string | null
          username: string | null
          display_name: string | null
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          tagline: string | null
          level: number
          experience_points: number
          city: string | null
          country: string | null
          birthday: string | null
          occupation: string | null
          status: string | null
          created_at: string
          updated_at: string
          last_seen_at: string
          is_verified: boolean
          profile_completion: number
          // Web2 auth fields
          password_hash: string | null
          email_verified: boolean
          email_verification_token: string | null
          email_verification_expires_at: string | null
          password_reset_token: string | null
          password_reset_expires_at: string | null
          auth_method: 'web3' | 'email' | 'both'
          login_attempts: number
          locked_until: string | null
        }
        Insert: {
          id?: string
          wallet_address?: string | null
          ens_name?: string | null
          email?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          tagline?: string | null
          level?: number
          experience_points?: number
          city?: string | null
          country?: string | null
          birthday?: string | null
          occupation?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string
          is_verified?: boolean
          profile_completion?: number
          password_hash?: string | null
          email_verified?: boolean
          email_verification_token?: string | null
          email_verification_expires_at?: string | null
          password_reset_token?: string | null
          password_reset_expires_at?: string | null
          auth_method?: 'web3' | 'email' | 'both'
          login_attempts?: number
          locked_until?: string | null
        }
        Update: {
          id?: string
          wallet_address?: string | null
          ens_name?: string | null
          email?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          tagline?: string | null
          level?: number
          experience_points?: number
          city?: string | null
          country?: string | null
          birthday?: string | null
          occupation?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string
          is_verified?: boolean
          profile_completion?: number
          password_hash?: string | null
          email_verified?: boolean
          email_verification_token?: string | null
          email_verification_expires_at?: string | null
          password_reset_token?: string | null
          password_reset_expires_at?: string | null
          auth_method?: 'web3' | 'email' | 'both'
          login_attempts?: number
          locked_until?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          post_type: string
          content: string | null
          visibility: string
          created_at: string
          updated_at: string
          likes_count: number
          comments_count: number
          shares_count: number
        }
        Insert: {
          id?: string
          author_id: string
          post_type?: string
          content?: string | null
          visibility?: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
          shares_count?: number
        }
        Update: {
          id?: string
          author_id?: string
          post_type?: string
          content?: string | null
          visibility?: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
          shares_count?: number
        }
      }
      post_media: {
        Row: {
          id: string
          post_id: string
          media_type: string
          url: string
          thumbnail_url: string | null
          title: string | null
          duration: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          media_type: string
          url: string
          thumbnail_url?: string | null
          title?: string | null
          duration?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          media_type?: string
          url?: string
          thumbnail_url?: string | null
          title?: string | null
          duration?: string | null
          order_index?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
          likes_count: number
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          parent_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
          likes_count?: number
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
          likes_count?: number
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          likeable_type: string
          likeable_id: string
          reaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          likeable_type: string
          likeable_id: string
          reaction_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          likeable_type?: string
          likeable_id?: string
          reaction_type?: string
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          avatar_url: string | null
          cover_url: string | null
          cover_image: string | null
          category: string | null
          privacy: 'public' | 'private' | 'secret'
          is_private: boolean
          is_verified: boolean
          is_active: boolean
          owner_id: string | null
          created_by: string | null
          member_count: number
          members_count: number
          posts_count: number
          created_at: string
          updated_at: string
          last_activity_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          cover_image?: string | null
          category?: string | null
          privacy?: 'public' | 'private' | 'secret'
          is_private?: boolean
          is_verified?: boolean
          is_active?: boolean
          owner_id?: string | null
          created_by?: string | null
          member_count?: number
          members_count?: number
          posts_count?: number
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          cover_image?: string | null
          category?: string | null
          privacy?: 'public' | 'private' | 'secret'
          is_private?: boolean
          is_verified?: boolean
          is_active?: boolean
          owner_id?: string | null
          created_by?: string | null
          member_count?: number
          members_count?: number
          posts_count?: number
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
      }
      group_memberships: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          status: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          status?: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          status?: string
          joined_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          cover_image: string | null
          location: string | null
          event_date: string
          start_date: string
          event_time: string | null
          end_date: string | null
          end_time: string | null
          organizer_id: string | null
          created_by: string | null
          group_id: string | null
          is_online: boolean
          is_virtual: boolean
          online_url: string | null
          max_participants: number | null
          max_attendees: number
          participants_count: number
          attendee_count: number
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          cover_image?: string | null
          location?: string | null
          event_date?: string
          start_date?: string
          event_time?: string | null
          end_date?: string | null
          end_time?: string | null
          organizer_id?: string | null
          created_by?: string | null
          group_id?: string | null
          is_online?: boolean
          is_virtual?: boolean
          online_url?: string | null
          max_participants?: number | null
          max_attendees?: number
          participants_count?: number
          attendee_count?: number
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          cover_image?: string | null
          location?: string | null
          event_date?: string
          start_date?: string
          event_time?: string | null
          end_date?: string | null
          end_time?: string | null
          organizer_id?: string | null
          created_by?: string | null
          group_id?: string | null
          is_online?: boolean
          is_virtual?: boolean
          online_url?: string | null
          max_participants?: number | null
          max_attendees?: number
          participants_count?: number
          attendee_count?: number
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          experience_points: number
          xp_reward: number
          category: string | null
          rarity: string
          requirements: Json | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          experience_points?: number
          xp_reward?: number
          category?: string | null
          rarity?: string
          requirements?: Json | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          experience_points?: number
          xp_reward?: number
          category?: string | null
          rarity?: string
          requirements?: Json | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
      }
      siwe_nonces: {
        Row: {
          id: string
          nonce: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          nonce: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          nonce?: string
          created_at?: string
          expires_at?: string
        }
      }
      siwe_sessions: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          nonce: string
          issued_at: string
          expires_at: string
          is_valid: boolean
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          nonce: string
          issued_at?: string
          expires_at: string
          is_valid?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          wallet_address?: string
          nonce?: string
          issued_at?: string
          expires_at?: string
          is_valid?: boolean
        }
      }
      // Admin tables
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'moderator' | 'admin' | 'super_admin'
          granted_by: string | null
          granted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'moderator' | 'admin' | 'super_admin'
          granted_by?: string | null
          granted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'moderator' | 'admin' | 'super_admin'
          granted_by?: string | null
          granted_at?: string
        }
      }
      content_reports: {
        Row: {
          id: string
          reporter_id: string
          content_type: string
          content_id: string
          reason: string
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          reviewed_by: string | null
          reviewed_at: string | null
          resolution_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          content_type: string
          content_id: string
          reason: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          reviewed_by?: string | null
          reviewed_at?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          content_type?: string
          content_id?: string
          reason?: string
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          reviewed_by?: string | null
          reviewed_at?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
      }
      user_suspensions: {
        Row: {
          id: string
          user_id: string
          suspended_by: string
          reason: string
          suspension_type: 'warning' | 'temporary' | 'permanent'
          ends_at: string | null
          is_active: boolean
          lifted_by: string | null
          lifted_at: string | null
          lift_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          suspended_by: string
          reason: string
          suspension_type: 'warning' | 'temporary' | 'permanent'
          ends_at?: string | null
          is_active?: boolean
          lifted_by?: string | null
          lifted_at?: string | null
          lift_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          suspended_by?: string
          reason?: string
          suspension_type?: 'warning' | 'temporary' | 'permanent'
          ends_at?: string | null
          is_active?: boolean
          lifted_by?: string | null
          lifted_at?: string | null
          lift_reason?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string
          action: string
          target_type: string | null
          target_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id: string
          action: string
          target_type?: string | null
          target_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string
          action?: string
          target_type?: string | null
          target_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          category: string | null
          is_public: boolean
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          category?: string | null
          is_public?: boolean
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          category?: string | null
          is_public?: boolean
          updated_by?: string | null
          updated_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty: string
          xp_reward: number
          requirements: Json | null
          is_daily: boolean
          is_weekly: boolean
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category?: string
          difficulty?: string
          xp_reward?: number
          requirements?: Json | null
          is_daily?: boolean
          is_weekly?: boolean
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          xp_reward?: number
          requirements?: Json | null
          is_daily?: boolean
          is_weekly?: boolean
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_sessions: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          issued_at: string
          expires_at: string
          is_valid: boolean
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          issued_at?: string
          expires_at: string
          is_valid?: boolean
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          issued_at?: string
          expires_at?: string
          is_valid?: boolean
          ip_address?: string | null
          user_agent?: string | null
        }
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
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type User = Tables<'users'>
export type Post = Tables<'posts'>
export type PostMedia = Tables<'post_media'>
export type Comment = Tables<'comments'>
export type Like = Tables<'likes'>
export type Friendship = Tables<'friendships'>
export type Group = Tables<'groups'>
export type GroupMembership = Tables<'group_memberships'>
export type Event = Tables<'events'>
export type Badge = Tables<'badges'>
export type UserBadge = Tables<'user_badges'>
export type Notification = Tables<'notifications'>
export type SiweNonce = Tables<'siwe_nonces'>
export type SiweSession = Tables<'siwe_sessions'>
// Admin types
export type UserRoleRow = Tables<'user_roles'>
export type ContentReport = Tables<'content_reports'>
export type UserSuspension = Tables<'user_suspensions'>
export type AuditLog = Tables<'audit_logs'>
export type SystemSetting = Tables<'system_settings'>
export type Quest = Tables<'quests'>
export type EmailSession = Tables<'email_sessions'>
