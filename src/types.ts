export interface User {
  id: string;
  email: string;
  profileImage?: string;
  role: Role;
}

export interface Role {
  name: string;
  color: string;
  icon: string;
  permissions: Permission[];
}

export type Permission = 
  | 'DELETE_ANNOUNCEMENT'
  | 'CREATE_ANNOUNCEMENT'
  | 'ADD_USERS'
  | 'DELETE_USERS'
  | 'MANAGE_PERMISSIONS'
  | 'ADMINISTRATOR';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  active: boolean;
  created_by: {
    email: string;
    profile_image: string;
  };
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          profile_image: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          profile_image?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          profile_image?: string | null;
          role?: string;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_at: string;
          created_by: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          created_at?: string;
          created_by: string;
          active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          created_by?: string;
          active?: boolean;
        };
      };
    };
  };
}