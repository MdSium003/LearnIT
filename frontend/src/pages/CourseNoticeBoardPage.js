import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Link } from 'lucide-react';

const CourseNoticeBoardPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch(`https://learnit-backend-ot1k.onrender.com/api/courses/${courseId}/notices`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setNotices(data.notices || []);
      } catch (err) {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [courseId]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-yellow-50 to-white">
      <div className="max-w-2xl mx-auto">
        <button
          className="flex items-center mb-6 text-purple-700 hover:underline font-semibold"
          onClick={() => navigate(`/my-courses/${courseId}/doing`)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Course
        </button>
        <h1 className="text-3xl font-bold mb-6 text-yellow-700 flex items-center gap-2">
          <FileText className="h-7 w-7 text-yellow-500" /> Notice Board
        </h1>
        {loading ? (
          <p>Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-gray-500">No notices for this course yet.</p>
        ) : (
          <ul className="space-y-6">
            {notices.map(notice => (
              <li key={notice.Notice_ID} className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-400">
                <h2 className="text-xl font-bold text-yellow-800 mb-2">{notice.Title}</h2>
                <p className="text-gray-700 mb-2 whitespace-pre-line">{notice.Description}</p>
                {notice.attachment_link && (
                  <a
                    href={notice.attachment_link}
                    className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Link className="h-4 w-4" />
                    {notice.attachment_title || 'View Attachment'}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseNoticeBoardPage;
