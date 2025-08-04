import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeachPage = ({ user, setUser }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    setShowConfirmation(false);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to become a teacher.');
        return;
      }
      const response = await fetch('https://learnit-backend-ot1k.onrender.com/api/become-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert('Congratulations! You are now an instructor.');
        
        // Update user state to reflect instructor status
        if (user && setUser) {
          const updatedUser = { ...user, isAuthor: true };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Set the role in localStorage to 'teacher' for route protection
        localStorage.setItem('role', 'teacher');
        
        navigate('/teacher-dashboard');
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Teach on LearnIT</h1>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Become an Instructor</h2>
          <p className="text-gray-600 mb-8">
            Share your knowledge and reach millions of students around the world. We provide the tools and skills to teach what you love.
          </p>
          <button 
            onClick={() => setShowConfirmation(true)}
            className="bg-purple-600 text-white px-8 py-3 rounded-md hover:bg-purple-700 text-lg font-semibold transition-colors"
          >
            Become a Teacher
          </button>
        </div>
      </div>

      {showConfirmation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          onClick={() => setShowConfirmation(false)} // Close modal on overlay click
        >
          <div 
            className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full m-4"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Your Decision</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to register as an instructor? This will allow you to create and manage your own courses on LearnIT.
            </p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowConfirmation(false)} className="px-6 py-2 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors">Cancel</button>
              <button onClick={handleConfirm} className="px-6 py-2 rounded-md font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeachPage;
