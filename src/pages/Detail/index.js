import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";
import { useFavorites } from "../../store/useFavorites";
import { useAuth } from "../../store/useAuth";
import DetailSkeleton from "../../components/Skeleton/DetailSkeleton";

const API_URL = "https://69538a2aa319a928023bc426.mockapi.io/movies";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addFavorite, removeFavorite, isFavorite, isLoading } = useFavorites();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [showMessage, setShowMessage] = useState("");
  const [isInFavorites, setIsInFavorites] = useState(false);

  // 💬 Comment states
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const movieId = parseInt(id);

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

  const parseComments = (commentsData) => {
    if (!commentsData) return [];
    if (Array.isArray(commentsData)) return commentsData;

    if (typeof commentsData === 'string') {
      try {
        const parsed = JSON.parse(commentsData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    setIsInFavorites(isFavorite(movieId));
  }, [movieId, user]);

  useEffect(() => {
    loadMovieData();
  }, [id]);

  const loadMovieData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      const movieData = response.data;

      setMovie(movieData);
      setRatings(movieData.ratings || []);
      setComments(parseComments(movieData.comments));
      setLoading(false);
    } catch (err) {
      setError("Lỗi tải dữ liệu");
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (rating === 0) return;

    const updatedRatings = [...ratings, rating];

    try {
      await axios.put(`${API_URL}/${id}`, {
        ...movie,
        ratings: updatedRatings,
      });

      setRatings(updatedRatings);
      setRating(0);
      setHover(0);
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setShowMessage("❌ Bạn cần đăng nhập để thêm yêu thích!");
      setTimeout(() => setShowMessage(""), 3000);
      return;
    }

    try {
      if (isInFavorites) {
        await removeFavorite(movieId);
        setIsInFavorites(false);
        setShowMessage("💔 Đã xóa khỏi yêu thích");
      } else {
        await addFavorite(movieId);
        setIsInFavorites(true);
        setShowMessage("❤️ Đã thêm vào yêu thích!");
      }
      setTimeout(() => setShowMessage(""), 3000);
    } catch (err) {
      setShowMessage(`❌ ${err.message}`);
      setTimeout(() => setShowMessage(""), 3000);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowMessage("❌ Bạn cần đăng nhập để bình luận!");
      setTimeout(() => setShowMessage(""), 3000);
      return;
    }

    if (!commentText.trim()) {
      setShowMessage("⚠️ Vui lòng nhập nội dung bình luận!");
      setTimeout(() => setShowMessage(""), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const newComment = {
        id: Date.now().toString(),
        userId: user.id || user.email,
        userName: user.username || user.name || user.email,
        userAvatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
        content: commentText.trim(),
        rating: commentRating,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      const updatedComments = [newComment, ...comments];

      await axios.put(`${API_URL}/${id}`, {
        ...movie,
        comments: JSON.stringify(updatedComments)
      });

      setComments(updatedComments);
      setCommentText("");
      setCommentRating(0);
      setShowMessage("✅ Đã thêm bình luận thành công!");
      setTimeout(() => setShowMessage(""), 3000);
    } catch (err) {
      setShowMessage("❌ Không thể thêm bình luận!");
      setTimeout(() => setShowMessage(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      const updatedComments = comments.filter(c => c.id !== commentId);

      await axios.put(`${API_URL}/${id}`, {
        ...movie,
        comments: JSON.stringify(updatedComments)
      });

      setComments(updatedComments);
      setShowMessage("✅ Đã xóa bình luận!");
      setTimeout(() => setShowMessage(""), 3000);
    } catch (err) {
      setShowMessage("❌ Không thể xóa bình luận!");
      setTimeout(() => setShowMessage(""), 3000);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      const updatedComments = comments.map(c =>
        c.id === commentId
          ? { ...c, content: newContent, editedAt: new Date().toISOString() }
          : c
      );

      await axios.put(`${API_URL}/${id}`, {
        ...movie,
        comments: JSON.stringify(updatedComments)
      });

      setComments(updatedComments);
      setShowMessage("✅ Đã cập nhật bình luận!");
      setTimeout(() => setShowMessage(""), 3000);
    } catch (err) {
      setShowMessage("❌ Không thể sửa bình luận!");
      setTimeout(() => setShowMessage(""), 3000);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const updatedComments = comments.map(c =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      );

      await axios.put(`${API_URL}/${id}`, {
        ...movie,
        comments: JSON.stringify(updatedComments)
      });

      setComments(updatedComments);
    } catch (err) {
      setShowMessage("❌ Không thể like bình luận!");
      setTimeout(() => setShowMessage(""), 3000);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) return <DetailSkeleton />;
  if (error) return <div style={{ padding: "120px", textAlign: "center", color: "red" }}>{error}</div>;
  if (!movie) return <div className="movie-detail-page" style={{ padding: "120px", color: "white" }}><h2>Không tìm thấy phim.</h2></div>;

  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : "Chưa có";

  return (
    <div className="movie-detail-page">
      <div className="movie-detail-header-space"></div>

      {showMessage && (
        <div className="notification-toast">
          {showMessage}
        </div>
      )}

      <div className="movie-detail">
        <div className="movie-detail-poster">
          <img src={movie.image} alt={movie.title} />

          {/* ⭐ HIỂN THỊ TRẠNG THÁI TẬP PHIM */}
          {movie.movieType === "series" && movie.totalEpisodes > 1 && (
            <div className="episode-status-badge">
              📺 Đã chiếu: {getLastWatchedEpisode(movie.id)}/{movie.totalEpisodes} tập
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button
              className="watch-button"
              onClick={() => {
                // ⭐ TỰ ĐỘNG MỞ TẬP TIẾP THEO
                const lastEpisode = getLastWatchedEpisode(movie.id);
                const nextEpisode = movie.movieType === "series" && lastEpisode < movie.totalEpisodes
                  ? lastEpisode + 1
                  : lastEpisode;

                navigate(`/xem-phim/${movie.id}?episode=${nextEpisode}`);
              }}
              style={{ flex: 1 }}
            >
              🎬 {movie.movieType === "series" ? `Xem tiếp tập ${Math.min(getLastWatchedEpisode(movie.id) + 1, movie.totalEpisodes)}` : "Xem Phim"}
            </button>

            <button
              onClick={handleToggleFavorite}
              disabled={isLoading}
              className={`favorite-button ${isInFavorites ? 'active' : ''}`}
              title={isInFavorites ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isInFavorites ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="movie-detail-info">
          <h1 className="movie-title">{movie.title || "Không có tiêu đề"}</h1>
          <p className="movie-eng-title"><em>{movie.engTitle || ""}</em></p>

          <div className="movie-meta">
            <p><strong>Trạng thái:</strong> Tập 1 Vietsub</p>
            <p><strong>Thời lượng:</strong> {movie.duration || "Chưa rõ"}</p>

            {/* ✅ FIX: Kiểm tra undefined trước khi split */}
            <p>
              <strong>Thể loại:</strong>{" "}
              {movie.genre ? (
                movie.genre.split(",").map((g, i) => (
                  <span key={i} className="tag">{g.trim()}</span>
                ))
              ) : (
                <span className="tag">Chưa rõ</span>
              )}
            </p>

            <div className="movie-rating-section">
              <p><strong>Đánh giá:</strong> ⭐ {avgRating} / 5</p>

              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= (hover || rating) ? "star active" : "star"}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <button className="rate-btn" onClick={submitRating}>
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="movie-detail-description">
        <h2>Nội dung chi tiết</h2>
        <p>{movie.description || "Chưa có mô tả"}</p>

        {/* ✅ FIX: Kiểm tra undefined trước khi replace */}
        <div className="keyword-tags">
          {movie.title && <span>#{movie.title.replace(/\s+/g, "")}</span>}
          {movie.engTitle && <span>#{movie.engTitle.replace(/\s+/g, "")}</span>}
        </div>
      </div>

      {/* 💬 COMMENTS SECTION */}
      <div className="comments-section">
        <h2 className="comments-title">💬 Bình luận ({comments.length})</h2>

        {user ? (
          <CommentForm
            user={user}
            commentText={commentText}
            setCommentText={setCommentText}
            commentRating={commentRating}
            setCommentRating={setCommentRating}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitComment}
          />
        ) : (
          <div className="comment-login-prompt">
            <p>Bạn cần đăng nhập để bình luận</p>
            <button onClick={() => navigate("/dang-nhap")}>Đăng nhập</button>
          </div>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="comments-empty">
              <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                user={user}
                onDelete={handleDeleteComment}
                onEdit={handleEditComment}
                onLike={handleLikeComment}
                formatTimeAgo={formatTimeAgo}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification-toast {
          position: fixed;
          top: 100px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          padding: 15px 25px;
          border-radius: 12px;
          z-index: 9999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          animation: slideIn 0.3s ease;
          font-weight: 500;
        }

        .favorite-button {
          min-width: 50px;
          padding: 12px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          color: #64748b;
        }

        .favorite-button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .favorite-button.active {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: #fff;
          box-shadow: 0 8px 24px rgba(245, 87, 108, 0.4);
          animation: heartBeat 0.4s ease;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(0.95); }
          75% { transform: scale(1.1); }
        }

        .comments-section {
          max-width: 1000px;
          margin: 60px auto;
          padding: 0 20px;
        }

        .comments-title {
          color: #fff;
          font-size: 28px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .comment-login-prompt {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          margin-bottom: 30px;
        }

        .comment-login-prompt p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 16px;
        }

        .comment-login-prompt button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .comments-empty {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          padding: 40px;
        }
          .episode-status-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
  margin-top: 12px;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
  }
}
      `}</style>
    </div>
  );
};

const CommentForm = ({ user, commentText, setCommentText, commentRating, setCommentRating, isSubmitting, onSubmit }) => (
  <form className="comment-form" onSubmit={onSubmit}>
    <div className="comment-form-header">
      <img
        src={user.avatar || `https://i.pravatar.cc/150?u=${user.email || user.id}`}
        alt={user.name || user.email}
        className="comment-avatar"
      />
      <div className="comment-form-content">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim..."
          rows="3"
          disabled={isSubmitting}
        />

        <div className="comment-form-footer">
          <div className="comment-rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= commentRating ? "star active" : "star"}
                onClick={() => setCommentRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="comment-submit-btn"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>
      </div>
    </div>

    <style>{`
      .comment-form {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 30px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .comment-form-header {
        display: flex;
        gap: 15px;
      }

      .comment-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255, 255, 255, 0.2);
        flex-shrink: 0;
      }

      .comment-form-content {
        flex: 1;
      }

      .comment-form textarea {
        width: 100%;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 12px 16px;
        color: #fff;
        font-size: 15px;
        resize: vertical;
        font-family: inherit;
        transition: all 0.3s;
      }

      .comment-form textarea:focus {
        outline: none;
        border-color: #667eea;
        background: rgba(255, 255, 255, 0.12);
      }

      .comment-form-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
      }

      .comment-rating-stars {
        display: flex;
        gap: 4px;
      }

      .comment-rating-stars .star {
        font-size: 20px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.2);
        transition: all 0.2s;
      }

      .comment-rating-stars .star:hover,
      .comment-rating-stars .star.active {
        color: #ffd700;
        transform: scale(1.1);
      }

      .comment-submit-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border: none;
        padding: 10px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .comment-submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `}</style>
  </form>
);

const CommentItem = ({ comment, user, onDelete, onEdit, onLike, formatTimeAgo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const isOwner = user && (user.id === comment.userId || user.email === comment.userId);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(comment.id, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="comment-item">
      <img
        src={comment.userAvatar}
        alt={comment.userName}
        className="comment-avatar"
      />

      <div className="comment-content">
        <div className="comment-header">
          <div className="comment-user-info">
            <span className="comment-username">{comment.userName}</span>
            <span className="comment-time">
              {formatTimeAgo(comment.createdAt)}
              {comment.editedAt && " (đã chỉnh sửa)"}
            </span>
            {comment.rating > 0 && (
              <span className="comment-rating">
                {Array.from({ length: comment.rating }, () => "⭐").join("")}
              </span>
            )}
          </div>

          {isOwner && !isEditing && (
            <div className="comment-actions-header">
              <button
                className="comment-edit-btn"
                onClick={() => setIsEditing(true)}
                title="Sửa bình luận"
              >
                ✏️
              </button>
              <button
                className="comment-delete-btn"
                onClick={() => onDelete(comment.id)}
                title="Xóa bình luận"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="comment-edit-box">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows="3"
            />
            <div className="comment-edit-actions">
              <button onClick={handleSaveEdit} className="save-btn">Lưu</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Hủy</button>
            </div>
          </div>
        ) : (
          <p className="comment-text">{comment.content}</p>
        )}

        {!isEditing && (
          <div className="comment-actions">
            <button
              className="comment-like-btn"
              onClick={() => onLike(comment.id)}
            >
              👍 {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .comment-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 15px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
        }

        .comment-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .comment-content {
          flex: 1;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .comment-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .comment-username {
          color: #fff;
          font-weight: 600;
        }

        .comment-time {
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px;
        }

        .comment-actions-header {
          display: flex;
          gap: 8px;
        }

        .comment-edit-btn,
        .comment-delete-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .comment-edit-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .comment-delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .comment-text {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin: 8px 0;
        }

        .comment-edit-box textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 10px;
          color: #fff;
          font-size: 15px;
          resize: vertical;
          font-family: inherit;
        }

        .comment-edit-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .save-btn,
        .cancel-btn {
          padding: 6px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .save-btn {
          background: #667eea;
          color: #fff;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .comment-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .comment-like-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .comment-like-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .comment-like-btn span {
          color: #fff;
          font-weight: 600;
        }

        .comment-rating {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default MovieDetail;