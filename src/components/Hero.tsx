import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const Hero: React.FC = () => {
  const backgroundVariants = {
    initial: { 
      opacity: 0,
    },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 1.5 
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (custom: number) => ({
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        delay: custom * 0.2 
      }
    })
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        delay: 0.8
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 15px rgba(88, 101, 242, 0.5)"
    },
    tap: { 
      scale: 0.95 
    }
  };

  const floatingElements = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative h-[50vh] flex items-center justify-center bg-[#5865F2]/30">
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20"
          variants={floatingElements}
          initial="initial"
          animate="animate"
          custom={1}
        ></motion.div>
        
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20"
          variants={floatingElements}
          initial="initial"
          animate="animate"
          custom={2}
        ></motion.div>
      </motion.div>
      
      <div className="relative text-center px-4 max-w-3xl mx-auto">
        <motion.h1
          custom={1}
          variants={textVariants}
          initial="initial"
          animate="animate"
          className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
        >
          Nathan's{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Portfolio
          </span>
        </motion.h1>
        
        <motion.p
          custom={2}
          variants={textVariants}
          initial="initial"
          animate="animate"
          className="text-xl sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8"
        >
          Developer & Community Manager
        </motion.p>
        
        <motion.div
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="https://discord.com/users/210768103594917888"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#5865F2]/20 border-2 border-[#5865F2] rounded-xl text-white hover:bg-[#5865F2]/30 transition-all flex items-center justify-center gap-2"
            whileHover="hover"
            whileTap="tap"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Discord</span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;