import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';

const EnrolledRoute = ({ children }) => {
    const { courseId } = useParams();
    const [isEnrolled, setIsEnrolled] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkEnrollment = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5001/api/enrollments/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsEnrolled(response.data.enrolled);
            } catch (error) {
                console.error("Enrollment check failed:", error);
                setIsEnrolled(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkEnrollment();
    }, [courseId]);

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!isEnrolled) {
        // If not enrolled, redirect to the main course detail page or homepage
        return <Navigate to={`/course/${courseId}`} replace />;
    }

    return children;
};

export default EnrolledRoute;
