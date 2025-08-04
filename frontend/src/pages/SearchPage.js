import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Loader } from 'lucide-react';

const COURSES_PER_PAGE = 20;

// --- Reusable Course Card Component (Corrected) ---
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

// A simple StarRating component
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

// --- Main Search Page Component ---
const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('query') || '';
    
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleCoursesCount, setVisibleCoursesCount] = useState(COURSES_PER_PAGE);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchTerm) {
                setCourses([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                // Assuming your API has a search endpoint like this
                const response = await fetch(`https://learnit-backend-ot1k.onrender.com/api/v1/courses/search?query=${encodeURIComponent(searchTerm)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch search results.');
                }
                const data = await response.json();
                setCourses(data.data.courses); 
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchTerm]);

    const handleSeeMore = () => {
        setVisibleCoursesCount(prevCount => prevCount + COURSES_PER_PAGE);
    };

    const coursesToDisplay = courses.slice(0, visibleCoursesCount);
    const hasMoreCourses = visibleCoursesCount < courses.length;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Search Results</h1>
                    {searchTerm && <p className="text-lg text-gray-600 mt-3">Showing results for: <span className="font-semibold">"{searchTerm}"</span></p>}
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="h-8 w-8 text-purple-600 animate-spin" />
                        <span className="ml-4 text-lg text-gray-600">Searching for courses...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        <p>Error: {error}</p>
                    </div>
                ) : courses.length > 0 ? (
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
                                    See More Results
                                </button>
                            </div> 
                        )}
                    </>
                ) : (
                     <div className="text-center py-20">
                        <p className="text-xl text-gray-700">No courses found matching your search.</p>
                        <p className="text-md text-gray-500 mt-2">Try searching for a different keyword.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;