// Create PrivateRoute component: Check localStorage token, else redirect to login.

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if token exists
  return children;
};

export default PrivateRoute;
