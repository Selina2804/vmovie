// src/components/ReportModal/index.js
import React, { useState } from "react";
import { useAuth } from "../../store/useAuth";
import "./style.css";

const ReportModal = ({ isOpen, onClose, movieData }) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const reportTypes = [
    { value: "video_error", label: "🎬 Video không phát được" },
    { value: "subtitle_error", label: "📝 Lỗi phụ đề" },
    { value: "wrong_content", label: "❌ Sai nội dung phim" },
    { value: "quality_issue", label: "📺 Chất lượng kém" },
    { value: "other", label: "💬 Lỗi khác" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!user) {
      setErrorMessage("⚠️ Bạn cần đăng nhập để báo lỗi!");
      return;
    }

    if (!reportType) {
      setErrorMessage("⚠️ Vui lòng chọn loại lỗi!");
      return;
    }

    setIsSubmitting(true);

    // Tạo report data
    const reportData = {
      movieId: movieData.id,
      movieTitle: movieData.title,
      reportType,
      description,
      userId: user.id,
      userName: user.name,
      reportedAt: new Date().toISOString(),
    };

    try {
      // Lưu vào localStorage (hoặc gửi API)
      const reportsKey = "movie_reports";
      const savedReports = localStorage.getItem(reportsKey);
      let reports = savedReports ? JSON.parse(savedReports) : [];

      reports.push(reportData);
      localStorage.setItem(reportsKey, JSON.stringify(reports));

      // Hiển thị thông báo thành công
      setSuccessMessage("✅ Đã gửi báo cáo thành công! Cảm ơn bạn đã đóng góp.");

      // Reset form sau 2 giây và đóng modal
      setTimeout(() => {
        setReportType("");
        setDescription("");
        setSuccessMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      setErrorMessage("❌ Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="report-modal-header">
          <h2>🚨 Báo Lỗi Phim</h2>
          <button className="report-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="report-modal-body">
          {/* Movie Info */}
          <div className="report-movie-info">
            <img src={movieData.image} alt={movieData.title} />
            <div>
              <h3>{movieData.title}</h3>
              <p>{movieData.engTitle}</p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="report-error-message">{errorMessage}</div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="report-success-message">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Chọn loại lỗi */}
            <div className="report-form-group">
              <label>Loại lỗi *</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">-- Chọn loại lỗi --</option>
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mô tả chi tiết */}
            <div className="report-form-group">
              <label>Mô tả chi tiết (tùy chọn)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả thêm về lỗi bạn gặp phải..."
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              ></textarea>
              <span className="report-char-count">
                {description.length}/500
              </span>
            </div>

            {/* Buttons */}
            <div className="report-form-actions">
              <button
                type="button"
                className="report-btn report-btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="report-btn report-btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;