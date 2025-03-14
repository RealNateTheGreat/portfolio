import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Server {
  id: number;
  name: string;
  role: string;
  members: string;
  duration: string;
  banner: string;
  icon: string;
  description: string;
  responsibilities: string[];
}

interface ServerSectionProps {
  servers: Server[];
  onSelectServer: (server: Server) => void;
  serversRef: React.RefObject<HTMLDivElement>;
}

const ServerSection: React.FC<ServerSectionProps> = ({ servers, onSelectServer, serversRef }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0');
            entry.target.classList.add('opacity-100');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={(el) => {
        // Assign to both refs
        if (el) {
          // @ts-ignore - this is a valid operation
          serversRef.current = el;
          sectionRef.current = el;
        }
      }}
      className="py-32 px-4 opacity-0 transition-opacity duration-1000 relative z-10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl -z-10"
          ></motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 font-anime">
              Discord{' '}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Servers
              </span>
            </h2>
            <p className="text-gray-400 text-lg sm:text-base md:text-lg max-w-2xl mx-auto font-anime-text">
              Communities I've managed and contributed to. Click on any server
              to see more details.
            </p>
          </motion.div>
        </div>

        {/* Animated Background Elements */}
        <div className="relative mb-12">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-purple-600/30 via-pink-600/20 to-transparent rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            ></motion.div>
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          {servers.map((server) => (
            <motion.div
              key={server.id}
              onClick={() => onSelectServer(server)}
              className="anime-card overflow-hidden cursor-pointer"
              variants={{
                hidden: { y: 50, opacity: 0 },
                visible: { 
                  y: 0, 
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 12
                  }
                }
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(236, 72, 153, 0.35)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-40">
                <img
                  src={server.banner}
                  alt={server.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-anime-dark to-transparent"></div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="absolute bottom-4 left-4"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-sm opacity-70"></div>
                  <img
                    src={server.icon}
                    alt={`${server.name} icon`}
                    className="relative w-12 h-12 rounded-full border-2 border-white shadow-lg"
                  />
                </motion.div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-1 font-anime">
                  {server.name}
                </h3>
                <p className="text-pink-400 font-medium font-anime-text">{server.role}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <motion.span 
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                    className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full"
                  >
                    {server.members} members
                  </motion.span>
                  <motion.span 
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                    className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full"
                  >
                    {server.duration}
                  </motion.span>
                </div>

                <div className="mt-4 flex justify-end">
                  <motion.button 
                    whileHover={{ x: 3, color: "#ec4899" }}
                    className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
                
                {/* Decorative element */}
                <motion.div 
                  className="absolute bottom-2 right-2 opacity-30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-pink-300" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ServerSection;