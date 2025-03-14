import React from 'react';
import { motion } from 'framer-motion';

const AnimeParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute sakura"
          initial={{
            top: -20,
            left: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            top: '100vh',
            left: `${Math.random() * 100}%`,
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute star"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: Math.random() * 4 + 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default AnimeParticles;