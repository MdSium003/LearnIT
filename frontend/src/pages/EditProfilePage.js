import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Briefcase, GraduationCap, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const EditProfilePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('https://learnit-backend-ot1k.onrender.com/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch profile data.');
                
                const data = await response.json();
                // Ensure nested objects are not null
                setFormData({
                    ...data,
                    address: data.address || {},
                    professional: data.professional || { working: '' },
                    education: data.education || []
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (section, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [name]: value }
        }));
    };

    const handleEducationChange = (index, e) => {
        const { name, value } = e.target;
        const newEducation = [...formData.education];
        newEducation[index] = { ...newEducation[index], [name]: value };
        setFormData(prev => ({ ...prev, education: newEducation }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { degree: '', subject: '', passingYear: '', grade: '' }]
        }));
    };

    const removeEducation = (index) => {
        const newEducation = formData.education.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, education: newEducation }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('https://learnit-backend-ot1k.onrender.com/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to update profile.');
            }

            alert('Profile updated successfully!');
            navigate('/profile');

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center p-8">Loading profile for editing...</div>;
    if (error && !formData) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    if (!formData) return <div className="text-center p-8">Could not load profile data.</div>;

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 md:p-8">
            <div className="container mx-auto max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
                        <button type="button" onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700">
                            <ArrowLeft size={16} /> Back to Profile
                        </button>
                    </div>

                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">{error}</div>}

                    {/* Personal Info */}
                    <div className="p-6 border rounded-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><User size={20} className="mr-2 text-purple-500" /> Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="p-2 border rounded-md" required />
                            <input name="email" value={formData.email} placeholder="Email" className="p-2 border rounded-md bg-gray-100" readOnly />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="p-6 border rounded-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><MapPin size={20} className="mr-2 text-purple-500" /> Address</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="holding" value={formData.address.holding || ''} onChange={(e) => handleNestedChange('address', e)} placeholder="Holding / Street" className="p-2 border rounded-md" />
                            <input name="thana" value={formData.address.thana || ''} onChange={(e) => handleNestedChange('address', e)} placeholder="Thana / Area" className="p-2 border rounded-md" />
                            <input name="city" value={formData.address.city || ''} onChange={(e) => handleNestedChange('address', e)} placeholder="City" className="p-2 border rounded-md" />
                            <input name="postalCode" value={formData.address.postalCode || ''} onChange={(e) => handleNestedChange('address', e)} placeholder="Postal Code" className="p-2 border rounded-md" />
                            <input name="district" value={formData.address.district || ''} onChange={(e) => handleNestedChange('address', e)} placeholder="District" className="p-2 border rounded-md" required />
                            <input name="country" value={formData.address.country || ''} onChange={(e) => handleNestedChange('address', e)} placeholder="Country" className="p-2 border rounded-md" required />
                        </div>
                    </div>

                    {/* Professional Info (conditional) */}
                    {formData.isAuthor && (
                        <div className="p-6 border rounded-lg">
                            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><Briefcase size={20} className="mr-2 text-purple-500" /> Professional Information</h2>
                            <input name="working" value={formData.professional.working || ''} onChange={(e) => handleNestedChange('professional', e)} placeholder="Currently Working At" className="w-full p-2 border rounded-md" />
                        </div>
                    )}

                    {/* Education */}
                    <div className="p-6 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-700 flex items-center"><GraduationCap size={20} className="mr-2 text-purple-500" /> Educational Qualifications</h2>
                            <button type="button" onClick={addEducation} className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600">
                                <Plus size={16} /> Add
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.education.map((edu, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center p-2 bg-gray-50 rounded-md">
                                    <input name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} placeholder="Degree (e.g., B.Sc.)" className="p-2 border rounded-md" />
                                    <input name="subject" value={edu.subject} onChange={(e) => handleEducationChange(index, e)} placeholder="Subject" className="p-2 border rounded-md" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input name="passingYear" value={edu.passingYear} onChange={(e) => handleEducationChange(index, e)} placeholder="Year" type="number" className="p-2 border rounded-md" />
                                        <input name="grade" value={edu.grade} onChange={(e) => handleEducationChange(index, e)} placeholder="Grade" type="text" className="p-2 border rounded-md" />
                                    </div>
                                    <button type="button" onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-700 justify-self-end p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-right pt-4 border-t">
                        <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition-transform transform hover:scale-105">
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;
