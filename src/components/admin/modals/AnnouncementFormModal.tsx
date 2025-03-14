import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, ToggleLeft, ToggleRight, Loader } from 'lucide-react';
import { Modal } from '../../Modal';
import { Database } from '../../../types/database.types';
import toast from 'react-hot-toast';
import { announcementOperations } from '../../../lib/supabase';

type Announcement = Database['public']['Tables']['announcements']['Row'];
type AnnouncementInput = Database['public']['Tables']['announcements']['Insert'];

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement?: Announcement | null;
  onSuccess: (announcement: Announcement, isUpdate: boolean) => void;
}

const defaultAnnouncement: AnnouncementInput = {
  title: '',
  content: '',
  is_active: true,
};

const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  isOpen,
  onClose,
  announcement,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AnnouncementInput>(defaultAnnouncement);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData(announcement);
    } else {
      setFormData(defaultAnnouncement);
    }
  }, [announcement, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleActive = () => {
    setFormData({
      ...formData,
      is_active: !formData.is_active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Validate required fields
      if (!formData.title || !formData.content) {
        toast.error('Please fill in all required fields');
        return;
      }

      let savedAnnouncement: Announcement;
      const isUpdate = !!announcement?.id;

      if (isUpdate) {
        savedAnnouncement = await announcementOperations.update(announcement.id, formData);
        toast.success('Announcement updated successfully!');
      } else {
        savedAnnouncement = await announcementOperations.create(formData);
        toast.success('Announcement added successfully!');
      }

      // Pass the saved announcement and update flag back to parent component
      onSuccess(savedAnnouncement, isUpdate);
    } catch (err) {
      console.error('Error saving announcement:', err);
      toast.error('Failed to save announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={announcement ? 'Edit Announcement' : 'Add New Announcement'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[150px]"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={toggleActive}
            className="flex items-center text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {formData.is_active ? (
              <>
                <ToggleRight className="w-6 h-6 text-green-500 mr-2" />
                <span>Active</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-6 h-6 text-gray-500 mr-2" />
                <span>Inactive</span>
              </>
            )}
          </button>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 disabled:bg-pink-800 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                {announcement ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {announcement ? 'Update Announcement' : 'Save Announcement'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AnnouncementFormModal;