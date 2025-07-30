import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Loader, Award } from 'lucide-react'; // Added Award icon for the tag

const COURSES_PER_PAGE = 20;

// --- Reusable Course Card Component ---
const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    // Function to truncate description
    const truncateDescription = (text, maxLength = 100) => {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div 
            onClick={() => navigate(`/course/${course.Course_ID}`)}
            className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden group cursor-pointer transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
        >
            <div className="relative h-40 bg-gray-200">
                {/* Bestseller Tag - Renders if enrollment_count > 3 */}
                {course.enrollment_count > 3 && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center shadow-md">
                        <Award className="h-4 w-4 mr-1" />
                        Bestseller
                    </div>
                )}

                 {course.thumbnail_base64 ? (
                    <img 
                        src={`data:image/png;base64,${course.thumbnail_base64}`} 
                        alt={`${course.Title} thumbnail`}
                        className="w-full h-full object-cover"
                    />
                 ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-80"></div>
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <h3 className="text-white text-xl font-bold text-center">{course.Title}</h3>
                        </div>
                    </>
                 )}
            </div>
            <div className="p-5 flex-grow flex flex-col">
                <h4 className="font-bold text-lg text-gray-800 mb-2 h-14 overflow-hidden">{course.Title}</h4>
                <p className="text-sm text-gray-600 mb-3 flex-grow">{truncateDescription(course.Description)}</p>
                <p className="text-sm text-gray-500 mb-2">By {course.instructor || 'LearnIT Staff'}</p>
                 <div className="flex items-center mb-4">
                    <StarRating rating={course.rating || 4.5} reviews={course.reviews || (Math.random() * 1000).toFixed(0)} />
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xl font-bold text-gray-900">{course.Price > 0 ? `$${course.Price}`: 'Free'}</p>
                    <span className="text-purple-600 group-hover:text-purple-700 font-semibold text-sm flex items-center">
                        View Details <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </div>
    );
};

// A simple StarRating component to be used in the card
const StarRating = ({ rating, reviews }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-current" />)}
            {halfStar && <Star key="half" className="h-4 w-4 text-yellow-400 fill-current" />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300 fill-current" />)}
            <span className="text-xs text-gray-500 ml-2">({reviews} reviews)</span>
        </div>
    );
};


// --- Main All Courses Page Component ---
const AllCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleCoursesCount, setVisibleCoursesCount] = useState(COURSES_PER_PAGE);
    
    useEffect(() => {
        const fetchAllCourses = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:5001/api/v1/courses');
                if (!response.ok) {
                    throw new Error('Failed to fetch courses.');
                }
                const data = await response.json();
                // The new 'enrollment_count' field is now available in the data
                setCourses(data.data.courses);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllCourses();
    }, []);

    const handleSeeMore = () => {
        setVisibleCoursesCount(prevCount => prevCount + COURSES_PER_PAGE);
    };

    const coursesToDisplay = courses.slice(0, visibleCoursesCount);
    const hasMoreCourses = visibleCoursesCount < courses.length;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Explore Our Courses</h1>
                    <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
                        Find the perfect course to match your ambition. From technology to arts, your learning journey starts here.
                    </p>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="h-8 w-8 text-purple-600 animate-spin" />
                        <span className="ml-4 text-lg text-gray-600">Loading Courses...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        <p>Error: {error}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {coursesToDisplay.map(course => (
                                <CourseCard key={course.Course_ID} course={course} />
                            ))}
                        </div>
                        {hasMoreCourses && (
                            <div className="text-center mt-12">
                                <button 
                                    onClick={handleSeeMore} 
                                    className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 text-lg font-semibold transition-transform transform hover:scale-105"
                                >
                                    See More Courses
                                </button>
                            </div> 
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllCoursesPage;
