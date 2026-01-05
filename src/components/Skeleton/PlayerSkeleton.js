// src/components/Skeleton/PlayerSkeleton.js
import React from 'react';
import './style.css';

const PlayerSkeleton = () => {
  return (
    <div className="watch-movie-page">
      <div className="header-space"></div>
      
      {/* Video Player Skeleton */}
      <div className="skeleton-video-player">
        <div className="skeleton-play-icon">▶</div>
      </div>

      {/* Server Buttons Skeleton */}
      <div className="server-buttons">
        {[1, 2, 3].map(num => (
          <div key={num} className="skeleton-server-btn"></div>
        ))}
      </div>

      {/* Episode Section Skeleton */}
      <div className="episode-section">
        <div className="skeleton-section-title"></div>
        <div className="episode-list">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <div key={num} className="skeleton-episode-btn"></div>
          ))}
        </div>
      </div>

      {/* Movie Info Skeleton */}
      <div className="watch-info">
        <div className="skeleton-title-large"></div>
        <div className="skeleton-subtitle"></div>
        
        <div className="skeleton-details">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="skeleton-detail-item"></div>
          ))}
        </div>

        <div className="skeleton-description">
          <div className="skeleton-text-line"></div>
          <div className="skeleton-text-line"></div>
          <div className="skeleton-text-line skeleton-text-line-short"></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSkeleton;