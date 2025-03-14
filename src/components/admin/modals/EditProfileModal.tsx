import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, User } from 'lucide-react';
import { Modal } from '../../Modal';
import toast from 'react-hot-toast';
import { userOperations } from '../../../lib/supabase';
import { useAdmin } from '../../../context/AdminContext';
import { HexColorPicker } from 'react-colorful';

interface FormData {
  display_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role_name: string;
  role_color: string;
  profile_image_url: string;
}

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

const EditProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { currentUser, updateLocalUserData } = useAdmin();
  const [formData, setFormData] = useState<FormData>({
    display_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_name: '',
    role_color: '#6366f1',
    profile_image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        display_name: currentUser.display_name || '',
        email: '', // We don't have this in currentUser from localStorage
        password: '',
        confirmPassword: '',
        role_name: currentUser.role_name || '',
        role_color: currentUser.role_color || '#6366f1',
        profile_image_url: currentUser.profile_image_url || '',
      });

      // Fetch full user data to get email
      const fetchUserDetails = async () => {
        if (currentUser.id) {
          try {
            const userData = await userOperations.getById(currentUser.id);
            if (userData) {
              setFormData(prevData => ({
                ...prevData,
                email: userData.email || '',
              }));
            }
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        }
      };

      if (isOpen) {
        fetchUserDetails();
      }
    }
  }, [currentUser, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    setColorPickerOpen(false);
  };

  const validateForm = () => {
    // Password validation if provided
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentUser) {
      return;
    }

    try {
      setSubmitting(true);

      // Update user in database
      const updateData: any = {
        display_name: formData.display_name || null,
        profile_image_url: formData.profile_image_url || null,
        role_color: formData.role_color || null,
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Call the user update function
      const updatedUser = await userOperations.update(currentUser.id, updateData);
      
      if (!updatedUser) {
        throw new Error("Failed to update profile");
      }
      
      // Update local state in AdminContext
      updateLocalUserData({
        display_name: formData.display_name || null,
        profile_image_url: formData.profile_image_url || null,
        role_color: formData.role_color || null,
      });
      
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
      {currentUser && (
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
                value={currentUser.username}
                className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white cursor-not-allowed opacity-70"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Display Name</label>
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
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white cursor-not-allowed opacity-70"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">New Password (leave blank to keep current)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <p className="text-xs text-gray-400 mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Role Name</label>
              <input
                type="text"
                value={formData.role_name}
                className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white cursor-not-allowed opacity-70"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Role name cannot be changed</p>
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
                          onClick={() => setPresetColor(color)}
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
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

export default EditProfileModal;