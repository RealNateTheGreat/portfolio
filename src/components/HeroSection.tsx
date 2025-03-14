import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLDivElement>;
  scrollToServers: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroRef, scrollToServers }) => {
  return (
    <div 
      ref={heroRef}
      className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-anime-dark via-anime-dark/95 to-anime-dark"
    >
      <div className="relative text-center px-4 max-w-3xl mx-auto z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <img 
            src="https://i.imgur.com/HVZOV5f.png" 
            alt="Profile" 
            className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white/20"
          />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white font-anime"
        >
          Nathan's{' '}
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Portfolio
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 font-anime-text"
        >
          Developer & Community Manager
        </motion.p>
        
        <div className="h-[100px]"></div>
      </div>
    </div>
  );
};

export default HeroSection;