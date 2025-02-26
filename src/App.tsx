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
} from 'lucide-react';
import { Modal } from './components/Modal';
import { supabase } from './lib/supabase';
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
    <Modal isOpen={isOpen} onClose={onClose} title="">
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
              Full Stack Developer & Community Manager
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
            I specialize in creating innovative solutions and managing thriving
            online communities.
          </p>

          <a
            href="https://discord.com/users/210768103594917888"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2]/20 border-2 border-[#5865F2] rounded-xl text-white hover:bg-[#5865F2]/30 transition-all group w-full"
          >
            <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
            <span className="font-medium text-base sm:text-sm md:text-base">
              Connect on Discord
            </span>
          </a>
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
  const serversRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          created_by:users(email, profile_image)
        `)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
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
      members: '17,300+',
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
      {/* Announcements Banner */}
      <AnimatePresence>
        {announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6"
          >
            <div className="max-w-7xl mx-auto">
              {announcements.map((announcement, index) => (
                <div key={announcement.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <BellRing className="h-6 w-6 animate-bounce" />
                    <div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-white/80">{announcement.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img
                      src={announcement.created_by.profile_image}
                      alt="Author"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-white/80">
                      {announcement.created_by.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-4 gap-8 opacity-5">
              {[...Array(16)].map((_, i) => (
                <MessageSquare
                  key={i}
                  className="w-24 h-24 text-white animate-[wave_2s_ease-in-out_infinite] [animation-delay:var(--delay)]"
                  style={{ '--delay': `${i * 0.2}s` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#5865F2]/10 via-[#5865F2]/5 to-gray-900"></div>
        </div>
        <div className="relative text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            Nathan
          </h1>
        </div>
      </div>

      {/* Servers Section */}
      <section
        ref={serversRef}
        className="relative py-20 px-4 bg-gray-900 opacity-0"
      >
        <div className="absolute inset-0 discord-bg-pattern opacity-5"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Servers I've Worked For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servers.map((server) => (
              <div
                key={server.id}
                className="server-card bg-gray-800 overflow-hidden shadow-xl"
              >
                <div className="relative h-48">
                  <img
                    src={server.banner}
                    alt={server.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <img
                    src={server.icon}
                    alt={`${server.name} icon`}
                    className="absolute bottom-4 left-4 w-16 h-16 rounded-full border-2 border-white shadow-lg"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {server.name}
                  </h3>
                  <p className="text-indigo-400 font-medium mb-4">
                    {server.role}
                  </p>
                  <div className="flex flex-col gap-2 mb-6">
                    <span className="text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-center">
                      {server.members} members
                    </span>
                    <span className="text-sm bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-center">
                      {server.duration}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedServer(server)}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Details <ExternalLink className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center">
        <p>© 2025 Nathan. All rights reserved.</p>
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
    </div>
  );
}

export default App;