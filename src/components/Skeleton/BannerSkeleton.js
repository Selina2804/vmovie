// src/components/Skeleton/BannerSkeleton.js
import React from 'react';
import './style.css';

const BannerSkeleton = () => {
  return (
    <div className="banner-skeleton">
      <div className="skeleton-banner-bg"></div>
      <div className="skeleton-banner-content">
        <div className="skeleton-banner-title"></div>
        <div className="skeleton-banner-text"></div>
        <div className="skeleton-banner-text skeleton-banner-text-short"></div>
        <div className="skeleton-banner-buttons">
          <div className="skeleton-button skeleton-button-large"></div>
          <div className="skeleton-button skeleton-button-large"></div>
        </div>
      </div>
    </div>
  );
};

export default BannerSkeleton;