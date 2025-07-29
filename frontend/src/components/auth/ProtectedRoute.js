import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // If no token is found, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // If the user is authenticated, render the child components
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
