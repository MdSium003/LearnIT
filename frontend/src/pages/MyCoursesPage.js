import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, PlayCircle, BookOpen } from 'lucide-react';

// --- Reusable Enrolled Course Card Component ---
const EnrolledCourseCard = ({ course }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden h-full flex flex-col">
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {course.Title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {course.Description?.slice(0, 100)}{course.Description && course.Description.length > 100 ? '...' : ''}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link 
                        to={`/my-courses/${course.Course_ID}/doing`} 
                        className="w-full flex items-center justify-center bg-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Continue
                    </Link>
                </div>
            </div>
        </div>
    );
};


// --- Main My Courses Page Component ---
const MyCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("You must be logged in to view your courses.");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('http://localhost:5001/api/my-courses', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error("Failed to load your courses. Please try again later.");
                }
                const data = await response.json();
                setCourses(data.courses || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">My Learning</h1>
                    <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
                        Continue your journey and master new skills. All your enrolled courses are here.
                    </p>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="h-8 w-8 text-purple-600 animate-spin" />
                        <span className="ml-4 text-lg text-gray-600">Loading Your Courses...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        <p>{error}</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-md border">
                        <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your learning journey awaits!</h2>
                        <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet.</p>
                        <button
                            onClick={() => navigate('/all-courses')}
                            className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 text-md font-semibold transition-transform transform hover:scale-105"
                        >
                            Explore Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {courses.map(course => (
                            <EnrolledCourseCard key={course.Course_ID} course={course} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCoursesPage;
