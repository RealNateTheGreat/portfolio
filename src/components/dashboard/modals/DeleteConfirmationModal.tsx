import React from 'react';
import { Modal } from '../../Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleDelete: () => Promise<void>;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  handleDelete
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
    >
      <div className="space-y-6">
        <div className="flex items-center text-red-500">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <p className="font-medium">
            Are you sure you want to delete this announcement?
          </p>
        </div>
        
        <p className="text-gray-300">
          This action cannot be undone. The announcement will be permanently removed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Yes, Delete
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