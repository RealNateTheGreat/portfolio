import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { AdminProvider } from './context/AdminContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AdminProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a182b',
              color: '#fff',
              border: '1px solid #2d2b42',
            },
            success: {
              iconTheme: {
                primary: '#ec4899',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#fff',
              },
            },
          }}
        />
      </AdminProvider>
    </Router>
  </StrictMode>
);