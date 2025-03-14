import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Edit, AlertCircle, Loader } from 'lucide-react';
import { announcementOperations } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import toast from 'react-hot-toast';
import AnnouncementFormModal from './modals/AnnouncementFormModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';

type Announcement = Database['public']['Tables']['announcements']['Row'];

const AnnouncementsTab: React.FC<{ key?: number }> = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementOperations.getAll();
      setAnnouncements(data);
      setError('');
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const startEditing = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsAddingAnnouncement(true);
  };
  
  const confirmDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
  };
  
  const deleteAnnouncement = async () => {
    if (!announcementToDelete) return;
    
    try {
      setSubmitting(true);
      await announcementOperations.delete(announcementToDelete.id);
      
      // Update local state immediately
      setAnnouncements(prev => prev.filter(a => a.id !== announcementToDelete.id));
      
      toast.success('Announcement deleted successfully!');
      setAnnouncementToDelete(null);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      toast.error('Failed to delete announcement. Please try again.');
      // Refresh announcements list to ensure UI is in sync with backend
      fetchAnnouncements();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle successful announcement creation/update
  const handleAnnouncementSuccess = (announcement: Announcement, isUpdate: boolean = false) => {
    if (isUpdate) {
      // Update existing announcement in the list
      setAnnouncements(prev => prev.map(a => a.id === announcement.id ? announcement : a));
    } else {
      // Add new announcement to the list
      setAnnouncements(prev => [announcement, ...prev]);
    }
    // Close the modal after successful operation
    setIsAddingAnnouncement(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-pink-500 animate-spin" />
        <span className="ml-2 text-gray-400">Loading announcements...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-anime">Manage Announcements</h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedAnnouncement(null);
            setIsAddingAnnouncement(true);
          }}
          className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Add Announcement</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Announcement Form Modal */}
      <AnnouncementFormModal
        isOpen={isAddingAnnouncement}
        onClose={() => setIsAddingAnnouncement(false)}
        announcement={selectedAnnouncement}
        onSuccess={handleAnnouncementSuccess}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={announcementToDelete !== null}
        onClose={() => setAnnouncementToDelete(null)}
        onConfirm={deleteAnnouncement}
        title="Delete Announcement"
        message={`Are you sure you want to delete the announcement "${announcementToDelete?.title}"? This action cannot be undone.`}
        isProcessing={submitting}
      />
      
      {announcements.length === 0 ? (
        <div className="bg-anime-dark border border-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">No announcements found. Add a new announcement to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              layoutId={`announcement-${announcement.id}`}
              className="bg-anime-dark border border-gray-800 rounded-lg overflow-hidden p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white break-words">{announcement.title}</h3>
                    {announcement.is_active ? (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-600/20 text-gray-400 text-xs px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Created: {formatDate(announcement.created_at)}
                  </p>
                  {announcement.updated_at !== announcement.created_at && (
                    <p className="text-gray-500 text-xs">
                      Updated: {formatDate(announcement.updated_at)}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2 sm:flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => startEditing(announcement)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => confirmDeleteAnnouncement(announcement)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    <Trash className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="mt-4 bg-anime-darker p-4 rounded-lg">
                <p className="text-gray-300 whitespace-pre-line break-words">{announcement.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTab;