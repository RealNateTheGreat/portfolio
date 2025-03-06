import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Code2,
  Palette,
  Database,
  ExternalLink,
  Bot,
  Users,
  Shield,
  User,
  BellRing,
  X,
} from 'lucide-react';
import { Modal } from './components/Modal';
import { supabase, supabaseAdmin } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Modal component for server details...
interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server | null;
}

function ServerModal({ isOpen, onClose, server }: ServerModalProps) {
  if (!isOpen || !server) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={server.name}>
      <div className="space-y-6">
        <div className="relative h-48 sm:h-36 md:h-48 lg:h-56 rounded-lg overflow-hidden">
          <img
            src={server.banner}
            alt={server.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <img
            src={server.icon}
            alt={`${server.name} icon`}
            className="absolute bottom-4 left-4 w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full border-2 border-white shadow-lg"
          />
        </div>
        <div>
          <h3 className="text-xl sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-100">
            {server.name}
          </h3>
          <p className="text-indigo-400 font-medium text-base sm:text-sm md:text-base">
            {server.role}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm sm:text-xs md:text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
            {server.members} members
          </span>
          <span className="text-sm sm:text-xs md:text-sm bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
            {server.duration}
          </span>
        </div>
        <p className="text-gray-300 text-base sm:text-sm md:text-base">
          {server.description}
        </p>
        <div>
          <h4 className="font-semibold text-gray-100 mb-2 text-lg sm:text-base md:text-lg">
            Responsibilities:
          </h4>
          <ul className="space-y-2">
            {server.responsibilities.map((resp, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-indigo-600"></span>
                <span className="text-gray-300 text-base sm:text-sm md:text-base">
                  {resp}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

// Modal component for About Me
interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AboutMeModal({ isOpen, onClose }: AboutMeModalProps) {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" hideCloseButton={true}>
      <div className="space-y-8 bg-gray-900 p-8 rounded-xl">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur"></div>
            <img
              src="https://i.imgur.com/HVZOV5f.png"
              alt="Nathan"
              className="relative w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-white/20"
            />
          </div>
          <div>
            <h3 className="text-3xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Nathan
            </h3>
            <p className="text-gray-400 text-lg sm:text-base md:text-lg">
              Developer & Manager
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`px-4 py-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-xl border ${tag.color} text-sm sm:text-xs md:text-sm font-medium transition-all hover:scale-105`}
            >
              {tag.text}
            </span>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed text-lg sm:text-base md:text-lg">
            I specialize in creating discord servers and making bots etc.
          </p>

          <a
            href="https://discord.com/users/210768103594917888"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2]/20 border-2 border-[#5865F2] rounded-xl text-white hover:bg-[#5865F2]/30 transition-all group w-full"
          >
            <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
            <span className="font-medium text-base sm:text-sm md:text-base">
              Contact Me On Discord
            </span>
          </a>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-all w-full mt-2"
          >
            <span className="font-medium text-base sm:text-sm md:text-base">
              Dismiss
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Modal component for Announcements
interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: any;
}

function AnnouncementModal({ isOpen, onClose, announcement }: AnnouncementModalProps) {
  if (!isOpen || !announcement) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" hideCloseButton={true}>
      <div className="space-y-6 bg-gray-900 p-6 rounded-xl">
        <div className="flex items-start">
          <div>
            <p className="text-gray-300 font-medium">
              New Announcement From
            </p>
            <div className="flex items-center mt-2">
              <img
                src={announcement.created_by?.profile_image || "https://i.imgur.com/HVZOV5f.png"}
                alt="Author"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="text-white font-medium">
                  {announcement.created_by?.display_name || announcement.created_by?.email || "Admin"}
                </p>
                <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                  {announcement.created_by?.role || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-bold text-white mb-3">{announcement.title}</h3>
          <p className="text-gray-300">{announcement.content}</p>
        </div>
        
        <div className="pt-4">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white hover:bg-gray-700 transition-all"
          >
            <span>Dismiss</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

function App() {
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

  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState<any | null>(null);
  const serversRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // When announcements are fetched, set the first one as active
  useEffect(() => {
    if (announcements.length > 0 && !activeAnnouncement) {
      setActiveAnnouncement(announcements[0]);
    }
  }, [announcements]);

  const fetchAnnouncements = async () => {
    try {
      // ALWAYS use supabaseAdmin for DB operations to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .select(`
          *,
          created_by:users(email, profile_image, display_name, role)
        `)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
      console.log('Fetched announcements:', data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const servers = [
    {
      id: 1,
      name: 'Broward County Roleplay',
      role: 'Mattress Fucker',
      members: '17,3K+',
      duration: '2+ Months',
      banner: 'https://i.imgur.com/ksmtGPV.png',
      icon: 'https://i.imgur.com/Eq5DLUF.png',
      description: '( THIS IS JUST A JOKE ) >:D',
      responsibilities: [
        'Humps the mattress',
        'Made mattress babies',
        'Humps the mattress again',
        'Made more mattress babies',
      ],
    },
    {
      id: 2,
      name: 'Astreality',
      role: 'Assistant Manager',
      members: '9.6K+',
      duration: '2+ Years',
      banner: 'https://i.imgur.com/ksmtGPV.png',
      icon: 'https://i.imgur.com/ZJmh2zc.png',
      description: "I've worked for this community for a long time and I enjoyied helping the users who played the game. :P",
      responsibilities: [
        'Made applications',
        'Managed staff',
        'Moderation',
        'Data restores',
        'Gamenights',
      ],
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (serversRef.current) {
      observer.observe(serversRef.current);
    }

    return () => {
      if (serversRef.current) {
        observer.unobserve(serversRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <div className="nav-container">
        <nav className="nav-border">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center space-x-4 sm:space-x-8 md:space-x-12">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-white hover:text-indigo-200 transition-colors text-sm sm:text-base px-3 py-1.5 rounded-full hover:bg-white/5"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection(serversRef)}
                className="text-white hover:text-indigo-200 transition-colors text-sm sm:text-base px-3 py-1.5 rounded-full hover:bg-white/5"
              >
                Servers
              </button>
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="px-4 py-2 bg-indigo-400/20 border-2 border-indigo-600 rounded-full text-white hover:bg-indigo-400/30 transition-all text-sm sm:text-base min-w-[90px] sm:min-w-[100px]"
              >
                About Me
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative h-[50vh] flex items-center justify-center bg-[#5865F2]/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
        </div>
        <div className="relative text-center px-4 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
          >
            Nathan's <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Portfolio</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8"
          >
            Developer & Community Manager
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a 
              href="https://discord.com/users/210768103594917888" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#5865F2]/20 border-2 border-[#5865F2] rounded-xl text-white hover:bg-[#5865F2]/30 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Discord</span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Server Section */}
      <div 
        ref={serversRef} 
        className="py-20 px-4 opacity-0 transition-opacity duration-1000"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Discord <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Servers</span>
            </h2>
            <p className="text-gray-400 text-lg sm:text-base md:text-lg max-w-2xl mx-auto">
              Communities I've managed and contributed to. Click on any server to see more details.
            </p>
          </div>

          {/* Glowing purple element */}
          <div className="relative mb-12">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => (
              <div
                key={server.id}
                onClick={() => setSelectedServer(server)}
                className="server-card bg-gray-800/50 backdrop-blur-sm overflow-hidden cursor-pointer"
              >
                <div className="relative h-40">
                  <img
                    src={server.banner}
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                  <img
                    src={server.icon}
                    alt={`${server.name} icon`}
                    className="absolute bottom-4 left-4 w-12 h-12 rounded-full border-2 border-white shadow-lg"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-1">{server.name}</h3>
                  <p className="text-indigo-400 font-medium">{server.role}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
                      {server.members} members
                    </span>
                    <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                      {server.duration}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white">Nathan's Portfolio</h2>
              <p className="text-gray-400 mt-2">Developer & Community Manager</p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Nathan's Portfolio. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">Built by Nathan</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ServerModal 
        isOpen={selectedServer !== null}
        onClose={() => setSelectedServer(null)}
        server={selectedServer}
      />
      
      <AboutMeModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={activeAnnouncement !== null}
        onClose={() => setActiveAnnouncement(null)}
        announcement={activeAnnouncement}
      />
    </div>
  );
}

export default App;