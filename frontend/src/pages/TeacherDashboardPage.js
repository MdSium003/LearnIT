import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Eye, Trash2, FileText, Award } from 'lucide-react'; // Import Award icon

const TeacherDashboardPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('https://learnit-backend-ot1k.onrender.com/api/teacher/my-courses', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    // Custom modal instead of window.confirm
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
        <div style="background: white; padding: 2rem; border-radius: 0.5rem; text-align: center;">
          <p class="mb-4">Are you sure you want to delete this course? This cannot be undone.</p>
          <button id="confirm-delete" style="background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; margin-right: 1rem;">Yes, Delete</button>
          <button id="cancel-delete" style="background: #d1d5db; padding: 0.5rem 1rem; border-radius: 0.25rem;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirm-delete').onclick = async () => {
        document.body.removeChild(modal);
        setDeleting(courseId);
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`https://learnit-backend-ot1k.onrender.com/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            setCourses(courses => courses.filter(c => c.Course_ID !== courseId));
          } else {
            alert('Failed to delete course.');
          }
        } catch (err) {
          alert('Error deleting course.');
        } finally {
          setDeleting(null);
        }
    };
    
    document.getElementById('cancel-delete').onclick = () => {
        document.body.removeChild(modal);
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teacher's Dashboard</h1>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-full shadow transition"
          onClick={() => navigate('/teacher/courses/create')}
        >
          + Create Course
        </button>
      </div>
      {loading ? (
        <p>Loading your courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">You have not authored any courses yet.</p>
      ) : (
        <ul className="space-y-4">
          {courses.map(course => (
            <li key={course.Course_ID} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold text-purple-700">{course.Title}</span>
                <p className="text-gray-600 text-sm mt-1">{course.Description?.slice(0, 80)}{course.Description && course.Description.length > 80 ? '...' : ''}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/teacher/courses/${course.Course_ID}/edit`}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 flex items-center gap-1 font-semibold"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
                <Link
                  to={`/teacher/courses/${course.Course_ID}/notices`}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 flex items-center gap-1 font-semibold"
                  title="Manage Notices"
                >
                  <FileText className="h-4 w-4" /> Notices
                </Link>
                {/* NEW Marks Button */}
                <Link
                  to={`/teacher/courses/${course.Course_ID}/marks`}
                  className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 flex items-center gap-1 font-semibold"
                  title="Manage Marks"
                >
                  <Award className="h-4 w-4" /> Marks
                </Link>
                <Link
                  to={`/course/${course.Course_ID}`}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 flex items-center gap-1 font-semibold"
                  title="See"
                >
                  <Eye className="h-4 w-4" /> See
                </Link>
                <button
                  onClick={() => handleDelete(course.Course_ID)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 flex items-center gap-1 font-semibold"
                  disabled={deleting === course.Course_ID}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" /> {deleting === course.Course_ID ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherDashboardPage;
