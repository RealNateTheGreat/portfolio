import React, { useState } from 'react';
import { Modal } from '../../Modal';
import { Send, Loader, AlertTriangle } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  handleSendEmail: (subject: string, message: string) => Promise<void>;
  isSending: boolean;
  users: any[];
  setSelectedEmailRecipient: React.Dispatch<React.SetStateAction<string>>;
}

export function EmailModal({
  isOpen,
  onClose,
  recipientEmail,
  handleSendEmail,
  isSending,
  users,
  setSelectedEmailRecipient
}: EmailModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendEmail(subject, message);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSending) {
          onClose();
          setSubject('');
          setMessage('');
        }
      }}
      title="Send Email"
    >
      <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded mb-6">
        <div className="flex">
          <AlertTriangle className="text-yellow-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-yellow-300 text-sm">
            This feature uses Cloudflare Email. If you don't receive emails, check your spam folder or 
            verify your Cloudflare Email Routing configuration.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-100 mb-2">
          Recipient
        </label>
        <select
          value={recipientEmail}
          onChange={(e) => setSelectedEmailRecipient(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          disabled={isSending}
        >
          {users.map(user => (
            <option key={user.id} value={user.email}>
              {user.display_name || user.email} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            placeholder="Enter email subject"
            required
            disabled={isSending}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white h-48"
            placeholder="Enter your message"
            required
            disabled={isSending}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={isSending}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (!isSending) {
                onClose();
                setSubject('');
                setMessage('');
              }
            }}
            disabled={isSending}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}