import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertCircle, Calendar, X } from 'lucide-react';
import { Modal } from '../Modal';
import { Database } from '../../types/database.types';

type Announcement = Database['public']['Tables']['announcements']['Row'];

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({ 
  isOpen, 
  onClose, 
  announcements 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Announcements">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {announcements.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-8"
          >
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-center">No announcements available at this time.</p>
          </motion.div>
        ) : (
          announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              variants={itemVariants}
              className="bg-anime-dark border border-pink-500/20 rounded-lg overflow-hidden"
            >
              <div className="p-4 border-b border-pink-500/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-pink-400 mr-3 flex-shrink-0" />
                    <h3 className="text-xl font-semibold text-white">{announcement.title}</h3>
                  </div>
                </div>
                <div className="flex items-center mt-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(announcement.created_at)}</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{announcement.content}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
        
        <motion.div 
          variants={itemVariants} 
          className="flex justify-center"
        >
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-white hover:bg-pink-500/30 transition-colors"
          >
            <X className="w-5 h-5 mr-2 inline-block" />
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    </Modal>
  );
};

export default AnnouncementsModal;