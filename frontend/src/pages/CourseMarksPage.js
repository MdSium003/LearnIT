import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, Save, XCircle, CheckCircle, User, Users, BookOpen } from 'lucide-react';

// Notification component for user feedback
const Notification = ({ message, type, onDismiss }) => {
  if (!message) return null;
  const baseStyle = "fixed top-5 right-5 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 transition-transform transform-gpu";
  const styles = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };
  return (
    <div className={`${baseStyle} ${styles[type]}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="text-gray-500 hover:text-gray-800 font-bold text-lg">&times;</button>
    </div>
  );
};

// Main component for the Course Marks Page
const CourseMarksPage = () => {
  const { courseId } = useParams();
  const [courseTitle, setCourseTitle] = useState('');
  const [students, setStudents] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [marks, setMarks] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetches data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Authentication token not found. Please log in.', 'error');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/teacher/courses/${courseId}/marks`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setCourseTitle(data.courseTitle);
        setSubTopics(data.subTopics);
        setStudents(data.students);
        
        // Set the first student as selected by default
        if (data.students.length > 0) {
          setSelectedStudent(data.students[0]);
        }

        // Initialize marks and comments state
        const initialMarks = {};
        const initialComments = {};
        data.students.forEach(student => {
          initialMarks[student.student_id] = {};
          initialComments[student.student_id] = {};
          data.subTopics.forEach(subTopic => {
            const markData = student.marks.find(m => m.sub_topic_id === subTopic.sub_topic_id);
            initialMarks[student.student_id][subTopic.sub_topic_id] = markData?.exam_mark ?? '';
            initialComments[student.student_id][subTopic.sub_topic_id] = markData?.comment ?? '';
          });
        });
        setMarks(initialMarks);
        setComments(initialComments);

      } catch (err) {
        console.error("Failed to fetch marks data", err);
        showNotification('Failed to load course data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  // Helper to show notifications
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  // State update handlers
  const handleMarkChange = (studentId, subTopicId, value) => {
    const numValue = Number(value);
    // Only update state if the value is empty or a number between 0 and 10.
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 10)) {
        setMarks(prev => ({ ...prev, [studentId]: { ...prev[studentId], [subTopicId]: value } }));
    }
  };

  const handleCommentChange = (studentId, subTopicId, value) => {
    setComments(prev => ({ ...prev, [studentId]: { ...prev[studentId], [subTopicId]: value } }));
  };

  // Save all changes to the backend
  const handleSaveChanges = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    const marksData = [];
    students.forEach(student => {
      subTopics.forEach(subTopic => {
        const mark = marks[student.student_id]?.[subTopic.sub_topic_id];
        const comment = comments[student.student_id]?.[subTopic.sub_topic_id];
        if (mark !== undefined || comment !== undefined) {
          marksData.push({
            studentId: student.student_id,
            subTopicId: subTopic.sub_topic_id,
            mark: mark === '' ? null : Number(mark),
            comment: comment || null,
          });
        }
      });
    });

    try {
      const response = await fetch(`http://localhost:5001/api/teacher/courses/${courseId}/marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ marks: marksData }),
      });
      if (response.ok) {
        showNotification('Marks saved successfully!', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to save marks.', 'error');
      }
    } catch (err) {
      console.error("Error saving marks:", err);
      showNotification('An error occurred while saving marks.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  // Main JSX for the redesigned page
  return (
    <>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onDismiss={() => setNotification({ message: '', type: '' })} 
      />
      <div className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{courseTitle}</h1>
                        <p className="text-md text-gray-600 mt-1">Student Marks</p>
                    </div>
                    <button
                        onClick={handleSaveChanges}
                        disabled={saving || loading}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving ? (
                            <><Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />Saving...</>
                        ) : (
                            <><Save className="-ml-1 mr-2 h-5 w-5" />Save All Changes</>
                        )}
                    </button>
                </div>
            </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Student List */}
            <aside className="w-full lg:w-1/3 xl:w-1/4">
              <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <Users size={20} /> Enrolled Students ({students.length})
                </h2>
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                  {students.length > 0 ? (
                    <ul className="space-y-2">
                      {students.map(student => (
                        <li key={student.student_id}>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                              selectedStudent?.student_id === student.student_id
                                ? 'bg-indigo-100 text-indigo-800 font-semibold'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-sm">{student.name}</p>
                                <p className={`text-xs ${selectedStudent?.student_id === student.student_id ? 'text-indigo-600' : 'text-gray-500'}`}>{student.email}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No students enrolled.</p>
                  )}
                </div>
              </div>
            </aside>

            {/* Right Column: Marks Entry Form */}
            <section className="w-full lg:w-2/3 xl:w-3/4">
              {selectedStudent ? (
                <div className="bg-white rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900">
                          Marks for {selectedStudent.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Enter marks and comments for each sub-topic below.</p>
                  </div>
                  <div className="p-6 space-y-6 max-h-[calc(100vh-15rem)] overflow-y-auto">
                    {subTopics.map(st => (
                      <div key={st.sub_topic_id} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                            <BookOpen size={18}/> {st.title}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label htmlFor={`mark-${st.sub_topic_id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Mark
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                  id={`mark-${st.sub_topic_id}`}
                                  type="number"
                                  min="0"
                                  max="10"
                                  placeholder="e.g., 8"
                                  value={marks[selectedStudent.student_id]?.[st.sub_topic_id] ?? ''}
                                  onChange={(e) => handleMarkChange(selectedStudent.student_id, st.sub_topic_id, e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                                <span className="text-gray-500 font-medium whitespace-nowrap">/ 10</span>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label htmlFor={`comment-${st.sub_topic_id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Comment
                            </label>
                            <textarea
                              id={`comment-${st.sub_topic_id}`}
                              placeholder="Add a comment..."
                              value={comments[selectedStudent.student_id]?.[st.sub_topic_id] ?? ''}
                              onChange={(e) => handleCommentChange(selectedStudent.student_id, st.sub_topic_id, e.target.value)}
                              className="w-full min-w-[200px] p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              rows="3"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-md p-12 text-center">
                    <Users size={48} className="text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Student</h3>
                    <p className="mt-1 text-sm text-gray-500">Choose a student from the list to view and manage their marks.</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default CourseMarksPage;
