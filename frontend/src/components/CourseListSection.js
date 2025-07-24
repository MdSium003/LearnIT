import React from 'react';
import { Loader2 } from 'lucide-react';
import CourseCard from './CourseCard';
import { Link } from 'react-router-dom';

const CourseListSection = ({ title, courses, isLoading }) => {
  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin inline-block text-purple-600" />
            <p className="text-gray-600 mt-2">Loading courses...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map(course => (
          <Link key={course.id} to={`/course/${course.id}`} className="text-left block">
            <CourseCard course={course} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CourseListSection;