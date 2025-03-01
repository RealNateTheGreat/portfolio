import React, { useEffect } from 'react';
import { Modal } from '../../Modal';
import { Shield } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  } | null;
  newUser: {
    email: string;
    password: string;
    displayName: string;
    role: string;
  };
  roles: any[];
  handleUpdateUser: (e: React.FormEvent) => Promise<void>;
  handleCreateUser: (e: React.FormEvent) => Promise<void>;
  setNewUser: React.Dispatch<React.SetStateAction<{
    email: string;
    password: string;
    displayName: string;
    role: string;
  }>>;
  setEditingUser: React.Dispatch<React.SetStateAction<{
    id: string;
    email: string;
    displayName: string;
    role: string;
  } | null>>;
  openPasswordResetModal: (email: string) => void;
}

export function UserModal({
  isOpen,
  onClose,
  editingUser,
  newUser,
  roles,
  handleUpdateUser,
  handleCreateUser,
  setNewUser,
  setEditingUser,
  openPasswordResetModal
}: UserModalProps) {
  // Pre-select a default role if none is selected
  useEffect(() => {
    // If editing a user and no role selected, set a default
    if (editingUser && !editingUser.role && roles.length > 0) {
      setEditingUser({
        ...editingUser,
        role: roles.find(r => r.name === 'User')?.name || roles[0].name
      });
    }
    
    // If creating a user and no role selected, set a default
    if (!editingUser && !newUser.role && roles.length > 0) {
      setNewUser(prev => ({
        ...prev,
        role: roles.find(r => r.name === 'User')?.name || roles[0].name
      }));
    }
  }, [isOpen, roles, editingUser, newUser]);

  // Sort roles by rank for the dropdown
  const sortedRoles = [...roles].sort((a, b) => {
    // Sort by rank (descending) with fallback to name
    if (a.rank !== undefined && b.rank !== undefined) {
      return b.rank - a.rank;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setEditingUser(null);
      }}
      title={editingUser ? "Edit User" : "Add New User"}
    >
      <form className="space-y-4" onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Email
          </label>
          <input
            type="email"
            value={editingUser ? editingUser.email : newUser.email}
            onChange={(e) => editingUser 
              ? setEditingUser({ ...editingUser, email: e.target.value })
              : setNewUser(prev => ({ ...prev, email: e.target.value }))
            }
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={editingUser ? editingUser.displayName : newUser.displayName}
            onChange={(e) => editingUser 
              ? setEditingUser({ ...editingUser, displayName: e.target.value })
              : setNewUser(prev => ({ ...prev, displayName: e.target.value }))
            }
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            placeholder={editingUser 
              ? editingUser.email.split('@')[0] 
              : newUser.email ? newUser.email.split('@')[0] : 'Display Name'
            }
          />
        </div>
        
        <div>
          <label className="flex items-center text-sm font-medium text-gray-100 mb-2">
            <Shield className="w-4 h-4 mr-2 text-indigo-400" />
            Role
          </label>
          <div className="relative">
            <select
              value={editingUser ? editingUser.role : newUser.role}
              onChange={(e) => editingUser 
                ? setEditingUser({ ...editingUser, role: e.target.value })
                : setNewUser(prev => ({ ...prev, role: e.target.value }))
              }
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white appearance-none pr-8"
            >
              {sortedRoles.length === 0 ? (
                <option value="">No roles available</option>
              ) : (
                sortedRoles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.name} {role.rank !== undefined ? `(Rank: ${role.rank})` : ''}
                  </option>
                ))
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          {sortedRoles.length === 0 && (
            <p className="text-red-400 text-xs mt-1">
              No roles are available. Please create roles in the Role Management section first.
            </p>
          )}
        </div>
        
        {!editingUser && (
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2">
              Password
            </label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ 
                ...prev, 
                password: e.target.value 
              }))}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            />
          </div>
        )}
        
        {editingUser && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => openPasswordResetModal(editingUser.email)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Send Password Reset Link
            </button>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          {editingUser ? "Update User" : "Create User"}
        </button>
      </form>
    </Modal>
  );
}