import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import TeachPage from './pages/TeachPage';
import AllCoursesPage from './pages/AllCoursesPage';
import ContactUs from './components/ContactUs';
import AboutUs from './pages/AboutUs';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import MyCoursesPage from './pages/MyCoursesPage';
import CourseDoingPage from './pages/CourseDoingPage';
import CourseNoticeBoardPage from './pages/CourseNoticeBoardPage';
import CreateCoursePage from './pages/CreateCoursePage';
import EditCoursePage from './pages/EditCoursePage';
import ManageNoticesPage from './pages/ManageNoticesPage';
import EditProfilePage from './pages/EditProfilePage'; 
// Import the new CourseMarksPage
import CourseMarksPage from './pages/CourseMarksPage';
import { Routes, Route, useNavigate } from 'react-router-dom';

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'LearnIT - Enchance Your Skills';
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5001/api/v1/courses');
        const transformedCourses = response.data.data.courses.map(course => ({
          id: course.Course_ID,
          title: course.Title,
          instructor: course.instructor_name,
          rating: (Math.random() * (5 - 4.2) + 4.2),
          reviews: Math.floor(Math.random() * 200000),
          price: course.Price,
          originalPrice: course.Price > 0 ? course.Price * 1.5 : 99.99,
          imageUrl: `https://placehold.co/300x170/E2E8F0/4A5568?text=${encodeURIComponent(course.Title.substring(0, 15))}`,
          bestseller: Math.random() > 0.5,
          shortDescription: course.Description,
          reviewsList: [
              { id: 1, user: 'Student A', rating: 5, comment: 'Absolutely fantastic course! Covered everything I needed and more.' },
              { id: 2, user: 'Student B', rating: 4, comment: 'Very comprehensive. A bit fast-paced at times, but the content is top-notch.' },
          ]
        }));
        setCourses(transformedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartItems([]);
    navigate('/login');
  };

  const handleAddToCart = (courseToAdd) => {
    setCartItems(prevItems => {
      const isAlreadyInCart = prevItems.some(item => item.id === courseToAdd.id);
      if (isAlreadyInCart) {
        return prevItems;
      }
      return [...prevItems, { ...courseToAdd, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (courseIdToRemove) => {
    setCartItems(prevItems =>
      prevItems.filter(item => item.id !== courseIdToRemove)
    );
  };

  return (
    <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen flex flex-col">
      <Navbar user={user} handleLogout={handleLogout} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage courses={courses} isLoading={isLoading} />} />
          <Route path="/course/:id" element={<CourseDetailPage courses={courses} addToCart={handleAddToCart} cartItems={cartItems} />} />
          <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage handleLogin={handleLogin} />} />
          <Route path="/cart" element={<CartPage cartItems={cartItems} removeFromCart={handleRemoveFromCart} />} />
          <Route path="/teach" element={<TeachPage user={user} setUser={setUser} />} />
          <Route path="/all-courses" element={<AllCoursesPage courses={courses} isLoading={isLoading} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/search" element={<SearchPage courses={courses} />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />
          <Route path="/my-courses" element={<MyCoursesPage user={user} />} />
          <Route path="/my-courses/:courseId/doing" element={<CourseDoingPage />} />
          <Route path="/my-courses/:courseId/notices" element={<CourseNoticeBoardPage />} />
          <Route path="/teacher/courses/create" element={<CreateCoursePage />} />
          <Route path="/teacher/courses/:courseId/edit" element={<EditCoursePage />} />
          <Route path="/teacher/courses/:courseId/notices" element={<ManageNoticesPage />} />
          {/* Add the new route for the marks page */}
          <Route path="/teacher/courses/:courseId/marks" element={<CourseMarksPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
