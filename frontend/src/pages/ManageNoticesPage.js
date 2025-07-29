import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, ArrowLeft, Link } from 'lucide-react';

const ManageNoticesPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    attachmentLink: '' // Changed from attachmentId to attachmentLink
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, [courseId]);

  const fetchNotices = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/teacher/courses/${courseId}/notices`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          alert('You are not authorized to manage notices for this course.');
          navigate('/teacher-dashboard');
          return;
        }
        throw new Error('Failed to fetch notices');
      }

      const data = await response.json();
      setNotices(data.notices || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
      alert('Failed to load notices. Please try again.');
      navigate('/teacher-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    
    if (!newNotice.title.trim() || !newNotice.description.trim()) {
      alert('Please fill in both title and description.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5001/api/teacher/courses/${courseId}/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newNotice.title.trim(),
          description: newNotice.description.trim(),
          attachmentLink: newNotice.attachmentLink.trim() || null // Changed from attachmentId
        }),
      });
      
      if (response.ok) {
        alert('Notice added successfully!');
        setNewNotice({ title: '', description: '', attachmentLink: '' }); // Reset state
        setShowAddForm(false);
        fetchNotices(); // Refresh the list
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to add notice.'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice? This cannot be undone.')) {
      return;
    }

    setDeleting(noticeId);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5001/api/teacher/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        setNotices(notices.filter(n => n.Notice_ID !== noticeId));
        alert('Notice deleted successfully!');
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to delete notice.'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-purple-700">Manage Notices</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Course Notices</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 font-semibold"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? 'Cancel' : 'Add Notice'}
          </button>
        </div>

        {/* Add Notice Form */}
        {showAddForm && (
          <form onSubmit={handleAddNotice} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="Enter notice title"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                  placeholder="Enter notice description"
                  rows={4}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachment Link (Optional)
                </label>
                <input
                  type="url"
                  value={newNotice.attachmentLink}
                  onChange={(e) => setNewNotice({ ...newNotice, attachmentLink: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Notice'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewNotice({ title: '', description: '', attachmentLink: '' });
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Notices List */}
        {notices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notices found for this course.</p>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.Notice_ID} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-800">{notice.Title}</h3>
                    </div>
                    <p className="text-gray-600 mb-2 whitespace-pre-wrap">{notice.Description}</p>
                    {notice.attachment_link && (
                      <div className="mt-2 text-sm text-purple-600 flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <a 
                          href={notice.attachment_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline hover:text-purple-800 break-all"
                        >
                          {notice.attachment_title || notice.attachment_link}
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteNotice(notice.Notice_ID)}
                    disabled={deleting === notice.Notice_ID}
                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full disabled:opacity-50"
                    title="Delete Notice"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageNoticesPage;
