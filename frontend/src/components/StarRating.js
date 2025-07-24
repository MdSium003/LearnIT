import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, reviews }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      <span className="text-sm font-bold text-orange-500 mr-1">{rating.toFixed(1)}</span>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-current" />
      ))}
      {halfStar && <Star key="half" className="h-4 w-4 text-yellow-400 fill-current" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300 fill-current" />
      ))}
      {reviews > 0 && <span className="text-xs text-gray-500 ml-1">({reviews.toLocaleString()})</span>}
    </div>
  );
};

export default StarRating;