import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Edit, AlertCircle, Loader, CheckCircle, XCircle, Shield, User } from 'lucide-react';
import { userOperations } from '../../lib/supabase';
import toast from 'react-hot-toast';
import UserFormModal from './modals/UserFormModal';
import { useAdmin } from '../../context/AdminContext';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';

interface AdminUser {
  id: string;
  username: string;
  email?: string | null;
  display_name?: string | null;
  permissions: string[];
  level: number;
  role_name?: string | null;
  role_color?: string | null;
  profile_image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { currentUser, canManageUser } = useAdmin();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userOperations.getAll();
      setUsers(data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const startEditing = (user: AdminUser) => {
    setSelectedUser(user);
    setIsAddingUser(true);
  };
  
  const confirmDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
  };
  
  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setSubmitting(true);
      await userOperations.delete(userToDelete.id);
      
      // Update local state immediately
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      
      toast.success('User deleted successfully!');
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user. Please try again.');
      // Refresh users list to ensure UI is in sync with backend
      fetchUsers();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle successful user creation/update
  const handleUserSuccess = (user: AdminUser, isUpdate: boolean = false) => {
    if (isUpdate) {
      // Update existing user in the list
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    } else {
      // Add new user to the list
      setUsers(prev => [...prev, user]);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to get contrast text color based on background
  const getContrastText = (hexColor: string) => {
    // Default to white text if no color provided
    if (!hexColor) return 'text-white';
    
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white depending on luminance
    return luminance > 0.5 ? 'text-gray-900' : 'text-white';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-pink-500 animate-spin" />
        <span className="ml-2 text-gray-400">Loading users...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-anime">Manage Admin Users</h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedUser(null);
            setIsAddingUser(true);
          }}
          className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* User Form Modal */}
      <UserFormModal
        isOpen={isAddingUser}
        onClose={() => setIsAddingUser(false)}
        user={selectedUser}
        onSuccess={(user, isUpdate) => {
          handleUserSuccess(user, isUpdate);
          setIsAddingUser(false);
        }}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={deleteUser}
        title="Delete User"
        message={`Are you sure you want to delete the user "${userToDelete?.display_name || userToDelete?.username}"? This action cannot be undone.`}
        isProcessing={submitting}
      />
      
      {users.length === 0 ? (
        <div className="bg-anime-dark border border-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">No users found. Add a new admin user to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Desktop view */}
          <div className="hidden md:block overflow-hidden border border-gray-800 rounded-lg">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-anime-dark">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-anime-darker divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-anime-dark/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border-2 border-gray-700">
                          {user.profile_image_url ? (
                            <img 
                              src={user.profile_image_url}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.display_name || user.username}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.username}
                          </div>
                          {user.email && (
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role_name ? (
                        <div className="flex flex-col space-y-1">
                          <span 
                            className={`px-3 py-1 rounded-full text-sm font-medium border-2 inline-block w-fit ${
                              user.role_color 
                                ? `${getContrastText(user.role_color)}`
                                : 'text-white border-gray-600'
                            }`}
                            style={{
                              backgroundColor: user.role_color ? `${user.role_color}40` : 'transparent',
                              borderColor: user.role_color || '#4B5563'
                            }}
                          >
                            {user.role_name}
                          </span>
                          <div className="text-xs text-gray-500">
                            Level: {user.level}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-300">
                            {user.level >= 100 ? 'Administrator' : 'User'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Level: {user.level}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Only show edit button if user has permission to edit this user */}
                        {canManageUser(user.level) && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditing(user)}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={submitting}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => confirmDeleteUser(user)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={submitting}
                            >
                              <Trash className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                        
                        {/* If current user can't manage this user, show a disabled indicator */}
                        {!canManageUser(user.level) && currentUser?.username !== user.username && (
                          <div className="p-2 bg-gray-800 text-gray-500 rounded-full cursor-not-allowed" title="You don't have permission to manage this user">
                            <Shield className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-anime-dark border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border-2 border-gray-700">
                      {user.profile_image_url ? (
                        <img 
                          src={user.profile_image_url}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.display_name || user.username}
                      </div>
                      <div className="text-sm text-gray-400">
                        {user.username}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {user.is_active ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Role</div>
                    {user.role_name ? (
                      <span 
                        className={`px-2 py-0.5 text-xs rounded-full font-medium border inline-block ${
                          user.role_color 
                            ? `${getContrastText(user.role_color)}`
                            : 'text-white border-gray-600'
                        }`}
                        style={{
                          backgroundColor: user.role_color ? `${user.role_color}40` : 'transparent',
                          borderColor: user.role_color || '#4B5563'
                        }}
                      >
                        {user.role_name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300">
                        {user.level >= 100 ? 'Administrator' : 'User'}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500">Level</div>
                    <div className="text-sm text-gray-300">{user.level}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="text-sm text-gray-300">{formatDate(user.created_at)}</div>
                  </div>
                  
                  {user.email && (
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm text-gray-300 truncate">{user.email}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 border-t border-gray-800 pt-3">
                  {canManageUser(user.level) && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startEditing(user)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitting}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => confirmDeleteUser(user)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitting}
                      >
                        <Trash className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}
                  
                  {!canManageUser(user.level) && currentUser?.username !== user.username && (
                    <div className="p-2 bg-gray-800 text-gray-500 rounded-full cursor-not-allowed" title="You don't have permission to manage this user">
                      <Shield className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;