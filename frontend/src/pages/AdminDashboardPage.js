import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, AlertTriangle, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// A single course card component for displaying course information
const CourseCard = ({ course, onUpdateStatus }) => {
    const navigate = useNavigate();
    const isPending = course.Status === 'pending';

    const handleCardClick = () => {
        // Navigate to the new admin course detail page
        navigate(`/admin/course/${course.Course_ID}`);
    };
    
    const getStatusChip = () => {
        switch (course.Status) {
            case 'accepted':
                return <span className="absolute top-3 right-3 text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</span>;
            case 'declined':
                return <span className="absolute top-3 right-3 text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Declined</span>;
            default:
                return null;
        }
    };

    const handleButtonClick = (e, status) => {
        e.stopPropagation(); // Prevent the card click event from firing
        onUpdateStatus(course.Course_ID, status);
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 relative cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="p-6">
                {!isPending && getStatusChip()}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.Title}</h3>
                <p className="text-sm text-gray-500 mb-4">By {course.instructorName}</p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{course.Description || "No description provided."}</p>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-purple-600">${course.Price}</span>
                </div>
                {isPending && (
                    <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => handleButtonClick(e, 'accepted')}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Accept
                        </button>
                        <button
                            onClick={(e) => handleButtonClick(e, 'declined')}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Decline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// The main dashboard component
const AdminDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const statusMap = {
            pending: 'pending',
            history: 'accepted,declined'
        };

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://learnit-backend-ot1k.onrender.com/api/v1/admin/courses?status=${statusMap[activeTab]}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(response.data.data.courses);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch courses. You may not have administrator access.');
            setCourses([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleUpdateStatus = async (courseId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`https://learnit-backend-ot1k.onrender.com/api/v1/admin/courses/${courseId}/status`, 
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh the list after updating
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update course status.');
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10">Loading courses...</div>;
        }
        if (error) {
            return (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6 rounded-md flex items-center" role="alert">
                    <AlertTriangle className="w-6 h-6 mr-3"/>
                    <div>
                        <p className="font-bold">An Error Occurred</p>
                        <p>{error}</p>
                    </div>
                </div>
            );
        }
        if (courses.length === 0) {
            return (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm mt-6">
                    <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Courses Found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        There are no courses in this category right now.
                    </p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {courses.map(course => (
                    <CourseCard key={course.Course_ID} course={course} onUpdateStatus={handleUpdateStatus} />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage and approve new course submissions.</p>
                </header>

                <div>
                    <div className="sm:hidden">
                        <label htmlFor="tabs" className="sr-only">Select a tab</label>
                        <select
                            id="tabs"
                            name="tabs"
                            className="block w-full focus:ring-purple-500 focus:border-purple-500 border-gray-300 rounded-md"
                            onChange={(e) => setActiveTab(e.target.value)}
                            value={activeTab}
                        >
                            <option value="pending">Pending</option>
                            <option value="history">History</option>
                        </select>
                    </div>
                    <div className="hidden sm:block">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`${activeTab === 'pending'
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                >
                                    <Clock className="w-5 h-5 mr-2" /> Pending Courses
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`${activeTab === 'history'
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Action History
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
