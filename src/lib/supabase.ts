import { createClient } from '@supabase/supabase-js';
import { Database, AdminPermission } from '../types/database.types';
import bcrypt from 'bcryptjs';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a client with types for public operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Create an admin client with service role key for bypassing RLS policies
export const adminSupabase = createClient<Database>(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// User type definitions
export interface AdminUser {
  id: string;
  username: string;
  email?: string | null;
  display_name?: string | null;
  permissions: AdminPermission[];
  level: number;
  role_name?: string | null;
  role_color?: string | null;
  profile_image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Create storage bucket if it doesn't exist
const ensureStorageBucket = async (): Promise<void> => {
  try {
    // Check if bucket exists first
    const { data: buckets } = await adminSupabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'admin-assets');
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error } = await adminSupabase.storage.createBucket('admin-assets', {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
      });
      
      if (error) {
        console.error('Error creating storage bucket:', error);
      } else {
        // Create RLS policies
        const createPolicies = async () => {
          await adminSupabase.rpc('create_storage_policy', {
            bucket_name: 'admin-assets',
            policy_name: 'Admin users can select',
            operation: 'SELECT',
            definition: "bucket_id = 'admin-assets'"
          });
          
          await adminSupabase.rpc('create_storage_policy', {
            bucket_name: 'admin-assets',
            policy_name: 'Admin users can insert',
            operation: 'INSERT',
            definition: "bucket_id = 'admin-assets'"
          });
        };
        
        // Run but don't wait for it (non-blocking)
        createPolicies().catch(err => console.error('Error creating policies:', err));
      }
    }
  } catch (error) {
    console.error('Error ensuring storage bucket:', error);
    // Continue anyway - bucket might already exist
  }
};

