import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Prevent rendering until auth state is determined (avoid redirect loop)
  if (user === undefined) {
    return null;
  }

  // If user is authenticated, redirect to home (or dashboard)
  if (user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
};

export default PublicRoute;
