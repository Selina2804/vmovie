// src/pages/Trending/index.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const API_URL = "https://69538a2aa319a928023bc426.mockapi.io/movies";

const TrendingItemSkeleton = () => (
  <div className="trending-item skeleton-item">
    <div className="trending-rank">
      <div className="skeleton-rank"></div>
    </div>
    <div className="trending-poster">
      <div className="skeleton-poster"></div>
    </div>
    <div className="trending-info">
      <div className="skeleton-title"></div>
      <div className="skeleton-subtitle"></div>
      <div className="skeleton-stats">
        <div className="skeleton-badge"></div>
        <div className="skeleton-badge"></div>
        <div className="skeleton-badge"></div>
      </div>
      <div className="skeleton-genres">
        <div className="skeleton-genre"></div>
        <div className="skeleton-genre"></div>
        <div className="skeleton-genre"></div>
      </div>
    </div>
    <div className="trending-score">
      <div className="skeleton-score-circle"></div>
    </div>
  </div>
);

const Trending = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');

  // ⭐ FETCH TRỰC TIẾP TỪ API để có data mới nhất
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        console.log('📊 Fetched movies:', response.data);
        setMovies(response.data);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching movies:', error);
        setLoading(false);
      }
    };

    fetchMovies();
    
    // ⭐ AUTO REFRESH mỗi 10 giây để cập nhật views real-time
    const interval = setInterval(fetchMovies, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Array.isArray(movies) && movies.length > 0) {
      calculateTrending();
    }
  }, [movies, timeFilter]);

  const calculateTrending = () => {
    if (!Array.isArray(movies)) {
      console.warn("⚠️ movies is not an array:", movies);
      setTrendingMovies([]);
      return;
    }

    const now = new Date();
    let filtered = [...movies];

    // Lọc theo thời gian
    switch (timeFilter) {
      case 'today':
        filtered = movies.filter(m => {
          const releaseDate = new Date(m.releaseDate || now);
          const diffTime = Math.abs(now - releaseDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 1;
        });
        break;
      case 'week':
        filtered = movies.filter(m => {
          const releaseDate = new Date(m.releaseDate || now);
          const diffTime = Math.abs(now - releaseDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        });
        break;
      case 'month':
        filtered = movies.filter(m => {
          const releaseDate = new Date(m.releaseDate || now);
          const diffTime = Math.abs(now - releaseDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        });
        break;
      case 'all':
      default:
        filtered = movies;
        break;
    }

    // ⭐⭐⭐ TÍNH TRENDING SCORE ĐÚNG ⭐⭐⭐
    const scored = filtered.map(movie => {
      // Parse views an toàn - chuyển về số
      const views = parseInt(movie.views) || 0;
      
      // Parse ratings
      const avgRating = movie.ratings?.length 
        ? movie.ratings.reduce((s, r) => s + r, 0) / movie.ratings.length 
        : 0;
      
      // Parse comments
      let commentsCount = 0;
      if (Array.isArray(movie.comments)) {
        commentsCount = movie.comments.length;
      } else if (typeof movie.comments === 'string' && movie.comments) {
        try {
          const parsed = JSON.parse(movie.comments);
          commentsCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch {
          commentsCount = 0;
        }
      }
      
      // ⭐ CÔNG THỨC MỚI - ƯU TIÊN VIEWS
      const trendingScore = (views * 1) + (avgRating * 50) + (commentsCount * 10);
      
      console.log(`🎬 ${movie.title}: views=${views}, rating=${avgRating}, comments=${commentsCount}, score=${trendingScore}`);
      
      return {
        ...movie,
        trendingScore,
        avgRating: avgRating.toFixed(1)
      };
    });

    // Sắp xếp theo điểm GIẢM DẦN
    scored.sort((a, b) => b.trendingScore - a.trendingScore);
    
    console.log('🏆 Top 5 trending:', scored.slice(0, 5).map(m => `${m.title} (${m.trendingScore} điểm)`));
    
    setTrendingMovies(scored.slice(0, 20));
  };

  const getTrendIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Hôm Nay';
      case 'week': return 'Tuần Này';
      case 'month': return 'Tháng Này';
      case 'all': return 'Mọi Thời Đại';
      default: return 'Hôm Nay';
    }
  };

  if (loading) {
    return (
      <div className="trending-page">
        <div className="trending-header-space"></div>
        <div className="trending-hero">
          <div className="trending-hero-content">
            <h1 className="trending-title">
              🔥 TRENDING
              <span className="trending-subtitle">Phim đang Hot nhất</span>
            </h1>
            <div className="time-filter-pills">
              {['today', 'week', 'month', 'all'].map(filter => (
                <button key={filter} className="filter-pill skeleton-loading" disabled>
                  {filter === 'today' && '📅 Hôm Nay'}
                  {filter === 'week' && '📆 Tuần Này'}
                  {filter === 'month' && '🗓️ Tháng Này'}
                  {filter === 'all' && '🌟 Mọi Thời Đại'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="stats-banner">
          {[1, 2, 3].map(i => (
            <div key={i} className="stat-item skeleton-stat">
              <div className="skeleton-stat-icon"></div>
              <div className="stat-info">
                <div className="skeleton-stat-value"></div>
                <div className="skeleton-stat-label"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="trending-container">
          <h2 className="section-title">🏆 Đang tải xu hướng...</h2>
          <div className="trending-list">
            {Array.from({ length: 10 }, (_, i) => (
              <TrendingItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-page">
      <div className="trending-header-space"></div>

      <div className="trending-hero">
        <div className="trending-hero-content">
          <h1 className="trending-title">
            🔥 TRENDING
            <span className="trending-subtitle">Phim đang Hot nhất</span>
          </h1>
          
          <div className="time-filter-pills">
            {['today', 'week', 'month', 'all'].map(filter => (
              <button
                key={filter}
                className={`filter-pill ${timeFilter === filter ? 'active' : ''}`}
                onClick={() => setTimeFilter(filter)}
              >
                {filter === 'today' && '📅 Hôm Nay'}
                {filter === 'week' && '📆 Tuần Này'}
                {filter === 'month' && '🗓️ Tháng Này'}
                {filter === 'all' && '🌟 Mọi Thời Đại'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-banner">
        <div className="stat-item">
          <div className="stat-icon">🎬</div>
          <div className="stat-info">
            <span className="stat-value">{trendingMovies.length}</span>
            <span className="stat-label">Phim Trending</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <span className="stat-value">
              {trendingMovies.reduce((sum, m) => sum + (parseInt(m.views) || 0), 0).toLocaleString()}
            </span>
            <span className="stat-label">Tổng Lượt Xem</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-value">
              {trendingMovies.length > 0 
                ? (trendingMovies.reduce((sum, m) => sum + parseFloat(m.avgRating), 0) / trendingMovies.length).toFixed(1)
                : '0.0'}
            </span>
            <span className="stat-label">Đánh Giá TB</span>
          </div>
        </div>
      </div>

      <div className="trending-container">
        <h2 className="section-title">
          🏆 Top Trending - {getTimeFilterLabel()}
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginLeft: '15px',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </h2>

        {trendingMovies.length === 0 ? (
          <div className="no-trending">
            <span className="no-trending-icon">😢</span>
            <h3>Chưa có phim trending</h3>
            <p>Hãy thử chọn khoảng thời gian khác</p>
          </div>
        ) : (
          <div className="trending-list">
            {trendingMovies.map((movie, index) => (
              <div 
                key={movie.id} 
                className={`trending-item rank-${index + 1}`}
                onClick={() => navigate(`/thong-tin/${movie.id}`)}
              >
                <div className="trending-rank">
                  <span className="rank-badge">{getTrendIcon(index + 1)}</span>
                  {index < 3 && <div className="rank-glow"></div>}
                </div>

                <div className="trending-poster">
                  <img src={movie.image} alt={movie.title} />
                  <div className="trending-poster-overlay">
                    <button className="watch-now-btn">▶ XEM NGAY</button>
                  </div>
                </div>

                <div className="trending-info">
                  <h3 className="trending-movie-title">{movie.title}</h3>
                  <p className="trending-movie-subtitle">{movie.engTitle}</p>
                  
                  <div className="trending-stats">
                    <span className="stat-badge">
                      <span className="stat-icon">⭐</span>
                      {movie.avgRating}
                    </span>
                    <span className="stat-badge">
                      <span className="stat-icon">👁️</span>
                      {(parseInt(movie.views) || 0).toLocaleString()}
                    </span>
                    <span className="stat-badge">
                      <span className="stat-icon">💬</span>
                      {(() => {
                        if (Array.isArray(movie.comments)) {
                          return movie.comments.length;
                        } else if (typeof movie.comments === 'string' && movie.comments) {
                          try {
                            const parsed = JSON.parse(movie.comments);
                            return Array.isArray(parsed) ? parsed.length : 0;
                          } catch {
                            return 0;
                          }
                        }
                        return 0;
                      })()}
                    </span>
                  </div>

                  <div className="trending-genres">
                    {movie.genre && typeof movie.genre === 'string' 
                      ? movie.genre.split(',').slice(0, 3).map((g, i) => (
                          <span key={i} className="genre-badge">{g.trim()}</span>
                        ))
                      : null
                    }
                  </div>
                </div>

                <div className="trending-score">
                  <div className="score-circle">
                    <span className="score-value">
                      {Math.round(movie.trendingScore)}
                    </span>
                    <span className="score-label">ĐIỂM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .skeleton-loading {
          opacity: 0.5;
          pointer-events: none;
        }

        .skeleton-item {
          pointer-events: none;
        }

        .skeleton-item .trending-rank,
        .skeleton-item .trending-poster,
        .skeleton-item .trending-info > *,
        .skeleton-item .trending-score {
          animation: skeletonPulse 1.5s ease-in-out infinite;
        }

        .skeleton-rank,
        .skeleton-poster,
        .skeleton-title,
        .skeleton-subtitle,
        .skeleton-badge,
        .skeleton-genre,
        .skeleton-score-circle {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }

        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skeleton-rank { width: 60px; height: 60px; border-radius: 50%; }
        .skeleton-poster { width: 100%; height: 100%; border-radius: 12px; }
        .skeleton-title { height: 24px; width: 80%; margin-bottom: 8px; }
        .skeleton-subtitle { height: 16px; width: 60%; margin-bottom: 16px; }
        .skeleton-stats { display: flex; gap: 8px; margin-bottom: 12px; }
        .skeleton-badge { height: 28px; width: 60px; border-radius: 6px; }
        .skeleton-genres { display: flex; gap: 6px; }
        .skeleton-genre { height: 24px; width: 70px; border-radius: 6px; }
        .skeleton-score-circle { width: 80px; height: 80px; border-radius: 50%; }
        
        .skeleton-stat { animation: skeletonPulse 1.5s ease-in-out infinite; }
        .skeleton-stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s ease-in-out infinite;
        }
        .skeleton-stat-value {
          height: 32px;
          width: 80px;
          margin-bottom: 8px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
        }
        .skeleton-stat-label {
          height: 16px;
          width: 100px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default Trending;