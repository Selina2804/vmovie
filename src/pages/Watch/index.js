// src/pages/Watch/index.js - TỰ ĐỘNG ẨN/HIỆN TẬP PHIM + FIX LẤY LINK TỪ EPISODES
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/useAuth";
import { useWatchProgress } from "../../hooks/useWatchProgress";
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
  const [currentEpisode, setCurrentEpisode] = useState(1);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const videoPlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // ⭐ LẤY THÔNG TIN TẬP ĐÃ XEM TỪ localStorage
  const getLastWatchedEpisode = (movieId) => {
    if (!user) return 1;
    
    const key = `watchProgress_${user.id}_${movieId}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.episode || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  };

  // ⭐ LƯU THÔNG TIN TẬP ĐANG XEM
  const saveWatchedEpisode = (movieId, episode) => {
    if (!user) return;
    
    const key = `watchProgress_${user.id}_${movieId}`;
    const data = {
      episode: episode,
      timestamp: new Date().toISOString(),
      movieId: movieId,
    };
    
    localStorage.setItem(key, JSON.stringify(data));
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/${id}`)
      .then((response) => {
        setMovie(response.data);
        setLoading(false);

        // ⭐ TỰ ĐỘNG SET TẬP PHIM KHI VÀO
        const episodeFromUrl = new URLSearchParams(location.search).get('episode');
        
        if (episodeFromUrl) {
          // Nếu có episode trong URL thì dùng nó
          setCurrentEpisode(parseInt(episodeFromUrl));
        } else if (user) {
          // Nếu không có trong URL thì lấy từ localStorage
          const lastEpisode = getLastWatchedEpisode(response.data.id);
          setCurrentEpisode(lastEpisode);
        }

        // LƯU LỊCH SỬ XEM
        if (user && response.data) {
          saveToHistory(response.data);
        }
      })
      .catch((err) => {
        console.error("Error loading movie:", err);
        setError("Không thể tải phim. Vui lòng thử lại!");
        setLoading(false);
      });
  }, [id, user, location]);

  // ⭐ LƯU TẬP ĐANG XEM KHI CHUYỂN TẬP
  useEffect(() => {
    if (movie && user) {
      saveWatchedEpisode(movie.id, currentEpisode);
    }
  }, [currentEpisode, movie, user]);

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
  }, [user, movie, currentEpisode, currentProgress, autoSaveProgress]);

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

  const isSeries = movie.movieType === "series";
  const totalEpisodes = movie.totalEpisodes || 1;

  // ⭐⭐⭐ FIX CHÍNH - LẤY LINK VIDEO ĐÚNG THEO LOẠI PHIM ⭐⭐⭐
  const getCurrentVideoUrl = () => {
    if (isSeries && movie.episodes && movie.episodes.length > 0) {
      // Phim bộ → lấy link từ episodes array
      const episode = movie.episodes.find(ep => ep.episodeNumber === currentEpisode);
      return episode?.videoUrl || null;
    } else {
      // Phim lẻ → lấy link từ videoUrl
      return movie.videoUrl || null;
    }
  };

  const currentVideoUrl = getCurrentVideoUrl();

  const servers = {
    1: getEmbedUrl(currentVideoUrl),
    2: movie.backupUrls ? getEmbedUrl(movie.backupUrls[0]) : null,
    3: movie.backupUrls ? getEmbedUrl(movie.backupUrls[1]) : null,
  };

  return (
    <div className="watch-movie-page">
      <div className="header-space"></div>

      {/* ⭐ HIỂN THỊ TẬP ĐANG XEM */}
      {isSeries && (
        <div className="current-episode-badge">
          📺 Đang xem: Tập {currentEpisode}/{totalEpisodes}
        </div>
      )}

      {currentProgress && (
        <div className="continue-watching-badge">
          📺 Tiếp tục từ {currentProgress.percentage}% ({Math.floor(currentProgress.currentTime / 60)} phút)
        </div>
      )}

      {/* Video Player */}
      {servers[currentServer] ? (
        <iframe
          ref={videoPlayerRef}
          className="main-video"
          src={servers[currentServer]}
          title={`${movie.title} - Server ${currentServer} - Tập ${currentEpisode}`}
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
          <h3>⚠️ {isSeries ? `Tập ${currentEpisode} chưa có link video` : "Video chưa có sẵn cho server này"}</h3>
        </div>
      )}

      {/* Server selection buttons */}
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

      {/* Rating */}
      <div className="movie-rating">
        ⭐⭐⭐⭐☆ <span>(8.9 điểm / 350 lượt xem)</span>
      </div>

      {/* ⭐ CHỈ HIỂN THỊ TẬP PHIM NẾU LÀ PHIM BỘ */}
      {isSeries && totalEpisodes > 1 && (
        <div className="episode-section">
          <h3>
            TẬP PHIM <span className="vietsub-tag">VIETSUB</span>
          </h3>
          <div className="episode-list">
            {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => {
              // ⭐ Kiểm tra tập có link chưa
              const hasVideo = movie.episodes?.find(e => e.episodeNumber === ep)?.videoUrl;
              
              return (
                <button
                  key={ep}
                  className={`episode-btn ${ep === currentEpisode ? "active" : ""} ${!hasVideo ? "no-video" : ""}`}
                  onClick={() => hasVideo && setCurrentEpisode(ep)}
                  disabled={!hasVideo}
                  title={hasVideo ? `Xem tập ${ep}` : `Tập ${ep} chưa có link`}
                >
                  {ep}
                  {!hasVideo && <span className="lock-icon">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Movie info */}
      <div className="watch-info">
        <h2>
          {movie.title}
          {isSeries && (
            <span style={{ 
              marginLeft: '10px', 
              fontSize: '14px', 
              color: '#4ade80', 
              fontWeight: 'normal' 
            }}>
              📺 ({totalEpisodes} tập)
            </span>
          )}
        </h2>
        <p className="eng-title">{movie.engTitle}</p>

        <ul className="movie-details">
          <li>
            <strong>Loại:</strong> {isSeries ? "Phim bộ" : "Phim lẻ"}
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
        </ul>

        <p className="movie-description">{movie.description || "Chưa có mô tả"}</p>

        <div className="keyword-tags">
          <span>#{movie.title.replace(/\s+/g, "")}</span>
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