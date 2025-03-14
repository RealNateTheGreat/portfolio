import React from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../Modal';
import { Database } from '../../types/database.types';

type Server = Database['public']['Tables']['servers']['Row'];

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server | null;
}

const ServerModal: React.FC<ServerModalProps> = ({ isOpen, onClose, server }) => {
  if (!isOpen || !server) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} title={server.name}>
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="relative h-48 sm:h-36 md:h-48 lg:h-56 rounded-lg overflow-hidden">
          <img
            src={server.banner}
            alt={server.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anime-dark/90 via-anime-dark/50 to-transparent"></div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="absolute bottom-4 left-4"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-sm opacity-70"></div>
            <img
              src={server.icon}
              alt={`${server.name} icon`}
              className="relative w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full border-2 border-white shadow-lg"
            />
          </motion.div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <h3 className="text-xl sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-100 font-anime">
            {server.name}
          </h3>
          <p className="text-pink-400 font-medium text-base sm:text-sm md:text-base font-anime-text">
            {server.role}
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          <motion.span 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
            className="text-sm sm:text-xs md:text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full"
          >
            {server.members} members
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(34, 197, 94, 0.2)" }}
            className="text-sm sm:text-xs md:text-sm bg-green-500/10 text-green-400 px-3 py-1 rounded-full"
          >
            {server.duration}
          </motion.span>
        </motion.div>
        
        <motion.p variants={itemVariants} className="text-gray-300 text-base sm:text-sm md:text-base font-anime-text">
          {server.description}
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <h4 className="font-semibold text-gray-100 mb-2 text-lg sm:text-base md:text-lg font-anime">
            Responsibilities:
          </h4>
          <ul className="space-y-2">
            {server.responsibilities.map((resp, index) => (
              <motion.li 
                key={index} 
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-pink-600"></span>
                <span className="text-gray-300 text-base sm:text-sm md:text-base font-anime-text">
                  {resp}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </Modal>
  );
};

export default ServerModal;