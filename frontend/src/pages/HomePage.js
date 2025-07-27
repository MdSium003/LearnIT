import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

// This can be the same CourseCard component used in AllCoursesPage
// For simplicity, it's defined here, but ideally, it would be in its own file.
const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    // Correctly access the course ID from the data
    const courseId = course.Course_ID || course.id;

    return (
        <div 
            onClick={() => navigate(`/course/${courseId}`)}
            className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden group cursor-pointer transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
        >
            <div className="relative h-40 bg-gray-200">
                 {course.thumbnail_base64 ? (
                    <img 
                        src={`data:image/png;base64,${course.thumbnail_base64}`} 
                        alt={`${course.Title || course.title} thumbnail`}
                        className="w-full h-full object-cover"
                    />
                 ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-80"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h3 className="text-white text-xl font-bold text-center p-4">{course.Title || course.title}</h3>
                        </div>
                    </>
                 )}
            </div>
            <div className="p-5 flex-grow flex flex-col">
                <p className="text-sm text-gray-500 mb-2">By {course.instructor || 'LearnIT Staff'}</p>
                <div className="flex items-center mb-4">
                    <StarRating rating={course.rating || 4.5} reviews={course.reviews || (Math.random() * 200).toFixed(0)} />
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


const HomePage = ({ courses, isLoading }) => {
    // Use a slice of courses for the featured section
    const featuredCourses = courses.slice(0, 8);

    return (
        <div className="bg-gray-50">
            {/* --- Hero Section --- */}
            <div className="relative bg-gray-800 text-white text-center py-20 md:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-black opacity-80"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
                
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                        Unlock Your Potential
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                        Explore thousands of courses to master new skills, achieve your goals, and advance your career.
                    </p>
                    <div className="flex justify-center">
                        <Link to="/all-courses" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 text-lg transform hover:scale-105">
                            Explore Courses
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- Featured Courses Section --- */}
            <div className="py-16 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Courses</h2>
                        <p className="text-lg text-gray-600 mt-2">Hand-picked courses to get you started</p>
                    </div>
                    {isLoading ? (
                        <div className="text-center">Loading courses...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredCourses.map(course => (
                                <CourseCard key={course.Course_ID || course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
