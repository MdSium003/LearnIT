import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, MapPin } from 'lucide-react';

const AdminProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5001/api/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data);
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (isLoading) return <div className="p-8">Loading profile...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!profile) return <div className="p-8">No profile data found.</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                    <img src={profile.avatarUrl} alt="Admin" className="w-24 h-24 rounded-full mr-6" />
                    <div>
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-gray-500">{profile.email}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-3 text-purple-600" />
                        <span>Born on: {new Date(profile.personalInfo.birthDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-3 text-purple-600" />
                        <span>{profile.address.city}, {profile.address.country}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
