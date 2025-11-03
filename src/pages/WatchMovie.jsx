import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import movieApi from "../api/movieApi";  

const WatchMovie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movies = await movieApi.getAll();  
        const selectedMovie = movies.find((m) => m.id === parseInt(id));  
        setMovie(selectedMovie);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải phim:", error);
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;

  if (!movie) return <div>Phim không tồn tại hoặc đã bị xóa.</div>;

  return (
    <div className="watch-container">
      <h1>{movie.name}</h1>

      <div className="video-wrapper">
        <iframe
          src={movie.videoUrl}
          title={movie.name}
          width="100%"
          height="500"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      <div className="movie-info">
        <h2>Thông tin phim</h2>
        <p><strong>Quốc gia:</strong> {movie.country}</p>
        <p><strong>Thể loại:</strong> {movie.genre}</p>
        <p><strong>Thời gian:</strong> {movie.duration}</p>
        <p><strong>Mô tả:</strong> {movie.description}</p>
      </div>

      {movie.image && (
        <img src={movie.image} alt={movie.name} className="poster" />
      )}
    </div>
  );
};

export default WatchMovie;
