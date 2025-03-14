import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Loader } from 'lucide-react';
import { Modal } from '../../Modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isProcessing?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 bg-red-500/10 p-2 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <p className="text-gray-300 mb-2">{message}</p>
            <p className="text-gray-400 text-sm">This action cannot be undone.</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-800 flex justify-end space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            Cancel
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 flex items-center space-x-2 disabled:bg-red-800 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5 mr-2" />
                <span>Delete</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;