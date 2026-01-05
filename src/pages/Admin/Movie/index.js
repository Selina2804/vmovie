// src/pages/Admin/Movie/index.js - FIX NHẬP SỐ TẬP & CẢNH BÁO XÓA
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Movie.css";

const API_URL = "https://69538a2aa319a928023bc426.mockapi.io/movies";
const YOUTUBE_API_KEY = "AIzaSyCcud5ItrZ4x6eS_XyTMkdYwsQEVinEZQk";

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
    trailerUrl: "",
    description: "",
    movieType: "single",
    totalEpisodes: 1,
    episodes: [],
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);
  const [currentEpisodeEdit, setCurrentEpisodeEdit] = useState(1);

  const extractYouTubeID = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const parseYouTubeDuration = (duration) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
    return `${totalMinutes} phút`;
  };

  const extractYearFromVideo = (snippet) => {
    if (snippet.tags) {
      for (let tag of snippet.tags) {
        const yearMatch = tag.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) return yearMatch[0];
      }
    }
    if (snippet.description) {
      const yearMatch = snippet.description.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) return yearMatch[0];
    }
    if (snippet.publishedAt) {
      return new Date(snippet.publishedAt).getFullYear().toString();
    }
    return "";
  };

  const extractCountryFromVideo = (snippet) => {
    const countries = [
      "Mỹ", "USA", "United States", "America",
      "Hàn Quốc", "Korea", "South Korea",
      "Nhật Bản", "Japan",
      "Trung Quốc", "China",
      "Việt Nam", "Vietnam",
      "Thái Lan", "Thailand",
      "Anh", "UK", "United Kingdom", "Britain",
      "Pháp", "France",
      "Đức", "Germany",
      "Nga", "Russia",
      "Ấn Độ", "India",
      "Úc", "Australia",
      "Canada",
      "Mexico",
      "Brazil",
      "Tây Ban Nha", "Spain",
      "Ý", "Italy"
    ];

    if (snippet.tags) {
      for (let tag of snippet.tags) {
        for (let country of countries) {
          if (tag.toLowerCase().includes(country.toLowerCase())) {
            return country.includes("USA") || country.includes("United States") || country.includes("America") ? "Mỹ" :
              country.includes("Korea") ? "Hàn Quốc" :
                country.includes("Japan") ? "Nhật Bản" :
                  country.includes("UK") || country.includes("United Kingdom") || country.includes("Britain") ? "Anh" :
                    country;
          }
        }
      }
    }

    if (snippet.description) {
      for (let country of countries) {
        if (snippet.description.toLowerCase().includes(country.toLowerCase())) {
          return country.includes("USA") || country.includes("United States") || country.includes("America") ? "Mỹ" :
            country.includes("Korea") ? "Hàn Quốc" :
              country.includes("Japan") ? "Nhật Bản" :
                country.includes("UK") || country.includes("United Kingdom") || country.includes("Britain") ? "Anh" :
                  country;
        }
      }
    }

    return "";
  };

  const fetchYouTubeDuration = async (url) => {
    const videoId = extractYouTubeID(url);
    if (!videoId) return null;

    try {
      setIsLoadingDuration(true);
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,snippet&key=${YOUTUBE_API_KEY}`
      );

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        const duration = parseYouTubeDuration(video.contentDetails.duration);
        const thumbnail = video.snippet.thumbnails.maxres?.url ||
          video.snippet.thumbnails.high?.url ||
          video.snippet.thumbnails.medium?.url;
        const year = extractYearFromVideo(video.snippet);
        const country = extractCountryFromVideo(video.snippet);

        return { duration, thumbnail, year, country };
      }
      return null;
    } catch (error) {
      console.error("YouTube API Error:", error);
      return null;
    } finally {
      setIsLoadingDuration(false);
    }
  };

  const handleVideoUrlChange = async (e) => {
    const url = e.target.value;
    setForm((prev) => ({ ...prev, videoUrl: url }));

    if (errors.videoUrl) {
      setErrors((prev) => ({ ...prev, videoUrl: "" }));
    }

    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      const data = await fetchYouTubeDuration(url);

      if (data) {
        setForm((prev) => ({
          ...prev,
          duration: data.duration,
          year: data.year || prev.year,
          country: data.country || prev.country,
          image: data.thumbnail || prev.image,
        }));

        const infoLines = [
          `✅ <strong>Thời lượng:</strong> ${data.duration}`,
          data.year ? `✅ <strong>Năm:</strong> ${data.year}` : '',
          data.country ? `✅ <strong>Quốc gia:</strong> ${data.country}` : '',
          data.thumbnail ? '✅ <strong>Ảnh poster:</strong> Đã lấy từ YouTube' : ''
        ].filter(Boolean);

        Swal.fire({
          icon: "success",
          title: "Đã tự động điền!",
          html: `<div style="text-align: left;">${infoLines.join('<br>')}</div>`,
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Không lấy được thông tin",
          text: "Vui lòng kiểm tra lại link YouTube hoặc nhập thủ công",
          timer: 3000,
        });
      }
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(API_URL);
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
      case "totalEpisodes":
        if (form.movieType === "series") {
          if (!value || value < 1) error = "Phim bộ phải có ít nhất 1 tập";
          if (value > 1000) error = "Số tập không hợp lý";
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
      case "trailerUrl":
        if (value && !/^https?:\/\/.+/i.test(value))
          error = "URL trailer không hợp lệ. Phải bắt đầu bằng http:// hoặc https://";
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleMovieTypeChange = (e) => {
    const movieType = e.target.value;
    const newTotalEpisodes = movieType === "single" ? 1 : form.totalEpisodes || 1;

    setForm((prev) => ({
      ...prev,
      movieType,
      totalEpisodes: newTotalEpisodes,
      episodes: movieType === "series"
        ? Array.from({ length: newTotalEpisodes }, (_, i) => ({
          episodeNumber: i + 1,
          videoUrl: prev.episodes?.[i]?.videoUrl || ""
        }))
        : []
    }));

    setCurrentEpisodeEdit(1);
  };

  // ⭐⭐⭐ FIX CHÍNH - XỬ LÝ THAY ĐỔI SỐ TẬP CÓ CẢNH BÁO ⭐⭐⭐
  const handleTotalEpisodesChange = async (e) => {
    const inputValue = e.target.value;

    // ✅ Cho phép xóa hết để gõ lại
    if (inputValue === "") {
      setForm((prev) => ({ ...prev, totalEpisodes: "" }));
      return;
    }

    const newTotal = parseInt(inputValue);

    // Validate số hợp lệ
    if (isNaN(newTotal) || newTotal < 1) {
      return;
    }

    const currentTotal = form.episodes.length;

    // ⭐ NÊU GIẢM SỐ TẬP → KIỂM TRA CÓ TẬP NÀO ĐÃ CÓ LINK BỊ XÓA KHÔNG
    if (newTotal < currentTotal) {
      // Lấy danh sách tập sẽ bị xóa
      const episodesWillBeDeleted = form.episodes.slice(newTotal);

      // Kiểm tra xem có tập nào đã có link không
      const episodesWithLinks = episodesWillBeDeleted.filter(ep => ep.videoUrl.trim() !== "");

      if (episodesWithLinks.length > 0) {
        // ⚠️ CÓ TẬP ĐÃ CÓ LINK → CẢNH BÁO
        const episodeNumbers = episodesWithLinks.map(ep => ep.episodeNumber).join(", ");

        const result = await Swal.fire({
          title: '⚠️ Cảnh báo!',
          html: `
            <div style="text-align: left;">
              <p>Bạn đang giảm số tập từ <strong>${currentTotal}</strong> xuống <strong>${newTotal}</strong>.</p>
              <p style="color: #f59e0b; margin-top: 10px;">
                <strong>Các tập sau đã có link video và sẽ bị xóa:</strong>
              </p>
              <p style="color: #ef4444; font-weight: 600;">
                Tập: ${episodeNumbers}
              </p>
              <p style="margin-top: 10px;">Bạn có chắc chắn muốn tiếp tục?</p>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Xóa các tập này',
          cancelButtonText: 'Hủy bỏ',
          width: '500px'
        });

        if (!result.isConfirmed) {
          // User từ chối → không làm gì cả
          return;
        }
      }
    }

    // ✅ Thực hiện thay đổi số tập
    setForm((prev) => {
      const currentEpisodes = prev.episodes || [];
      const newEpisodes = Array.from({ length: newTotal }, (_, i) => ({
        episodeNumber: i + 1,
        videoUrl: currentEpisodes[i]?.videoUrl || ""
      }));

      return {
        ...prev,
        totalEpisodes: newTotal,
        episodes: newEpisodes
      };
    });

    if (currentEpisodeEdit > newTotal) {
      setCurrentEpisodeEdit(newTotal);
    }
  };

  const handleEpisodeUrlChange = (episodeNum, url) => {
    setForm((prev) => ({
      ...prev,
      episodes: prev.episodes.map(ep =>
        ep.episodeNumber === episodeNum
          ? { ...ep, videoUrl: url }
          : ep
      )
    }));
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;

    // ⭐ Nếu số tập bị để trống → tự động đổi về 1
    if (name === "totalEpisodes" && value === "") {
      setForm((prev) => ({
        ...prev,
        totalEpisodes: 1,
        episodes: [{ episodeNumber: 1, videoUrl: prev.episodes?.[0]?.videoUrl || "" }]
      }));
      return;
    }

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["title", "genre", "country", "duration", "year"];

    requiredFields.forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });

    if (form.movieType === "series") {
      const episodeError = validateField("totalEpisodes", form.totalEpisodes);
      if (episodeError) newErrors.totalEpisodes = episodeError;

      // ✅ ĐÃ XÓA PHẦN KIỂM TRA BẮT BUỘC ĐIỀN LINK VIDEO
      // Bây giờ có thể lưu phim bộ mà không cần điền link video ngay

    } else {
      if (!form.videoUrl.trim()) {
        newErrors.videoUrl = "Link video là bắt buộc";
      }
    }

    if (form.image) {
      const imageError = validateField("image", form.image);
      if (imageError) newErrors.image = imageError;
    }

    if (form.trailerUrl) {
      const trailerError = validateField("trailerUrl", form.trailerUrl);
      if (trailerError) newErrors.trailerUrl = trailerError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      const res = await axios.post(API_URL, form);
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

  const handleEdit = (movie) => {
    setForm({
      ...movie,
      year: movie.year?.toString() || "",
      duration: movie.duration?.toString() || "",
      trailerUrl: movie.trailerUrl || "",
      movieType: movie.movieType || "single",
      totalEpisodes: movie.totalEpisodes || 1,
      episodes: movie.episodes || [],
    });
    setIsEditing(true);
    setShowModal(true);
    setErrors({});
    setCurrentEpisodeEdit(1);
  };

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
      const res = await axios.put(`${API_URL}/${form.id}`, form);
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
        await axios.delete(`${API_URL}/${id}`);
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
      trailerUrl: "",
      description: "",
      movieType: "single",
      totalEpisodes: 1,
      episodes: [],
    });
    setErrors({});
    setCurrentEpisodeEdit(1);
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditing ? "Chỉnh sửa phim" : "Thêm phim mới"}</h2>
            <form className="movie-form" onSubmit={(e) => e.preventDefault()} autoComplete="off">
              <div className="form-content">
                <div className="form-left">
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

                  {form.trailerUrl && (
                    <div className="trailer-preview-container" style={{ marginTop: '15px' }}>
                      <label className="field-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', color: '#4ade80' }}>
                        ✓ Preview Trailer
                      </label>
                      <video
                        src={form.trailerUrl}
                        controls
                        muted
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          maxHeight: '200px',
                          objectFit: 'cover',
                          border: '2px solid #4ade80'
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          setErrors((prev) => ({
                            ...prev,
                            trailerUrl: "Không thể load trailer từ URL này",
                          }));
                        }}
                      />
                      <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px', textAlign: 'center' }}>
                        ✓ Trailer sẽ tự động phát khi user hover vào poster
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-right">
                  <div className="form-grid">
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
                      {errors.title && <div className="error-message">{errors.title}</div>}
                    </div>

                    <div className="input-group">
                      <label className="field-label">Tên tiếng Anh</label>
                      <input
                        name="engTitle"
                        placeholder="Nhập tên tiếng Anh..."
                        value={form.engTitle}
                        onChange={handleInputChange}
                        className={errors.engTitle ? "error" : ""}
                      />
                      {errors.engTitle && <div className="error-message">{errors.engTitle}</div>}
                    </div>

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
                      {errors.genre && <div className="error-message">{errors.genre}</div>}
                    </div>

                    <div className="form-row-inline">
                      <div className="input-group">
                        <label className="field-label">
                          Loại phim <span className="required">*</span>
                        </label>
                        <select
                          name="movieType"
                          value={form.movieType}
                          onChange={handleMovieTypeChange}
                          className="small-input"
                          style={{ padding: '10px' }}
                        >
                          <option value="single">🎬 Phim lẻ</option>
                          <option value="series">📺 Phim bộ</option>
                        </select>
                      </div>

                      {form.movieType === "series" && (
                        <div className="input-group">
                          <label className="field-label">
                            Số tập <span className="required">*</span>
                          </label>
                          <input
                            type="number"
                            name="totalEpisodes"
                            placeholder="VD: 16"
                            value={form.totalEpisodes}
                            onChange={handleTotalEpisodesChange}
                            onBlur={handleInputBlur}
                            className={`small-input ${errors.totalEpisodes ? "error" : ""}`}
                            min="1"
                          />
                          {errors.totalEpisodes && (
                            <div className="error-message">{errors.totalEpisodes}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {form.movieType === "single" ? (
                      <div className="input-group">
                        <label className="field-label">
                          🎥 URL video (YouTube/Cloud) <span className="required">*</span>
                          {isLoadingDuration && (
                            <span style={{ color: '#ffa500', fontSize: '12px', marginLeft: '8px' }}>
                              ⏳ Đang lấy thông tin...
                            </span>
                          )}
                        </label>
                        <input
                          name="videoUrl"
                          placeholder="https://youtube.com/watch?v=... hoặc cloud link"
                          value={form.videoUrl}
                          onChange={handleVideoUrlChange}
                          className={errors.videoUrl ? "error" : ""}
                        />
                        {errors.videoUrl && <div className="error-message">{errors.videoUrl}</div>}
                        <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '4px' }}>
                          💡 Nhập link YouTube → tự động lấy thời lượng, năm, quốc gia & ảnh poster
                        </div>
                      </div>
                    ) : (
                      <div className="input-group">
                        <label className="field-label">
                          📺 Link video cho từng tập
                        </label>
                        <div className="episode-tabs">
                      {form.episodes.map((ep) => (
                        <button
                          key={ep.episodeNumber}
                          type="button"
                          className={`episode-tab ${currentEpisodeEdit === ep.episodeNumber ? 'active' : ''}`}
                          onClick={() => setCurrentEpisodeEdit(ep.episodeNumber)}
                        >
                          Tập {ep.episodeNumber}
                          {ep.videoUrl && <span className="check-icon">✓</span>}
                        </button>
                      ))}
                    </div>

                    <input
                      placeholder={`Nhập link video tập ${currentEpisodeEdit}...`}
                      value={form.episodes.find(ep => ep.episodeNumber === currentEpisodeEdit)?.videoUrl || ""}
                      onChange={(e) => handleEpisodeUrlChange(currentEpisodeEdit, e.target.value)}
                      style={{ marginTop: '10px' }}
                    />

                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                      💡 Nhấn tab "Tập X" để nhập link cho từng tập. Dấu ✓ = đã có link. Có thể điền sau.
                    </div>
                  </div>
                )}

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
                    {errors.duration && <div className="error-message">{errors.duration}</div>}
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
                    {errors.year && <div className="error-message">{errors.year}</div>}
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
                    {errors.country && <div className="error-message">{errors.country}</div>}
                  </div>
                </div>

                <div className="input-group">
                  <label className="field-label">URL ảnh từ Internet</label>
                  <input
                    name="image"
                    placeholder="https://example.com/image.jpg (hoặc để trống nếu dùng ảnh YouTube)"
                    value={form.image}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={errors.image ? "error" : ""}
                  />
                  {errors.image && <div className="error-message">{errors.image}</div>}
                </div>

                <div className="input-group">
                  <label className="field-label">
                    🎬 URL Trailer
                    <span style={{ color: '#ffa500', fontSize: '12px', marginLeft: '8px' }}>
                      (Hiển thị khi hover)
                    </span>
                  </label>
                  <input
                    name="trailerUrl"
                    placeholder="https://example.com/trailer.mp4 (hoặc YouTube, Drive, Dropbox...)"
                    value={form.trailerUrl}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={errors.trailerUrl ? "error" : ""}
                  />
                  {errors.trailerUrl && <div className="error-message">{errors.trailerUrl}</div>}
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                    💡 Hỗ trợ: mp4, webm, ogg, YouTube, Google Drive, Dropbox, hoặc bất kỳ link video nào
                  </div>
                </div>

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
                  {errors.description && <div className="error-message">{errors.description}</div>}
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

  <div className="movie-table">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Ảnh</th>
          <th>Tên phim</th>
          <th>Loại</th>
          <th>Thể loại</th>
          <th>Quốc gia</th>
          <th>Năm</th>
          <th>Video</th>
          <th>Trailer</th>
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
            <td>
              {m.movieType === "series" ? (
                <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>
                  📺 Bộ ({m.totalEpisodes} tập)
                </span>
              ) : (
                <span style={{ color: '#888', fontSize: '12px' }}>🎬 Lẻ</span>
              )}
            </td>
            <td>{m.genre}</td>
            <td>{m.country}</td>
            <td>{m.year}</td>
            <td>
              {m.movieType === "series" ? (
                <span style={{ color: '#4ade80', fontSize: '11px' }}>
                  {m.episodes?.filter(ep => ep.videoUrl).length || 0}/{m.totalEpisodes} tập
                </span>
              ) : (
                m.videoUrl && (
                  <a href={m.videoUrl} target="_blank" rel="noopener noreferrer" className="watch-link">
                    Xem
                  </a>
                )
              )}
            </td>
            <td>
              {m.trailerUrl ? (
                <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>✓ Có</span>
              ) : (
                <span style={{ color: '#888', fontSize: '12px' }}>-</span>
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
            <td colSpan={10} className="no-movie">
              Không có phim nào
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  <style>{`
    .episode-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }

    .episode-tab {
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .episode-tab:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .episode-tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
      color: #fff;
      font-weight: 600;
    }

    .episode-tab .check-icon {
      color: #4ade80;
      font-size: 14px;
      font-weight: bold;
    }

    .episode-tab.active .check-icon {
      color: #fff;
    }
  `}</style>
</div>
);
}