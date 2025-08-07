import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

const Authorization = ({ allowedRoles, children }) => {
  const user = useSelector((state) => state.userprofileReducer.user);
  const location = useLocation();

  return user?._id ? (
    allowedRoles.find((role) => user?.role?.includes(role)) ? (
      children
    ) : (
      <Navigate to="/auth/404" />
    )
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default Authorization;