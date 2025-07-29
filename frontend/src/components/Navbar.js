import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Search, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-gray-300 hover:text-white font-medium transition-colors duration-300 relative group text-sm"
  >
    {children}
    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
  </Link>
);

const DropdownLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
    >
      {children}
    </Link>
);


const Navbar = ({ user, handleLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // State for the new logo animation
  const [animatedWord, setAnimatedWord] = useState('LearnIT');
  const [animationClass, setAnimationClass] = useState('slide-in-up');
    const words = ['LearnIT', 'ENHANCE', 'EXCELLENCE' ,'SKILLS', 'WORK','KNOWLEDGE', 'TALENT', 'GROWTH',  'SUCCESS'];
  const wordIndexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationClass('slide-out-up'); // Animate out

      setTimeout(() => {
        wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
        setAnimatedWord(words[wordIndexRef.current]);
        setAnimationClass('slide-in-up'); // Animate in
      }, 1000); // This duration should match the CSS animation duration
    }, 50000); // This is the time each word is displayed on screen

    return () => clearInterval(interval);
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Keyframes for animations */}
      <style>
        {`
          @keyframes dance1 { 0%, 100% { height: 0.75rem; } 50% { height: 1.5rem; } }
          @keyframes dance2 { 0%, 100% { height: 1.5rem; } 50% { height: 0.75rem; } }
          @keyframes dance3 { 0%, 100% { height: 1rem; } 50% { height: 1.3rem; } }
          
          .logo-text-container {
            width: 180px; 
            height: 30px;
            position: relative;
            overflow: hidden;
          }

          .animated-word {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start; /* Changed from center to flex-start */
            font-size: 1.5rem;
            font-weight: bold;
            letter-spacing: 0.05em;
            white-space: nowrap;
            color: white;
          }
          
          .slide-out-up { animation: slide-out-up 1s ease-in-out forwards; }
          .slide-in-up { animation: slide-in-up 1s ease-in-out forwards; }

          @keyframes slide-out-up {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-100%); opacity: 0; }
          }
          @keyframes slide-in-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      <header className="bg-gray-900/80 backdrop-blur-lg shadow-2xl shadow-purple-900/10 sticky top-0 z-50 border-b border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 flex items-end justify-center gap-1 p-2 bg-gray-900/80 rounded-lg border border-purple-500/30 group-hover:border-purple-400 transition-all duration-300">
                  <span className="w-1.5 bg-purple-400 rounded-full" style={{ animation: 'dance1 2s ease-in-out infinite' }}></span>
                  <span className="w-1.5 bg-purple-300 rounded-full" style={{ animation: 'dance2 2s ease-in-out infinite 0.2s' }}></span>
                  <span className="w-1.5 bg-purple-400 rounded-full" style={{ animation: 'dance3 2s ease-in-out infinite 0.4s' }}></span>
              </div>
              <div className="logo-text-container group-hover:text-purple-300 transition-colors duration-300">
                <span className={`animated-word ${animationClass}`}>
                  {animatedWord}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <NavLink to="/all-courses">Courses</NavLink>
                {user?.isAuthor ? (
                  <NavLink to="/teacher-dashboard">Teacher Dashboard</NavLink>
                ) : (
                  <NavLink to="/teach">Teach on LearnIT</NavLink>
                )}
              </nav>
              
              <div className="h-6 w-px bg-purple-500/30"></div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search for anything..."
                  className="w-64 py-2 px-4 pr-10 bg-white/5 border border-purple-500/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:w-72 transition-all duration-300 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* User Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 bg-white/5 border border-purple-500/30 text-white pl-2 pr-3 py-1.5 rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium text-sm">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-2xl py-2 z-20 border border-gray-200/80 animate-fade-in-down">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                      </div>
                      <div className="py-1">
                          <DropdownLink to="/profile" onClick={() => setIsDropdownOpen(false)}>
                              <User size={16} className="mr-3 text-gray-500"/> My Profile
                          </DropdownLink>
                          <DropdownLink to="/my-courses" onClick={() => setIsDropdownOpen(false)}>
                              <BookOpen size={16} className="mr-3 text-gray-500"/> My Courses
                          </DropdownLink>
                      </div>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut size={16} className="mr-3" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login" 
                    className="text-gray-300 hover:text-white font-medium transition-colors duration-200 text-sm"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2 rounded-full transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border-t border-purple-500/20 animate-fade-in-down">
            <div className="container mx-auto px-4 py-6 space-y-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full py-3 px-4 pr-12 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white">
                  <Search className="h-5 w-5" />
                </button>
              </form>

              <nav className="flex flex-col space-y-2">
                <Link to="/all-courses" className="text-gray-300 hover:bg-white/5 hover:text-white block py-3 px-3 rounded-md transition-colors duration-200" onClick={closeMobileMenu}>Courses</Link>
                {user?.isAuthor ? (
                  <Link to="/teacher-dashboard" className="text-gray-300 hover:bg-white/5 hover:text-white block py-3 px-3 rounded-md transition-colors duration-200" onClick={closeMobileMenu}>Teacher Dashboard</Link>
                ) : (
                  <Link to="/teach" className="text-gray-300 hover:bg-white/5 hover:text-white block py-3 px-3 rounded-md transition-colors duration-200" onClick={closeMobileMenu}>Teach on LearnIT</Link>
                )}
                {user && <Link to="/my-courses" className="text-gray-300 hover:bg-white/5 hover:text-white block py-3 px-3 rounded-md transition-colors duration-200" onClick={closeMobileMenu}>My Courses</Link>}
                {user && <Link to="/profile" className="text-gray-300 hover:bg-white/5 hover:text-white block py-3 px-3 rounded-md transition-colors duration-200" onClick={closeMobileMenu}>My Profile</Link>}
              </nav>

              <div className="border-t border-purple-500/20 pt-6">
                {!user ? (
                  <div className="flex space-x-3">
                    <Link to="/login" className="flex-1 text-center py-3 px-4 border border-purple-500/50 text-white rounded-full hover:bg-white/5 transition-colors" onClick={closeMobileMenu}>Log In</Link>
                    <Link to="/signup" className="flex-1 text-center py-3 px-4 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors" onClick={closeMobileMenu}>Sign Up</Link>
                  </div>
                ) : (
                   <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="w-full text-center py-3 px-4 bg-red-600/80 text-white rounded-full hover:bg-red-600 transition-colors">
                      Logout
                   </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
