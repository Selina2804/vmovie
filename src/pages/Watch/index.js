import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

const WatchMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentServer, setCurrentServer] = useState("1");
  const [currentEpisode, setCurrentEpisode] = useState(1);

  useEffect(() => {
    // Lấy dữ liệu phim từ MockAPI
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

  // Nếu không có phimƯ
  if (!movie) {
    return (
      <div className="watch-movie-page" style={{ color: "white", padding: "100px" }}>
        <h2>Không tìm thấy phim.</h2>
        <button className="back-btn" onClick={() => navigate("/")}>
          ⏪ Quay lại trang chủ
        </button>
      </div>
    );
  }

  // Các server video
  const servers = {
    1: movie.videoUrl,
    2: movie.backupUrls[0],
    3: movie.backupUrls[1],
  };

  return (
    <div className="watch-movie-page">
      <div className="header-space"></div>

      {/* Video Player */}
      <iframe
        className="main-video"
        src={servers[currentServer]}
        title={`${movie.title} - Server ${currentServer}`}
        allowFullScreen
        frameBorder="0"
        scrolling="no"
      ></iframe>

      {/* Server selection buttons */}
      <div className="server-buttons">
        {Object.keys(servers).map((num) => (
          <button
            key={num}
            className={`server-btn ${currentServer === num ? "active" : ""}`}
            onClick={() => setCurrentServer(num)}
          >
            Server #{num}
          </button>
        ))}
      </div>

      {/* Rating */}
      <div className="movie-rating">
        ⭐⭐⭐⭐☆ <span>(8.9 điểm / 350 lượt xem)</span>
      </div>

      {/* Episode list */}
      <div className="episode-section">
        <h3>
          TẬP PHIM <span className="vietsub-tag">VIETSUB</span>
        </h3>
        <div className="episode-list">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((ep) => (
            <button
              key={ep}
              className={`episode-btn ${ep === currentEpisode ? "active" : ""}`}
              onClick={() => setCurrentEpisode(ep)}
            >
              {ep}
            </button>
          ))}
        </div>
      </div>

      {/* Movie info */}
      <div className="watch-info">
        <h2>{movie.title}</h2>
        <p className="eng-title">{movie.engTitle}</p>

        <ul className="movie-details">
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

        <p className="movie-description">{movie.description}</p>

        <div className="keyword-tags">
          <span>#{movie.title.replace(/\s+/g, "")}</span>
          <span>#{movie.engTitle.replace(/\s+/g, "")}</span>
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
    </div>
  );
};

export default WatchMovie;
