import React from 'react';
import { formatPrice } from '../utils/formatPrice';
import StarRating from './StarRating';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 w-full h-full flex flex-col group">
      <div className="relative overflow-hidden">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {course.bestseller && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 text-xs font-bold rounded">
            Bestseller
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-bold text-gray-800 mb-1 h-12 overflow-hidden leading-tight">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{course.instructor}</p>
        
        <div className="mt-auto pt-2">
          <StarRating rating={course.rating} reviews={course.reviews} />
          <div className="flex items-baseline mt-2">
            <p className="text-xl font-bold text-gray-900 mr-2">{formatPrice(course.price)}</p>
            {course.originalPrice && <p className="text-sm text-gray-500 line-through">{formatPrice(course.originalPrice)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;