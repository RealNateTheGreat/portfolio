import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { Database } from './types/database.types';

// Component imports
import AnimeParticles from './components/AnimeParticles';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ServerSection from './components/ServerSection';
import Footer from './components/Footer';
import ServerModal from './components/modals/ServerModal';
import AboutMeModal from './components/modals/AboutMeModal';
import AnnouncementsModal from './components/modals/AnnouncementsModal';
import Loading from './components/Loading';

// Type definitions
type Server = Database['public']['Tables']['servers']['Row'];
type Announcement = Database['public']['Tables']['announcements']['Row'];

function App() {
  // State and refs
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isAnnouncementsModalOpen, setIsAnnouncementsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [servers, setServers] = useState<Server[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const serversRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Loading effect
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch servers from Supabase
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoadingServers(true);
        const { data, error } = await supabase
          .from('servers')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) {
          console.error('Error fetching servers:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setServers(data);
        } else {
          // Fallback to hardcoded data if no servers in database
          setServers([
            {
              id: 1,
              name: 'Broward County Roleplay',
              role: 'Mattress Fucker',
              members: '17,7K+',
              duration: '1+ Months',
              banner: 'https://i.imgur.com/ksmtGPV.png',
              icon: 'https://i.imgur.com/Eq5DLUF.png',
              description: 'I moderate this community.',
              responsibilities: ['Responded to mod calls.'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              name: 'Astreality',
              role: 'Assistant Manager',
              members: '9.6K+',
              duration: '2+ Years',
              banner: 'https://i.imgur.com/SeBYdd2.png',
              icon: 'https://i.imgur.com/ZJmh2zc.png',
              description:
                "I've worked for this community for a long time and I enjoyied helping the users who played the game. :P",
              responsibilities: [
                'Made applications',
                'Managed staff',
                'Moderation',
                'Data restores',
                'Gamenights',
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
          ]);
        }
      } catch (error) {
        console.error('Error in fetchServers:', error);
      } finally {
        setLoadingServers(false);
      }
    };

    fetchServers();
  }, []);

  // Fetch active announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching announcements:', error);
          return;
        }
        
        if (data) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Error in fetchAnnouncements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  // Scroll helper function
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-anime-dark overflow-hidden relative">
      {/* Loading screen */}
      <AnimatePresence>
        {isLoading && <Loading />}
      </AnimatePresence>
      
      {/* Main content - only visible when not loading */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen"
          >
            {/* Floating particles */}
            <AnimeParticles />
            
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden">
              <div className="absolute inset-0 bg-anime-grid opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-purple-900/30 to-transparent"></div>
              <div className="absolute top-0 right-0 w-full h-[30vh] bg-gradient-to-b from-pink-900/30 to-transparent"></div>
            </div>

            {/* Navigation */}
            <Navigation 
              scrollToServers={() => scrollToSection(serversRef)} 
              openAboutModal={() => setIsAboutModalOpen(true)}
              openAnnouncementsModal={() => setIsAnnouncementsModalOpen(true)}
              hasAnnouncements={announcements.length > 0}
            />

            {/* Hero Section */}
            <HeroSection 
              heroRef={heroRef} 
              scrollToServers={() => scrollToSection(serversRef)} 
            />

            {/* Server Section */}
            <ServerSection 
              servers={servers} 
              onSelectServer={setSelectedServer} 
              serversRef={serversRef} 
            />

            {/* Footer */}
            <Footer />

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

            <AnnouncementsModal
              isOpen={isAnnouncementsModalOpen}
              onClose={() => setIsAnnouncementsModalOpen(false)}
              announcements={announcements}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;