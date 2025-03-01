import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import toast from 'react-hot-toast';
import { supabase, supabaseAdmin, logSupabaseError } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  createUser: (email: string, password: string, displayName: string, role: string) => Promise<boolean>;
  updateUser: (userData: Partial<User> & { password?: string, id?: string }) => Promise<boolean>;
  isAdmin: () => boolean;
  hasPermission: (permission: Permission) => boolean;
  getUserRoleRank: (userRole: string | undefined) => number;
  getCurrentUserRoleRank: () => number;
  canManageRole: (roleRank: number | undefined) => boolean;
  canManageUser: (userRole: string | undefined) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Admin email - modify this to control who has admin access!
const ADMIN_EMAILS = ['perryng655@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<{name: string, rank: number}[]>([]);

  const isAdmin = () => {
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email) || hasPermission('ADMINISTRATOR');
  };

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    
    // Founder/Admins always have all permissions
    if (ADMIN_EMAILS.includes(user.email)) return true;
    
    return userPermissions.includes(permission);
  };

  // Fetch all roles to get their ranks
  const fetchAllRoles = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('roles')
        .select('name, rank')
        .order('rank', { ascending: false });
      
      if (error) {
        console.error('Error fetching roles:', error);
        return;
      }
      
      setRoles(data || []);
    } catch (error) {
      console.error('Error in fetchAllRoles:', error);
    }
  };

  // Get the role rank for any user by role name
  const getUserRoleRank = (userRole: string | undefined): number => {
    if (!userRole) return 0;
    
    // Admins always have the highest rank
    if (isAdmin()) return 1000;
    
    const roleObj = roles.find(r => r.name === userRole);
    return roleObj?.rank || 0;
  };

  // Get the current user's role rank
  const getCurrentUserRoleRank = (): number => {
    if (!user) return 0;
    return getUserRoleRank(user.role);
  };

  // Check if the current user can manage a specific role
  const canManageRole = (roleRank: number | undefined): boolean => {
    if (!user) return false;
    if (isAdmin()) return true;
    
    const currentUserRank = getCurrentUserRoleRank();
    const targetRoleRank = roleRank || 0;
    
    // Cannot manage roles with equal or higher rank
    return currentUserRank > targetRoleRank && hasPermission('MANAGE_PERMISSIONS');
  };

  // Check if the current user can manage a specific user
  const canManageUser = (userRole: string | undefined): boolean => {
    if (!user) return false;
    if (isAdmin()) return true;
    
    const currentUserRank = getCurrentUserRoleRank();
    const targetUserRank = getUserRoleRank(userRole);
    
    // Cannot manage users with equal or higher role rank
    return currentUserRank > targetUserRank && hasPermission('ADD_USERS');
  };

  // Fetch user permissions based on their role
  const fetchUserPermissions = async (userId: string, userRole: string | undefined) => {
    try {
      if (!userRole) {
        setUserPermissions([]);
        return;
      }

      // Fetch role permissions using admin client to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('roles')
        .select('permissions')
        .eq('name', userRole)
        .single();

      if (error) {
        console.error('Error fetching user permissions:', error);
        setUserPermissions([]);
        return;
      }

      if (data && data.permissions) {
        console.log('User permissions:', data.permissions);
        setUserPermissions(data.permissions);
      } else {
        setUserPermissions([]);
      }
    } catch (error) {
      console.error('Error in fetchUserPermissions:', error);
      setUserPermissions([]);
    }
  };

  const login = async (email: string, password: string, remember: boolean) => {
    try {
      console.log('Attempting to log in with email:', email);
      
      // We use regular supabase for auth operations
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        toast.error('Invalid email or password');
        return false;
      }

      if (!data.user) {
        console.error('No user returned from Supabase.');
        toast.error('Login failed. Please try again.');
        return false;
      }

      console.log('Login successful, fetching user profile for user ID:', data.user.id);

      // Use supabaseAdmin for DB operations to bypass RLS
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      if (!profile) {
        console.warn('User profile not found. Attempting to create a new one.');

        // Check if it's one of the admin emails to determine role
        const userRole = ADMIN_EMAILS.includes(email) ? 'Founder' : 'User';

        // Create user profile with admin client to bypass RLS
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              profile_image: 'https://i.imgur.com/HVZOV5f.png',
              display_name: email.split('@')[0],
              role: userRole
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          logSupabaseError('create_profile', createError);
          toast.error('Failed to create user profile');
          return false;
        }

        console.log('New profile created successfully:', newProfile);

        const userData = {
          id: newProfile.id,
          email: newProfile.email,
          display_name: newProfile.display_name,
          profileImage: newProfile.profile_image,
          role: newProfile.role || 'User'
        };

        setUser(userData);
        remember
          ? localStorage.setItem('user', JSON.stringify(userData))
          : sessionStorage.setItem('user', JSON.stringify(userData));

        // Fetch permissions for the new profile
        await fetchUserPermissions(userData.id, userData.role);
        
        // Also fetch all roles for rank comparison
        await fetchAllRoles();

        return true;
      }

      console.log('User profile fetched successfully:', profile);

      const userData = {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        profileImage: profile.profile_image,
        role: profile.role || 'User'
      };

      setUser(userData);
      remember
        ? localStorage.setItem('user', JSON.stringify(userData))
        : sessionStorage.setItem('user', JSON.stringify(userData));

      // Fetch permissions for the user
      await fetchUserPermissions(userData.id, userData.role);
      
      // Also fetch all roles for rank comparison
      await fetchAllRoles();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out');
    await supabase.auth.signOut();
    setUser(null);
    setUserPermissions([]);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    console.log('Logged out successfully');
  };

  const createUser = async (email: string, password: string, displayName: string, role: string) => {
    try {
      console.log('Creating user with email:', email, 'and role:', role);
      
      // Check if the current user has permission to assign this role
      if (!isAdmin()) {
        const roleObj = roles.find(r => r.name === role);
        if (roleObj && !canManageRole(roleObj.rank)) {
          toast.error('You do not have permission to assign this role');
          return false;
        }
      }
      
      // Check if the email already exists
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing user:', checkError);
        logSupabaseError('check_existing_user', checkError);
      }
      
      if (existingUser) {
        toast.error('A user with this email already exists');
        return false;
      }
      
      // Using admin client to create user with auto-confirmation
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Always auto-confirm
      });

      if (authError) {
        console.error('Error creating user auth:', authError);
        logSupabaseError('create_user_auth', authError);
        toast.error(authError.message || 'Failed to create user');
        return false;
      }

      if (!authData.user) {
        toast.error('Failed to create user in Supabase Auth');
        return false;
      }

      // Create user profile with admin client to bypass RLS
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: email,
            display_name: displayName || email.split('@')[0],
            profile_image: 'https://i.imgur.com/HVZOV5f.png',
            role: role
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        logSupabaseError('create_user_profile', profileError);
        toast.error('Failed to create user profile');
        
        // Try to clean up the auth user if profile creation fails
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          console.log('Cleaned up auth user after profile creation failed');
        } catch (cleanupError) {
          console.error('Failed to clean up auth user:', cleanupError);
        }
        
        return false;
      }

      console.log('User created successfully with profile:', profileData);
      toast.success('User created successfully');
      return true;
    } catch (error) {
      console.error('Error in createUser:', error);
      toast.error('Failed to create user');
      return false;
    }
  };

  const updateUser = async (userData: Partial<User> & { password?: string, id?: string }) => {
    try {
      // Use either the provided id or the logged-in user's id
      const userId = userData.id || user?.id;
      
      if (!userId) {
        toast.error('No user ID provided for update');
        return false;
      }
      
      // Check if this is trying to update someone else
      const isSelfUpdate = userId === user?.id;
      
      // If updating someone else, check if current user has permission
      if (!isSelfUpdate) {
        // Get the target user's role to check rank
        const { data: targetUser, error: targetUserError } = await supabaseAdmin
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (targetUserError) {
          console.error('Error getting target user role:', targetUserError);
          toast.error('Failed to verify permissions');
          return false;
        }
        
        // Check if current user can manage this user
        if (!canManageUser(targetUser.role)) {
          console.warn('Permission denied: Cannot manage user with equal or higher role rank');
          toast.error('You do not have permission to manage this user');
          return false;
        }
        
        // If changing the role, check if current user can assign that role
        if (userData.role && userData.role !== targetUser.role) {
          const roleObj = roles.find(r => r.name === userData.role);
          if (roleObj && !canManageRole(roleObj.rank)) {
            console.warn('Permission denied: Cannot assign role with equal or higher rank');
            toast.error('You do not have permission to assign this role');
            return false;
          }
        }
      } else {
        // Self-update: Users cannot change their own role
        if (userData.role && userData.role !== user?.role) {
          console.warn('Permission denied: Users cannot change their own role');
          toast.error('You cannot change your own role');
          return false;
        }
      }
      
      console.log('Updating user with ID:', userId);
      const updatePromises = [];

      // Update password if provided - using admin client
      if (userData.password && userData.password.trim() !== '') {
        console.log('Updating password for user ID:', userId);
        
        updatePromises.push(
          supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: userData.password }
          )
        );
      }

      // Update profile data using admin client to bypass RLS
      const profileData: Record<string, any> = {};
      if (userData.email) profileData.email = userData.email;
      if (userData.display_name) profileData.display_name = userData.display_name;
      if (userData.profileImage) profileData.profile_image = userData.profileImage;
      if (userData.role) profileData.role = userData.role;

      if (Object.keys(profileData).length > 0) {
        console.log('Updating profile data for user ID:', userId, profileData);
        
        updatePromises.push(
          supabaseAdmin
            .from('users')
            .update(profileData)
            .eq('id', userId)
        );
      }

      if (updatePromises.length === 0) {
        console.log('No updates to apply');
        return true; // Nothing to update
      }

      const results = await Promise.all(updatePromises);
      
      // Log detailed results for debugging
      results.forEach((result, index) => {
        console.log(`Update operation ${index + 1} result:`, result);
        if ('error' in result && result.error) {
          console.error(`Error in update operation ${index + 1}:`, result.error);
          logSupabaseError(`update_operation_${index}`, result.error);
        }
      });
      
      const hasErrors = results.some(result => 'error' in result && result.error);

      if (hasErrors) {
        console.error('Update errors:', results.filter(r => 'error' in r).map(r => r.error));
        toast.error('Failed to update user information');
        return false;
      }

      // Only update local user state if we're updating the current user
      if (user && userId === user.id) {
        // Update local user state
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            email: userData.email || prev.email,
            display_name: userData.display_name || prev.display_name,
            profileImage: userData.profileImage || prev.profileImage,
            role: userData.role || prev.role
          };
        });

        // Update stored user
        const storedUserData = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (storedUserData) {
          const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
          const updatedStoredUser = {
            ...JSON.parse(storedUserData),
            email: userData.email || user.email,
            display_name: userData.display_name || user.display_name,
            profileImage: userData.profileImage || user.profileImage,
            role: userData.role || user.role
          };
          storage.setItem('user', JSON.stringify(updatedStoredUser));
          
          // If role changed, update permissions
          if (userData.role && userData.role !== user.role) {
            await fetchUserPermissions(userId, userData.role);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user information');
      return false;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Found stored user:', parsedUser);
        setUser(parsedUser);
        
        // Fetch permissions for the stored user
        fetchUserPermissions(parsedUser.id, parsedUser.role);
        
        // Also fetch all roles for rank comparison
        fetchAllRoles();
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserPermissions([]);
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
        }
      }
    );

    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      createUser, 
      updateUser, 
      isAdmin, 
      hasPermission,
      getUserRoleRank,
      getCurrentUserRoleRank,
      canManageRole,
      canManageUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};