import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, FileText, ChevronDown, Star, CheckCircle, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import StarRating from '../components/StarRating';

// --- Sub-component for the Accordion Item ---
const SubtopicAccordion = ({ subtopic }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200/80 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
                <span className="font-semibold text-gray-800 text-left">{subtopic.title}</span>
                <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="p-4 bg-white border-t border-gray-200/80">
                    <ul className="space-y-3">
                        {subtopic.videos.map((video, index) => (
                            <li key={`video-${index}`} className="flex items-center text-sm text-gray-600">
                                <PlayCircle className="h-4 w-4 mr-3 text-purple-600 flex-shrink-0" />
                                <span>{video}</span>
                            </li>
                        ))}
                        {subtopic.exams.map((exam, index) => (
                            <li key={`exam-${index}`} className="flex items-center text-sm text-gray-600">
                                <FileText className="h-4 w-4 mr-3 text-purple-600 flex-shrink-0" />
                                <span>{exam}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- Main Course Detail Page Component ---
const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolled, setEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch main course data
                const response = await fetch(`http://localhost:5001/api/v1/courses/${id}`);
                if (!response.ok) {
                    throw new Error('Course not found.');
                }
                const courseData = await response.json();
                setCourse(courseData);

                // Check enrollment status
                const token = localStorage.getItem('token');
                if (token) {
                    const enrollResponse = await fetch(`http://localhost:5001/api/enrollments/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    const enrollData = await enrollResponse.json();
                    setEnrolled(enrollData.enrolled);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseDetails();
    }, [id]);

    const handleEnroll = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to enroll.');
            navigate('/login');
            return;
        }
        try {
            const response = await fetch('http://localhost:5001/api/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId: course.id }),
            });
            const data = await response.json();
            if (data.success) {
                alert('You have successfully enrolled in this course!');
                setEnrolled(true);
                navigate('/my-courses');
            } else {
                throw new Error(data.error || 'Could not enroll.');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading course details...</div>;
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => navigate('/')} className="text-purple-600 hover:underline">Go Home</button>
            </div>
        );
    }
    
    if (!course) {
        return null; // Or a more specific "not found" component
    }

    return (
        <div className="bg-gray-50 font-sans">
            {/* --- Header Section --- */}
            <div className="bg-gray-800 text-white pt-12 pb-24">
                <div className="container mx-auto px-4">
                    <button onClick={() => navigate('/all-courses')} className="flex items-center text-sm text-purple-300 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to all courses
                    </button>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-3 max-w-4xl">{course.title}</h1>
                    <p className="text-lg text-gray-300 mb-5 max-w-4xl">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center">
                           <StarRating rating={course.rating} reviews={course.reviews} />
                        </div>
                        <p className="text-sm text-gray-400">Created by <span className="text-purple-300">{course.instructor}</span></p>
                    </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className="container mx-auto px-4 -mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Content</h2>
                            <div className="space-y-2">
                                {course.structure && course.structure.length > 0 ? (
                                    course.structure.map(subtopic => (
                                        <SubtopicAccordion key={subtopic.id} subtopic={subtopic} />
                                    ))
                                ) : (
                                    <p className="text-gray-500">No course structure available yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sticky Purchase Card) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-2xl sticky top-24 border border-gray-200/80">
                            <div className="p-6">
                                <p className="text-4xl font-bold text-gray-900 mb-4">{formatPrice(course.price)}</p>
                                
                                {enrolled ? (
                                    <Link to={`/my-courses/${id}/doing`} className="w-full text-center block bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition duration-200">
                                        Go to Course
                                    </Link>
                                ) : (
                                    <button onClick={handleEnroll} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition duration-200">
                                        Enroll Now
                                    </button>
                                )}
                                
                                <p className="text-xs text-gray-500 text-center mt-3">30-Day Money-Back Guarantee</p>
                            </div>
                            <div className="p-6 border-t border-gray-200/80">
                                <h4 className="font-semibold mb-3 text-gray-800">This course includes:</h4>
                                <ul className="text-sm space-y-2 text-gray-600">
                                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Full lifetime access</li>
                                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Certificate of completion</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
