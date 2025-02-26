import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission } from '../types';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, remember: boolean) => {
    try {
      console.log('Attempting to log in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Login successful, fetching user profile for user ID:', data.user.id);
        // Fetch user profile from our users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw profileError;
        }

        if (profile) {
          const userData = {
            id: data.user.id,
            email: data.user.email!,
            profileImage: profile.profile_image,
            role: profile.role
          };

          console.log('User profile fetched successfully:', userData);
          setUser(userData);
          
          if (remember) {
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
          
          return true;
        }
      }
      
      toast.error('Invalid email or password');
      return false;
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
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    console.log('Logged out successfully');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      console.log('Found stored user:', storedUser);
      setUser(JSON.parse(storedUser));
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_OUT') {
          setUser(null);
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};