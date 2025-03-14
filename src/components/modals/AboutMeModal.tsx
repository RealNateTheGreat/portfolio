import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '../Modal';

interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutMeModal: React.FC<AboutMeModalProps> = ({ isOpen, onClose }) => {
  const tags = [
    {
      text: 'IT/Network',
      color: 'bg-pink-900/30 text-pink-200 border-pink-700',
    },
    {
      text: 'Discord Bot Dev',
      color: 'bg-blue-900/30 text-blue-200 border-blue-700',
    },
    {
      text: 'Moderator',
      color: 'bg-green-900/30 text-green-200 border-green-700',
    },
    {
      text: 'Community Management',
      color: 'bg-purple-900/30 text-purple-200 border-purple-700',
    },
    {
      text: 'Web Development',
      color: 'bg-yellow-900/30 text-yellow-200 border-yellow-700',
    },
    {
      text: 'Server Administration',
      color: 'bg-red-900/30 text-red-200 border-red-700',
    },
    {
      text: 'Automation',
      color: 'bg-indigo-900/30 text-indigo-200 border-indigo-700',
    },
    { text: 'Security', color: 'bg-teal-900/30 text-teal-200 border-teal-700' },
  ];

  // Create variants for staggered animations
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
    <Modal isOpen={isOpen} onClose={onClose} title="" hideCloseButton={true}>
      <motion.div 
        className="space-y-8 bg-anime-darker p-8 rounded-xl border border-pink-500/20"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex items-center space-x-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur"></div>
            <img
              src="https://i.imgur.com/HVZOV5f.png"
              alt="Nathan"
              className="relative w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-white/20"
            />
          </div>
          <div>
            <h3 className="text-3xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-anime">
              Nathan
            </h3>
            <p className="text-gray-400 text-lg sm:text-base md:text-lg font-anime-text">
              Developer & Manager
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <motion.span
              key={index}
              whileHover={{ scale: 1.1 }}
              className={`px-4 py-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-xl border ${tag.color} text-sm sm:text-xs md:text-sm font-medium transition-all`}
            >
              {tag.text}
            </motion.span>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <p className="text-gray-300 leading-relaxed text-lg sm:text-base md:text-lg">
            I specialize in creating discord servers and making bots etc.
          </p>

          <motion.a
            whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(88, 101, 242, 0.4)" }}
            whileTap={{ scale: 0.97 }}
            href="https://discord.com/users/210768103594917888"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2]/20 border-2 border-[#5865F2] rounded-xl text-white hover:bg-[#5865F2]/30 transition-all group w-full relative overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 opacity-20"
              animate={{ 
                background: [
                  "linear-gradient(to right, #5865F2 0%, transparent 100%)",
                  "linear-gradient(to right, transparent 0%, #5865F2 100%)",
                  "linear-gradient(to right, #5865F2 0%, transparent 100%)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
            <span className="font-medium text-base sm:text-sm md:text-base font-anime-text">
              Contact Me On Discord
            </span>
          </motion.a>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-anime-dark/50 border border-gray-700 rounded-xl text-gray-300 hover:bg-anime-dark transition-all w-full mt-2"
          >
            <span className="font-medium text-base sm:text-sm md:text-base font-anime-text">
              Dismiss
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </Modal>
  );
};

export default AboutMeModal;