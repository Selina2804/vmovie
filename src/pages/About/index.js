// src/pages/About/index.js
import React from "react";
import "./style.css";

function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <h1 className="about-title">Về Chúng Tôi</h1>
          <p className="about-subtitle">
            Nền tảng xem phim trực tuyến hàng đầu Việt Nam
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-content-wrapper">
            <div className="about-text">
              <h2 className="section-title">Sứ Mệnh Của Chúng Tôi</h2>
              <p>
                <strong>VMOVIE</strong> ra đời với mục tiêu mang đến trải nghiệm
                xem phim tuyệt vời nhất cho người dùng Việt Nam. Chúng tôi cam
                kết cung cấp kho phim phong phú, chất lượng cao với giao diện
                thân thiện và dễ sử dụng.
              </p>
              <p>
                Từ những bộ anime hành động đỉnh cao, phim bom tấn Hollywood đến
                các series truyền hình được yêu thích, VMOVIE luôn cập nhật và
                đa dạng hóa nội dung để phục vụ mọi sở thích của khán giả.
              </p>
            </div>
            <div className="about-image">
              <img
                src="https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Movie Experience"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features">
        <div className="about-container">
          <h2 className="section-title center">Tại Sao Chọn VMOVIE?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3>Kho Phim Khổng Lồ</h3>
              <p>
                Hàng ngàn bộ phim, anime và series từ khắp nơi trên thế giới,
                liên tục cập nhật mỗi ngày.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Chất Lượng Cao</h3>
              <p>
                Hỗ trợ đa dạng độ phân giải từ HD đến 4K, âm thanh sống động cho
                trải nghiệm điện ảnh tuyệt vời.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Tốc Độ Nhanh</h3>
              <p>
                Công nghệ streaming hiện đại, tải nhanh, xem mượt mà không giật
                lag trên mọi thiết bị.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>An Toàn & Bảo Mật</h3>
              <p>
                Thông tin người dùng được bảo vệ tuyệt đối với hệ thống mã hóa
                tiên tiến.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Đa Nền Tảng</h3>
              <p>
                Xem mọi lúc, mọi nơi trên máy tính, điện thoại, tablet với giao
                diện responsive.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💝</div>
              <h3>Miễn Phí</h3>
              <p>
                Truy cập không giới hạn các bộ phim yêu thích mà không tốn bất
                kỳ chi phí nào.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="about-container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3 className="stat-number">10,000+</h3>
              <p className="stat-label">Bộ Phim</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">500K+</h3>
              <p className="stat-label">Người Dùng</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">1M+</h3>
              <p className="stat-label">Lượt Xem/Tháng</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">24/7</h3>
              <p className="stat-label">Hỗ Trợ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section">
        <div className="about-container">
          <h2 className="section-title center">Đội Ngũ Của Chúng Tôi</h2>
          <p className="team-intro">
            VMOVIE được vận hành bởi đội ngũ đam mê điện ảnh, luôn nỗ lực mang
            đến trải nghiệm tốt nhất cho người dùng.
          </p>
          <div className="team-values">
            <div className="value-item">
              <h4>💡 Sáng Tạo</h4>
              <p>Không ngừng đổi mới và cải tiến</p>
            </div>
            <div className="value-item">
              <h4>🤝 Tận Tâm</h4>
              <p>Đặt trải nghiệm người dùng lên hàng đầu</p>
            </div>
            <div className="value-item">
              <h4>🎯 Chuyên Nghiệp</h4>
              <p>Chất lượng là ưu tiên số một</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="about-cta">
        <div className="about-container">
          <h2>Bắt Đầu Trải Nghiệm Ngay Hôm Nay</h2>
          <p>
            Tham gia cộng đồng hàng trăm nghìn người yêu phim trên toàn quốc
          </p>
          <div className="cta-buttons">
            <button className="cta-btn primary" onClick={() => window.location.href = '/danh-sach'}>
              Khám Phá Phim
            </button>
            <button className="cta-btn secondary" onClick={() => window.location.href = '/register'}>
              Đăng Ký Miễn Phí
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;