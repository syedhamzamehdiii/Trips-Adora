import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import ApplicationSubmittedPage from '../../components/products/ApplicationSubmittedPage';

const ApplicationSubmitted = () => {
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <ApplicationSubmittedPage onReturnToDashboard={handleReturnToDashboard} />
    </DashboardLayout>
  );
};

export default ApplicationSubmitted;
