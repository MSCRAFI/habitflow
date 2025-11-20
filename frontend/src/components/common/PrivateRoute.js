import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    const Loading = require('./Loading').default; // Lazy require to avoid circular deps
    return <Loading fullScreen label="Checking authentication..." />;
  }

  return user ? children : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default React.memo(PrivateRoute);
