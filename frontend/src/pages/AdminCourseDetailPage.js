import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, Video, FileText, DollarSign, User } from 'lucide-react';

// Helper function to ensure URL is absolute
const formatUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // Prepend 'https://' to make the URL absolute
    return `https://${url}`;
};

const AdminCourseDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setIsLoading(true);
            // Add a check to ensure the courseId is a valid number before fetching
            if (isNaN(parseInt(courseId))) {
                setError("Invalid Course ID provided.");
                setIsLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://learnit-backend-ot1k.onrender.com/api/v1/admin/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourse(response.data.data.course);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to fetch course details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="text-xl">Loading course details...</div></div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (!course) {
        return <div className="text-center py-10">Course not found.</div>;
    }

    const {
        Title,
        Description,
        Price,
        instructorName,
        thumbnail_base64,
        trailerLink,
        subtopics
    } = course;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-purple-700 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="md:col-span-1">
                            {thumbnail_base64 ? (
                                <img
                                    src={`data:image/png;base64,${thumbnail_base64}`}
                                    alt={Title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <BookOpen className="text-gray-400 w-16 h-16" />
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2 p-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{Title}</h1>
                            <p className="text-lg text-gray-600 mb-4">{Description}</p>
                            <div className="flex flex-wrap gap-4 text-lg mb-6">
                                <span className="flex items-center gap-2 text-gray-800">
                                    <User size={20} className="text-purple-600" />
                                    Instructor: <strong>{instructorName}</strong>
                                </span>
                                <span className="flex items-center gap-2 text-gray-800">
                                    <DollarSign size={20} className="text-purple-600" />
                                    Price: <strong>${Price}</strong>
                                </span>
                            </div>
                             {trailerLink && (
                                <a href={formatUrl(trailerLink)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                                    Watch Trailer
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="p-8 border-t border-gray-200">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Course Structure</h2>
                        <div className="space-y-6">
                            {subtopics && subtopics.map((subtopic, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{subtopic.title}</h3>
                                    <ul className="space-y-3">
                                        {subtopic.videos.map((video, vIndex) => (
                                            <li key={vIndex} className="flex items-center gap-3 text-gray-700">
                                                <Video size={18} className="text-green-500" />
                                                <a href={formatUrl(video.Link)} target="_blank" rel="noopener noreferrer" className="hover:underline">{video.Title}</a>
                                            </li>
                                        ))}
                                        {subtopic.assignments.map((assignment, aIndex) => (
                                            <li key={aIndex} className="flex items-center gap-3 text-gray-700">
                                                <FileText size={18} className="text-blue-500" />
                                                <a href={formatUrl(assignment.Assignment_Link)} target="_blank" rel="noopener noreferrer" className="hover:underline">Assignment</a>
                                            </li>
                                        ))}
                                         {subtopic.exams.map((exam, eIndex) => (
                                            <li key={eIndex} className="flex items-center gap-3 text-gray-700">
                                                <FileText size={18} className="text-red-500" />
                                                <a href={formatUrl(exam.Exam_Link)} target="_blank" rel="noopener noreferrer" className="hover:underline">Exam</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCourseDetailPage;
