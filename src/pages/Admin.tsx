import React, { useEffect } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const { isAuthenticated, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated && !loading) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="admin-page">
      <AdminLogin />
    </div>
  );
};

export default Admin;