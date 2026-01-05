// src/pages/Contact/index.js
import React, { useState } from "react";
import "./style.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý gửi form ở đây (có thể gọi API)
    console.log("Form submitted:", formData);
    setSubmitted(true);

    // Reset form sau 3 giây
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content">
          <h1 className="contact-title">Liên Hệ Với Chúng Tôi</h1>
          <p className="contact-subtitle">
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-wrapper">
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Thông Tin Liên Hệ</h2>
              <p className="contact-intro">
                Bạn có câu hỏi, góp ý hoặc cần hỗ trợ? Hãy liên hệ với chúng tôi
                qua các kênh dưới đây hoặc điền form bên cạnh.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div className="method-content">
                    <h3>Email</h3>
                    <p>support@vmovie.vn</p>
                    <p>info@vmovie.vn</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📱</div>
                  <div className="method-content">
                    <h3>Điện Thoại</h3>
                    <p>+84 123 456 789</p>
                    <p>Hotline: 1900 xxxx</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📍</div>
                  <div className="method-content">
                    <h3>Địa Chỉ</h3>
                    <p>123 Đường ABC, Quận 1</p>
                    <p>TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">⏰</div>
                  <div className="method-content">
                    <h3>Giờ Làm Việc</h3>
                    <p>Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                    <p>Thứ 7 - CN: 9:00 - 16:00</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-section">
                <h3>Kết Nối Với Chúng Tôi</h3>
                <div className="social-links">
                  <a href="#" className="social-btn facebook">
                    <i className="fab fa-facebook-f"></i> Facebook
                  </a>
                  <a href="#" className="social-btn youtube">
                    <i className="fab fa-youtube"></i> YouTube
                  </a>
                  <a href="#" className="social-btn instagram">
                    <i className="fab fa-instagram"></i> Instagram
                  </a>
                  <a href="#" className="social-btn twitter">
                    <i className="fab fa-twitter"></i> Twitter
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <h2>Gửi Tin Nhắn</h2>
              {submitted ? (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h3>Cảm ơn bạn!</h3>
                  <p>Tin nhắn của bạn đã được gửi thành công.</p>
                  <p>Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Họ và Tên *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nhập họ tên của bạn"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Tiêu Đề *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Chủ đề liên hệ"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Nội Dung *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-btn">
                    Gửi Tin Nhắn
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="contact-container">
          <h2 className="section-title">Câu Hỏi Thường Gặp</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>🎬 Làm sao để xem phim?</h3>
              <p>
                Bạn chỉ cần đăng ký tài khoản miễn phí, sau đó truy cập vào danh
                sách phim và chọn phim muốn xem. Không cần thanh toán!
              </p>
            </div>

            <div className="faq-item">
              <h3>💳 Có mất phí không?</h3>
              <p>
                VMOVIE hoàn toàn MIỄN PHÍ! Bạn có thể xem không giới hạn mà không
                cần trả bất kỳ chi phí nào.
              </p>
            </div>

            <div className="faq-item">
              <h3>📱 Xem trên thiết bị nào?</h3>
              <p>
                Bạn có thể xem trên máy tính, laptop, điện thoại, tablet. Website
                tương thích với mọi thiết bị.
              </p>
            </div>

            <div className="faq-item">
              <h3>🔄 Phim có được cập nhật không?</h3>
              <p>
                Chúng tôi cập nhật phim mới hàng ngày, bao gồm cả phim bom tấn và
                anime hot nhất.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;