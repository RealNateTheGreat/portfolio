import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ToggleLeft, ToggleRight, Check, ChevronDown, Shield, User } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Modal } from '../../Modal';
import toast from 'react-hot-toast';
import { userOperations } from '../../../lib/supabase';
import { AdminPermission } from '../../../types/database.types';
import { useAdmin } from '../../../context/AdminContext';

interface AdminUser {
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

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser | null;
  onSuccess: (user: AdminUser, isUpdate: boolean) => void;
}

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  display_name: string;
  permissions: AdminPermission[];
  level: number;
  role_name: string;
  role_color: string;
  profile_image_url: string;
  is_active: boolean;
}

const defaultFormData: FormData = {
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  display_name: '',
  permissions: [],
  level: 1,
  role_name: '',
  role_color: '#6366f1',
  profile_image_url: '',
  is_active: true,
};

// Available permissions with descriptive labels
const availablePermissions: { value: AdminPermission; label: string }[] = [
  { value: 'create_announcements', label: 'Create Announcements' },
  { value: 'create_servers', label: 'Create Servers' },
  { value: 'manage_users', label: 'Manage Users' },
];

// A list of predefined colors for role selection
const predefinedColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [permissionsMenuOpen, setPermissionsMenuOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const isEditing = !!user;
  const { currentUser } = useAdmin();

  // Determine if current user can set high privilege levels
  const canSetHighPrivileges = currentUser?.username === 'ADMIN' || (currentUser?.level || 0) >= 50;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '',
        confirmPassword: '',
        email: user.email || '',
        display_name: user.display_name || '',
        permissions: user.permissions || [],
        level: user.level || 1,
        role_name: user.role_name || '',
        role_color: user.role_color || '#6366f1',
        profile_image_url: user.profile_image_url || '',
        is_active: user.is_active,
      });
    } else {
      setFormData(defaultFormData);
    }
    setColorPickerOpen(false);
    setPermissionsMenuOpen(false);
  }, [user, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Make sure we have a valid number and limit maximum based on current user's level
    if (!isNaN(value) && value >= 1) {
      // If current user is not ADMIN, limit the maximum level they can set
      const maxLevel = currentUser?.username === 'ADMIN' ? 100 : (currentUser?.level || 1) - 1;
      setFormData({ ...formData, level: Math.min(value, maxLevel) });
    }
  };

  const toggleActive = () => {
    setFormData({
      ...formData,
      is_active: !formData.is_active,
    });
  };

  const togglePermission = (permission: AdminPermission) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permission)
        ? formData.permissions.filter(p => p !== permission)
        : [...formData.permissions, permission]
    });
  };

  const handleColorChange = (color: string) => {
    setFormData({
      ...formData,
      role_color: color
    });
  };

  const setPresetColor = (color: string) => {
    setFormData({
      ...formData,
      role_color: color
    });
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }

    // Password validation only on create or if password is provided on edit
    if (!isEditing || formData.password) {
      if (!isEditing && !formData.password) {
        toast.error('Password is required');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    }

    // Email validation if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Level validation
    if (formData.level < 1) {
      toast.error('User level must be at least 1');
      return false;
    }

    // If current user is not ADMIN, check if they're trying to set a level too high
    if (currentUser?.username !== 'ADMIN' && formData.level >= (currentUser?.level || 0)) {
      toast.error(`You cannot set a user level equal to or higher than your own (${currentUser?.level})`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      let savedUser: AdminUser;
      const isUpdate = isEditing && !!user;

      if (isUpdate && user) {
        // Update existing user
        const updateData = {
          username: formData.username,
          email: formData.email || null,
          display_name: formData.display_name || null,
          permissions: formData.permissions,
          level: formData.level,
          role_name: formData.role_name || null,
          role_color: formData.role_color || null,
          profile_image_url: formData.profile_image_url || null,
          is_active: formData.is_active,
        };

        // Only include password if it's been changed
        if (formData.password) {
          Object.assign(updateData, { password: formData.password });
        }

        savedUser = await userOperations.update(user.id, updateData);
        toast.success('User updated successfully!');
      } else {
        // Create new user
        savedUser = await userOperations.create({
          username: formData.username,
          password: formData.password,
          email: formData.email || undefined,
          display_name: formData.display_name || undefined,
          permissions: formData.permissions,
          level: formData.level,
          role_name: formData.role_name || undefined,
          role_color: formData.role_color || undefined,
          profile_image_url: formData.profile_image_url || undefined,
          is_active: formData.is_active,
        });
        toast.success('User created successfully!');
      }

      // Pass the saved user and update flag back to parent component
      onSuccess(savedUser, isUpdate);
    } catch (err: any) {
      console.error('Error saving user:', err);
      
      // Handle specific errors
      if (err.message && err.message.includes('duplicate key')) {
        toast.error('Username already exists');
      } else {
        toast.error('Failed to save user. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit User' : 'Add New User'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Profile Image Preview */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center mb-2 mx-auto border-2 border-gray-700">
                {formData.profile_image_url ? (
                  <img 
                    src={formData.profile_image_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Profile Image URL */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Profile Image URL</label>
            <input
              type="url"
              name="profile_image_url"
              value={formData.profile_image_url}
              onChange={handleInputChange}
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">Use a direct image URL from a hosting service</p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              disabled={submitting || (isEditing && true)} // Disable username editing
            />
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">
              {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required={!isEditing}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">
              {isEditing ? 'Confirm New Password' : 'Confirm Password'}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required={!isEditing || !!formData.password}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Display Name (optional)</label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Email (optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Role Name</label>
              <input
                type="text"
                name="role_name"
                value={formData.role_name}
                onChange={handleInputChange}
                className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
                placeholder="e.g. Admin, Moderator, etc."
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Level</label>
              <input
                type="number"
                name="level"
                value={formData.level}
                onChange={handleLevelChange}
                min="1"
                max={canSetHighPrivileges ? 100 : (currentUser?.level || 1) - 1}
                className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher levels have more authority. Users can only manage users with lower levels than themselves.
                {!canSetHighPrivileges && ` You can only set levels up to ${(currentUser?.level || 1) - 1}.`}
              </p>
            </div>
          </div>

          {/* Role Color Picker */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Role Color</label>
            <div className="relative">
              <div 
                className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 cursor-pointer flex items-center"
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
              >
                <div 
                  className="w-6 h-6 rounded-full mr-2" 
                  style={{ backgroundColor: formData.role_color || '#6366f1' }}
                ></div>
                <span className="text-white">{formData.role_color || 'Select a color'}</span>
              </div>

              {colorPickerOpen && (
                <div className="absolute z-10 mt-2 bg-anime-dark border border-gray-700 rounded-lg p-4 shadow-xl">
                  <HexColorPicker 
                    color={formData.role_color} 
                    onChange={handleColorChange}
                    className="mb-3"
                  />
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {predefinedColors.map(color => (
                      <div 
                        key={color}
                        className="w-6 h-6 rounded-full cursor-pointer border-2 border-gray-700 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setPresetColor(color);
                          setColorPickerOpen(false);
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-xs text-gray-400 hover:text-white mt-2"
                      onClick={() => setColorPickerOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Preview of Role Badge */}
            {formData.role_name && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Preview:</p>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium border-2 inline-block`}
                  style={{
                    backgroundColor: `${formData.role_color}40`,
                    borderColor: formData.role_color,
                    color: getContrastTextColor(formData.role_color)
                  }}
                >
                  {formData.role_name}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Permissions</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setPermissionsMenuOpen(!permissionsMenuOpen)}
                className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white flex items-center justify-between"
                disabled={submitting}
              >
                <span>
                  {formData.permissions.length === 0 
                    ? 'No permissions' 
                    : `${formData.permissions.length} permission${formData.permissions.length !== 1 ? 's' : ''} selected`}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${permissionsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {permissionsMenuOpen && (
                <div className="absolute z-10 mt-1 w-full bg-anime-dark border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 space-y-1">
                    {availablePermissions.map(permission => (
                      <div
                        key={permission.value}
                        className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer"
                        onClick={() => togglePermission(permission.value)}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 
                          ${formData.permissions.includes(permission.value) 
                            ? 'bg-pink-500 border-pink-500' 
                            : 'border-gray-600'}`}
                        >
                          {formData.permissions.includes(permission.value) && 
                            <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-white">{permission.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.permissions.map(perm => {
                const permInfo = availablePermissions.find(p => p.value === perm);
                return (
                  <div 
                    key={perm}
                    className="bg-pink-500/20 text-pink-400 text-xs px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{permInfo?.label || perm}</span>
                    <button 
                      type="button" 
                      onClick={() => togglePermission(perm)}
                      disabled={submitting}
                      className="ml-2 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={toggleActive}
              className="flex items-center text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {formData.is_active ? (
                <>
                  <ToggleRight className="w-6 h-6 text-green-500 mr-2" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-gray-500 mr-2" />
                  <span>Inactive</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 disabled:bg-pink-800 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isEditing ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Helper function to determine text color based on background color
function getContrastTextColor(hexColor: string): string {
  // Default to white if no color
  if (!hexColor) return 'white';
  
  // Remove # if present
  hexColor = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright colors, white for dark ones
  return luminance > 0.5 ? 'black' : 'white';
}

export default UserFormModal;