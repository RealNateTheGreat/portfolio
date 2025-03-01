import React from 'react';
import { Modal } from '../../Modal';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  newAnnouncement: {
    title: string;
    content: string;
  };
  setNewAnnouncement: React.Dispatch<React.SetStateAction<{
    title: string;
    content: string;
  }>>;
  handleCreateAnnouncement: (e: React.FormEvent) => Promise<void>;
}

export function AnnouncementModal({
  isOpen,
  onClose,
  newAnnouncement,
  setNewAnnouncement,
  handleCreateAnnouncement
}: AnnouncementModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Announcement"
    >
      <form className="space-y-4" onSubmit={handleCreateAnnouncement}>
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Title
          </label>
          <input
            type="text"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement(prev => ({ 
              ...prev, 
              title: e.target.value 
            }))}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Content
          </label>
          <textarea
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement(prev => ({ 
              ...prev, 
              content: e.target.value 
            }))}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white h-36"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Create Announcement
        </button>
      </form>
    </Modal>
  );
}