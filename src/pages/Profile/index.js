// src/pages/Profile/index.js - FIX KHÔNG RELOAD, CHỈ CẬP NHẬT STATE
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/useAuth";
import Swal from "sweetalert2";
import "./style.css";

function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatar: "",
  });
  const [stats, setStats] = useState({
    totalWatched: 0,
    favoriteGenre: "Chưa có",
    favoriteCountry: "Chưa có",
  });

  useEffect(() => {
    console.log("🔍 useEffect - Đang ở:", location.pathname);
    
    if (!user) {
      navigate("/login");
      return;
    }

    setFormData({
      username: user.username || "",
      email: user.email || "",
      avatar: user.avatar || "",
    });

    // Tính toán thống kê từ lịch sử xem
    const savedHistory = localStorage.getItem(`history_${user.id}`);
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setStats({
        totalWatched: history.length,
        favoriteGenre: getMostFrequent(history.map(h => h.genre)),
        favoriteCountry: getMostFrequent(history.map(h => h.country)),
      });
    }
  }, [user, navigate, location.pathname]);

  const getMostFrequent = (arr) => {
    if (arr.length === 0) return "Chưa có";
    const frequency = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : "Chưa có";
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Ngăn event bubble
    
    console.log("🎯 handleSubmit được gọi");
    console.log("📍 Location trước khi submit:", location.pathname);
    
    if (!formData.username.trim()) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Tên người dùng không được để trống!",
        confirmButtonColor: "#ff5c5c",
      });
      return;
    }

    // Validate URL avatar
    if (formData.avatar.trim() && !isValidUrl(formData.avatar.trim())) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "URL avatar không hợp lệ!",
        confirmButtonColor: "#ff5c5c",
      });
      return;
    }

    try {
      console.log("🚀 Bắt đầu cập nhật profile...");
      
      // ✅ Dùng hàm updateUser từ useAuth
      const result = await updateUser(user.id, {
        username: formData.username.trim(),
        avatar: formData.avatar.trim() || user.avatar,
      });
      
      console.log("✅ Kết quả cập nhật:", result);
      console.log("📍 Location sau khi cập nhật:", location.pathname);
      
      setIsEditing(false);
      
      // ✅ FIX: KHÔNG RELOAD, chỉ hiện thông báo
      await Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật thông tin thành công!",
        confirmButtonColor: "#4caf50",
        timer: 1500,
        showConfirmButton: false,
      });
      
      console.log("📍 Location sau Swal:", location.pathname);
      
      // Cập nhật lại formData từ user mới
      setFormData({
        username: result.username || user.username,
        email: result.email || user.email,
        avatar: result.avatar || user.avatar,
      });

    } catch (err) {
      console.error("❌ Error updating profile:", err);
      console.log("📍 Location khi có lỗi:", location.pathname);
      
      // ✅ Nếu lỗi 404, nghĩa là user không tồn tại trên API
      if (err.response?.status === 404) {
        Swal.fire({
          icon: "warning",
          title: "Cảnh báo",
          html: `
            <p>Không tìm thấy tài khoản trên server.</p>
            <p><strong>Thông tin đã được lưu tạm thời trên máy bạn.</strong></p>
            <p style="font-size: 12px; color: #666;">
              Lưu ý: Khi đăng xuất và đăng nhập lại, avatar sẽ quay về mặc định.
            </p>
          `,
          confirmButtonColor: "#ff9800",
        });
        
        setIsEditing(false);
        
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: err.message || "Cập nhật thất bại! Vui lòng thử lại.",
          confirmButtonColor: "#ff5c5c",
        });
      }
    }
  };

  // Hàm kiểm tra URL hợp lệ
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff5c5c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          icon: "success",
          title: "Đã đăng xuất!",
          text: "Hẹn gặp lại bạn!",
          confirmButtonColor: "#4caf50",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/");
        });
      }
    });
  };

  if (!user) {
    return null;
  }

  console.log("🎨 Render Profile - Location:", location.pathname);

  return (
    <div className="profile-page">
      <div className="profile-header-space"></div>

      <div className="profile-container">
        <div className="profile-wrapper">
          {/* Left Sidebar - Avatar & Basic Info */}
          <div className="profile-sidebar">
            <div className="avatar-section">
              <img 
                src={formData.avatar || user.avatar || "https://i.pravatar.cc/150?img=12"} 
                alt="Avatar" 
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = "https://i.pravatar.cc/150?img=12";
                }}
                key={formData.avatar} // ✅ Force re-render khi avatar thay đổi
              />
              {isEditing && (
                <div className="avatar-edit">
                  <label>URL Avatar mới:</label>
                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://i.pravatar.cc/150?img=5"
                    className="avatar-input"
                  />
                  <small className="avatar-hint">
                    💡 <strong>Gợi ý:</strong>
                    <br />• https://i.pravatar.cc/150?img=1
                    <br />• https://i.imgur.com/your-image.jpg
                    <br />• https://avatars.githubusercontent.com/u/123456
                  </small>
                </div>
              )}
            </div>

            <div className="profile-basic">
              <h2>{user.username}</h2>
              <p className="user-email">{user.email}</p>
              <span className={`user-role ${user.role}`}>
                {user.role === "admin" ? "👑 Quản trị viên" : "👤 Người dùng"}
              </span>
            </div>

            <div className="profile-actions">
              {!isEditing ? (
                <>
                  <button 
                    className="edit-btn" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditing(true);
                    }}
                  >
                    ✏️ Chỉnh sửa hồ sơ
                  </button>
                  {user.role === "admin" && (
                    <button 
                      className="admin-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/admin/movies");
                      }}
                    >
                      ⚙️ Trang quản trị
                    </button>
                  )}
                  <button 
                    className="history-btn" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/lich-su");
                    }}
                  >
                    📺 Lịch sử xem
                  </button>
                  <button 
                    className="logout-btn" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    🚪 Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="save-btn" 
                    onClick={handleSubmit}
                    type="button"
                  >
                    💾 Lưu thay đổi
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleCancel();
                    }}
                    type="button"
                  >
                    ✕ Hủy
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Content - Info & Stats */}
          <div className="profile-content">
            {/* Edit Form */}
            {isEditing ? (
              <div className="edit-section">
                <h3>Chỉnh Sửa Thông Tin</h3>
                <div className="edit-form">
                  <div className="form-group">
                    <label>Tên người dùng *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Nhập tên mới"
                      minLength={2}
                      maxLength={50}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email (không thể thay đổi)</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="disabled-input"
                    />
                  </div>

                  <div className="form-note">
                    💡 <strong>Lưu ý:</strong> Email không thể thay đổi. Chỉ có thể cập nhật tên và avatar.
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="stats-section">
                  <h3>Thống Kê Xem Phim</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">🎬</div>
                      <div className="stat-content">
                        <span className="stat-number">{stats.totalWatched}</span>
                        <span className="stat-label">Phim đã xem</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">❤️</div>
                      <div className="stat-content">
                        <span className="stat-number">{stats.favoriteGenre}</span>
                        <span className="stat-label">Thể loại yêu thích</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon">🌍</div>
                      <div className="stat-content">
                        <span className="stat-number">{stats.favoriteCountry}</span>
                        <span className="stat-label">Quốc gia ưa thích</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="info-section">
                  <h3>Thông Tin Tài Khoản</h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Tên người dùng:</span>
                      <span className="info-value">{user.username}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{user.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Vai trò:</span>
                      <span className="info-value">
                        {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">ID tài khoản:</span>
                      <span className="info-value">#{user.id}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Truy Cập Nhanh</h3>
                  <div className="action-grid">
                    <button 
                      className="action-card"
                      onClick={() => navigate("/lich-su")}
                    >
                      <span className="action-icon">📺</span>
                      <span className="action-label">Lịch sử xem</span>
                    </button>
                    <button 
                      className="action-card"
                      onClick={() => navigate("/danh-sach")}
                    >
                      <span className="action-icon">🎬</span>
                      <span className="action-label">Khám phá phim</span>
                    </button>
                    <button 
                      className="action-card"
                      onClick={() => navigate("/gioi-thieu")}
                    >
                      <span className="action-icon">ℹ️</span>
                      <span className="action-label">Về chúng tôi</span>
                    </button>
                    <button 
                      className="action-card"
                      onClick={() => navigate("/lien-he")}
                    >
                      <span className="action-icon">📞</span>
                      <span className="action-label">Liên hệ</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;