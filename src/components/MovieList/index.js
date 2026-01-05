// src/components/MovieList/index.js
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "./style.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useFavorites } from "../../store/useFavorites";
import MovieCardSkeleton from "../Skeleton/MovieCardSkeleton";
import VideoPreview from "../VideoPreview";

// ===== Thẻ phim với icon tim + HOVER PREVIEW =====
const MovieCard = ({ movie }) => {
  const { isFavorite, addFavorite, removeFavorite, isLoading } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;

    try {
      setIsAnimating(true);
      
      if (isFavorite(movie.id)) {
        await removeFavorite(movie.id);
      } else {
        await addFavorite(movie.id);
      }
      
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      console.error("Lỗi xử lý yêu thích:", error.message);
      setIsAnimating(false);
    }
  };

  return (
    <Link
      style={{ textDecoration: "none" }}
      to={`/thong-tin/${movie.id}`}
      className="movie-card-link"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="movie-card">
        <div className="movie-card-image-wrapper">
          <img src={movie.image} alt={movie.title} />
          
          {/* ⭐ Video Preview khi hover */}
          <VideoPreview movie={movie} isHovering={isHovering} />
          
          {/* Icon tim yêu thích */}
          <button
            className={`favorite-btn ${isFavorite(movie.id) ? 'is-favorite' : ''} ${isAnimating ? 'animate' : ''}`}
            onClick={handleFavoriteClick}
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
    </Link>
  );
};

// ===== Mục phim (Swiper độc lập) =====
const MovieSection = ({ title, movies, showSeeMore = true }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.destroy();
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, [swiperRef, prevRef, nextRef]);

  return (
    <div className="movie-section">
      <div className="movie-header">
        <h2>{title}</h2>
        {showSeeMore && (
          <Link to="/danh-sach" className="see-more">
            Xem thêm →
          </Link>
        )}
      </div>

      <div className="swiper-container-wrapper">
        <div ref={prevRef} className="swiper-button-prev custom-nav"></div>

        <Swiper
          modules={[Navigation]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          spaceBetween={16}
          slidesPerView={5}
          grabCursor
          breakpoints={{
            320: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <MovieCard movie={movie} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div ref={nextRef} className="swiper-button-next custom-nav"></div>
      </div>
    </div>
  );
};

// ===== Grid Layout cho Search Results =====
const MovieGrid = ({ movies }) => {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

// ===== Danh sách tổng hợp =====
const MovieList = ({ movies: propMovies }) => {
  // ✅ FIX: Khởi tạo là ARRAY, không phải undefined
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Nếu có movies từ prop (search results) thì dùng prop
  // Nếu không thì tự fetch
  const isSearchMode = propMovies && propMovies.length >= 0;

  useEffect(() => {
    // Chỉ fetch khi KHÔNG có prop movies
    if (!isSearchMode) {
      setLoading(true);
      axios
        // ✅ FIX: Đổi sang API không bị CORS
        .get("https://69538a2aa319a928023bc426.mockapi.io/movies")
        .then((res) => {
          // ✅ FIX: Đảm bảo luôn set array
          setAllMovies(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Lỗi tải danh sách phim:", err);
          setError("Lỗi tải danh sách phim");
          setAllMovies([]); // ✅ FIX: Set array rỗng khi lỗi
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isSearchMode]);

  // Nếu đang ở search mode, hiển thị grid
  if (isSearchMode) {
    return <MovieGrid movies={propMovies} />;
  }

  // ⭐ Hiển thị Skeleton khi đang load
  if (loading) {
    return (
      <div className="movie-section">
        <div className="movie-header">
          <h2>Đang tải phim...</h2>
        </div>
        <div className="movie-grid">
          {Array.from({ length: 10 }, (_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p style={{ color: '#ff6b6b', textAlign: 'center', padding: '40px' }}>{error}</p>;

  // ✅ FIX: Đảm bảo allMovies là array trước khi slice/filter
  const safeMovies = Array.isArray(allMovies) ? allMovies : [];
  
  const firstSection = safeMovies.slice(0, 6);
  
  // ✅ FIX: Kiểm tra m.genre tồn tại trước khi .toLowerCase()
  const animeSection = safeMovies.filter((m) => {
    if (!m.genre || typeof m.genre !== 'string') return false;
    return m.genre.toLowerCase().includes("anime");
  });

  return (
    <>
      {firstSection.length > 0 && (
        <MovieSection title="Anime & Phim Hay" movies={firstSection} />
      )}
      {animeSection.length > 0 && (
        <MovieSection title="Anime" movies={animeSection} />
      )}
    </>
  );
};

export default MovieList;