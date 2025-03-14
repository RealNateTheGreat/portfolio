import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Server, Bell, Users, User, Settings, ChevronDown } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import ServersTab from './ServersTab';
import AnnouncementsTab from './AnnouncementsTab';
import UsersTab from './UsersTab';
import EditProfileModal from './modals/EditProfileModal';
import { AdminPermission } from '../../types/database.types';

type TabType = 'servers' | 'announcements' | 'users';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('servers');
  const { logout, currentUser, hasPermission } = useAdmin();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-render

  const tabs = [
    { 
      id: 'servers' as TabType, 
      label: 'Servers', 
      icon: <Server className="w-5 h-5" />,
      permission: 'create_servers' as AdminPermission
    },
    { 
      id: 'announcements' as TabType, 
      label: 'Announcements', 
      icon: <Bell className="w-5 h-5" />,
      permission: 'create_announcements' as AdminPermission
    },
    { 
      id: 'users' as TabType, 
      label: 'Users', 
      icon: <Users className="w-5 h-5" />,
      permission: 'manage_users' as AdminPermission
    },
  ];

  // Filter tabs based on user permissions
  const filteredTabs = tabs.filter(tab => 
    // Default admin always sees all tabs
    currentUser?.username === 'ADMIN' || hasPermission(tab.permission)
  );

  // Initialize active tab only once when dashboard loads
  useEffect(() => {
    if (!initialized && filteredTabs.length > 0) {
      setActiveTab(filteredTabs[0].id);
      setInitialized(true);
    }
  }, [filteredTabs, initialized]);

  // If current tab is not in filtered tabs, select the first available tab
  useEffect(() => {
    if (initialized && filteredTabs.length > 0 && !filteredTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(filteredTabs[0].id);
    }
  }, [filteredTabs, activeTab, initialized]);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
  };

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // Increment refresh key to force tabs to refetch data when switching
    setRefreshKey(prev => prev + 1);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  return (
    <div className="min-h-screen bg-anime-darker">
      <nav className="bg-anime-dark border-b border-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-anime"
              >
                Admin Dashboard
              </motion.h1>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="relative">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(!profileDropdownOpen);
                    }}
                    className="flex items-center gap-3 text-gray-300 text-sm cursor-pointer py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border-2 border-pink-500/30 shadow-xl transform hover:scale-105 transition-all duration-200">
                      {currentUser.profile_image_url ? (
                        <img 
                          src={currentUser.profile_image_url} 
                          alt={currentUser.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <span className="font-semibold">{currentUser.display_name || currentUser.username}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {profileDropdownOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="absolute right-0 mt-2 w-48 bg-anime-dark border border-gray-800 rounded-lg shadow-lg z-10 overflow-hidden"
                    >
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setIsEditProfileModalOpen(true);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md text-sm transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md text-sm transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="border-b border-gray-800 overflow-x-auto">
            <nav className="flex space-x-4 md:space-x-8 py-1">
              {filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-3 px-1 inline-flex items-center border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${refreshKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'servers' && <ServersTab key={refreshKey} />}
            {activeTab === 'announcements' && <AnnouncementsTab key={refreshKey} />}
            {activeTab === 'users' && <UsersTab key={refreshKey} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;