import React from 'react';
import { motion } from 'framer-motion';

const Loading: React.FC = () => {
  return (
    <motion.div 
      className="fixed inset-0 bg-anime-darker flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative">
        {/* Background glow */}
        <div className="absolute -inset-10 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
        
        {/* Main loading animation */}
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 w-24 h-24 relative"
          >
            {/* Sakura logo spinner */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-24 h-24 border-4 border-transparent border-t-pink-500 border-r-purple-500 rounded-full"></div>
            </motion.div>
            
            {/* Inner spinner */}
            <motion.div
              className="absolute inset-2"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-20 h-20 border-4 border-transparent border-t-purple-300 border-b-pink-300 rounded-full"></div>
            </motion.div>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-glow"></div>
          </motion.div>
          
          {/* Text elements */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-anime mb-3"
          >
            Nathan's Portfolio
          </motion.h2>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full w-48 mb-3"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 0.7, duration: 2, repeat: Infinity }}
            className="text-gray-400 text-sm font-anime-text"
          >
            Loading Experience...
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default Loading;