// src/components/Skeleton/DetailSkeleton.js
import React from 'react';
import './style.css';

const DetailSkeleton = () => {
  return (
    <div className="movie-detail-page">
      <div className="movie-detail-header-space"></div>
      
      <div className="detail-skeleton-wrapper">
        <div className="movie-detail">
          {/* Poster Skeleton */}
          <div className="movie-detail-poster">
            <div className="skeleton-poster"></div>
            <div className="skeleton-buttons">
              <div className="skeleton-button skeleton-button-large"></div>
              <div className="skeleton-button skeleton-button-small"></div>
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="movie-detail-info">
            <div className="skeleton-title-large"></div>
            <div className="skeleton-subtitle"></div>
            
            <div className="skeleton-meta">
              <div className="skeleton-meta-item"></div>
              <div className="skeleton-meta-item"></div>
              <div className="skeleton-meta-item"></div>
              <div className="skeleton-meta-item"></div>
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="movie-detail-description">
          <div className="skeleton-section-title"></div>
          <div className="skeleton-text-line"></div>
          <div className="skeleton-text-line"></div>
          <div className="skeleton-text-line"></div>
          <div className="skeleton-text-line skeleton-text-line-short"></div>
        </div>
      </div>
    </div>
  );
};

export default DetailSkeleton;