export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AdminPermission = 'create_announcements' | 'create_servers' | 'manage_users';

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          username: string
          password_hash: string
          email: string | null
          display_name: string | null
          is_active: boolean
          permissions: AdminPermission[]
          level: number
          role_name: string | null
          role_color: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          email?: string | null
          display_name?: string | null
          is_active?: boolean
          permissions?: AdminPermission[]
          level?: number
          role_name?: string | null
          role_color?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          email?: string | null
          display_name?: string | null
          is_active?: boolean
          permissions?: AdminPermission[]
          level?: number
          role_name?: string | null
          role_color?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: number
          title: string
          content: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      servers: {
        Row: {
          id: number
          name: string
          role: string
          members: string
          duration: string
          banner: string
          icon: string
          description: string
          responsibilities: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          role: string
          members: string
          duration: string
          banner: string
          icon: string
          description: string
          responsibilities: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          role?: string
          members?: string
          duration?: string
          banner?: string
          icon?: string
          description?: string
          responsibilities?: string[]
          created_at?: string
          updated_at?: string
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