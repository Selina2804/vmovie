// src/pages/History/index.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/useAuth";
import Swal from "sweetalert2";
import "./style.css";

function History() {
  const [history, setHistory] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Lấy lịch sử từ localStorage
    const savedHistory = localStorage.getItem(`history_${user.id}`);
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      // Sắp xếp theo thời gian mới nhất
      const sorted = parsed.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
      setHistory(sorted);
    }
  }, [user, navigate]);

  const handleClearHistory = () => {
    Swal.fire({
      title: "Xóa toàn bộ lịch sử?",
      text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff5c5c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Xóa tất cả",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(`history_${user.id}`);
        setHistory([]);
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Lịch sử xem đã được xóa sạch.",
          confirmButtonColor: "#4caf50",
          timer: 2000,
        });
      }
    });
  };

  const handleRemoveItem = (movieId, movieTitle) => {
    Swal.fire({
      title: "Xóa khỏi lịch sử?",
      text: `Bạn muốn xóa "${movieTitle}" khỏi lịch sử xem?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff5c5c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedHistory = history.filter((item) => item.id !== movieId);
        setHistory(updatedHistory);
        localStorage.setItem(`history_${user.id}`, JSON.stringify(updatedHistory));
        
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Phim đã được xóa khỏi lịch sử.",
          confirmButtonColor: "#4caf50",
          timer: 1500,
        });
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return date.toLocaleDateString("vi-VN");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="history-page">
      <div className="history-header-space"></div>

      <div className="history-container">
        <div className="history-header">
          <h1>Lịch Sử Xem Phim</h1>
          {history.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearHistory}>
              🗑️ Xóa toàn bộ
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">📺</div>
            <h2>Chưa có lịch sử xem</h2>
            <p>Các bộ phim bạn đã xem sẽ được lưu lại tại đây</p>
            <button className="browse-btn" onClick={() => navigate("/danh-sach")}>
              Khám phá phim ngay
            </button>
          </div>
        ) : (
          <>
            <div className="history-stats">
              <div className="stat-card">
                <span className="stat-number">{history.length}</span>
                <span className="stat-label">Phim đã xem</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {new Set(history.map(h => h.genre)).size}
                </span>
                <span className="stat-label">Thể loại</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {new Set(history.map(h => h.country)).size}
                </span>
                <span className="stat-label">Quốc gia</span>
              </div>
            </div>

            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div 
                    className="history-poster"
                    onClick={() => navigate(`/thong-tin/${item.id}`)}
                  >
                    <img src={item.image} alt={item.title} />
                    <div className="play-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>

                  <div className="history-info">
                    <h3 
                      className="history-title"
                      onClick={() => navigate(`/thong-tin/${item.id}`)}
                    >
                      {item.title}
                    </h3>
                    <p className="history-eng-title">{item.engTitle}</p>
                    
                    <div className="history-meta">
                      <span className="meta-item">🎬 {item.genre}</span>
                      <span className="meta-item">🌍 {item.country}</span>
                      <span className="meta-item">📅 {item.year}</span>
                      <span className="meta-item">⏱️ {item.duration}</span>
                    </div>

                    <p className="watched-time">
                      <span className="clock-icon">🕐</span>
                      Đã xem {formatDate(item.watchedAt)}
                    </p>
                  </div>

                  <div className="history-actions">
                    <button 
                      className="watch-again-btn"
                      onClick={() => navigate(`/xem-phim/${item.id}`)}
                    >
                      ▶ Xem lại
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      title="Xóa khỏi lịch sử"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default History;