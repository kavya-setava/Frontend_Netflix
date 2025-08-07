import { createBrowserRouter, Navigate } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';

const finalRoutes = [
    { path: '/', element: <Navigate to="/tickets" replace /> }, // Redirect root to login
    ...routes.map((route) => ({
        ...route,
        element: route.layout === 'blank'
            ? <BlankLayout>{route.element}</BlankLayout>
            : <DefaultLayout>{route.element}</DefaultLayout>,
    })),
    // { path: '*', element: <Navigate to="/login" replace /> }, // Catch-all redirect to login
];

const router = createBrowserRouter(finalRoutes);

export default router;
