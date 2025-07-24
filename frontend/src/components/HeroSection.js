import React from 'react';

const HeroSection = () => {
  const handleScroll = () => {
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center text-center text-white"
      style={{ backgroundImage: 'url(/Homepage_logo.png)', backgroundAttachment: 'fixed' }}
      role="img"
      aria-label="A vibrant, abstract background image representing learning and technology."
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 p-4 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-2xl">
          Unlock Your Potential
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-lg">
          Learn from industry experts with our vast library of online courses. Start your journey today.
        </p>
        <button 
          onClick={handleScroll}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
        >
          Explore Courses
        </button>
      </div>
    </div>
  );
};

export default HeroSection;