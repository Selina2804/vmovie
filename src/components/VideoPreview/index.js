// src/components/VideoPreview/index.js
// 🎬 Netflix-style Preview: Show Info First → Then Play Trailer

import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const VideoPreview = ({ movie, isHovering }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const timerRef = useRef(null);
  const videoTimerRef = useRef(null);
  const soundTimerRef = useRef(null);

  // ⭐ Helper: Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url, muted = true) => {
    if (!url) return null;

    const muteParam = muted ? 1 : 0;
    
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&mute=${muteParam}&controls=0&loop=1&playlist=${shortMatch[1]}&modestbranding=1&rel=0`;
    }

    // youtube.com/watch?v=VIDEO_ID
    const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (longMatch) {
      return `https://www.youtube.com/embed/${longMatch[1]}?autoplay=1&mute=${muteParam}&controls=0&loop=1&playlist=${longMatch[1]}&modestbranding=1&rel=0`;
    }

    // youtube.com/embed/VIDEO_ID
    if (url.includes('youtube.com/embed/')) {
      return url.includes('?') ? `${url}&autoplay=1&mute=${muteParam}` : `${url}?autoplay=1&mute=${muteParam}&controls=0&loop=1`;
    }

    return null;
  };

  // ⭐ Check if URL is YouTube
  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  useEffect(() => {
    if (isHovering) {
      // ⭐ BƯỚC 1: Hiện preview ngay lập tức (0ms)
      setShowPreview(true);
      
      // ⭐ BƯỚC 2: Nếu có trailer, đợi 2 giây mới play video
      if (movie.trailerUrl) {
        videoTimerRef.current = setTimeout(() => {
          setShowVideo(true);
          
          // ⭐ BƯỚC 3: Unmute sau thêm 2s nữa (tổng 4s từ lúc hover)
          soundTimerRef.current = setTimeout(() => {
            setIsMuted(false);
            
            // Unmute video nếu là direct video
            if (videoRef.current && !isYouTubeUrl(movie.trailerUrl)) {
              videoRef.current.muted = false;
              videoRef.current.volume = 0.5;
            }
            
            // Unmute YouTube
            if (isYouTubeUrl(movie.trailerUrl) && iframeRef.current) {
              const newSrc = getYouTubeEmbedUrl(movie.trailerUrl, false);
              iframeRef.current.src = newSrc;
            }
          }, 2000);
        }, 2000); // ⭐ 2 giây đợi trước khi play trailer
      }
    } else {
      // Reset tất cả khi unhover
      setShowPreview(false);
      setShowVideo(false);
      setVideoError(false);
      setIsMuted(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
      if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
    };
  }, [isHovering, movie.trailerUrl]);

  // Auto play video
  useEffect(() => {
    if (showVideo && videoRef.current && !videoError && !isYouTubeUrl(movie.trailerUrl)) {
      videoRef.current.play().catch((err) => {
        console.error("Video play error:", err);
        setVideoError(true);
      });
    } else if (videoRef.current && !isYouTubeUrl(movie.trailerUrl)) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [showVideo, videoError, movie.trailerUrl]);

  if (!showPreview) return null;

  const youtubeEmbedUrl = isYouTubeUrl(movie.trailerUrl) ? getYouTubeEmbedUrl(movie.trailerUrl, isMuted) : null;

  return (
    <div className={`video-preview-overlay ${showPreview ? 'active' : ''}`}>
      <div className="preview-content">
        {/* ⭐ Background: Poster hoặc Video */}
        <div className="preview-media-wrapper">
          {/* Poster luôn hiển thị làm background */}
          <img 
            src={movie.image} 
            alt={movie.title}
            className={`preview-poster ${showVideo ? 'fade-out' : ''}`}
          />
          
          {/* Video chỉ hiện sau 2s */}
          {movie.trailerUrl && showVideo && !videoError && (
            <div className="preview-video-container">
              {youtubeEmbedUrl ? (
                <iframe
                  ref={iframeRef}
                  className="preview-video"
                  src={youtubeEmbedUrl}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  frameBorder="0"
                  title="YouTube Trailer"
                />
              ) : (
                <video
                  ref={videoRef}
                  className="preview-video"
                  src={movie.trailerUrl}
                  muted={isMuted}
                  loop
                  playsInline
                  preload="metadata"
                  onError={() => setVideoError(true)}
                />
              )}
              
              {/* Sound indicator */}
              {!isMuted && (
                <div className="sound-indicator">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ⭐ Info Overlay - Luôn hiển thị */}
        <div className="preview-info-overlay">
          <div className="preview-gradient-top"></div>
          <div className="preview-gradient-bottom"></div>
          
          <div className="preview-info">
            <div className="preview-header">
              <h4 className="preview-title">{movie.title}</h4>
              {movie.year && (
                <div className="preview-year-badge">{movie.year}</div>
              )}
            </div>
            
            {movie.engTitle && (
              <p className="preview-eng-title">{movie.engTitle}</p>
            )}
            
            <div className="preview-meta-row">
              <div className="preview-rating">
                <span className="star">★</span> 8.5
              </div>
              {movie.duration && (
                <span className="preview-duration">{movie.duration}</span>
              )}
              {movie.country && (
                <span className="preview-country">{movie.country}</span>
              )}
            </div>

            {movie.genre && (
              <div className="preview-genres">
                {movie.genre.split(',').slice(0, 3).map((genre, i) => (
                  <span key={i} className="preview-genre-tag">
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="preview-actions">
              <button className="preview-btn preview-btn-play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Xem ngay
              </button>
              <button className="preview-btn preview-btn-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;