// src/pages/Watch/index.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/useAuth";
import { useWatchProgress } from "../../hooks/useWatchProgress";
import { incrementMovieViews } from "../../store/apiService";
import ReportModal from "../../components/ReportModal";
import axios from "axios";
import "./style.css";

const API_URL = "https://69538a2aa319a928023bc426.mockapi.io/movies";

const WatchMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { currentProgress, autoSaveProgress, saveProgress } = useWatchProgress(id);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentServer, setCurrentServer] = useState("1");
  
  const [currentPart, setCurrentPart] = useState(1);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const videoPlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const hasIncrementedViews = useRef(false);

  const getLastWatchedInfo = (movieId) => {
    if (!user) return { part: 1, season: 1, episode: 1 };
    
    const key = `watchProgress_${user.id}_${movieId}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return {
          part: data.part || 1,
          season: data.season || 1,
          episode: data.episode || 1
        };
      } catch {
        return { part: 1, season: 1, episode: 1 };
      }
    }
    return { part: 1, season: 1, episode: 1 };
  };

  const saveWatchedInfo = (movieId, info) => {
    if (!user) return;
    
    const key = `watchProgress_${user.id}_${movieId}`;
    const data = {
      part: info.part || 1,
      season: info.season || 1,
      episode: info.episode || 1,
      timestamp: new Date().toISOString(),
      movieId: movieId,
    };
    
    localStorage.setItem(key, JSON.stringify(data));
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/${id}`)
      .then((response) => {
        const movieData = response.data;
        setMovie(movieData);
        setLoading(false);

        const params = new URLSearchParams(location.search);
        const partFromUrl = params.get('part');
        const seasonFromUrl = params.get('season');
        const episodeFromUrl = params.get('episode');
        
        if (partFromUrl) {
          setCurrentPart(parseInt(partFromUrl));
        } else if (seasonFromUrl || episodeFromUrl) {
          setCurrentSeason(seasonFromUrl ? parseInt(seasonFromUrl) : 1);
          setCurrentEpisode(episodeFromUrl ? parseInt(episodeFromUrl) : 1);
        } else if (user) {
          const lastInfo = getLastWatchedInfo(movieData.id);
          setCurrentPart(lastInfo.part);
          setCurrentSeason(lastInfo.season);
          setCurrentEpisode(lastInfo.episode);
        }

        if (user && movieData) {
          saveToHistory(movieData);
        }

        // ⭐⭐⭐ TĂNG VIEWS MỖI LẦN XEM ⭐⭐⭐
        if (!hasIncrementedViews.current) {
          incrementMovieViews(movieData.id)
            .then((updatedMovie) => {
              console.log('✅ Đã tăng views:', updatedMovie.views);
              setMovie(updatedMovie);
              hasIncrementedViews.current = true;
            })
            .catch((err) => {
              console.error('❌ Không thể tăng views:', err);
            });
        }
      })
      .catch((err) => {
        console.error("Error loading movie:", err);
        setError("Không thể tải phim. Vui lòng thử lại!");
        setLoading(false);
      });
  }, [id, user, location]);

  useEffect(() => {
    if (movie && user) {
      saveWatchedInfo(movie.id, {
        part: currentPart,
        season: currentSeason,
        episode: currentEpisode
      });
    }
  }, [currentPart, currentSeason, currentEpisode, movie, user]);

  useEffect(() => {
    if (currentProgress && videoPlayerRef.current) {
      setTimeout(() => {
        console.log(`📺 Tiếp tục xem từ ${currentProgress.currentTime}s (${currentProgress.percentage}%)`);
      }, 1000);
    }
  }, [currentProgress]);

  useEffect(() => {
    if (!user || !movie) return;

    let simulatedTime = currentProgress?.currentTime || 0;
    const duration = parseDuration(movie.duration);

    progressIntervalRef.current = setInterval(() => {
      simulatedTime += 10;

      if (simulatedTime <= duration) {
        autoSaveProgress({
          movieId: movie.id,
          title: movie.title,
          engTitle: movie.engTitle,
          image: movie.image,
          currentTime: simulatedTime,
          duration: duration,
          part: currentPart,
          season: currentSeason,
          episode: currentEpisode,
          genre: movie.genre,
          country: movie.country,
          year: movie.year,
        });
      }
    }, 10000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [user, movie, currentPart, currentSeason, currentEpisode, currentProgress, autoSaveProgress]);

  const parseDuration = (durationStr) => {
    if (!durationStr) return 3600;
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[0]) * 60 : 3600;
  };

  const saveToHistory = (movieData) => {
    if (!user) return;

    const historyKey = `history_${user.id}`;
    const savedHistory = localStorage.getItem(historyKey);
    let history = savedHistory ? JSON.parse(savedHistory) : [];

    const existingIndex = history.findIndex((item) => item.id === movieData.id);

    const historyItem = {
      id: movieData.id,
      title: movieData.title,
      engTitle: movieData.engTitle,
      image: movieData.image,
      genre: movieData.genre,
      country: movieData.country,
      year: movieData.year,
      duration: movieData.duration,
      watchedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      history[existingIndex] = historyItem;
    } else {
      history.unshift(historyItem);
    }

    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    localStorage.setItem(historyKey, JSON.stringify(history));
  };

  if (loading) {
    return (
      <div className="watch-movie-page" style={{ padding: "100px", textAlign: "center", color: "white" }}>
        <h2>⏳ Đang tải phim...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch-movie-page" style={{ padding: "100px", textAlign: "center", color: "white" }}>
        <h2>❌ {error}</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          ⏪ Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="watch-movie-page" style={{ padding: "100px", textAlign: "center", color: "white" }}>
        <h2>❌ Không tìm thấy phim.</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          ⏪ Quay lại trang chủ
        </button>
      </div>
    );
  }

  const getEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("watch?v=")
        ? url.split("watch?v=")[1]?.split("&")[0]
        : url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("dailymotion.com")) {
      const videoId = url.split("/video/")[1]?.split("?")[0];
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    if (url.includes("rophim.li") || url.includes("phim")) {
      return url;
    }

    return url;
  };

  const getCurrentVideoUrl = () => {
    if (movie.movieType === "single" && movie.hasParts && movie.parts && movie.parts.length > 0) {
      const part = movie.parts.find(p => p.partNumber === currentPart);
      return part?.videoUrl || null;
    }
    
    if (movie.movieType === "series" && movie.seasons && movie.seasons.length > 0) {
      const season = movie.seasons.find(s => s.seasonNumber === currentSeason);
      if (season && season.episodes && season.episodes.length > 0) {
        const episode = season.episodes.find(ep => ep.episodeNumber === currentEpisode);
        return episode?.videoUrl || null;
      }
      return null;
    }
    
    return movie.videoUrl || null;
  };

  const currentVideoUrl = getCurrentVideoUrl();

  const servers = {
    1: getEmbedUrl(currentVideoUrl),
    2: movie.backupUrls ? getEmbedUrl(movie.backupUrls[0]) : null,
    3: movie.backupUrls ? getEmbedUrl(movie.backupUrls[1]) : null,
  };

  const isSeriesWithSeasons = movie.movieType === "series" && movie.seasons && movie.seasons.length > 0;
  const isSingleWithParts = movie.movieType === "single" && movie.hasParts && movie.parts && movie.parts.length > 0;
  const isSingleNormal = movie.movieType === "single" && !movie.hasParts;

  return (
    <div className="watch-movie-page">
      <div className="header-space"></div>

      {isSingleWithParts && (
        <div className="current-episode-badge">
          🎞️ Đang xem: Phần {currentPart}/{movie.totalParts}
        </div>
      )}

      {isSeriesWithSeasons && (
        <div className="current-episode-badge">
          📺 Đang xem: Season {currentSeason} - Tập {currentEpisode}
        </div>
      )}

      {currentProgress && (
        <div className="continue-watching-badge">
          📺 Tiếp tục từ {currentProgress.percentage}% ({Math.floor(currentProgress.currentTime / 60)} phút)
        </div>
      )}

      {servers[currentServer] ? (
        <iframe
          ref={videoPlayerRef}
          className="main-video"
          src={servers[currentServer]}
          title={`${movie.title} - Server ${currentServer}`}
          allowFullScreen
          frameBorder="0"
          scrolling="no"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      ) : (
        <div className="main-video" style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "#000",
          color: "#fff"
        }}>
          <h3>⚠️ Video chưa có sẵn</h3>
        </div>
      )}

      <div className="server-buttons">
        {Object.keys(servers).map((num) => (
          <button
            key={num}
            className={`server-btn ${currentServer === num ? "active" : ""} ${!servers[num] ? "disabled" : ""}`}
            onClick={() => servers[num] && setCurrentServer(num)}
            disabled={!servers[num]}
          >
            Server #{num}
          </button>
        ))}

        <button 
          className="report-btn"
          onClick={() => setIsReportModalOpen(true)}
          title="Báo lỗi phim"
        >
          🚨 Báo lỗi
        </button>
      </div>

      <div className="movie-rating">
        ⭐⭐⭐⭐☆ <span>(8.9 điểm / {movie.views || 0} lượt xem)</span>
      </div>

      {isSingleWithParts && (
        <div className="episode-section">
          <h3>
            CÁC PHẦN PHIM <span className="vietsub-tag">VIETSUB</span>
          </h3>
          <div className="episode-list">
            {movie.parts.map((part) => {
              const hasVideo = part.videoUrl?.trim();
              
              return (
                <button
                  key={part.partNumber}
                  className={`episode-btn ${part.partNumber === currentPart ? "active" : ""} ${!hasVideo ? "no-video" : ""}`}
                  onClick={() => hasVideo && setCurrentPart(part.partNumber)}
                  disabled={!hasVideo}
                  title={hasVideo ? `Xem phần ${part.partNumber}${part.partTitle ? `: ${part.partTitle}` : ''}` : `Phần ${part.partNumber} chưa có link`}
                >
                  Phần {part.partNumber}
                  {!hasVideo && <span className="lock-icon">🔒</span>}
                  {part.partTitle && (
                    <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
                      {part.partTitle.length > 20 ? part.partTitle.slice(0, 20) + '...' : part.partTitle}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isSeriesWithSeasons && (
        <div className="episode-section">
          <h3>
            CHỌN SEASON <span className="vietsub-tag">VIETSUB</span>
          </h3>
          
          <div className="season-tabs">
            {movie.seasons.map((season) => {
              const episodesWithLinks = season.episodes?.filter(ep => ep.videoUrl?.trim()).length || 0;
              const totalEps = season.totalEpisodes || 0;
              
              return (
                <button
                  key={season.seasonNumber}
                  className={`season-tab ${season.seasonNumber === currentSeason ? "active" : ""}`}
                  onClick={() => {
                    setCurrentSeason(season.seasonNumber);
                    setCurrentEpisode(1);
                  }}
                >
                  Season {season.seasonNumber}
                  <span className="season-progress">({episodesWithLinks}/{totalEps})</span>
                </button>
              );
            })}
          </div>

          <h3 style={{ marginTop: '20px', fontSize: '16px' }}>
            TẬP PHIM - SEASON {currentSeason}
          </h3>
          <div className="episode-list">
            {movie.seasons
              .find(s => s.seasonNumber === currentSeason)
              ?.episodes?.map((episode) => {
                const hasVideo = episode.videoUrl?.trim();
                
                return (
                  <button
                    key={episode.episodeNumber}
                    className={`episode-btn ${episode.episodeNumber === currentEpisode ? "active" : ""} ${!hasVideo ? "no-video" : ""}`}
                    onClick={() => hasVideo && setCurrentEpisode(episode.episodeNumber)}
                    disabled={!hasVideo}
                    title={hasVideo ? `Xem tập ${episode.episodeNumber}` : `Tập ${episode.episodeNumber} chưa có link`}
                  >
                    Tập {episode.episodeNumber}
                    {!hasVideo && <span className="lock-icon">🔒</span>}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      <div className="watch-info">
        <h2>
          {movie.title}
          {isSingleWithParts && (
            <span style={{ 
              marginLeft: '10px', 
              fontSize: '14px', 
              color: '#fbbf24', 
              fontWeight: 'normal' 
            }}>
              🎞️ ({movie.totalParts} phần)
            </span>
          )}
          {isSeriesWithSeasons && (
            <span style={{ 
              marginLeft: '10px', 
              fontSize: '14px', 
              color: '#4ade80', 
              fontWeight: 'normal' 
            }}>
              📺 ({movie.totalSeasons} season)
            </span>
          )}
        </h2>
        <p className="eng-title">{movie.engTitle}</p>

        <ul className="movie-details">
          <li>
            <strong>Loại:</strong>{" "}
            {isSeriesWithSeasons 
              ? `Phim bộ (${movie.totalSeasons} season)` 
              : isSingleWithParts 
                ? `Phim lẻ (${movie.totalParts} phần)` 
                : "Phim lẻ"}
          </li>
          <li>
            <strong>Thể loại:</strong> {movie.genre}
          </li>
          <li>
            <strong>Quốc gia:</strong> {movie.country}
          </li>
          <li>
            <strong>Thời lượng:</strong> {movie.duration}
          </li>
          <li>
            <strong>Năm:</strong> {movie.year}
          </li>
          <li>
            <strong>Lượt xem:</strong> {movie.views || 0}
          </li>
        </ul>

        <p className="movie-description">{movie.description || "Chưa có mô tả"}</p>

        <div className="keyword-tags">
          {movie.title && <span>#{movie.title.replace(/\s+/g, "")}</span>}
          {movie.engTitle && <span>#{movie.engTitle.replace(/\s+/g, "")}</span>}
        </div>

        <div className="watch-buttons">
          <button
            className="detail-btn"
            onClick={() => navigate(`/thong-tin/${movie.id}`)}
          >
            🎞️ Chi tiết phim
          </button>
          <button className="back-btn" onClick={() => navigate("/danh-sach")}>
            ⏪ Danh sách khác
          </button>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        movieData={movie}
      />

      <style>{`
        .current-episode-badge {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          z-index: 1000;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          animation: slideDown 0.4s ease;
        }

        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .season-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .season-tab {
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .season-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .season-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: #fff;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .season-progress {
          font-size: 11px;
          opacity: 0.8;
        }

        .episode-btn.no-video {
          opacity: 0.4;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .episode-btn .lock-icon {
          margin-left: 4px;
          font-size: 10px;
        }

        .episode-btn:disabled {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default WatchMovie;