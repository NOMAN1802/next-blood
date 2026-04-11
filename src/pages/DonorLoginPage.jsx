// This file is deprecated. Donor authentication has been removed.
import React from 'react';
import { Navigate } from 'react-router-dom';

const DonorLoginPage = () => {
  return <Navigate to="/" replace />;
};

export default DonorLoginPage;