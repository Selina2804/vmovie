import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useFavorites } from "../../store/useFavorites";
import { useAuth } from "../../store/useAuth";
import "./style.css";

const FavoritePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFavoriteIds, removeFavorite } = useFavorites();
  
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState("");

  // Load danh sách phim yêu thích
  const loadFavorites = async () => {
    setLoading(true);
    const favoriteIds = getFavoriteIds();
    
    if (favoriteIds.length === 0) {
      setFavoriteMovies([]);
      setLoading(false);
      return;
    }

    try {
      const moviePromises = favoriteIds.map((id) =>
        axios.get(`https://69538a2aa319a928023bc426.mockapi.io/movies/${id}`)
      );
      
      const results = await Promise.all(moviePromises);
      const movies = results.map((res) => res.data);
      
      setFavoriteMovies(movies);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải phim yêu thích:", error);
      setLoading(false);
    }
  };

  // ✅ Load khi component mount hoặc user thay đổi
  useEffect(() => {
    if (!user) {
      navigate("/dang-nhap");
      return;
    }

    loadFavorites();
  }, [user, navigate]);

  // ✅ Lắng nghe thay đổi localStorage để tự động reload
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.type === 'storage') {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRemove = async (movieId, movieTitle) => {
    // Hiển thị SweetAlert2 confirmation
    const result = await Swal.fire({
      title: 'Xóa khỏi yêu thích?',
      text: `Bạn có chắc muốn xóa "${movieTitle}" khỏi danh sách yêu thích?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    // Nếu người dùng hủy thì dừng
    if (!result.isConfirmed) {
      return;
    }

    try {
      // ✅ Gọi removeFavorite và chờ hoàn thành
      await removeFavorite(movieId);
      
      // ✅ Cập nhật UI ngay lập tức - xóa phim khỏi danh sách
      setFavoriteMovies((prev) => prev.filter((m) => m.id !== movieId));
      
      // Hiển thị thông báo thành công
      Swal.fire({
        title: 'Đã xóa!',
        text: 'Phim đã được xóa khỏi danh sách yêu thích.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Lỗi xóa phim:", error);
      
      // Hiển thị thông báo lỗi
      Swal.fire({
        title: 'Lỗi!',
        text: error.message || 'Không thể xóa phim. Vui lòng thử lại.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  if (loading) {
    return (
      <div className="favorite-page" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        color: 'white',
        fontSize: '20px'
      }}>
        <div>
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎬</div>
          Đang tải danh sách yêu thích...
        </div>
      </div>
    );
  }

  return (
    <div className="favorite-page">
      <div style={{ height: "100px" }}></div>

      {showMessage && (
        <div className="notification-message">{showMessage}</div>
      )}

      <h1 className="favorite-title">❤️ Phim Yêu Thích Của Tôi</h1>

      {favoriteMovies.length === 0 ? (
        <div className="empty-favorite">
          <p style={{ fontSize: "50px" }}>💔</p>
          <h2>Chưa có phim yêu thích nào</h2>
          <button onClick={() => navigate("/danh-sach")} className="browse-btn">
            Khám phá phim ngay
          </button>
        </div>
      ) : (
        <div className="favorite-grid">
          {favoriteMovies.map((movie) => (
            <div key={movie.id} className="favorite-card">
              <div
                className="favorite-poster"
                onClick={() => navigate(`/thong-tin/${movie.id}`)}
              >
                <img src={movie.image} alt={movie.title} />
                <div className="movie-overlay">
                  <p className="movie-genre">{movie.genre}</p>
                </div>
              </div>

              <div className="favorite-info">
                <h3>{movie.title}</h3>
                <p className="eng-title">{movie.engTitle}</p>
                
                <div className="action-buttons">
                  <button
                    onClick={() => navigate(`/xem-phim/${movie.id}`)}
                    className="btn-watch"
                  >
                    🎬 Xem
                  </button>
                  <button
                    onClick={() => handleRemove(movie.id, movie.title)}
                    className="btn-remove"
                  >
                    ❌ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritePage;