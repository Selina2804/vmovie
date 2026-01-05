// src/components/Skeleton/MovieCardSkeleton.js
import React from 'react';
import './style.css';

const MovieCardSkeleton = () => {
  return (
    <div className="movie-card skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-info">
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
      </div>
    </div>
  );
};

/**
 * Component hiển thị nhiều skeleton cards
 */
export const MovieCardSkeletonList = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </>
  );
};

export default MovieCardSkeleton;