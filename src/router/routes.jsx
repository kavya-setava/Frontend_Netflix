import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Tickets = lazy(() => import('../pages/dashboard/Tickets'));
const Login = lazy(() => import('../pages/Login'));
 // Add this page

const routes = [
  // Public routes
  {
    path: '/login',
    element: <Login />,
    layout: 'blank',
  },
 
  // Default redirect
  {
    path: '/',
    element: <Navigate to="/tickets" replace />,
    layout: 'default',
  },
  

  // Protected routes
  {
    path: '/',
   element: <ProtectedRoute allowedRoles={['qm', 'cm']} />,
// ✅ role check
    layout: 'default',
    children: [
      {
        path: 'tickets',
        element: <Tickets />,
      },
      // {
      //   path: 'dashboard',
      //   element: <Dashboard />,
      // },
    ],
  },

  // Catch-all: redirect unknown routes
  {
    path: '*',
    element: <Navigate to="/tickets" replace />,
    layout: 'default',
  },
];

export { routes };
