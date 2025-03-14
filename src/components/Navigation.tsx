import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface NavigationProps {
  scrollToServers: () => void;
  openAboutModal: () => void;
  openAnnouncementsModal: () => void;
  hasAnnouncements: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  scrollToServers, 
  openAboutModal, 
  openAnnouncementsModal,
  hasAnnouncements 
}) => {
  return (
    <motion.div 
      className="nav-container z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <nav className="nav-border">
        <div className="flex items-center justify-center h-16">
          <div className="flex items-center space-x-4 sm:space-x-8 md:space-x-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-white hover:text-pink-200 transition-colors text-sm sm:text-base px-3 py-1.5 rounded-full hover:bg-white/5"
            >
              Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToServers}
              className="text-white hover:text-pink-200 transition-colors text-sm sm:text-base px-3 py-1.5 rounded-full hover:bg-white/5"
            >
              Servers
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openAnnouncementsModal}
              className="text-white hover:text-pink-200 transition-colors text-sm sm:text-base px-3 py-1.5 rounded-full hover:bg-white/5 relative"
            >
              <Bell className="w-5 h-5" />
              {hasAnnouncements && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openAboutModal}
              className="px-4 py-2 bg-pink-400/20 border-2 border-pink-600 rounded-full text-white hover:bg-pink-400/30 transition-all text-sm sm:text-base min-w-[90px] sm:min-w-[100px]"
            >
              About Me
            </motion.button>
          </div>
        </div>
      </nav>
    </motion.div>
  );
};

export default Navigation;