// src/components/ContinueWatching/index.js
// 📺 Component hiển thị danh sách phim đang xem

import React from 'react';
import { useContinueWatching } from '../../hooks/useWatchProgress';
import ContinueWatchingCard from './ContinueWatchingCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import './style.css';

const ContinueWatching = ({ limit = 10, showTitle = true }) => {
  const { movies, isLoading, remove } = useContinueWatching(limit);

  if (isLoading) {
    return (
      <div className="continue-watching-section">
        {showTitle && <h2 className="section-title">📺 Xem tiếp</h2>}
        <div className="continue-watching-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return null; // Không hiển thị gì nếu không có phim
  }

  return (
    <div className="continue-watching-section">
      {showTitle && (
        <div className="section-header">
          <h2 className="section-title">📺 Xem tiếp</h2>
          <span className="section-count">{movies.length} phim</span>
        </div>
      )}

      <div className="continue-watching-slider">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={4}
          navigation
          grabCursor
          breakpoints={{
            320: { slidesPerView: 1.5 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.movieId}>
              <ContinueWatchingCard movie={movie} onRemove={remove} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ContinueWatching;