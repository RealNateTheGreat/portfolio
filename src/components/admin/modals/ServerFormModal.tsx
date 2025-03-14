import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Plus, Loader } from 'lucide-react';
import { Modal } from '../../Modal';
import { Database } from '../../../types/database.types';
import toast from 'react-hot-toast';
import { serverOperations } from '../../../lib/supabase';

type Server = Database['public']['Tables']['servers']['Row'];
type ServerInput = Database['public']['Tables']['servers']['Insert'];

interface ServerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  server?: Server | null;
  onSuccess: (server: Server, isUpdate: boolean) => void;
}

const defaultServer: ServerInput = {
  name: '',
  role: '',
  members: '',
  duration: '',
  banner: '',
  icon: '',
  description: '',
  responsibilities: [],
};

const ServerFormModal: React.FC<ServerFormModalProps> = ({
  isOpen,
  onClose,
  server,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ServerInput>(defaultServer);
  const [currentResponsibility, setCurrentResponsibility] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (server) {
      setFormData(server);
    } else {
      setFormData(defaultServer);
    }
    setCurrentResponsibility('');
  }, [server, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addResponsibility = () => {
    if (!currentResponsibility.trim()) return;

    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, currentResponsibility.trim()],
    });
    setCurrentResponsibility('');
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Validate required fields
      if (
        !formData.name ||
        !formData.role ||
        !formData.members ||
        !formData.duration ||
        !formData.banner ||
        !formData.icon ||
        !formData.description
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Make sure responsibilities is not empty
      if (formData.responsibilities.length === 0) {
        toast.error('Please add at least one responsibility');
        return;
      }

      let savedServer: Server;
      const isUpdate = !!server?.id;

      if (isUpdate) {
        savedServer = await serverOperations.update(server.id, formData);
        toast.success('Server updated successfully!');
      } else {
        savedServer = await serverOperations.create(formData);
        toast.success('Server added successfully!');
      }

      // Pass the saved server and update flag back to parent component
      onSuccess(savedServer, isUpdate);
    } catch (err) {
      console.error('Error saving server:', err);
      toast.error('Failed to save server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={server ? 'Edit Server' : 'Add New Server'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Server Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Members (e.g., "9.6K+")
            </label>
            <input
              type="text"
              name="members"
              value={formData.members}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Duration (e.g., "2+ Years")
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Banner URL</label>
            <input
              type="text"
              name="banner"
              value={formData.banner}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Icon URL</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full bg-anime-darker border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[80px]"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Responsibilities</label>
          <div className="flex">
            <input
              type="text"
              value={currentResponsibility}
              onChange={(e) => setCurrentResponsibility(e.target.value)}
              className="flex-1 bg-anime-darker border border-gray-700 rounded-l-lg px-4 py-2 text-white"
              placeholder="Add a responsibility"
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentResponsibility.trim()) {
                  e.preventDefault();
                  addResponsibility();
                }
              }}
            />
            <button
              type="button"
              onClick={addResponsibility}
              className="bg-pink-500 text-white px-4 py-2 rounded-r-lg hover:bg-pink-600 disabled:bg-pink-800 disabled:cursor-not-allowed"
              disabled={submitting || !currentResponsibility.trim()}
            >
              Add
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {formData.responsibilities.map((resp, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-800 px-3 py-2 rounded"
              >
                <span className="flex-1 text-gray-300">{resp}</span>
                <button
                  type="button"
                  onClick={() => removeResponsibility(index)}
                  className="text-red-400 hover:text-red-300 ml-2 disabled:text-red-800 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {formData.responsibilities.length === 0 && (
              <p className="text-gray-500 text-sm italic">No responsibilities added yet. Add at least one.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 disabled:bg-pink-800 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                {server ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {server ? 'Update Server' : 'Save Server'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ServerFormModal;