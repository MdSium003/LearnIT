import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// --- NEW: Import Award icon for the certificate button ---
import { PlayCircle, FileText, ChevronDown, Menu, X, Bell, Loader, ArrowLeft, Award } from 'lucide-react';

// Helper to ensure links are absolute URLs for external resources
const ensureAbsoluteUrl = url => {
    if (!url) return '#';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}

const CourseDoingPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState({ title: '', subtopics: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openSubtopic, setOpenSubtopic] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    // --- NEW: State to handle certificate download loading ---
    const [isDownloading, setIsDownloading] = useState(false);
    // --- NEW: State to control certificate button availability ---
    const [canGetCertificate, setCanGetCertificate] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await fetch(`https://learnit-backend-ot1k.onrender.com/api/courses/${courseId}/doing`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                 if (!response.ok) {
                    throw new Error("Failed to load course content. You may not be enrolled.");
                }
                const data = await response.json();
                
                // Set the certificate availability based on the API response
                setCanGetCertificate(data.canGetCertificate);
                
                // Fetch course title separately for the header
                const courseTitleRes = await fetch(`https://learnit-backend-ot1k.onrender.com/api/v1/courses/${courseId}`);
                const courseTitleData = await courseTitleRes.json();

                // **FIX:** Sort subtopics to ensure "Final Quiz" is always last.
                let sortedSubtopics = [];
                if (data.subtopics && Array.isArray(data.subtopics)) {
                    const finalQuiz = data.subtopics.find(sub => sub.title === 'Final Quiz');
                    const regularSubtopics = data.subtopics.filter(sub => sub.title !== 'Final Quiz');
                    sortedSubtopics = [...regularSubtopics];
                    if (finalQuiz) {
                        sortedSubtopics.push(finalQuiz);
                    }
                }

                setCourseData({ title: courseTitleData.title || 'Course', subtopics: sortedSubtopics });

                // Auto-select the first video of the first subtopic
                if (sortedSubtopics.length > 0) {
                    const firstSubtopic = sortedSubtopics[0];
                    setOpenSubtopic(firstSubtopic.subTopicId);
                    if (firstSubtopic.videos && firstSubtopic.videos.length > 0) {
                        setSelectedContent({ type: 'video', data: firstSubtopic.videos[0] });
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, navigate]);

    const handleSelectContent = (type, data) => {
        setSelectedContent({ type, data });
        setSidebarOpen(false); // Close sidebar on mobile after selection
    };

    // --- NEW: Function to handle certificate download ---
    const handleDownloadCertificate = async () => {
        setIsDownloading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://learnit-backend-ot1k.onrender.com/api/courses/${courseId}/certificate`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.msg || 'Could not download certificate.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // The filename is set by the server's Content-Disposition header
            a.download = `Certificate-${courseData.title}.png`; 
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`); // Replace with a better notification system if you have one
        } finally {
            setIsDownloading(false);
        }
    };


    const renderContent = () => {
        if (!selectedContent) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-100 rounded-lg w-full max-w-6xl mx-auto">
                    <PlayCircle className="h-16 w-16 mb-4 text-gray-300" />
                    <h2 className="text-xl font-semibold">Welcome to your course!</h2>
                    <p>Select a lesson from the sidebar to begin learning.</p>
                </div>
            );
        }

        if (selectedContent.type === 'video') {
            return (
                <div className="w-full max-w-6xl mx-auto">
                    {/* --- FIXED VIDEO CONTAINER --- */}
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* This creates a 16:9 aspect ratio container */}
                        <iframe
                            src={ensureAbsoluteUrl(selectedContent.data.Link)}
                            title={selectedContent.data.Title || 'Course Video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl shadow-purple-900/20 border-0"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">{selectedContent.data.Title}</h2>
                </div>
            );
        }
        // Can add more content types here later (e.g., assignments, exams)
        return null;
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-purple-200/50">
                <p className="text-sm text-purple-800">Course</p>
                <h2 className="text-xl font-bold text-purple-900 tracking-tight">{courseData.title}</h2>
            </div>
            {loading ? (
                 <div className="flex justify-center items-center flex-grow">
                    <Loader className="h-6 w-6 text-purple-600 animate-spin" />
                 </div>
            ) : error ? (
                <p className="p-4 text-red-500">{error}</p>
            ) : (
                <ul className="flex-grow overflow-y-auto p-2 space-y-1">
                    {courseData.subtopics.map(sub => (
                        <li key={sub.subTopicId}>
                            <button
                                className="w-full flex items-center justify-between font-semibold text-purple-800 px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-purple-100"
                                onClick={() => setOpenSubtopic(openSubtopic === sub.subTopicId ? null : sub.subTopicId)}
                            >
                                <span className="text-left">{sub.title}</span>
                                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openSubtopic === sub.subTopicId ? 'rotate-180' : ''}`} />
                            </button>
                            {openSubtopic === sub.subTopicId && (
                                <div className="pl-4 mt-1 space-y-1">
                                    {sub.videos.map(video => (
                                        <button
                                            key={video.Video_ID}
                                            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${selectedContent?.data.Video_ID === video.Video_ID ? 'bg-purple-600 text-white font-semibold' : 'hover:bg-purple-100 text-gray-700'}`}
                                            onClick={() => handleSelectContent('video', video)}
                                        >
                                            <PlayCircle className="h-4 w-4 flex-shrink-0" />
                                            {video.Title || 'Untitled Video'}
                                        </button>
                                    ))}
                                    {sub.assignments.map(ass => (
                                        <a key={ass.Assignment_ID} href={ensureAbsoluteUrl(ass.Assignment_Link)} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-purple-100 text-gray-700 transition-colors duration-200">
                                            <FileText className="h-4 w-4 flex-shrink-0" />
                                            Assignment
                                        </a>
                                    ))}
                                    {/* MODIFIED EXAM MAPPING */}
                                    {sub.exams.map(exam => (
                                        <a 
                                            key={exam.Exam_ID} 
                                            href={ensureAbsoluteUrl(exam.Exam_Link)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm hover:bg-purple-100 text-gray-700 transition-colors duration-200"
                                        >
                                            <span className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 flex-shrink-0" />
                                                {sub.title.toLowerCase().includes('quiz') ? 'Final Quiz' : 'Exam'}
                                            </span>
                                            
                                            {exam.exam_mark !== null && exam.exam_mark !== undefined && (
                                                <span className="font-bold text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                                                    {exam.exam_mark} / {10}
                                                </span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:block w-80 bg-white border-r border-gray-200/80 shadow-sm flex-shrink-0">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)}></div>
                 <aside className="relative w-80 h-full bg-white shadow-lg">
                    {sidebarContent}
                 </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigate('/my-courses')} className="flex items-center text-sm text-gray-500 hover:text-purple-700 font-semibold">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to My Courses
                    </button>
                    <div className="flex items-center gap-4">
                        {/* --- MODIFIED: Certificate Button --- */}
                        <button
                            onClick={handleDownloadCertificate}
                            disabled={!canGetCertificate || isDownloading}
                            title={!canGetCertificate ? "You must complete the Final Quiz to get your certificate." : "Download your certificate"}
                            className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-purple-700 transition-colors duration-200 shadow-sm disabled:bg-purple-300 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                                <Award className="h-4 w-4" />
                            )}
                            {isDownloading ? 'Generating...' : 'Get Certificate'}
                        </button>

                        <button
                            onClick={() => navigate(`/my-courses/${courseId}/notices`)}
                            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300/80 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                        >
                            <Bell className="h-4 w-4" />
                            Notice Board
                        </button>
                        <button className="lg:hidden text-gray-600 p-2 rounded-full hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default CourseDoingPage;