// File upload
export const uploadProfileImage = async (file: File, username: string): Promise<string | null> => {
  try {
    // Ensure storage bucket exists first
    await ensureStorageBucket();
    
    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const filePath = `profile-images/${username}-${Date.now()}.${fileExt}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await adminSupabase.storage
      .from('admin-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Changed to true to allow overwriting existing files
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: urlData } = adminSupabase.storage
      .from('admin-assets')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return null;
  }
};

// Hardcoded admin credentials for default access
const HARDCODED_ADMIN = {
  id: 'default-admin-id',
  username: 'ADMIN',
  display_name: 'Default Administrator',
  email: null,
  permissions: ['create_announcements', 'create_servers', 'manage_users'] as AdminPermission[],
  level: 100,
  role_name: 'Super Admin',
  role_color: '#8b5cf6',
  profile_image_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const HARDCODED_PASSWORD = 'AdminLove';

// Admin user operations
export const userOperations = {
  // Get all admin users
  getAll: async (): Promise<AdminUser[]> => {
    try {
      const { data, error } = await adminSupabase
        .from('admin_users')
        .select('*')
        .order('level', { ascending: false })
        .order('username', { ascending: true });
      
      if (error) {
        console.error('Error fetching admin users:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAll admin users:', error);
      throw error;
    }
  },
  
  // Get admin user by username
  getByUsername: async (username: string): Promise<AdminUser | null> => {
    try {
      // If username is blank, return null immediately
      if (!username || username.trim() === '') {
        return null;
      }

      // Special case for hardcoded admin
      if (username.toUpperCase() === HARDCODED_ADMIN.username) {
        return HARDCODED_ADMIN;
      }

      const { data, error } = await adminSupabase
        .from('admin_users')
        .select('*')
        .eq('username', username.trim());
      
      if (error) {
        console.error('Error fetching admin user:', error);
        throw error;
      }
      
      // Return the first user if found, otherwise null
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getByUsername:', error);
      return null; // Return null on any error for better error handling
    }
  },
  
  // Get admin user by ID
  getById: async (id: string): Promise<AdminUser | null> => {
    try {
      // Special case for hardcoded admin
      if (id === 'default-admin-id') {
        return HARDCODED_ADMIN;
      }
      
      // If id is blank, return null immediately
      if (!id || id.trim() === '') {
        return null;
      }

      const { data, error } = await adminSupabase
        .from('admin_users')
        .select('*')
        .eq('id', id.trim())
        .single();
      
      if (error) {
        console.error('Error fetching admin user by ID:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getById:', error);
      return null;
    }
  },
  
  // Create a new admin user
  create: async (user: { 
    username: string; 
    password: string; 
    email?: string; 
    display_name?: string;
    permissions?: AdminPermission[];
    level?: number;
    role_name?: string;
    role_color?: string;
    profile_image_url?: string;
    is_active?: boolean;
  }): Promise<AdminUser> => {
    try {
      // Hash the password
      const password_hash = await bcrypt.hash(user.password, 10);
      
      const { data, error } = await adminSupabase
        .from('admin_users')
        .insert({
          username: user.username,
          password_hash,
          email: user.email,
          display_name: user.display_name,
          permissions: user.permissions || [],
          level: user.level || 1,
          role_name: user.role_name || null,
          role_color: user.role_color || null,
          profile_image_url: user.profile_image_url || null,
          is_active: user.is_active ?? true,
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating admin user:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in create admin user:', error);
      throw error;
    }
  },
  
  // Update an admin user
  update: async (id: string, user: {
    username?: string;
    password?: string;
    email?: string;
    display_name?: string;
    permissions?: AdminPermission[];
    level?: number;
    role_name?: string;
    role_color?: string;
    profile_image_url?: string;
    is_active?: boolean;
  }): Promise<AdminUser> => {
    try {
      // Special case for hardcoded admin - only update local storage
      if (id === 'default-admin-id') {
        const adminUser = { ...HARDCODED_ADMIN };
        if (user.display_name) adminUser.display_name = user.display_name;
        if (user.role_color) adminUser.role_color = user.role_color;
        if (user.profile_image_url) adminUser.profile_image_url = user.profile_image_url;
        
        // Update the entry in localStorage
        const currentUser = adminAuth.getCurrentUser();
        if (currentUser && currentUser.id === 'default-admin-id') {
          adminAuth.updateCurrentUser({
            display_name: user.display_name || null,
            role_color: user.role_color || null,
            profile_image_url: user.profile_image_url || null,
          });
        }
        
        return adminUser;
      }
      
      // Create update object
      const updateData: any = {
        ...user,
        updated_at: new Date().toISOString(),
      };
      
      // If password is provided, hash it
      if (user.password) {
        updateData.password_hash = await bcrypt.hash(user.password, 10);
        delete updateData.password;
      }
      
      const { data, error } = await adminSupabase
        .from('admin_users')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating admin user:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in update admin user:', error);
      throw error;
    }
  },
  
  // Delete an admin user
  delete: async (id: string): Promise<void> => {
    try {
      // Prevent deletion of hardcoded admin
      if (id === 'default-admin-id') {
        throw new Error('Cannot delete default admin user');
      }
      
      const { error } = await adminSupabase
        .from('admin_users')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting admin user:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete admin user:', error);
      throw error;
    }
  },
  
  // Authenticate a user
  authenticate: async (username: string, password: string): Promise<AdminUser | null> => {
    try {
      // Check for hardcoded admin credentials
      if (username.toUpperCase() === HARDCODED_ADMIN.username && password === HARDCODED_PASSWORD) {
        return HARDCODED_ADMIN;
      }
      
      // Get user by username - handle null case
      const user = await userOperations.getByUsername(username);
      
      // If user not found or not active, return null
      if (!user || !user.is_active) {
        return null;
      }
      
      // Verify password
      const { data, error } = await adminSupabase
        .from('admin_users')
        .select('password_hash')
        .eq('id', user.id)
        .single();
      
      if (error || !data) {
        console.error('Error getting password hash:', error);
        return null;
      }
      
      const isValid = await bcrypt.compare(password, data.password_hash);
      
      return isValid ? user : null;
    } catch (error) {
      console.error('Error in authenticate:', error);
      return null;
    }
  }
};

// Admin authentication helper
export const adminAuth = {
  // Log in a user
  login: async (username: string, password: string): Promise<AdminUser | null> => {
    try {
      // Validate inputs
      if (!username || !password) {
        return null;
      }
      
      // Check for hardcoded admin credentials first
      if (username.toUpperCase() === HARDCODED_ADMIN.username && password === HARDCODED_PASSWORD) {
        // Store user info in local storage for hardcoded admin
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify({
          id: HARDCODED_ADMIN.id,
          username: HARDCODED_ADMIN.username,
          display_name: HARDCODED_ADMIN.display_name,
          permissions: HARDCODED_ADMIN.permissions,
          level: HARDCODED_ADMIN.level,
          role_name: HARDCODED_ADMIN.role_name,
          role_color: HARDCODED_ADMIN.role_color,
          profile_image_url: HARDCODED_ADMIN.profile_image_url
        }));
        return HARDCODED_ADMIN;
      }
      
      // If not hardcoded credentials, try database authentication
      const user = await userOperations.authenticate(username, password);
      
      if (user) {
        // Store user info in local storage
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify({
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          permissions: user.permissions,
          level: user.level,
          role_name: user.role_name,
          role_color: user.role_color,
          profile_image_url: user.profile_image_url
        }));
      }
      
      return user;
    } catch (error) {
      console.error('Error in login:', error);
      return null;
    }
  },
  
  // Check if a user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem('adminAuthenticated') === 'true';
  },
  
  // Get the current user
  getCurrentUser: (): { id: string; username: string; display_name?: string | null; permissions: AdminPermission[]; level: number; role_name?: string | null; role_color?: string | null; profile_image_url?: string | null } | null => {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Update the current user in localStorage (after profile changes)
  updateCurrentUser: (userData: Partial<AdminUser>): void => {
    const currentUser = adminAuth.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    }
  },
  
  // Log out a user
  logout: (): void => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');
  }
};

// Server operations
export const serverOperations = {
  getAll: async () => {
    try {
      // For read operations, we can use the regular client
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching servers:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error in getAll servers:', error);
      throw error;
    }
  },
  
  create: async (server: Database['public']['Tables']['servers']['Insert']) => {
    try {
      // Make sure responsibilities is an array
      if (!Array.isArray(server.responsibilities)) {
        server.responsibilities = [];
      }
      
      // Add timestamps if not provided
      const serverWithTimestamps = {
        ...server,
        created_at: server.created_at || new Date().toISOString(),
        updated_at: server.updated_at || new Date().toISOString()
      };
      
      // Use direct fetch with service role key to bypass RLS
      const response = await fetch(`${supabaseUrl}/rest/v1/servers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey || supabaseAnonKey,
          'Authorization': `Bearer ${supabaseServiceKey || supabaseAnonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(serverWithTimestamps)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating server:', error);
        throw new Error(JSON.stringify(error));
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from server creation');
      }
      
      return data[0];
    } catch (error) {
      console.error('Error in server creation:', error);
      throw error;
    }
  },
  
  update: async (id: number, server: Database['public']['Tables']['servers']['Update']) => {
    try {
      // Make sure responsibilities is an array if it's included
      if (server.responsibilities && !Array.isArray(server.responsibilities)) {
        server.responsibilities = [];
      }
      
      // Add updated_at field
      const serverWithUpdatedAt = {
        ...server,
        updated_at: new Date().toISOString()
      };
      
      // Use direct fetch with service role key to bypass RLS
      const response = await fetch(`${supabaseUrl}/rest/v1/servers?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey || supabaseAnonKey,
          'Authorization': `Bearer ${supabaseServiceKey || supabaseAnonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(serverWithUpdatedAt)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error updating server:', error);
        throw new Error(JSON.stringify(error));
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from server update');
      }
      
      return data[0];
    } catch (error) {
      console.error('Error in server update:', error);
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      // Use direct fetch with service role key to bypass RLS
      const response = await fetch(`${supabaseUrl}/rest/v1/servers?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey || supabaseAnonKey,
          'Authorization': `Bearer ${supabaseServiceKey || supabaseAnonKey}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error deleting server:', error);
        throw new Error(JSON.stringify(error));
      }
      
      return true;
    } catch (error) {
      console.error('Error in server deletion:', error);
      throw error;
    }
  }
};

// Announcement operations
export const announcementOperations = {
  getAll: async () => {
    try {
      // Use direct fetch with service role key to bypass RLS
      const response = await fetch(`${supabaseUrl}/rest/v1/announcements?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey || supabaseAnonKey,
          'Authorization': `Bearer ${supabaseServiceKey || supabaseAnonKey}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching announcements:', error);
        throw new Error(JSON.stringify(error));
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error in getAll announcements:', error);
      throw error;
    }
  },
  
  getActive: async () => {
    try {
      // For public-facing operations, use the regular client
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching active announcements:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getActive announcements:', error);
      throw error;
    }
  },
  
  create: async (announcement: Database['public']['Tables']['announcements']['Insert']) => {
    try {
      // Add created_at and updated_at if not included
      const announcementWithTimestamps = {
        ...announcement,
        created_at: announcement.created_at || new Date().toISOString(),
        updated_at: announcement.updated_at || new Date().toISOString()
      };
      
      // Use direct fetch with service role key to bypass RLS
      const response = await fetch(`${supabaseUrl}/rest/v1/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey || supabaseAnonKey,
          'Authorization': `Bearer ${supabaseServiceKey || supabaseAnonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(announcementWithTimestamps)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating announcement:', error);
        throw new Error(JSON.stringify(error));
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from announcement creation');
      }
      
      return data[0];
    } catch (error) {
      console.error('Error in announcement creation:', error);
      throw error;
    }
  },
  
  update: async (id: number, announcement: Database['public']['Tables']['announcements']['Update']) => {
    try {
      // Add updated_at field
      const announcementWithUpdatedAt = {
        ...announcement,
        updated_at: new Date().toISOString()
      };
      
      // Use direct fetch with service role key to bypass RLS
      const response = await fetch(`${supabaseUrl}/rest/v1/announcements?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey || supabaseAnonKey,
          'Authorization': `Bearer ${supabaseServiceKey || supabaseAnonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(announcementWithUpdatedAt)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error updating announcement:', error);
        throw new Error(JSON.stringify(error));
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from announcement update');
      }
      
      return data[0];
    } catch (error) {
      console.error('Error in announcement update:', error);
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      // Use direct fetch with service role key to bypass RLS
      const response = await fetch(`${supabaseUrl}/rest/v1/announcements?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey || supabaseAnonKey,
          'Authorization': `Bearer ${supabaseServiceKey || supabaseAnonKey}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error deleting announcement:', error);
        throw new Error(JSON.stringify(error));
      }
      
      return true;
    } catch (error) {
      console.error('Error in announcement deletion:', error);
      throw error;
    }
  }
};