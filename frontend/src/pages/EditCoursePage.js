import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, PlayCircle, FileCheck2, Image, Youtube } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Helper function to create an empty subtopic object, ensuring all arrays are initialized.
const emptySubtopic = () => ({
  title: '',
  videos: [{ title: '', link: '' }],
  assignments: [{ link: '' }],
  exams: [{ link: '' }],
});

const EditCoursePage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  
  const [courseInfo, setCourseInfo] = useState({
    title: '',
    description: '',
    price: '',
  });
  
  // State for thumbnail and trailer
  const [trailerLink, setTrailerLink] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  // Initialize subtopics as an empty array to prevent errors before data is loaded.
  const [subtopics, setSubtopics] = useState([]);
  const [finalQuizExamLink, setFinalQuizExamLink] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/teacher/courses/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            alert('You are not authorized to edit this course.');
            navigate('/teacher-dashboard');
            return;
          }
          throw new Error('Failed to fetch course data');
        }

        const data = await response.json();
        const course = data.course;
        
        setCourseInfo({
          title: course.title || '',
          description: course.description || '',
          price: course.price || '',
        });
        
        setTrailerLink(course.trailerLink || '');
        setThumbnailPreview(`http://localhost:5001/api/courses/${courseId}/thumbnail`);

        if (course.subtopics && course.subtopics.length > 0) {
          const finalQuiz = course.subtopics.find(sub => sub.title === 'Final Quiz');
          const regularSubtopics = course.subtopics.filter(sub => sub.title !== 'Final Quiz');

          if (finalQuiz && Array.isArray(finalQuiz.exams) && finalQuiz.exams.length > 0) {
            setFinalQuizExamLink(finalQuiz.exams[0].link || '');
          }

          // **CRITICAL FIX:** Sanitize the fetched data to ensure all nested arrays exist.
          const sanitizedSubtopics = regularSubtopics.map(sub => ({
            ...sub,
            title: sub.title || '',
            videos: Array.isArray(sub.videos) ? sub.videos : [],
            assignments: Array.isArray(sub.assignments) ? sub.assignments : [],
            exams: Array.isArray(sub.exams) ? sub.exams : [],
          }));

          setSubtopics(sanitizedSubtopics.length > 0 ? sanitizedSubtopics : [emptySubtopic()]);
        } else {
          // If no subtopics exist, initialize with one empty one.
          setSubtopics([emptySubtopic()]);
        }

      } catch (error) {
        console.error('Error fetching course:', error);
        alert('Failed to load course data. Please try again.');
        navigate('/teacher-dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  const handleCourseChange = e => {
    setCourseInfo({ ...courseInfo, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = e => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubtopicChange = (idx, field, value) => {
    const updated = [...subtopics];
    updated[idx][field] = value;
    setSubtopics(updated);
  };

  const handleAddSubtopic = () => setSubtopics([...subtopics, emptySubtopic()]);
  const handleRemoveSubtopic = idx => setSubtopics(subtopics.filter((_, i) => i !== idx));

  const handleNestedChange = (type, sIdx, idx, field, value) => {
    const updated = [...subtopics];
    // Defensive check to prevent errors
    if (updated[sIdx] && updated[sIdx][type] && updated[sIdx][type][idx]) {
        updated[sIdx][type][idx][field] = value;
        setSubtopics(updated);
    }
  };

  const handleAddNested = (type, sIdx) => {
    const updated = [...subtopics];
    // Ensure the array exists before trying to push to it.
    if (!Array.isArray(updated[sIdx][type])) {
        updated[sIdx][type] = [];
    }
    updated[sIdx][type].push(type === 'videos' ? { title: '', link: '' } : { link: '' });
    setSubtopics(updated);
  };
  
  const handleRemoveNested = (type, sIdx, idx) => {
    const updated = [...subtopics];
    if (updated[sIdx] && Array.isArray(updated[sIdx][type])) {
        updated[sIdx][type] = updated[sIdx][type].filter((_, i) => i !== idx);
        setSubtopics(updated);
    }
  };

  const getFinalQuizSubtopic = () => ({
    title: 'Final Quiz',
    videos: [],
    assignments: [],
    exams: [{ link: finalQuizExamLink || '' }],
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (subtopics.length === 0) {
      alert('At least one subsection is required.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to update this course? This will replace all existing content.')) {
      return;
    }

    const formData = new FormData();
    formData.append('title', courseInfo.title);
    formData.append('description', courseInfo.description);
    formData.append('price', courseInfo.price);
    formData.append('trailerLink', trailerLink);
    if (thumbnail) {
        formData.append('thumbnail', thumbnail);
    }
    formData.append('subtopics', JSON.stringify([
        ...subtopics,
        getFinalQuizSubtopic(),
    ]));

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/teacher/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        alert('Course updated successfully!');
        navigate('/teacher-dashboard');
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to update course.'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <p>Loading course data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-gradient-to-r from-purple-100 to-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold mb-8 text-purple-700 text-center tracking-tight">Edit Course</h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Course Info */}
          <div className="bg-white/90 p-6 rounded-xl shadow-md space-y-4 border border-purple-100">
            <h2 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2"><FileText className="h-6 w-6 text-purple-400" /> Course Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="title"
                value={courseInfo.title}
                onChange={handleCourseChange}
                placeholder="Course Title"
                className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                required
              />
              <input
                name="price"
                value={courseInfo.price}
                onChange={handleCourseChange}
                placeholder="Price (USD)"
                type="number"
                min="0"
                className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                required
              />
            </div>
            <textarea
              name="description"
              value={courseInfo.description}
              onChange={handleCourseChange}
              placeholder="Course Description"
              className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
              rows={4}
              required
            />
             {/* Trailer Link Input */}
            <div className="flex items-center gap-2">
                <Youtube className="h-6 w-6 text-red-500" />
                <input
                    name="trailerLink"
                    value={trailerLink}
                    onChange={e => setTrailerLink(e.target.value)}
                    placeholder="Course Trailer Link (e.g., YouTube embed URL)"
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                />
            </div>
            {/* Thumbnail Upload */}
            <div className="flex items-center gap-2">
                <Image className="h-6 w-6 text-green-500" />
                <label htmlFor="thumbnail-upload" className="w-full p-3 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    {thumbnail ? `New: ${thumbnail.name}` : 'Change Course Thumbnail'}
                </label>
                <input
                    id="thumbnail-upload"
                    name="thumbnail"
                    type="file"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>
            {thumbnailPreview && (
                <div className="mt-4">
                    <p className="font-semibold text-gray-700">Thumbnail Preview:</p>
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="mt-2 rounded-lg max-h-48 shadow-md" />
                </div>
            )}
          </div>
          {/* Subtopics */}
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-purple-700 flex items-center gap-2"><PlayCircle className="h-6 w-6 text-purple-400" /> Subsections</h2>
              <button type="button" onClick={handleAddSubtopic} className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 font-semibold shadow transition">
                <Plus className="h-5 w-5" /> Add Subsection
              </button>
            </div>
            {subtopics.map((sub, sIdx) => (
              <div key={sIdx} className="bg-white/90 border border-purple-100 rounded-xl shadow p-6 mb-2 space-y-4 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveSubtopic(sIdx)}
                  className="absolute -top-5 right-4 bg-red-500 hover:bg-red-700 text-white rounded-full px-4 py-2 shadow-lg ring-0 focus:ring-4 focus:ring-red-300 transition-all duration-200 z-20 transform hover:scale-110 flex items-center gap-2"
                  title="Remove Subsection"
                  aria-label="Remove Subsection"
                  style={{ minWidth: 'fit-content' }}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="font-semibold">Delete Subsection</span>
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  <input
                    value={sub.title || ''}
                    onChange={e => handleSubtopicChange(sIdx, 'title', e.target.value)}
                    placeholder="Subsection Title"
                    className="flex-1 p-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                    required
                  />
                </div>
                {/* Videos */}
                <div className="ml-4 mb-2">
                  <div className="flex items-center gap-2 mb-1 font-semibold text-gray-700"><PlayCircle className="h-4 w-4 text-purple-500" /> Videos</div>
                  {(sub.videos || []).map((v, idx) => (
                    <div key={idx} className="flex gap-2 mb-1">
                      <input
                        value={v.title || ''}
                        onChange={e => handleNestedChange('videos', sIdx, idx, 'title', e.target.value)}
                        placeholder="Video Title"
                        className="flex-1 p-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                        required
                      />
                      <input
                        value={v.link || ''}
                        onChange={e => handleNestedChange('videos', sIdx, idx, 'link', e.target.value)}
                        placeholder="Video Link (embed URL)"
                        className="flex-1 p-2 border border-purple-200 rounded focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                        required
                      />
                      <button type="button" onClick={() => handleRemoveNested('videos', sIdx, idx)} className="text-red-500 hover:text-red-700 bg-red-50 rounded-full p-2 transition" title="Remove Video"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddNested('videos', sIdx)} className="text-xs text-purple-600 hover:underline mt-1 font-semibold">+ Add Video</button>
                </div>
                {/* Assignments */}
                <div className="ml-4 mb-2">
                  <div className="flex items-center gap-2 mb-1 font-semibold text-gray-700"><FileCheck2 className="h-4 w-4 text-blue-500" /> Assignments</div>
                  {(sub.assignments || []).map((a, idx) => (
                    <div key={idx} className="flex gap-2 mb-1">
                      <input
                        value={a.link || ''}
                        onChange={e => handleNestedChange('assignments', sIdx, idx, 'link', e.target.value)}
                        placeholder="Assignment Link (URL)"
                        className="flex-1 p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        required
                      />
                    </div>
                  ))}
                </div>
                {/* Exams */}
                <div className="ml-4">
                  <div className="flex items-center gap-2 mb-1 font-semibold text-gray-700"><FileCheck2 className="h-4 w-4 text-red-500" /> Exams</div>
                  {(sub.exams || []).map((e, idx) => (
                    <div key={idx} className="flex gap-2 mb-1">
                      <input
                        value={e.link || ''}
                        onChange={ev => handleNestedChange('exams', sIdx, idx, 'link', ev.target.value)}
                        placeholder="Exam Link (URL)"
                        className="flex-1 p-2 border border-red-200 rounded focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Final Quiz Subsection */}
            <div className="bg-white/90 border-2 border-yellow-400 rounded-xl shadow p-6 mb-2 space-y-4 relative mt-8">
              <div className="flex items-center gap-3 mb-2">
                <FileCheck2 className="h-5 w-5 text-yellow-500" />
                <input
                  value="Final Quiz"
                  readOnly
                  className="flex-1 p-2 border border-yellow-300 rounded bg-yellow-50 font-bold text-yellow-700 cursor-not-allowed"
                />
              </div>
              <div className="ml-4">
                <input
                  value={finalQuizExamLink}
                  onChange={e => setFinalQuizExamLink(e.target.value)}
                  placeholder="Final Quiz Exam Link (URL)"
                  className="w-full p-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition bg-yellow-50"
                  required
                />
              </div>
            </div>
          </div>
          <div className="text-right mt-8">
            <button type="submit" className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold px-10 py-3 rounded-full shadow-lg transition text-lg tracking-wide">Done</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage;
