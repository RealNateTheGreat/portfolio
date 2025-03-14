import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, User, Key } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    try {
      setLoading(true);
      const success = await login(username.trim(), password);
      
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-anime-darker flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-anime-grid opacity-10"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-anime-dark border-2 border-pink-500/30 rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="absolute -inset-10 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-3xl opacity-30 -z-10"></div>
          
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2 font-anime"
            >
              Admin Access
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 font-anime-text"
            >
              Enter your credentials to continue
            </motion.p>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-gray-400 text-sm mb-2 font-anime-text">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  id="username"
                  className="w-full bg-anime-darker border-2 border-gray-700 focus:border-pink-500/50 rounded-lg py-3 px-10 text-white transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-anime-text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-400 text-sm mb-2 font-anime-text">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  id="password"
                  className="w-full bg-anime-darker border-2 border-gray-700 focus:border-pink-500/50 rounded-lg py-3 px-10 text-white transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-anime-text"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-pink-500/25 font-anime-text disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <a
              href="/"
              className="text-gray-400 hover:text-white text-sm transition-colors font-anime-text"
            >
              Return to home page
            </a>
          </motion.div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Default login: username <span className="text-gray-400">ADMIN</span>, password <span className="text-gray-400">AdminLove</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;