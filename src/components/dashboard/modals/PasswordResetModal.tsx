import React from 'react';
import { Modal } from '../../Modal';
import { Loader, Mail } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwordResetEmail: string;
  sendingPasswordReset: boolean;
  handleSendPasswordReset: () => Promise<void>;
  setPasswordResetEmail: React.Dispatch<React.SetStateAction<string>>;
}

export function PasswordResetModal({
  isOpen,
  onClose,
  passwordResetEmail,
  sendingPasswordReset,
  handleSendPasswordReset,
  setPasswordResetEmail
}: PasswordResetModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setPasswordResetEmail('');
      }}
      title="Send Password Reset Link"
    >
      <div className="space-y-6">
        <p className="text-gray-300">
          A password reset link will be sent to:
        </p>
        
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-md text-white">
          {passwordResetEmail}
        </div>
        
        <div className="border-l-4 border-blue-500 bg-blue-500/10 p-4 rounded">
          <p className="text-blue-300 text-sm">
            The user will receive instructions to reset their password.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSendPasswordReset}
            disabled={sendingPasswordReset}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {sendingPasswordReset ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Reset Link
              </>
            )}
          </button>
          <button
            onClick={() => {
              onClose();
              setPasswordResetEmail('');
            }}
            disabled={sendingPasswordReset}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}