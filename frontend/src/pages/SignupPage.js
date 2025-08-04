import React, { useState } from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignupPage = ({ handleLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    birthdate: '', 
    district: '',  
    city: '',      
    country: '', 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://learnit-backend-ot1k.onrender.com/api/auth/register', { // Updated URL to 5001
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Something went wrong. Please try again.');
      }

      handleLogin(data.user, data.token);
      navigate('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg relative pt-16">
        <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-gray-600 hover:text-purple-600 flex items-center p-2 rounded-md bg-gray-100 hover:bg-gray-200">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Home
        </button>
        <div>
          <BookOpen className="mx-auto h-12 w-auto text-purple-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="fullname" className="sr-only">Full Name</label>
              <input id="fullname" name="fullName" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="email-address-signup" className="sr-only">Email address</label>
              <input id="email-address-signup" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" placeholder="Email address" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="password-signup" className="sr-only">Password</label>
              <input id="password-signup" name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" placeholder="Password" value={formData.password} onChange={handleChange} />
            </div>
            {/* New fields */}
            <div>
              <label htmlFor="birthdate" className="sr-only">Birthdate</label>
              <input id="birthdate" name="birthdate" type="date" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" value={formData.birthdate} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="district" className="sr-only">District</label>
              <input id="district" name="district" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" placeholder="District" value={formData.district} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="city" className="sr-only">City</label>
              <input id="city" name="city" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" placeholder="City" value={formData.city} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="country" className="sr-only">Country</label>
              <input id="country" name="country" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" placeholder="Country" value={formData.country} onChange={handleChange} />
            </div>
            {/* End new fields */}
          </div>
           <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 disabled:cursor-not-allowed">
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-medium text-purple-600 hover:text-purple-500">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;