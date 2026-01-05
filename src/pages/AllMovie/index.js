// src/pages/AllMovie/index.js
import React, { useState, useEffect, useRef } from "react";
import "./style.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFavorites } from "../../store/useFavorites";
import MovieCardSkeleton from "../../components/Skeleton/MovieCardSkeleton";
import VideoPreview from "../../components/VideoPreview";

const AllMovies = () => {
  const [allMovies, setAllMovies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState("spring");
  const [retryCount, setRetryCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite, isLoading } = useFavorites();

  const params = new URLSearchParams(location.search);
  const genreParam = params.get("theloai");
  const countryParam = params.get("quocgia");

  useEffect(() => {
    const getSeason = () => {
      const month = new Date().getMonth() + 1;
      if (month >= 3 && month <= 5) return "spring";
      if (month >= 6 && month <= 8) return "summer";
      if (month >= 9 && month <= 11) return "autumn";
      return "winter";
    };
    
    setSeason(getSeason());
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      
      const maxRetries = 3;
      let currentRetry = 0;
      
      while (currentRetry < maxRetries) {
        try {
          console.log(`🎬 Fetching movies... (attempt ${currentRetry + 1}/${maxRetries})`);
          
          const response = await axios.get("https://69538a2aa319a928023bc426.mockapi.io/movies", {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.data && Array.isArray(response.data)) {
            console.log(`✅ Successfully loaded ${response.data.length} movies`);
            setAllMovies(response.data);
            setLoading(false);
            setRetryCount(0);
            return;
          } else {
            console.warn("⚠️ Invalid response format:", response.data);
            throw new Error("Invalid data format");
          }
          
        } catch (err) {
          console.error(`❌ Attempt ${currentRetry + 1} failed:`, err.message);
          currentRetry++;
          
          if (currentRetry >= maxRetries) {
            console.error("❌ All retry attempts failed");
            setError("Không thể tải danh sách phim. Vui lòng thử lại!");
            setAllMovies([]);
            setLoading(false);
            setRetryCount(currentRetry);
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
          }
        }
      }
    };
    
    fetchMovies();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const genres = [
    ...new Set(
      allMovies
        .filter(m => m && m.genre)
        .flatMap((m) => m.genre.split(",").map((g) => g.trim()))
        .filter(Boolean)
    )
  ];
  
  const countries = [
    ...new Set(
      allMovies
        .filter(m => m && m.country)
        .map((m) => m.country)
    )
  ];

  let filteredMovies = [...allMovies];
  
  if (genreParam && genreParam !== "tat-ca") {
    filteredMovies = filteredMovies.filter((m) => {
      if (!m || !m.genre) return false;
      return m.genre
        .split(",")
        .map((g) => g.trim().toLowerCase())
        .includes(genreParam.toLowerCase());
    });
  }
  
  if (countryParam && countryParam !== "tat-ca") {
    filteredMovies = filteredMovies.filter((m) => {
      if (!m || !m.country) return false;
      return m.country.toLowerCase() === countryParam.toLowerCase();
    });
  }

  const handleFilter = (type, value) => {
    const newParams = new URLSearchParams(location.search);
    if (type === "theloai") {
      if (value === "tat-ca") newParams.delete("theloai");
      else newParams.set("theloai", value);
    }
    if (type === "quocgia") {
      if (value === "tat-ca") newParams.delete("quocgia");
      else newParams.set("quocgia", value);
    }
    navigate(`/danh-sach?${newParams.toString()}`);
  };

  const handleSeeMore = () => setVisibleCount(filteredMovies.length);

  const handleFavoriteClick = async (e, movieId) => {
    e.stopPropagation();
    
    if (isLoading) return;

    try {
      if (isFavorite(movieId)) {
        await removeFavorite(movieId);
      } else {
        await addFavorite(movieId);
      }
    } catch (error) {
      console.error("Lỗi xử lý yêu thích:", error.message);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="all-movies-page" data-season={season}>
        <div style={{ height: "100px" }}></div>
        <h2>🎬 Đang tải danh sách phim...</h2>
        {retryCount > 0 && (
          <p style={{ color: '#ffa500', textAlign: 'center' }}>
            Đang thử lại lần {retryCount}...
          </p>
        )}
        <div className="movie-grid">
          {Array.from({ length: 15 }, (_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "120px 20px", 
        textAlign: "center", 
        color: "#fff",
        minHeight: "60vh"
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>😢 {error}</h2>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '16px' }}>
          Có thể do kết nối mạng hoặc server đang bận
        </p>
        <button 
          onClick={handleRetry}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🔄 Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="all-movies-page" data-season={season}>
      <div style={{ height: "100px" }}></div>
      
      {/* Nút chọn mùa */}
      <div style={{
        textAlign: "center",
        marginBottom: "20px",
        display: "flex",
        gap: "15px",
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => setSeason("spring")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: season === "spring" ? "3px solid #ff69b4" : "2px solid rgba(0,0,0,0.2)",
            borderRadius: "50px",
            background: season === "spring" ? "linear-gradient(135deg, #ff69b4, #ffb6c1)" : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            color: season === "spring" ? "#fff" : "#333",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: season === "spring" ? "0 5px 20px rgba(255,105,180,0.4)" : "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          🌸 Mùa Xuân
        </button>
        <button
          onClick={() => setSeason("summer")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: season === "summer" ? "3px solid #ff8c00" : "2px solid rgba(0,0,0,0.2)",
            borderRadius: "50px",
            background: season === "summer" ? "linear-gradient(135deg, #ff8c00, #ffa500)" : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            color: season === "summer" ? "#fff" : "#333",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: season === "summer" ? "0 5px 20px rgba(255,140,0,0.4)" : "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          ☀️ Mùa Hạ
        </button>
        <button
          onClick={() => setSeason("autumn")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: season === "autumn" ? "3px solid #d2691e" : "2px solid rgba(0,0,0,0.2)",
            borderRadius: "50px",
            background: season === "autumn" ? "linear-gradient(135deg, #d2691e, #cd853f)" : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            color: season === "autumn" ? "#fff" : "#333",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: season === "autumn" ? "0 5px 20px rgba(210,105,30,0.4)" : "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          🍂 Mùa Thu
        </button>
        <button
          onClick={() => setSeason("winter")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: season === "winter" ? "3px solid #4682b4" : "2px solid rgba(0,0,0,0.2)",
            borderRadius: "50px",
            background: season === "winter" ? "linear-gradient(135deg, #4682b4, #5f9ea0)" : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            color: season === "winter" ? "#fff" : "#333",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: season === "winter" ? "0 5px 20px rgba(70,130,180,0.4)" : "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          ❄️ Mùa Đông
        </button>
      </div>

      <h2>🎬 Danh sách phim</h2>

      {/* Bộ lọc thể loại & quốc gia */}
      <div className="filter-wrapper">
        <div className="filter-section">
          <span className="filter-label">Thể loại:</span>
          <div className="filter-options">
            <button
              onClick={() => handleFilter("theloai", "tat-ca")}
              className={`filter-btn ${!genreParam ? "active" : ""}`}
            >
              Tất cả
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => handleFilter("theloai", g)}
                className={`filter-btn ${
                  genreParam?.toLowerCase() === g.toLowerCase() ? "active" : ""
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-label">Quốc gia:</span>
          <div className="filter-options">
            <button
              onClick={() => handleFilter("quocgia", "tat-ca")}
              className={`filter-btn ${!countryParam ? "active" : ""}`}
            >
              Tất cả
            </button>
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => handleFilter("quocgia", c)}
                className={`filter-btn ${
                  countryParam?.toLowerCase() === c.toLowerCase() ? "active" : ""
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách phim */}
      <div className="movie-grid">
        {filteredMovies.length > 0 ? (
          filteredMovies.slice(0, visibleCount).map((movie) => (
            <MovieCardWithPreview
              key={movie.id}
              movie={movie}
              isFavorite={isFavorite}
              handleFavoriteClick={handleFavoriteClick}
              isLoading={isLoading}
              navigate={navigate}
            />
          ))
        ) : (
          <p className="no-results">Không tìm thấy phim phù hợp.</p>
        )}
      </div>

      {visibleCount < filteredMovies.length && (
        <div className="see-more-container">
          <button className="see-more-btn" onClick={handleSeeMore}>
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
};

// ⭐ Component MovieCard với Hover Preview + cardRef
const MovieCardWithPreview = ({ movie, isFavorite, handleFavoriteClick, isLoading, navigate }) => {
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef(null); // ⭐ THÊM cardRef

  return (
    <div
      ref={cardRef} // ⭐ THÊM ref
      className="movie-card"
      onClick={() => navigate(`/thong-tin/${movie.id}`)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="movie-card-image-wrapper">
        <img src={movie.image} alt={movie.title} />
        
        {/* ⭐ Video Preview với cardRef */}
        <VideoPreview 
          movie={movie} 
          isHovering={isHovering}
          cardRef={cardRef}
        />
        
        {/* Icon tim yêu thích */}
        <button
          className={`favorite-btn ${isFavorite(movie.id) ? 'is-favorite' : ''}`}
          onClick={(e) => handleFavoriteClick(e, movie.id)}
          disabled={isLoading}
          aria-label={isFavorite(movie.id) ? "Bỏ yêu thích" : "Thêm yêu thích"}
        >
          <svg
            className="heart-icon"
            viewBox="0 0 24 24"
            fill={isFavorite(movie.id) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>{movie.engTitle}</p>
      </div>
    </div>
  );
};

export default AllMovies;