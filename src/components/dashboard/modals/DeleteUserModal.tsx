import React from 'react';
import { Modal } from '../../Modal';
import { AlertTriangle, UserX } from 'lucide-react';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleDeleteUser: () => Promise<void>;
  userEmail?: string;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  handleDeleteUser,
  userEmail
}: DeleteUserModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm User Deletion"
    >
      <div className="space-y-6">
        <div className="flex items-center text-red-500">
          <AlertTriangle className="w-6 h-6 mr-2 flex-shrink-0" />
          <p className="font-medium">
            Are you sure you want to delete this user{userEmail ? ` (${userEmail})` : ''}?
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg flex items-start space-x-3 border border-yellow-600/30">
          <UserX className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium mb-1">Warning</p>
            <p className="text-gray-300 text-sm">
              This will permanently delete the user account and all associated data:
            </p>
            <ul className="text-gray-400 text-sm mt-2 list-disc pl-5 space-y-1">
              <li>User profile information</li>
              <li>User authentication data</li>
              <li>Any content created by this user</li>
            </ul>
          </div>
        </div>
        
        <p className="text-gray-300">
          This action cannot be undone. Are you absolutely sure you want to proceed?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleDeleteUser}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center"
          >
            <UserX className="w-4 h-4 mr-2" />
            <span>Yes, Delete User</span>
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