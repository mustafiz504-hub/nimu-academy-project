import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ComingSoon from '../../components/admin/ComingSoon';

const AdminOrders = () => {
  return (
    <AdminLayout>
      <ComingSoon 
        title="Order Management" 
        description="We are currently building a powerful tracking and order processing system for you."
      />
    </AdminLayout>
  );
};

export default AdminOrders;
