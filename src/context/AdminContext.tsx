import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuth } from '../lib/supabase';
import toast from 'react-hot-toast';
import { AdminPermission } from '../types/database.types';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  currentUser: { 
    id: string; 
    username: string; 
    display_name?: string | null;
    permissions: AdminPermission[];
    level: number;
    role_name?: string | null;
    role_color?: string | null;
    profile_image_url?: string | null;
  } | null;
  hasPermission: (permission: AdminPermission) => boolean;
  canManageUser: (userLevel: number) => boolean;
  updateLocalUserData: (userData: Partial<{
    display_name?: string | null;
    profile_image_url?: string | null;
    role_color?: string | null;
  }>) => void;
}

const AdminContext = createContext<AdminContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  loading: true,
  currentUser: null,
  hasPermission: () => false,
  canManageUser: () => false,
  updateLocalUserData: () => {},
});

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ 
    id: string; 
    username: string; 
    display_name?: string | null;
    permissions: AdminPermission[];
    level: number;
    role_name?: string | null;
    role_color?: string | null;
    profile_image_url?: string | null;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const auth = adminAuth.isAuthenticated();
        setIsAuthenticated(auth);
        
        if (auth) {
          const user = adminAuth.getCurrentUser();
          if (user) {
            setCurrentUser({
              ...user,
              permissions: user.permissions || [],
              level: user.level || 1,
              role_name: user.role_name,
              role_color: user.role_color,
              profile_image_url: user.profile_image_url
            });
          } else {
            // If getCurrentUser returns null but isAuthenticated is true,
            // there might be inconsistent localStorage state
            localStorage.removeItem('adminAuthenticated');
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Reset auth state on error
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await adminAuth.login(username, password);
      
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser({
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          permissions: user.permissions || [],
          level: user.level || 1,
          role_name: user.role_name,
          role_color: user.role_color,
          profile_image_url: user.profile_image_url
        });
        navigate('/admin/dashboard');
        toast.success('Login successful!');
        return true;
      } else {
        toast.error('Invalid username or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  const logout = () => {
    adminAuth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/admin');
    toast.success('Logged out successfully');
  };

  const hasPermission = (permission: AdminPermission): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  const canManageUser = (userLevel: number): boolean => {
    if (!currentUser) return false;
    
    // Default admin (username ADMIN) can manage all users
    if (currentUser.username === 'ADMIN') return true;
    
    // Users can only manage users with lower levels than themselves
    return currentUser.level > userLevel;
  };

  const updateLocalUserData = (userData: Partial<{
    display_name?: string | null;
    profile_image_url?: string | null;
    role_color?: string | null;
  }>) => {
    if (!currentUser) return;

    // Create updated user object
    const updatedUser = {
      ...currentUser,
      ...userData
    };

    // Update local state
    setCurrentUser(updatedUser);

    // Update localStorage via adminAuth helper
    adminAuth.updateCurrentUser(userData);
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        loading,
        currentUser,
        hasPermission,
        canManageUser,
        updateLocalUserData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);