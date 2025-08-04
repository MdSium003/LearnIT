import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, MapPin, Calendar, Briefcase, GraduationCap, ShieldCheck, Edit } from 'lucide-react';

// --- Helper Component for Profile Fields ---
const ProfileField = ({ icon, label, value }) => (
  <div>
    <label className="text-xs font-semibold text-gray-500 uppercase flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </label>
    <p className="text-md md:text-lg text-gray-800">{value || 'N/A'}</p>
  </div>
);

// --- Helper Component for Education Card ---
const EducationCard = ({ edu }) => (
  <div className="p-4 border-l-4 border-purple-400 bg-purple-50 rounded-r-lg">
    <h3 className="font-bold text-md text-purple-800">{edu.degree}</h3>
    <p className="text-sm text-gray-600">{edu.institution}</p>
    <div className="flex justify-between items-end mt-2 text-xs text-gray-500">
      <span>Passing Year: {edu.passingYear}</span>
      {edu.grade !== 'N/A' && <span>Grade: {edu.grade}</span>}
    </div>
  </div>
);


// --- Main Profile Page Component ---
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setError('No authentication token found. Please log in.');
        return;
      }

      try {
        const response = await fetch('https://learnit-backend-ot1k.onrender.com/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch profile data.');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center bg-gray-50 min-h-screen">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center bg-gray-50 min-h-screen">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center bg-gray-50 min-h-screen">
        <p className="text-lg text-gray-600">Could not load user profile. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        
        {/* --- Profile Header --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
          <img
            src={user.avatarUrl}
            alt="Profile Avatar"
            className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-purple-300 object-cover shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/e9d5ff/4c1d95?text=User'; }}
          />
          <div className="flex-grow text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">{user.name}</h1>
              {user.isAuthor && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full" title="This user is a course author">
                  <ShieldCheck size={14} /> Author
                </span>
              )}
            </div>
            <p className="text-md text-gray-500 mt-1 flex items-center justify-center md:justify-start">
              <Mail size={16} className="mr-2" /> {user.email}
            </p>
          </div>
          <Link to="/profile/edit" className="flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md transition-transform transform hover:scale-105">
                <Edit size={16} />
                Edit Profile
            </button>
          </Link>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column (Personal & Address) --- */}
          <div className="lg:col-span-1 space-y-8">
            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><User size={20} className="mr-2 text-purple-500"/> Personal Information</h2>
              <div className="space-y-4">
                <ProfileField icon={<Calendar size={14} />} label="Birth Date" value={formatDate(user.personalInfo.birthDate)} />
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><MapPin size={20} className="mr-2 text-purple-500"/> Address</h2>
              <div className="space-y-4">
                <ProfileField icon={<></>} label="Street / Holding" value={user.address.holding} />
                <ProfileField icon={<></>} label="Area / Thana" value={user.address.thana} />
                <ProfileField icon={<></>} label="City" value={user.address.city} />
                <ProfileField icon={<></>} label="Postal Code" value={user.address.postalCode} />
                <ProfileField icon={<></>} label="District" value={user.address.district} />
                <ProfileField icon={<></>} label="Country" value={user.address.country} />
              </div>
            </div>
          </div>

          {/* --- Right Column (Professional & Education) --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Professional Info Card (Conditional) */}
            {user.professional && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><Briefcase size={20} className="mr-2 text-purple-500"/> Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProfileField icon={<></>} label="Currently Working At" value={user.professional.working} />
                  <ProfileField icon={<></>} label="Teaching Since" value={formatDate(user.professional.teachingStartDate)} />
                </div>
              </div>
            )}

            {/* Educational Qualifications Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><GraduationCap size={20} className="mr-2 text-purple-500"/> Educational Qualifications</h2>
              <div className="space-y-4">
                {user.education && user.education.length > 0 ? (
                  user.education.map((edu, index) => <EducationCard key={index} edu={edu} />)
                ) : (
                  <p className="text-gray-500">No educational qualifications listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
