import React from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseListSection from '../components/CourseListSection';

const SearchPage = ({ courses, setCurrentPage }) => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('query') || '';

  const filteredCourses = courses.filter(course =>
    (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.shortDescription || '').toLowerCase().includes(searchTerm.toLowerCase()) || // Corrected property name
    (course.instructor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasResults = filteredCourses.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Search Results for "{searchTerm}"
      </h1>
      <CourseListSection
        courses={filteredCourses}
        setCurrentPage={setCurrentPage}
      />
      {!hasResults && (
        <p className="text-gray-600 text-lg text-center">No courses found matching your search.</p>
      )}
    </div>
  );
};

export default SearchPage;