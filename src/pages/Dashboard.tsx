import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { 
  BellRing, 
  Users, 
  Shield, 
  LogOut,
  ChevronDown,
  Plus,
  Upload,
  Trash2,
  Edit3,
  Crown,
  Image
} from 'lucide-react';
import { Permission } from '../types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('announcements');
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'user' | 'role' | 'announcement' | null }>({
    isOpen: false,
    type: null
  });
  const [editingUser, setEditingUser] = useState<{
    username: string;
    password: string;
    profileImage: string;
  } | null>(null);

  // Form states
  const [newUser, setNewUser] = useState({ username: '', password: '', profileImage: '' });
  const [newRole, setNewRole] = useState({ 
    name: '', 
    color: '#FF0000',
    icon: '',
    permissions: {
      DELETE_ANNOUNCEMENT: false,
      CREATE_ANNOUNCEMENT: false,
      ADD_USERS: false,
      DELETE_USERS: false,
      MANAGE_PERMISSIONS: false,
      ADMINISTRATOR: false
    }
  });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [roleIcon, setRoleIcon] = useState<string>('');

  const navigation = [
    { name: 'Global Announcements', icon: BellRing, id: 'announcements' },
    { name: 'User Management', icon: Users, id: 'users' },
    { name: 'Role Management', icon: Shield, id: 'roles' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'role') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'user') {
          if (editingUser) {
            setEditingUser({ ...editingUser, profileImage: reader.result as string });
          } else {
            setNewUser(prev => ({ ...prev, profileImage: reader.result as string }));
          }
        } else {
          setRoleIcon(reader.result as string);
          setNewRole(prev => ({ ...prev, icon: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser({
      username: user.username,
      password: '',
      profileImage: user.profileImage || ''
    });
    setModal({ isOpen: true, type: 'user' });
  };

  const handlePermissionChange = (permission: Permission) => {
    setNewRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const renderModal = () => {
    switch (modal.type) {
      case 'user':
        return (
          <Modal
            isOpen={modal.isOpen}
            onClose={() => {
              setModal({ isOpen: false, type: null });
              setEditingUser(null);
            }}
            title={editingUser ? "Edit User" : "Add New User"}
          >
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editingUser ? editingUser.username : newUser.username}
                  onChange={(e) => editingUser 
                    ? setEditingUser({ ...editingUser, username: e.target.value })
                    : setNewUser(prev => ({ ...prev, username: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={editingUser ? editingUser.password : newUser.password}
                  onChange={(e) => editingUser
                    ? setEditingUser({ ...editingUser, password: e.target.value })
                    : setNewUser(prev => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  {(editingUser?.profileImage || newUser.profileImage) && (
                    <img
                      src={editingUser ? editingUser.profileImage : newUser.profileImage}
                      alt="Profile Preview"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md inline-flex items-center">
                    <Upload size={20} className="mr-2" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'user')}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                  <Crown className="text-yellow-500" size={20} />
                  <span className="font-medium">Founder</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                {editingUser ? "Update User" : "Create User"}
              </button>
            </form>
          </Modal>
        );

      case 'role':
        return (
          <Modal
            isOpen={modal.isOpen}
            onClose={() => {
              setModal({ isOpen: false, type: null });
              setNewRole({ 
                name: '', 
                color: '#FF0000',
                icon: '',
                permissions: {
                  DELETE_ANNOUNCEMENT: false,
                  CREATE_ANNOUNCEMENT: false,
                  ADD_USERS: false,
                  DELETE_USERS: false,
                  MANAGE_PERMISSIONS: false,
                  ADMINISTRATOR: false
                }
              });
              setRoleIcon('');
            }}
            title="Create New Role"
          >
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newRole.color}
                    onChange={(e) => setNewRole(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-12 p-1 rounded-md cursor-pointer"
                  />
                  <div 
                    className="flex-1 h-12 rounded-md"
                    style={{ backgroundColor: newRole.color }}
                  ></div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Icon
                </label>
                <div className="flex items-center space-x-4">
                  {roleIcon && (
                    <img
                      src={roleIcon}
                      alt="Role Icon Preview"
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  )}
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md inline-flex items-center">
                    <Image size={20} className="mr-2" />
                    <span>Upload Icon</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'role')}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2 border rounded-md p-4">
                  {Object.entries(newRole.permissions).map(([perm, isEnabled]) => (
                    <div key={perm} className="flex items-center">
                      <input
                        type="checkbox"
                        id={perm}
                        checked={isEnabled}
                        onChange={() => handlePermissionChange(perm as Permission)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={perm} className="ml-2 text-sm text-gray-700">
                        {perm.split('_').map(word => 
                          word.charAt(0) + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Create Role
              </button>
            </form>
          </Modal>
        );

      case 'announcement':
        return (
          <Modal
            isOpen={modal.isOpen}
            onClose={() => setModal({ isOpen: false, type: null })}
            title="Create Announcement"
          >
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border rounded-md h-32"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Post Announcement
              </button>
            </form>
          </Modal>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            {user?.profileImage && (
              <img
                src={user.profileImage}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">Admin Dashboard</h2>
              <p className="text-sm text-gray-500">Welcome, {user?.username}</p>
            </div>
          </div>
        </div>
        <nav className="p-4">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md mb-2 ${
                activeSection === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </button>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 mt-4"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeSection === 'announcements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Global Announcements</h2>
              <button
                onClick={() => setModal({ isOpen: true, type: 'announcement' })}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                <Plus size={20} />
                <span>New Announcement</span>
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Welcome to the New Platform!</h3>
                  <p className="text-gray-600">
                    We're excited to announce the launch of our new admin dashboard...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Posted by {user?.username}</p>
                </div>
                <button className="text-red-600 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <button
                onClick={() => setModal({ isOpen: true, type: 'user' })}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                <Plus size={20} />
                <span>Add User</span>
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user?.profileImage}
                          alt={user?.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="ml-3">{user?.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Crown className="text-yellow-500" size={16} />
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Founder
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'roles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Role Management</h2>
              <button
                onClick={() => setModal({ isOpen: true, type: 'role' })}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                <Plus size={20} />
                <span>Create Role</span>
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Crown className="text-yellow-500" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold">Founder</h3>
                        <p className="text-sm text-gray-500">All permissions granted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {renderModal()}
    </div>
  );
}