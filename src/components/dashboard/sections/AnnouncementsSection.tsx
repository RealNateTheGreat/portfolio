import React from 'react';
import { Announcement, Permission } from '../../../types';
import { 
  Loader, 
  Plus, 
  Trash2, 
  ToggleRight, 
  ToggleLeft 
} from 'lucide-react';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  loading: boolean;
  updatingStatus: { id: string | null; loading: boolean };
  isAdmin: () => boolean;
  hasPermission: (permission: Permission) => boolean;
  confirmDeleteAnnouncement: (id: string) => void;
  handleToggleAnnouncementStatus: (id: string, active: boolean) => Promise<void>;
  openCreateAnnouncementModal: () => void;
}

export function AnnouncementsSection({
  announcements,
  loading,
  updatingStatus,
  isAdmin,
  hasPermission,
  confirmDeleteAnnouncement,
  handleToggleAnnouncementStatus,
  openCreateAnnouncementModal
}: AnnouncementsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Global Announcements</h2>
        {(isAdmin() || hasPermission('CREATE_ANNOUNCEMENT')) && (
          <button
            onClick={openCreateAnnouncementModal}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-300 mb-4">No announcements yet.</p>
          {(isAdmin() || hasPermission('CREATE_ANNOUNCEMENT')) && (
            <button
              onClick={openCreateAnnouncementModal}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Create your first announcement
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`bg-gray-800 rounded-lg overflow-hidden border-2 ${
                announcement.active 
                  ? 'border-indigo-500' 
                  : 'border-gray-700'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {announcement.title}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    {(isAdmin() || hasPermission('DELETE_ANNOUNCEMENT')) && (
                      <button
                        onClick={() => confirmDeleteAnnouncement(announcement.id)}
                        className="p-1.5 bg-red-900/30 text-red-300 rounded-md hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {(isAdmin() || hasPermission('CREATE_ANNOUNCEMENT')) && (
                      <button
                        onClick={() => handleToggleAnnouncementStatus(
                          announcement.id, 
                          announcement.active
                        )}
                        disabled={
                          updatingStatus.loading && 
                          updatingStatus.id === announcement.id
                        }
                        className={`p-1.5 ${
                          announcement.active 
                            ? 'bg-green-900/30 text-green-300' 
                            : 'bg-yellow-900/30 text-yellow-300'
                        } rounded-md hover:bg-opacity-50 transition-colors`}
                      >
                        {updatingStatus.loading && 
                         updatingStatus.id === announcement.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : announcement.active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {announcement.content}
                </p>
                
                <div className="flex items-center text-gray-400 text-sm">
                  <span>
                    {new Date(announcement.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {announcement.created_by?.display_name || 
                      announcement.created_by?.email || 
                      'Unknown User'}
                  </span>
                </div>
                
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                    announcement.active 
                      ? 'bg-green-900/30 text-green-300 border border-green-700' 
                      : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                  }`}>
                    {announcement.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}