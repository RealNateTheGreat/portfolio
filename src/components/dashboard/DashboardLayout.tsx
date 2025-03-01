import React, { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { User } from '../../types';

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
  activeSection: string;
  navigation: {
    name: string;
    icon: React.ElementType;
    id: string;
    requiredPermission?: string;
  }[];
  setActiveSection: (section: string) => void;
  logout: () => void;
}

export function DashboardLayout({
  children,
  user,
  activeSection,
  navigation,
  setActiveSection,
  logout
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="flex items-center p-4 border-b border-gray-700">
            <div className="ml-3">
              <p className="text-white font-medium">{user?.display_name || user?.email?.split('@')[0]}</p>
              <p className="text-gray-400 text-sm">{user?.role || 'User'}</p>
            </div>
          </div>
          
          <div className="py-4 flex-grow">
            <nav className="px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center py-2 px-3 rounded-md w-full text-left ${
                      activeSection === item.id
                        ? 'bg-indigo-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        activeSection === item.id
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 w-full rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="ml-2">
              <p className="text-white text-sm font-medium">{user?.display_name || user?.email?.split('@')[0]}</p>
              <p className="text-gray-400 text-xs">{user?.role || 'User'}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="text-gray-300 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex overflow-x-auto py-2 px-4 space-x-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center py-1.5 px-3 rounded-md whitespace-nowrap ${
                  activeSection === item.id
                    ? 'bg-indigo-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon
                  className={`mr-2 flex-shrink-0 h-4 w-4 ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                <span className="text-sm">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-8 overflow-auto mt-24 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}