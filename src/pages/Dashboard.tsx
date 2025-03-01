import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { Announcement, Permission, Role } from '../types';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { AnnouncementsSection } from '../components/dashboard/sections/AnnouncementsSection';
import { AnnouncementModal } from '../components/dashboard/modals/AnnouncementModal';
import { DeleteConfirmationModal } from '../components/dashboard/modals/DeleteConfirmationModal';
import { DeleteUserModal } from '../components/dashboard/modals/DeleteUserModal';
import { UserModal } from '../components/dashboard/modals/UserModal';
import { RoleModal } from '../components/dashboard/modals/RoleModal';
import { DeleteRoleModal } from '../components/dashboard/modals/DeleteRoleModal';
import { 
  BellRing, 
  UserCog,
  Shield,
  Loader,
  Trash2,
  CogIcon
} from 'lucide-react';

// Permission settings
const AVAILABLE_PERMISSIONS: { id: Permission; label: string }[] = [
  { id: 'CREATE_ANNOUNCEMENT', label: 'Create Announcements' },
  { id: 'DELETE_ANNOUNCEMENT', label: 'Delete Announcements' },
  { id: 'ADD_USERS', label: 'Add Users' },
  { id: 'DELETE_USERS', label: 'Delete Users' },
  { id: 'MANAGE_PERMISSIONS', label: 'Manage Permissions' },
  { id: 'ADMINISTRATOR', label: 'Administrator (All Permissions)' },
];

