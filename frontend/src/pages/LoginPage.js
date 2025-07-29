import React, { useState } from 'react';
import { BookOpen, ArrowLeft, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * LoginPage Component
 * * @param {object} props - The component's props.
 * @param {function} props.handleLogin - Callback function to handle the login process,
 * passing user data, token, and role to the parent component.
 */
const LoginPage = ({ handleLogin }) => {
  // State for form data (email and password)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  // State to manage the selected role ('user' or 'admin')
  const [role, setRole] = useState('user');
  // State for storing and displaying login errors
  const [error, setError] = useState('');
  // State to indicate when a login request is in progress
  const [isLoading, setIsLoading] = useState(false);
  // Hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Handles changes in form input fields.
   * @param {object} e - The event object from the input field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  /**
   * Handles the form submission for logging in.
   * @param {object} e - The form submission event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Send a POST request to the login endpoint
      const response = await fetch('http://localhost:5001/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include the form data and the selected role in the request body
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await response.json();

      // If the response is not OK, throw an error with the message from the server
      if (!response.ok) {
        throw new Error(data.msg || 'Something went wrong. Please try again.');
      }

      // Call the parent component's login handler with the user data, token, and role
      handleLogin(data.user, data.token, data.role);

      // Navigate to the appropriate dashboard based on the user's role
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      // Set the error message to be displayed to the user
      setError(err.message);
    } finally {
      // Stop the loading indicator
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl relative pt-16">
        {/* Back to Home Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 text-gray-500 hover:text-purple-600 flex items-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Home
        </button>
        
        {/* Header */}
        <div>
          <BookOpen className="mx-auto h-12 w-auto text-purple-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex justify-center rounded-lg p-1 bg-gray-200">
            <button
                onClick={() => setRole('user')}
                className={`flex items-center justify-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${
                role === 'user' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-300'
                }`}
            >
                <User className="h-4 w-4 mr-2" /> User
            </button>
            <button
                onClick={() => setRole('admin')}
                className={`flex items-center justify-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${
                role === 'admin' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-300'
                }`}
            >
                <Shield className="h-4 w-4 mr-2" /> Admin
            </button>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input 
                id="email-address" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" 
                placeholder="Email address" 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autoComplete="current-password" 
                required 
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <button type="button" className="font-medium text-purple-600 hover:text-purple-500"> Forgot your password? </button>
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
        
        {/* Link to Signup Page */}
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <button onClick={() => navigate('/signup')} className="font-medium text-purple-600 hover:text-purple-500">
            create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
