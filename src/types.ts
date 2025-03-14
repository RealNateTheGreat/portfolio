export interface User {
  id: string;
  email: string;
  display_name?: string;
  profileImage?: string;
  role?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  rank?: number;
  created_at?: string;
}

export type Permission = 
  | 'DELETE_ANNOUNCEMENT'
  | 'CREATE_ANNOUNCEMENT'
  | 'ADD_USERS'
  | 'DELETE_USERS'
  | 'MANAGE_PERMISSIONS'
  | 'ADMINISTRATOR';

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name?: string | null;
          profile_image: string | null;
          created_at: string;
          role?: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          profile_image?: string | null;
          created_at?: string;
          role?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          profile_image?: string | null;
          created_at?: string;
          role?: string | null;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description?: string | null;
          permissions: Permission[];
          rank?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions: Permission[];
          rank?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: Permission[];
          rank?: number;
          created_at?: string;
        };
      };
    };
  };
}