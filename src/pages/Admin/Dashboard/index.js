import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";

const BASE_URL = "https://69538a2aa319a928023bc426.mockapi.io";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    nowShowing: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, usersRes] = await Promise.all([
          axios.get(`${BASE_URL}/movies`),
          axios.get(`${BASE_URL}/account`),
        ]);

        const movies = moviesRes.data || [];
        const users = usersRes.data || [];

        const nowShowing = movies.filter(
          (m) => m.videoUrl && m.videoUrl.trim() !== ""
        ).length;

        const allRatings = movies.flatMap((m) => m.ratings || []);

        const avgRating =
          allRatings.length > 0
            ? (
                allRatings.reduce((sum, r) => sum + Number(r), 0) /
                allRatings.length
              ).toFixed(1)
            : 0;

        setStats({
          totalMovies: movies.length,
          totalUsers: users.length,
          nowShowing,
          avgRating,
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="dashboard">
      <h2>Trang tổng quan</h2>
      <p>Chào mừng bạn đến với bảng điều khiển quản trị hệ thống Movie!</p>

      <div className="stats-row">
        <div className="stat-card" style={{ borderTopColor: "#4f46e5" }}>
          <div>
            <div className="stat-title">Tổng số phim</div>
            <div className="stat-value">{stats.totalMovies}</div>
          </div>
          <div className="stat-icon" style={{ background: "#4f46e5" }}>
            🎥
          </div>
        </div>

        <div className="stat-card" style={{ borderTopColor: "#10b981" }}>
          <div>
            <div className="stat-title">Người dùng</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-icon" style={{ background: "#10b981" }}>
            👥
          </div>
        </div>

        <div className="stat-card" style={{ borderTopColor: "#f59e0b" }}>
          <div>
            <div className="stat-title">Đang chiếu</div>
            <div className="stat-value">{stats.nowShowing}</div>
          </div>
          <div className="stat-icon" style={{ background: "#f59e0b" }}>
            🍿
          </div>
        </div>

        <div className="stat-card" style={{ borderTopColor: "#ef4444" }}>
          <div>
            <div className="stat-title">Đánh giá TB</div>
            <div className="stat-value">{stats.avgRating}⭐</div>
          </div>
          <div className="stat-icon" style={{ background: "#ef4444" }}>
            ❤️
          </div>
        </div>
      </div>
    </section>
  );
}
