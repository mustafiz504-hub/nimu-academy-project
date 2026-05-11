import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ComingSoon from '../../components/admin/ComingSoon';

const AdminEnrollments = () => {
  return (
    <AdminLayout>
      <ComingSoon 
        title="Enrollment Management" 
        description="A comprehensive student registration and batch management portal is under development."
      />
    </AdminLayout>
  );
};

export default AdminEnrollments;
