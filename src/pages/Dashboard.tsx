import React from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import ProtectedRoute from '../components/admin/ProtectedRoute';

const Dashboard: React.FC = () => {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
};

export default Dashboard;