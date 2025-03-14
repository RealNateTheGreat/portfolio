import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Edit, AlertCircle, Loader } from 'lucide-react';
import { serverOperations } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import toast from 'react-hot-toast';
import ServerFormModal from './modals/ServerFormModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';

type Server = Database['public']['Tables']['servers']['Row'];

const ServersTab: React.FC<{ key?: number }> = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchServers();
  }, []);
  
  const fetchServers = async () => {
    try {
      setLoading(true);
      const data = await serverOperations.getAll();
      setServers(data);
      setError('');
    } catch (err) {
      console.error('Error fetching servers:', err);
      setError('Failed to load servers. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const startEditing = (server: Server) => {
    setSelectedServer(server);
    setIsAddingServer(true);
  };
  
  const confirmDeleteServer = (server: Server) => {
    setServerToDelete(server);
  };
  
  const deleteServer = async () => {
    if (!serverToDelete) return;
    
    try {
      setSubmitting(true);
      await serverOperations.delete(serverToDelete.id);
      
      // Update local state immediately
      setServers(prev => prev.filter(s => s.id !== serverToDelete.id));
      
      toast.success('Server deleted successfully!');
      setServerToDelete(null);
    } catch (err) {
      console.error('Error deleting server:', err);
      toast.error('Failed to delete server. Please try again.');
      // Refresh servers list to ensure UI is in sync with backend
      fetchServers();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle successful server creation/update
  const handleServerSuccess = (server: Server, isUpdate: boolean = false) => {
    if (isUpdate) {
      // Update existing server in the list
      setServers(prev => prev.map(s => s.id === server.id ? server : s));
    } else {
      // Add new server to the list
      setServers(prev => [...prev, server]);
    }
    // Close the modal after successful operation
    setIsAddingServer(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-pink-500 animate-spin" />
        <span className="ml-2 text-gray-400">Loading servers...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-anime">Manage Servers</h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedServer(null);
            setIsAddingServer(true);
          }}
          className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Add Server</span>
          <span className="sm:hidden">Add</span>
        </motion.button>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Server Form Modal */}
      <ServerFormModal
        isOpen={isAddingServer}
        onClose={() => setIsAddingServer(false)}
        server={selectedServer}
        onSuccess={handleServerSuccess}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={serverToDelete !== null}
        onClose={() => setServerToDelete(null)}
        onConfirm={deleteServer}
        title="Delete Server"
        message={`Are you sure you want to delete the server "${serverToDelete?.name}"? This action cannot be undone.`}
        isProcessing={submitting}
      />
      
      {servers.length === 0 ? (
        <div className="bg-anime-dark border border-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">No servers found. Add a new server to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <motion.div
              key={server.id}
              layoutId={`server-${server.id}`}
              className="bg-anime-dark border border-gray-800 rounded-lg overflow-hidden"
            >
              <div className="relative h-40">
                <img
                  src={server.banner}
                  alt={server.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-anime-dark to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <img
                    src={server.icon}
                    alt={`${server.name} icon`}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                  />
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold text-white">{server.name}</h3>
                <p className="text-pink-400 font-medium">{server.role}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
                    {server.members} members
                  </span>
                  <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                    {server.duration}
                  </span>
                </div>
                
                <p className="text-gray-400 mt-3 text-sm line-clamp-2">
                  {server.description}
                </p>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => startEditing(server)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => confirmDeleteServer(server)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    <Trash className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServersTab;