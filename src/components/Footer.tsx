import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-md py-10 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-white font-anime">
              Nathan's Portfolio
            </h2>
            <p className="text-gray-400 mt-2 font-anime-text">
              Developer & Community Manager
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Nathan's Portfolio. All rights
            reserved.
          </p>
          <p className="text-gray-500 text-sm mt-4 md:mt-0">
            Built by Nathan
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;