import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

const MovieDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lấy dữ liệu từ MockAPI khi component được render
    axios
      .get(`https://68faff8894ec96066024411b.mockapi.io/movies/${id}`)
      .then((response) => {
        setMovie(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Lỗi tải dữ liệu");
        setLoading(false);
      });
  }, [id]);

  // Nếu dữ liệu đang được tải
  if (loading) {
    return <div>Đang tải phim...</div>;
  }

  // Nếu có lỗi
  if (error) {
    return <div>{error}</div>;
  }

  // Nếu không có phim
  if (!movie) {
    return (
      <div className="movie-detail-page" style={{ padding: "120px", color: "white" }}>
        <h2>Không tìm thấy phim.</h2>
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      {/* Khoảng trống để tránh header đè */}
      <div className="movie-detail-header-space"></div>

      <div className="movie-detail">
        {/* Poster phim */}
        <div className="movie-detail-poster">
          <img src={movie.image} alt={movie.title} />
          <button
            className="watch-button"
            onClick={() => navigate(`/xem-phim/${movie.id}`)}
          >
            🎬 Xem Phim
          </button>
        </div>

        {/* Thông tin phim */}
        <div className="movie-detail-info">
          <h1 className="movie-title">{movie.title}</h1>
          <p className="movie-eng-title">
            <em>{movie.engTitle}</em>
          </p>

          <div className="movie-meta">
            <p>
              <strong>Trạng thái:</strong> Tập 1 Vietsub
            </p>
            <p>
              <strong>Thời lượng:</strong> {movie.duration}
            </p>
            <p>
              <strong>Thể loại:</strong>{" "}
              {movie.genre.split(",").map((g, index) => (
                <span key={index} className="tag">
                  {g.trim()}
                </span>
              ))}
            </p>
            <p>
              <strong>Đánh giá:</strong> ⭐⭐⭐⭐☆ (8.7/10)
            </p>
          </div>
        </div>
      </div>

      {/* Mô tả phim */}
      <div className="movie-detail-description">
        <h2>Nội dung chi tiết</h2>
        <p>{movie.description}</p>

        <div className="keyword-tags">
          <span>#{movie.title.replace(/\s+/g, "")}</span>
          <span>#{movie.engTitle.replace(/\s+/g, "")}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
