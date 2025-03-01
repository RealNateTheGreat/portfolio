import React, { useState, useEffect } from 'react';
import { Modal } from '../../Modal';
import { Permission } from '../../../types';
import { Info } from 'lucide-react';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRole: any | null;
  newRole: {
    name: string;
    description: string;
    permissions: Permission[];
    rank?: number;
  };
  roleToEdit: any;
  availablePermissions: { id: Permission; label: string }[];
  togglePermission: (permission: Permission) => void;
  handleUpdateRole: (e: React.FormEvent) => Promise<void>;
  handleCreateRole: (e: React.FormEvent) => Promise<void>;
  setEditingRole: React.Dispatch<React.SetStateAction<any | null>>;
  setNewRole: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    permissions: Permission[];
    rank?: number;
  }>>;
}

export function RoleModal({
  isOpen,
  onClose,
  editingRole,
  newRole,
  roleToEdit,
  availablePermissions,
  togglePermission,
  handleUpdateRole,
  handleCreateRole,
  setEditingRole,
  setNewRole
}: RoleModalProps) {
  const isSystemRole = editingRole?.name === 'Founder' || editingRole?.name === 'User';
  const [rankValue, setRankValue] = useState<number | undefined>(100);

  // Initialize rank value from the role being edited or created
  useEffect(() => {
    if (editingRole) {
      setRankValue(editingRole.rank);
    } else {
      setRankValue(50); // Default rank for new roles
    }
  }, [editingRole, isOpen]);

  // Handle rank value changes
  const handleRankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    
    // Ensure the value is within range 1-99
    const boundedValue = Math.min(Math.max(value, 1), 99);
    
    setRankValue(boundedValue);
    
    if (editingRole) {
      setEditingRole({...editingRole, rank: boundedValue});
    } else {
      setNewRole({...newRole, rank: boundedValue});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setEditingRole(null);
      }}
      title={editingRole ? "Edit Role" : "Create New Role"}
    >
      <form className="space-y-6" onSubmit={editingRole ? handleUpdateRole : handleCreateRole}>
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Role Name
          </label>
          <input
            type="text"
            value={roleToEdit.name}
            onChange={(e) => editingRole 
              ? setEditingRole({...editingRole, name: e.target.value})
              : setNewRole({...newRole, name: e.target.value})
            }
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            required
            disabled={isSystemRole}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Description
          </label>
          <textarea
            value={roleToEdit.description || ''}
            onChange={(e) => editingRole 
              ? setEditingRole({...editingRole, description: e.target.value})
              : setNewRole({...newRole, description: e.target.value})
            }
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white h-24"
            placeholder="Describe the purpose of this role"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Rank Level (1-99)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="99"
              value={rankValue || 50}
              onChange={handleRankChange}
              className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={isSystemRole && editingRole?.name === 'Founder'}
            />
            <input
              type="number"
              min="1"
              max="99"
              value={rankValue || 50}
              onChange={handleRankChange}
              className="w-16 p-2 bg-gray-800 border border-gray-700 rounded-md text-white text-center"
              disabled={isSystemRole && editingRole?.name === 'Founder'}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Higher ranks have more authority (Founder = 100, User = 0)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-3">
            Permissions
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availablePermissions.map(permission => (
              <div 
                key={permission.id} 
                className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
              >
                <span className="text-white">{permission.label}</span>
                <button
                  type="button"
                  onClick={() => togglePermission(permission.id)}
                  disabled={(
                    editingRole?.name === 'Founder' && 
                    permission.id === 'ADMINISTRATOR'
                  )}
                  className={`w-12 h-6 rounded-full p-1 ${
                    roleToEdit.permissions.includes(permission.id) 
                      ? 'bg-indigo-600' 
                      : 'bg-gray-700'
                  } relative transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    (editingRole?.name === 'Founder' && 
                    permission.id === 'ADMINISTRATOR') 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${
                      roleToEdit.permissions.includes(permission.id) 
                        ? 'translate-x-6' 
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-2 flex items-start bg-indigo-900/20 p-3 rounded-md border border-indigo-800/30">
          <Info className="w-5 h-5 text-indigo-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-300">
            Roles with higher ranks have more authority. The rank determines a user's position in the hierarchy.
            Permissions control what actions a user can perform in the system.
          </p>
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          disabled={isSystemRole && editingRole?.name === 'Founder'}
        >
          {editingRole ? "Update Role" : "Create Role"}
        </button>
        
        {editingRole?.name === 'Founder' && (
          <p className="text-yellow-500 text-sm text-center">
            The Founder role cannot be modified as it has all permissions by default.
          </p>
        )}
        
        {editingRole?.name === 'User' && (
          <p className="text-yellow-500 text-sm text-center">
            The User role's name cannot be changed, but other properties can be modified.
          </p>
        )}
      </form>
    </Modal>
  );
}