// src/components/ContinueWatching/ContinueWatchingCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { formatTimeAgo, formatDuration } from '../../utils/dateUtils';

const ContinueWatchingCard = ({ movie, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Xóa phim này khỏi danh sách xem tiếp?')) {
      setIsRemoving(true);
      onRemove(movie.movieId);
    }
  };

  return (
    <Link
      to={`/xem-phim/${movie.movieId}`}
      className={`continue-watching-card ${isRemoving ? 'removing' : ''}`}
    >
      {/* Thumbnail */}
      <div className="cw-card-image">
        <img src={movie.image || movie.poster} alt={movie.title} />
        
        {/* Play Icon Overlay */}
        <div className="cw-play-overlay">
          <div className="cw-play-icon">▶</div>
        </div>

        {/* Progress Indicator */}
        <div className="cw-progress-indicator">
          <span className="cw-percentage">{movie.percentage}%</span>
        </div>

        {/* Remove Button */}
        <button className="cw-remove-btn" onClick={handleRemove} title="Xóa">
          ✕
        </button>
      </div>

      {/* Info */}
      <div className="cw-card-info">
        <h3 className="cw-title">{movie.title}</h3>
        
        {movie.episode && (
          <p className="cw-episode">Tập {movie.episode}</p>
        )}

        {/* Progress Bar */}
        <ProgressBar 
          percentage={movie.percentage} 
          currentTime={movie.currentTime}
          duration={movie.duration}
        />

        <div className="cw-meta">
          <span className="cw-time">
            {formatDuration(movie.currentTime)} / {formatDuration(movie.duration)}
          </span>
          <span className="cw-last-watched">
            {formatTimeAgo(movie.lastWatched)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ContinueWatchingCard;