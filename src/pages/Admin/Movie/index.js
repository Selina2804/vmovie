import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Movie.css";

export default function MovieManager() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    engTitle: "",
    genre: "",
    country: "",
    duration: "",
    year: "",
    image: "",
    videoUrl: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Lấy danh sách phim
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(
          "https://68faff8894ec96066024411b.mockapi.io/movies"
        );
        setMovies(res.data);
      } catch (err) {
        console.error("Error fetching movies:", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải danh sách phim",
          confirmButtonText: "OK",
        });
      }
    };
    fetchMovies();
  }, []);

  // Validation rules
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "title":
        if (!value.trim()) error = "Tên phim là bắt buộc";
        else if (value.trim().length < 2)
          error = "Tên phim phải có ít nhất 2 ký tự";
        break;
      case "genre":
        if (!value.trim()) error = "Thể loại là bắt buộc";
        break;
      case "country":
        if (!value.trim()) error = "Quốc gia là bắt buộc";
        break;
      case "duration":
        if (!value.trim()) error = "Thời lượng là bắt buộc";
        break;
      case "year":
        if (!value.trim()) error = "Năm sản xuất là bắt buộc";
        else if (!/^\d{4}$/.test(value)) error = "Năm phải có 4 chữ số";
        else {
          const yearNum = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (yearNum < 1900 || yearNum > currentYear + 1)
            error = `Năm phải từ 1900 đến ${currentYear + 1}`;
        }
        break;
      case "image":
        if (
          value.trim() &&
          !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|bmp|avif|svg)(\?.*)?$/i.test(
            value
          )
        ) {
          error =
            "URL ảnh không hợp lệ. Chỉ hỗ trợ: jpg, jpeg, png, webp, gif, bmp, avif, svg";
        }
        break;
      case "videoUrl":
        if (value && !/^https?:\/\/.+/i.test(value))
          error = "URL video không hợp lệ";
        break;
      default:
        break;
    }

    return error;
  };

  // Real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Validate on blur
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Validate all fields before submit
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["title", "genre", "country", "duration", "year"];

    requiredFields.forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });

    if (form.image) {
      const imageError = validateField("image", form.image);
      if (imageError) newErrors.image = imageError;
    }

    if (form.videoUrl) {
      const videoError = validateField("videoUrl", form.videoUrl);
      if (videoError) newErrors.videoUrl = videoError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Thêm phim
  const handleAdd = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Thông tin không hợp lệ",
        text: "Vui lòng kiểm tra lại các trường thông tin được đánh dấu *",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const res = await axios.post(
        "https://68faff8894ec96066024411b.mockapi.io/movies",
        form
      );
      setMovies([...movies, res.data]);
      resetForm();
      setShowModal(false);

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Đã thêm phim mới",
        confirmButtonText: "OK",
        timer: 2000,
      });
    } catch (err) {
      console.error("Error adding movie:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể thêm phim",
        confirmButtonText: "OK",
      });
    }
  };

  // Chỉnh sửa phim
  const handleEdit = (movie) => {
    setForm(movie);
    setIsEditing(true);
    setShowModal(true);
    setErrors({});
  };

  // Cập nhật phim
  const handleUpdate = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Thông tin không hợp lệ",
        text: "Vui lòng kiểm tra lại các trường thông tin được đánh dấu *",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const res = await axios.put(
        `https://68faff8894ec96066024411b.mockapi.io/movies/${form.id}`,
        form
      );
      setMovies(movies.map((m) => (m.id === form.id ? res.data : m)));
      resetForm();
      setIsEditing(false);
      setShowModal(false);

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Đã cập nhật thông tin phim",
        confirmButtonText: "OK",
        timer: 2000,
      });
    } catch (err) {
      console.error("Error updating movie:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể cập nhật phim",
        confirmButtonText: "OK",
      });
    }
  };

  // Xóa phim
  const handleDelete = async (id) => {
    const movieToDelete = movies.find((m) => m.id === id);

    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Bạn muốn xóa phim "${movieToDelete.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `https://68faff8894ec96066024411b.mockapi.io/movies/${id}`
        );
        setMovies(movies.filter((m) => m.id !== id));

        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Phim đã được xóa thành công",
          confirmButtonText: "OK",
          timer: 2000,
        });
      } catch (err) {
        console.error("Error deleting movie:", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể xóa phim",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      engTitle: "",
      genre: "",
      country: "",
      duration: "",
      year: "",
      image: "",
      videoUrl: "",
      description: "",
    });
    setErrors({});
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
    setIsEditing(false);
  };

  const hasErrors = Object.values(errors).some((error) => error !== "");

  return (
    <div className="movie-manager">
      <h1>Quản Lý Danh Sách Phim</h1>
      <div className="top-bar">
        <button className="add-btn" onClick={() => setShowModal(true)}>
          Thêm phim mới
        </button>
        <p className="movie-count">
          Tổng số phim: <span>{movies.length}</span>
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditing ? "Chỉnh sửa phim" : "Thêm phim mới"}</h2>
            <form
              className="movie-form"
              onSubmit={(e) => e.preventDefault()}
              autoComplete="off"
            >
              <div className="form-content">
                <div className="form-left">
                  {/* Preview image */}
                  <div className="image-preview-container">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Preview"
                        className="preview"
                        onError={(e) => {
                          e.target.style.display = "none";
                          setErrors((prev) => ({
                            ...prev,
                            image: "Không thể tải ảnh từ URL này",
                          }));
                        }}
                      />
                    ) : (
                      <div className="preview-placeholder">
                        <div className="placeholder-text">Chưa có ảnh poster</div>
                        <div className="placeholder-subtext">Ảnh là tùy chọn</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-right">
                  <div className="form-grid">
                    {/* Title */}
                    <div className="input-group">
                      <label className="field-label">
                        Tên phim <span className="required">*</span>
                      </label>
                      <input
                        name="title"
                        placeholder="Nhập tên phim..."
                        value={form.title}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={errors.title ? "error" : ""}
                      />
                      {errors.title && (
                        <div className="error-message">{errors.title}</div>
                      )}
                    </div>

                    {/* English Title */}
                    <div className="input-group">
                      <label className="field-label">Tên tiếng Anh</label>
                      <input
                        name="engTitle"
                        placeholder="Nhập tên tiếng Anh..."
                        value={form.engTitle}
                        onChange={handleInputChange}
                        className={errors.engTitle ? "error" : ""}
                      />
                      {errors.engTitle && (
                        <div className="error-message">{errors.engTitle}</div>
                      )}
                    </div>

                    {/* Genre */}
                    <div className="input-group">
                      <label className="field-label">
                        Thể loại <span className="required">*</span>
                      </label>
                      <input
                        name="genre"
                        placeholder="Nhập thể loại..."
                        value={form.genre}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={errors.genre ? "error" : ""}
                      />
                      {errors.genre && (
                        <div className="error-message">{errors.genre}</div>
                      )}
                    </div>

                    {/* Duration, Year, Country */}
                    <div className="form-row-inline">
                      <div className="input-group">
                        <label className="field-label">
                          Thời lượng <span className="required">*</span>
                        </label>
                        <input
                          className={`small-input ${errors.duration ? "error" : ""}`}
                          name="duration"
                          placeholder="VD: 120 phút"
                          value={form.duration}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                        />
                        {errors.duration && (
                          <div className="error-message">{errors.duration}</div>
                        )}
                      </div>
                      <div className="input-group">
                        <label className="field-label">
                          Năm <span className="required">*</span>
                        </label>
                        <input
                          className={`small-input ${errors.year ? "error" : ""}`}
                          name="year"
                          placeholder="VD: 2024"
                          value={form.year}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                        />
                        {errors.year && (
                          <div className="error-message">{errors.year}</div>
                        )}
                      </div>
                      <div className="input-group">
                        <label className="field-label">
                          Quốc gia <span className="required">*</span>
                        </label>
                        <input
                          className={`small-input ${errors.country ? "error" : ""}`}
                          name="country"
                          placeholder="Nhập quốc gia..."
                          value={form.country}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                        />
                        {errors.country && (
                          <div className="error-message">{errors.country}</div>
                        )}
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="input-group">
                      <label className="field-label">URL ảnh từ Internet</label>
                      <input
                        name="image"
                        placeholder="https://example.com/image.jpg"
                        value={form.image}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className={errors.image ? "error" : ""}
                      />
                      {errors.image && (
                        <div className="error-message">{errors.image}</div>
                      )}
                    </div>

                    {/* Video URL */}
                    <div className="input-group">
                      <label className="field-label">URL video (Cloud/YouTube)</label>
                      <input
                        name="videoUrl"
                        placeholder="https://your-cloud-link/video.mp4"
                        value={form.videoUrl}
                        onChange={handleInputChange}
                        className={errors.videoUrl ? "error" : ""}
                      />
                      {errors.videoUrl && (
                        <div className="error-message">{errors.videoUrl}</div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="input-group">
                      <label className="field-label">Mô tả phim</label>
                      <textarea
                        name="description"
                        placeholder="Nhập mô tả về phim..."
                        value={form.description}
                        onChange={handleInputChange}
                        className={errors.description ? "error" : ""}
                        rows="3"
                      />
                      {errors.description && (
                        <div className="error-message">{errors.description}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-buttons">
                    {isEditing ? (
                      <button
                        className={`save-btn ${hasErrors ? "disabled" : ""}`}
                        onClick={handleUpdate}
                        disabled={hasErrors}
                      >
                        Cập nhật phim
                      </button>
                    ) : (
                      <button
                        className={`save-btn ${hasErrors ? "disabled" : ""}`}
                        onClick={handleAdd}
                        disabled={hasErrors}
                      >
                        Thêm phim mới
                      </button>
                    )}
                    <button type="button" className="cancel-btn" onClick={closeModal}>
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách phim */}
      <div className="movie-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Ảnh</th>
              <th>Tên phim</th>
              <th>Thể loại</th>
              <th>Quốc gia</th>
              <th>Thời lượng</th>
              <th>Năm</th>
              <th>Video</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m, i) => (
              <tr key={m.id}>
                <td>{i + 1}</td>
                <td>
                  {m.image && (
                    <img
                      src={m.image}
                      alt={m.title}
                      className="poster"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                </td>
                <td className="title-cell">
                  <strong>{m.title}</strong>
                  {m.engTitle && <div className="eng-title">{m.engTitle}</div>}
                </td>
                <td>{m.genre}</td>
                <td>{m.country}</td>
                <td>{m.duration}</td>
                <td>{m.year}</td>
                <td>
                  {m.videoUrl && (
                    <a href={m.videoUrl} target="_blank" rel="noopener noreferrer" className="watch-link">
                      Xem
                    </a>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(m)}>
                      Sửa
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(m.id)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {movies.length === 0 && (
              <tr>
                <td colSpan={9} className="no-movie">
                  Không có phim nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