export default function Dashboard() {
  const { user, logout, createUser, updateUser, isAdmin, hasPermission, canManageRole, canManageUser } = useAuth();
  const navigate = useNavigate();
  
  // UI state
  const [activeSection, setActiveSection] = useState('announcements');
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<{ id: string | null, loading: boolean }>({ 
    id: null, loading: false 
  });
  
  // Modal state
  const [modalType, setModalType] = useState<'user' | 'announcement' | 'deleteConfirmation' | 'role' | 'deleteRole' | 'deleteUser' | null>(null);
  
  // Data state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Edit/Delete state
  const [editingUser, setEditingUser] = useState<{
    id: string;
    email: string;
    displayName: string;
    role: string;
  } | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingUserEmail, setDeletingUserEmail] = useState<string | null>(null);
  
  // Form state
  const [newUser, setNewUser] = useState({ 
    email: '', password: '', displayName: '', role: 'User' 
  });
  const [newAnnouncement, setNewAnnouncement] = useState({ 
    title: '', content: '' 
  });
  const [newRole, setNewRole] = useState<{
    name: string;
    description: string;
    permissions: Permission[];
    rank?: number;
  }>({
    name: '',
    description: '',
    permissions: [],
    rank: 50
  });

  // Navigation items based on permissions
  const navigation = [
    { name: 'Global Announcements', icon: BellRing, id: 'announcements' },
    { name: 'User Management', icon: CogIcon, id: 'users', requiredPermission: 'ADD_USERS' },
    { name: 'Role Management', icon: Shield, id: 'roles', requiredPermission: 'MANAGE_PERMISSIONS' }
  ].filter(item => !item.requiredPermission || isAdmin() || hasPermission(item.requiredPermission as Permission));

  // Check permissions and load data on section change
  useEffect(() => {
    // Redirect if user doesn't have permission
    if (activeSection === 'users' && !hasPermission('ADD_USERS') && !isAdmin()) {
      setActiveSection('announcements');
    }
    
    if (activeSection === 'roles' && !hasPermission('MANAGE_PERMISSIONS') && !isAdmin()) {
      setActiveSection('announcements');
    }

    // Fetch data for the active section
    fetchDataForActiveSection();
  }, [activeSection]);

  // Check user auth status and create default roles
  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    
    // Create default roles if needed
    if (isAdmin()) {
      createDefaultRolesIfNeeded();
    }
  }, [user, navigate]);

  // Helper to fetch appropriate data based on active section
  const fetchDataForActiveSection = () => {
    fetchAnnouncements();
    
    if ((isAdmin() || hasPermission('ADD_USERS')) && (activeSection === 'users')) {
      fetchUsers();
    }
    
    if ((isAdmin() || hasPermission('MANAGE_PERMISSIONS')) && (activeSection === 'roles')) {
      fetchRoles();
    }
  };

  // Create default roles if they don't exist
  const createDefaultRolesIfNeeded = async () => {
    try {
      const { data: existingRoles, error: checkError } = await supabaseAdmin
        .from('roles')
        .select('id, name')
        .in('name', ['Founder', 'User']);
        
      if (checkError) {
        console.error('Error checking for existing roles:', checkError);
        return;
      }
      
      const hasFounder = existingRoles?.some(r => r.name === 'Founder');
      const hasUser = existingRoles?.some(r => r.name === 'User');
      
      const rolesToCreate = [];
      
      if (!hasFounder) {
        rolesToCreate.push({
          name: 'Founder',
          description: 'Full access to all system features',
          permissions: [
            'CREATE_ANNOUNCEMENT',
            'DELETE_ANNOUNCEMENT',
            'ADD_USERS',
            'DELETE_USERS',
            'MANAGE_PERMISSIONS',
            'ADMINISTRATOR'
          ],
          rank: 100
        });
      }
      
      if (!hasUser) {
        rolesToCreate.push({
          name: 'User',
          description: 'Basic user with limited permissions',
          permissions: [
            'CREATE_ANNOUNCEMENT'
          ],
          rank: 0
        });
      }
      
      if (rolesToCreate.length > 0) {
        const { error: createError } = await supabaseAdmin
          .from('roles')
          .insert(rolesToCreate);
          
        if (createError) {
          console.error('Error creating default roles:', createError);
          return;
        }
        
        console.log('Default roles created successfully');
      }
    } catch (error) {
      console.error('Error in createDefaultRolesIfNeeded:', error);
    }
  };

  // Data fetching functions
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      console.log('Fetching announcements...');
      
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .select(`
          *,
          created_by:users(email, profile_image, display_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }
      
      console.log('Successfully fetched announcements:', data?.length || 0);
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Successfully fetched users:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      console.log('Fetching roles...');
      
      const { data, error } = await supabaseAdmin
        .from('roles')
        .select('*')
        .order('rank', { ascending: false });

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
      
      console.log('Successfully fetched roles:', data?.length || 0);
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  // Modal helpers
  const openModal = (type: typeof modalType) => setModalType(type);
  const closeModal = () => setModalType(null);

  // User related functions
  const handleEditUser = (user: any) => {
    // Check if current user can manage this user
    if (!isAdmin() && !canManageUser(user.role)) {
      toast.error('You do not have permission to edit this user');
      return;
    }

    setEditingUser({
      id: user.id,
      email: user.email,
      displayName: user.display_name || '',
      role: user.role || 'User',
    });
    openModal('user');
  };

  const confirmDeleteUser = (id: string, email: string) => {
    // Find the user to confirm we can delete them
    const userToDelete = users.find(u => u.id === id);
    
    if (!userToDelete) {
      toast.error('User not found');
      return;
    }
    
    // Cannot delete yourself
    if (userToDelete.id === user?.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    
    // Check if user has permission to delete this user
    if (!isAdmin() && !canManageUser(userToDelete.role)) {
      toast.error('You do not have permission to delete this user');
      return;
    }
    
    setDeletingUserId(id);
    setDeletingUserEmail(email);
    openModal('deleteUser');
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    
    try {
      console.log('Deleting user with ID:', deletingUserId);
      
      // First, check if the user has any linked data
      const { data: userAnnouncements, error: announcementError } = await supabaseAdmin
        .from('announcements')
        .select('id')
        .eq('created_by', deletingUserId);
        
      if (announcementError) {
        console.error('Error checking user announcements:', announcementError);
      }
      
      // If the user has announcements, we could either delete them or reassign them
      // Here, we'll delete them for simplicity
      if (userAnnouncements && userAnnouncements.length > 0) {
        const { error: deleteAnnouncementsError } = await supabaseAdmin
          .from('announcements')
          .delete()
          .eq('created_by', deletingUserId);
          
        if (deleteAnnouncementsError) {
          console.error('Error deleting user announcements:', deleteAnnouncementsError);
          throw deleteAnnouncementsError;
        }
      }
      
      // Next, delete the user's auth record
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        deletingUserId
      );
      
      if (authDeleteError) {
        console.error('Error deleting user auth:', authDeleteError);
        throw authDeleteError;
      }
      
      // Finally, delete the user's profile
      const { error: profileDeleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', deletingUserId);
        
      if (profileDeleteError) {
        console.error('Error deleting user profile:', profileDeleteError);
        throw profileDeleteError;
      }
      
      toast.success('User deleted successfully');
      closeModal();
      setDeletingUserId(null);
      setDeletingUserEmail(null);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!newUser.email || !newUser.password) {
        toast.error('Email and password are required');
        return;
      }
      
      // Check if user can assign this role
      const roleToAssign = roles.find(r => r.name === newUser.role);
      if (!isAdmin() && roleToAssign && !canManageRole(roleToAssign.rank)) {
        toast.error('You do not have permission to assign this role');
        return;
      }
      
      const success = await createUser(
        newUser.email,
        newUser.password,
        newUser.displayName || newUser.email.split('@')[0],
        newUser.role || 'User'
      );
      
      if (success) {
        closeModal();
        setNewUser({ email: '', password: '', displayName: '', role: 'User' });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error in handleCreateUser:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      console.log('Updating user with ID:', editingUser.id);
      
      // If changing role, check permissions
      if (editingUser.id !== user?.id) {
        // Updating someone else - check if can manage their role
        const targetUser = users.find(u => u.id === editingUser.id);
        if (targetUser && !isAdmin() && !canManageUser(targetUser.role)) {
          toast.error('You do not have permission to edit this user');
          return;
        }
        
        // Check if user can assign the new role
        const newRole = roles.find(r => r.name === editingUser.role);
        if (newRole && !isAdmin() && !canManageRole(newRole.rank)) {
          toast.error('You do not have permission to assign this role');
          return;
        }
      } else {
        // Self update - cannot change own role
        const currentUserData = users.find(u => u.id === user.id);
        if (currentUserData && editingUser.role !== currentUserData.role) {
          toast.error('You cannot change your own role');
          return;
        }
      }
      
      const updateData = {
        id: editingUser.id,
        email: editingUser.email,
        display_name: editingUser.displayName,
        role: editingUser.role,
      };
      
      const success = await updateUser(updateData);
      
      if (success) {
        toast.success('User updated successfully');
        closeModal();
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  // Announcement related functions
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      console.log('Creating new announcement:', newAnnouncement);
      
      const uniqueId = `announcement_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert([
          {
            title: newAnnouncement.title,
            content: newAnnouncement.content,
            created_by: user.id,
            active: true,
            unique_id: uniqueId
          }
        ]);
        
      if (error) {
        console.error('Error creating announcement:', error);
        throw error;
      }
      
      toast.success('Announcement created successfully');
      closeModal();
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const confirmDeleteAnnouncement = (id: string) => {
    setDeletingAnnouncementId(id);
    openModal('deleteConfirmation');
  };

  const handleDeleteAnnouncement = async () => {
    if (!deletingAnnouncementId) return;
    
    try {
      console.log('Deleting announcement with ID:', deletingAnnouncementId);
      
      const { error } = await supabaseAdmin
        .from('announcements')
        .delete()
        .eq('id', deletingAnnouncementId);
        
      if (error) {
        console.error('Delete announcement failed:', error);
        throw error;
      }
      
      toast.success('Announcement deleted successfully');
      closeModal();
      setDeletingAnnouncementId(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggleAnnouncementStatus = async (id: string, currentStatus: boolean) => {
    setUpdatingStatus({ id, loading: true });
    
    try {
      console.log(`Toggling announcement ${id} status from ${currentStatus ? 'active' : 'inactive'} to ${!currentStatus ? 'active' : 'inactive'}`);
      
      const { error } = await supabaseAdmin
        .from('announcements')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) {
        console.error('Toggle announcement status failed:', error);
        throw error;
      }
      
      toast.success(`Announcement ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Update local state immediately for better UX
      setAnnouncements(prev => 
        prev.map(a => a.id === id ? { ...a, active: !currentStatus } : a)
      );
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement status:', error);
      toast.error('Failed to update announcement status');
    } finally {
      setUpdatingStatus({ id: null, loading: false });
    }
  };

  // Role related functions
  const handleEditRole = (role: Role) => {
    // System roles have special handling
    if (role.name === 'Founder' && !isAdmin()) {
      toast.error('Only admins can edit the Founder role');
      return;
    }
    
    // Check if user can manage this role based on rank
    if (!isAdmin() && !canManageRole(role.rank)) {
      toast.error('You do not have permission to edit this role');
      return;
    }
    
    setEditingRole({...role});
    openModal('role');
  };

  const togglePermission = (permission: Permission) => {
    const targetState = editingRole ? editingRole : newRole;
    const hasPermission = targetState.permissions.includes(permission);
    let newPermissions: Permission[];
    
    if (hasPermission) {
      // Remove the permission
      newPermissions = targetState.permissions.filter(p => p !== permission);
    } else {
      // Add the permission
      if (permission === 'ADMINISTRATOR') {
        // If adding ADMINISTRATOR, include all permissions
        newPermissions = [...AVAILABLE_PERMISSIONS.map(p => p.id)];
      } else {
        newPermissions = [...targetState.permissions, permission];
      }
    }
    
    if (editingRole) {
      setEditingRole(prev => prev ? {...prev, permissions: newPermissions} : null);
    } else {
      setNewRole(prev => ({...prev, permissions: newPermissions}));
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!newRole.name) {
        toast.error('Role name is required');
        return;
      }
      
      // Check if role already exists
      const { data: existingRole, error: checkError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', newRole.name)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing role:', checkError);
      }
      
      if (existingRole) {
        toast.error('A role with this name already exists');
        return;
      }
      
      // Validate role rank - cannot create role with higher rank than own
      if (!isAdmin()) {
        const currentUserRole = roles.find(r => r.name === user?.role);
        if (currentUserRole && newRole.rank && newRole.rank >= currentUserRole.rank) {
          toast.error('You cannot create a role with equal or higher rank than your own');
          return;
        }
      }
      
      // Create new role
      const { data, error } = await supabaseAdmin
        .from('roles')
        .insert([
          {
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions,
            rank: newRole.rank || 50
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating role:', error);
        toast.error('Failed to create role');
        return;
      }
      
      toast.success('Role created successfully');
      closeModal();
      setNewRole({ name: '', description: '', permissions: [], rank: 50 });
      fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    
    try {
      // Special validation for Founder role
      if (editingRole.name === 'Founder' && !isAdmin()) {
        toast.error('Only admins can modify the Founder role');
        return;
      }
      
      // Check if user can manage this role
      if (!isAdmin() && !canManageRole(editingRole.rank)) {
        toast.error('You do not have permission to modify this role');
        return;
      }
      
      // Validate role rank - cannot set role rank higher than own
      if (!isAdmin()) {
        const currentUserRole = roles.find(r => r.name === user?.role);
        if (currentUserRole && editingRole.rank && editingRole.rank >= currentUserRole.rank) {
          toast.error('You cannot set a role rank equal to or higher than your own');
          return;
        }
      }
      
      const { data, error } = await supabaseAdmin
        .from('roles')
        .update({
          name: editingRole.name === 'User' || editingRole.name === 'Founder' 
            ? editingRole.name // Don't change system role names
            : editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions,
          rank: editingRole.rank
        })
        .eq('id', editingRole.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating role:', error);
        toast.error('Failed to update role');
        return;
      }
      
      toast.success('Role updated successfully');
      closeModal();
      setEditingRole(null);
      fetchRoles();
      
      // If users have this role, their permissions might have changed
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const confirmDeleteRole = (id: string) => {
    const roleToDelete = roles.find(r => r.id === id);
    
    // System roles can't be deleted
    if (roleToDelete && (roleToDelete.name === 'Founder' || roleToDelete.name === 'User')) {
      toast.error(`The ${roleToDelete.name} role cannot be deleted`);
      return;
    }
    
    // Check if user can manage this role
    if (roleToDelete && !isAdmin() && !canManageRole(roleToDelete.rank)) {
      toast.error('You do not have permission to delete this role');
      return;
    }
    
    setDeletingRoleId(id);
    openModal('deleteRole');
  };

  const handleDeleteRole = async () => {
    if (!deletingRoleId) return;
    
    try {
      // Check if any users are using this role
      const roleToDelete = roles.find(r => r.id === deletingRoleId);
      if (!roleToDelete) {
        toast.error('Role not found');
        closeModal();
        return;
      }
      
      const { data: usersWithRole, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', roleToDelete.name);
        
      if (checkError) {
        console.error('Error checking users with role:', checkError);
      }
      
      if (usersWithRole && usersWithRole.length > 0) {
        toast.error(`Cannot delete role: ${usersWithRole.length} users have this role assigned`);
        closeModal();
        setDeletingRoleId(null);
        return;
      }
      
      // Delete role
      const { error } = await supabaseAdmin
        .from('roles')
        .delete()
        .eq('id', deletingRoleId);
        
      if (error) {
        console.error('Error deleting role:', error);
        toast.error('Failed to delete role');
        return;
      }
      
      toast.success('Role deleted successfully');
      closeModal();
      setDeletingRoleId(null);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  // Render the appropriate content based on active section
  const renderContent = () => {
    if (loading && (!announcements.length || activeSection !== 'announcements')) {
      return (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      );
    }

    switch (activeSection) {
      case 'announcements':
        return (
          <AnnouncementsSection
            announcements={announcements}
            loading={loading}
            updatingStatus={updatingStatus}
            isAdmin={isAdmin}
            hasPermission={hasPermission}
            confirmDeleteAnnouncement={confirmDeleteAnnouncement}
            handleToggleAnnouncementStatus={handleToggleAnnouncementStatus}
            openCreateAnnouncementModal={() => openModal('announcement')}
          />
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              {(isAdmin() || hasPermission('ADD_USERS')) && (
                <button
                  onClick={() => openModal('user')}
                  className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add User
                </button>
              )}
            </div>
            
            {users.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">No users found.</p>
                {(isAdmin() || hasPermission('ADD_USERS')) && (
                  <button
                    onClick={() => openModal('user')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Add your first user
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="px-4 py-3 text-left text-white">User</th>
                      <th className="px-4 py-3 text-left text-white">Email</th>
                      <th className="px-4 py-3 text-left text-white">Role</th>
                      <th className="px-4 py-3 text-left text-white">Joined</th>
                      <th className="px-4 py-3 text-right text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((userData) => (
                      <tr key={userData.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <CogIcon className="h-6 w-6 text-gray-300" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {userData.display_name || userData.email.split('@')[0]}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {userData.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-800 text-indigo-100">
                            {userData.role || 'User'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {new Date(userData.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditUser(userData)}
                              className="text-indigo-400 hover:text-indigo-300 p-1"
                              disabled={!isAdmin() && !canManageUser(userData.role)}
                            >
                              Edit
                            </button>
                            {(isAdmin() || hasPermission('DELETE_USERS')) && (
                              <button
                                onClick={() => confirmDeleteUser(userData.id, userData.email)}
                                className="text-red-400 hover:text-red-300 p-1"
                                disabled={userData.id === user?.id || (!isAdmin() && !canManageUser(userData.role))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
        
      case 'roles':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Role Management</h2>
              {(isAdmin() || hasPermission('MANAGE_PERMISSIONS')) && (
                <button
                  onClick={() => openModal('role')}
                  className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Create Role
                </button>
              )}
            </div>
            
            {roles.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">No roles found.</p>
                {(isAdmin() || hasPermission('MANAGE_PERMISSIONS')) && (
                  <button
                    onClick={() => openModal('role')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Create your first role
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <div key={role.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{role.name}</h3>
                      
                      <div className="flex items-center gap-2">
                        {(isAdmin() || hasPermission('MANAGE_PERMISSIONS')) && 
                         role.name !== 'Founder' && 
                         (isAdmin() || canManageRole(role.rank)) && (
                          <>
                            <button
                              onClick={() => confirmDeleteRole(role.id)}
                              className="p-1.5 bg-red-900/30 text-red-300 rounded-md hover:bg-red-900/50 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleEditRole(role)}
                              className="p-1.5 bg-blue-900/30 text-blue-300 rounded-md hover:bg-blue-900/50 transition-colors"
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {role.description && (
                      <p className="text-gray-300 mb-4">
                        {role.description}
                      </p>
                    )}
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-1">Rank:</h4>
                      <div className="flex items-center">
                        <div className="bg-gray-700 h-2 rounded-full flex-grow">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full" 
                            style={{ width: `${role.rank ? (role.rank / 100) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-indigo-300 font-medium">
                          {role.rank || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Permissions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map(permission => (
                          <span
                            key={permission}
                            className="px-2 py-1 text-xs bg-indigo-900/30 text-indigo-300 rounded-full border border-indigo-700/50"
                          >
                            {AVAILABLE_PERMISSIONS.find(p => p.id === permission)?.label || permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-300">Select a section from the sidebar.</p>
          </div>
        );
    }
  };

  // Render the dashboard with the layout component
  return (
    <DashboardLayout
      user={user}
      activeSection={activeSection}
      navigation={navigation}
      setActiveSection={setActiveSection}
      logout={logout}
    >
      {renderContent()}

      {/* Modals */}
      <UserModal
        isOpen={modalType === 'user'}
        onClose={closeModal}
        editingUser={editingUser}
        newUser={newUser}
        roles={roles}
        handleUpdateUser={handleUpdateUser}
        handleCreateUser={handleCreateUser}
        setNewUser={setNewUser}
        setEditingUser={setEditingUser}
      />

      <AnnouncementModal
        isOpen={modalType === 'announcement'}
        onClose={closeModal}
        newAnnouncement={newAnnouncement}
        setNewAnnouncement={setNewAnnouncement}
        handleCreateAnnouncement={handleCreateAnnouncement}
      />

      <DeleteConfirmationModal
        isOpen={modalType === 'deleteConfirmation'}
        onClose={closeModal}
        handleDelete={handleDeleteAnnouncement}
      />

      <DeleteUserModal
        isOpen={modalType === 'deleteUser'}
        onClose={() => {
          closeModal();
          setDeletingUserId(null);
          setDeletingUserEmail(null);
        }}
        handleDeleteUser={handleDeleteUser}
        userEmail={deletingUserEmail || ''}
      />

      <RoleModal
        isOpen={modalType === 'role'}
        onClose={closeModal}
        editingRole={editingRole}
        newRole={newRole}
        roleToEdit={editingRole || newRole}
        availablePermissions={AVAILABLE_PERMISSIONS}
        togglePermission={togglePermission}
        handleUpdateRole={handleUpdateRole}
        handleCreateRole={handleCreateRole}
        setEditingRole={setEditingRole}
        setNewRole={setNewRole}
      />

      <DeleteRoleModal
        isOpen={modalType === 'deleteRole'}
        onClose={closeModal}
        handleDeleteRole={handleDeleteRole}
      />
    </DashboardLayout>
  );
}
