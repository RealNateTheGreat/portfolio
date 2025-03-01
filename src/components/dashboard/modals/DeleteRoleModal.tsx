import React from 'react';
import { Modal } from '../../Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleDeleteRole: () => Promise<void>;
}

export function DeleteRoleModal({
  isOpen,
  onClose,
  handleDeleteRole
}: DeleteRoleModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Role Deletion"
    >
      <div className="space-y-6">
        <div className="flex items-center text-red-500">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <p className="font-medium">
            Are you sure you want to delete this role?
          </p>
        </div>
        
        <p className="text-gray-300">
          This action cannot be undone. This role will be permanently removed.
        </p>
        
        <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded">
          <p className="text-yellow-300 text-sm">
            You can only delete a role if no users are currently assigned to it.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleDeleteRole}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Yes, Delete Role
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}