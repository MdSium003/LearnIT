import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const TeacherRoute = ({ children }) => {
    const role = localStorage.getItem('role');

    if (role !== 'teacher') {
        // If the user is not a teacher, redirect to the homepage
        return <Navigate to="/" replace />;
    }

    // If the user is a teacher, render the child components
    return children ? children : <Outlet />;
};

export default TeacherRoute;
