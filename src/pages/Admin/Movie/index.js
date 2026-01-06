// src/pages/Admin/Movie/index.js - FULL CODE với Phim lẻ nhiều phần & Phim bộ nhiều season
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
    
    // Phim lẻ nhiều phần
    hasParts: false,
    totalParts: 1,
    parts: [],
    
    // Phim bộ nhiều season
    totalSeasons: 1,
    seasons: [],
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);
  
  // State quản lý UI
  const [currentPartEdit, setCurrentPartEdit] = useState(1);
  const [currentSeasonEdit, setCurrentSeasonEdit] = useState(1);
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
      case "totalParts":
        if (form.hasParts) {
          if (!value || value < 1) error = "Phải có ít nhất 1 phần";
          if (value > 100) error = "Số phần không hợp lý";
        }
        break;
      case "totalSeasons":
        if (form.movieType === "series") {
          if (!value || value < 1) error = "Phải có ít nhất 1 season";
          if (value > 50) error = "Số season không hợp lý";
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
    
    setForm((prev) => ({
      ...prev,
      movieType,
      
      // Reset phim lẻ
      hasParts: false,
      totalParts: 1,
      parts: [],
      videoUrl: "",
      
      // Reset phim bộ
      totalSeasons: movieType === "series" ? 1 : 1,
      seasons: movieType === "series" ? [{
        seasonNumber: 1,
        totalEpisodes: 1,
        episodes: [{ episodeNumber: 1, videoUrl: "" }]
      }] : []
    }));
    
    setCurrentPartEdit(1);
    setCurrentSeasonEdit(1);
    setCurrentEpisodeEdit(1);
  };

  // ========== XỬ LÝ PHIM LẺ NHIỀU PHẦN ==========
  
  const handleHasPartsChange = (e) => {
    const hasParts = e.target.checked;
    
    setForm((prev) => ({
      ...prev,
      hasParts,
      totalParts: hasParts ? 1 : 1,
      parts: hasParts ? [{ partNumber: 1, partTitle: "", videoUrl: "", year: "" }] : [],
      videoUrl: hasParts ? "" : prev.videoUrl
    }));
    
    setCurrentPartEdit(1);
  };

  const handleTotalPartsChange = async (e) => {
    const inputValue = e.target.value;
    
    if (inputValue === "") {
      setForm((prev) => ({ ...prev, totalParts: "" }));
      return;
    }
    
    const newTotal = parseInt(inputValue);
    
    if (isNaN(newTotal) || newTotal < 1) {
      return;
    }
    
    const currentTotal = form.parts.length;
    
    if (newTotal < currentTotal) {
      const partsWillBeDeleted = form.parts.slice(newTotal);
      const partsWithLinks = partsWillBeDeleted.filter(p => p.videoUrl.trim() !== "");
      
      if (partsWithLinks.length > 0) {
        const partNumbers = partsWithLinks.map(p => `Phần ${p.partNumber}`).join(", ");
        
        const result = await Swal.fire({
          title: '⚠️ Cảnh báo!',
          html: `
            <div style="text-align: left;">
              <p>Bạn đang giảm số phần từ <strong>${currentTotal}</strong> xuống <strong>${newTotal}</strong>.</p>
              <p style="color: #f59e0b; margin-top: 10px;">
                <strong>Các phần sau đã có link video và sẽ bị xóa:</strong>
              </p>
              <p style="color: #ef4444; font-weight: 600;">
                ${partNumbers}
              </p>
              <p style="margin-top: 10px;">Bạn có chắc chắn muốn tiếp tục?</p>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Xóa các phần này',
          cancelButtonText: 'Hủy bỏ',
          width: '500px'
        });
        
        if (!result.isConfirmed) {
          return;
        }
      }
    }
    
    setForm((prev) => {
      const currentParts = prev.parts || [];
      const newParts = Array.from({ length: newTotal }, (_, i) => ({
        partNumber: i + 1,
        partTitle: currentParts[i]?.partTitle || "",
        videoUrl: currentParts[i]?.videoUrl || "",
        year: currentParts[i]?.year || ""
      }));
      
      return {
        ...prev,
        totalParts: newTotal,
        parts: newParts
      };
    });
    
    if (currentPartEdit > newTotal) {
      setCurrentPartEdit(newTotal);
    }
  };

  const handlePartFieldChange = (partNum, field, value) => {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.map(p =>
        p.partNumber === partNum
          ? { ...p, [field]: value }
          : p
      )
    }));
  };

  // ========== XỬ LÝ PHIM BỘ NHIỀU SEASON ==========
  
  const handleTotalSeasonsChange = async (e) => {
    const inputValue = e.target.value;
    
    if (inputValue === "") {
      setForm((prev) => ({ ...prev, totalSeasons: "" }));
      return;
    }
    
    const newTotal = parseInt(inputValue);
    
    if (isNaN(newTotal) || newTotal < 1) {
      return;
    }
    
    const currentTotal = form.seasons.length;
    
    if (newTotal < currentTotal) {
      const seasonsWillBeDeleted = form.seasons.slice(newTotal);
      
      let hasEpisodesWithLinks = false;
      const seasonNumbers = [];
      
      seasonsWillBeDeleted.forEach(season => {
        const episodesWithLinks = season.episodes?.filter(ep => ep.videoUrl.trim() !== "");
        if (episodesWithLinks && episodesWithLinks.length > 0) {
          hasEpisodesWithLinks = true;
          seasonNumbers.push(`Season ${season.seasonNumber} (${episodesWithLinks.length} tập)`);
        }
      });
      
      if (hasEpisodesWithLinks) {
        const result = await Swal.fire({
          title: '⚠️ Cảnh báo!',
          html: `
            <div style="text-align: left;">
              <p>Bạn đang giảm số season từ <strong>${currentTotal}</strong> xuống <strong>${newTotal}</strong>.</p>
              <p style="color: #f59e0b; margin-top: 10px;">
                <strong>Các season sau có tập đã có link và sẽ bị xóa:</strong>
              </p>
              <p style="color: #ef4444; font-weight: 600;">
                ${seasonNumbers.join('<br>')}
              </p>
              <p style="margin-top: 10px;">Bạn có chắc chắn muốn tiếp tục?</p>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Xóa các season này',
          cancelButtonText: 'Hủy bỏ',
          width: '500px'
        });
        
        if (!result.isConfirmed) {
          return;
        }
      }
    }
    
    setForm((prev) => {
      const currentSeasons = prev.seasons || [];
      const newSeasons = Array.from({ length: newTotal }, (_, i) => ({
        seasonNumber: i + 1,
        totalEpisodes: currentSeasons[i]?.totalEpisodes || 1,
        episodes: currentSeasons[i]?.episodes || [{ episodeNumber: 1, videoUrl: "" }]
      }));
      
      return {
        ...prev,
        totalSeasons: newTotal,
        seasons: newSeasons
      };
    });
    
    if (currentSeasonEdit > newTotal) {
      setCurrentSeasonEdit(newTotal);
    }
  };

  const handleSeasonEpisodesChange = async (seasonNum, e) => {
    const inputValue = e.target.value;
    
    if (inputValue === "") {
      setForm((prev) => ({
        ...prev,
        seasons: prev.seasons.map(s =>
          s.seasonNumber === seasonNum
            ? { ...s, totalEpisodes: "" }
            : s
        )
      }));
      return;
    }
    
    const newTotal = parseInt(inputValue);
    
    if (isNaN(newTotal) || newTotal < 1) {
      return;
    }
    
    const currentSeason = form.seasons.find(s => s.seasonNumber === seasonNum);
    const currentTotal = currentSeason?.episodes?.length || 0;
    
    if (newTotal < currentTotal) {
      const episodesWillBeDeleted = currentSeason.episodes.slice(newTotal);
      const episodesWithLinks = episodesWillBeDeleted.filter(ep => ep.videoUrl.trim() !== "");
      
      if (episodesWithLinks.length > 0) {
        const episodeNumbers = episodesWithLinks.map(ep => ep.episodeNumber).join(", ");
        
        const result = await Swal.fire({
          title: '⚠️ Cảnh báo!',
          html: `
            <div style="text-align: left;">
              <p>Bạn đang giảm số tập Season ${seasonNum} từ <strong>${currentTotal}</strong> xuống <strong>${newTotal}</strong>.</p>
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
          return;
        }
      }
    }
    
    setForm((prev) => ({
      ...prev,
      seasons: prev.seasons.map(s =>
        s.seasonNumber === seasonNum
          ? {
              ...s,
              totalEpisodes: newTotal,
              episodes: Array.from({ length: newTotal }, (_, i) => ({
                episodeNumber: i + 1,
                videoUrl: s.episodes?.[i]?.videoUrl || ""
              }))
            }
          : s
      )
    }));
    
    if (currentEpisodeEdit > newTotal) {
      setCurrentEpisodeEdit(newTotal);
    }
  };

  const handleEpisodeUrlChange = (seasonNum, episodeNum, url) => {
    setForm((prev) => ({
      ...prev,
      seasons: prev.seasons.map(s =>
        s.seasonNumber === seasonNum
          ? {
              ...s,
              episodes: s.episodes.map(ep =>
                ep.episodeNumber === episodeNum
                  ? { ...ep, videoUrl: url }
                  : ep
              )
            }
          : s
      )
    }));
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === "totalParts" && value === "") {
      setForm((prev) => ({
        ...prev,
        totalParts: 1,
        parts: [{ partNumber: 1, partTitle: "", videoUrl: "", year: "" }]
      }));
      return;
    }
    
    if (name === "totalSeasons" && value === "") {
      setForm((prev) => ({
        ...prev,
        totalSeasons: 1,
        seasons: [{ seasonNumber: 1, totalEpisodes: 1, episodes: [{ episodeNumber: 1, videoUrl: "" }] }]
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

    // Validate phim lẻ
    if (form.movieType === "single") {
      if (form.hasParts) {
        const partsError = validateField("totalParts", form.totalParts);
        if (partsError) newErrors.totalParts = partsError;
      } else {
        if (!form.videoUrl.trim()) {
          newErrors.videoUrl = "Link video là bắt buộc";
        }
      }
    }

    // Validate phim bộ
    if (form.movieType === "series") {
      const seasonsError = validateField("totalSeasons", form.totalSeasons);
      if (seasonsError) newErrors.totalSeasons = seasonsError;
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
      
      // Phim lẻ nhiều phần
      hasParts: movie.hasParts || false,
      totalParts: movie.totalParts || 1,
      parts: movie.parts || [],
      
      // Phim bộ nhiều season
      totalSeasons: movie.totalSeasons || 1,
      seasons: movie.seasons || [],
    });
    setIsEditing(true);
    setShowModal(true);
    setErrors({});
    setCurrentPartEdit(1);
    setCurrentSeasonEdit(1);
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
      hasParts: false,
      totalParts: 1,
      parts: [],
      totalSeasons: 1,
      seasons: [],
    });
    setErrors({});
    setCurrentPartEdit(1);
    setCurrentSeasonEdit(1);
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

                    {/* CHỌN LOẠI PHIM */}
                    <div className="input-group">
                      <label className="field-label">
                        Loại phim <span className="required">*</span>
                      </label>
                      <select
                        name="movieType"
                        value={form.movieType}
                        onChange={handleMovieTypeChange}
                        style={{ padding: '10px' }}
                      >
                        <option value="single">🎬 Phim lẻ</option>
                        <option value="series">📺 Phim bộ</option>
                      </select>
                    </div>

                    {/* ========== PHIM LẺ ========== */}
                    {form.movieType === "single" && (
                      <>
                        {/* Checkbox: Phim có nhiều phần không? */}
                        <div className="input-group">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={form.hasParts}
                              onChange={handleHasPartsChange}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px', color: '#fff' }}>
                              🎞️ Phim này có nhiều phần? (VD: Harry Potter, Fast & Furious)
                            </span>
                          </label>
                        </div>

                        {form.hasParts ? (
                          <>
                            {/* Nhập số phần */}
                            <div className="input-group">
                              <label className="field-label">
                                Số phần <span className="required">*</span>
                              </label>
                              <input
                                type="number"
                                name="totalParts"
                                placeholder="VD: 8 (Harry Potter có 8 phần)"
                                value={form.totalParts}
                                onChange={handleTotalPartsChange}
                                onBlur={handleInputBlur}
                                className={errors.totalParts ? "error" : ""}
                                min="1"
                              />
                              {errors.totalParts && (
                                <div className="error-message">{errors.totalParts}</div>
                              )}
                            </div>

                            {/* Tabs chọn phần */}
                            <div className="input-group">
                              <label className="field-label">
                                🎬 Nhập thông tin từng phần
                              </label>
                              <div className="episode-tabs">
                                {form.parts.map((part) => (
                                  <button
                                    key={part.partNumber}
                                    type="button"
                                    className={`episode-tab ${currentPartEdit === part.partNumber ? 'active' : ''}`}
                                    onClick={() => setCurrentPartEdit(part.partNumber)}
                                  >
                                    Phần {part.partNumber}
                                    {part.videoUrl && <span className="check-icon">✓</span>}
                                  </button>
                                ))}
                              </div>

                              {/* Form nhập thông tin phần đang chọn */}
                              <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <div style={{ marginBottom: '10px' }}>
                                  <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '5px' }}>
                                    Tên phần (Tùy chọn)
                                  </label>
                                  <input
                                    placeholder={`VD: Harry Potter và Hòn đá Phù thủy`}
                                    value={form.parts.find(p => p.partNumber === currentPartEdit)?.partTitle || ""}
                                    onChange={(e) => handlePartFieldChange(currentPartEdit, 'partTitle', e.target.value)}
                                  />
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                  <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '5px' }}>
                                    Link video <span className="required">*</span>
                                  </label>
                                  <input
                                    placeholder={`Nhập link video phần ${currentPartEdit}...`}
                                    value={form.parts.find(p => p.partNumber === currentPartEdit)?.videoUrl || ""}
                                    onChange={(e) => handlePartFieldChange(currentPartEdit, 'videoUrl', e.target.value)}
                                  />
                                </div>

                                <div>
                                  <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '5px' }}>
                                    Năm phát hành (Tùy chọn)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder={`VD: 2001`}
                                    value={form.parts.find(p => p.partNumber === currentPartEdit)?.year || ""}
                                    onChange={(e) => handlePartFieldChange(currentPartEdit, 'year', e.target.value)}
                                    style={{ width: '150px' }}
                                  />
                                </div>
                              </div>

                              <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
                                💡 Nhấn tab "Phần X" để nhập thông tin cho từng phần. Dấu ✓ = đã có link.
                              </div>
                            </div>
                          </>
                        ) : (
                          // Phim lẻ KHÔNG có nhiều phần
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
                        )}
                      </>
                    )}

                    {/* ========== PHIM BỘ ========== */}
                    {form.movieType === "series" && (
                      <>
                        {/* Nhập số season */}
                        <div className="form-row-inline">
                          <div className="input-group">
                            <label className="field-label">
                              Số Season/Phần <span className="required">*</span>
                            </label>
                            <input
                              type="number"
                              name="totalSeasons"
                              placeholder="VD: 4"
                              value={form.totalSeasons}
                              onChange={handleTotalSeasonsChange}
                              onBlur={handleInputBlur}
                              className={`small-input ${errors.totalSeasons ? "error" : ""}`}
                              min="1"
                            />
                            {errors.totalSeasons && (
                              <div className="error-message">{errors.totalSeasons}</div>
                            )}
                          </div>
                        </div>

                        {/* Tabs chọn season */}
                        <div className="input-group">
                          <label className="field-label">
                            📺 Chọn Season để nhập tập
                          </label>
                          <div className="episode-tabs">
                            {form.seasons.map((season) => {
                              const episodesWithLinks = season.episodes?.filter(ep => ep.videoUrl.trim() !== "").length || 0;
                              return (
                                <button
                                  key={season.seasonNumber}
                                  type="button"
                                  className={`episode-tab ${currentSeasonEdit === season.seasonNumber ? 'active' : ''}`}
                                  onClick={() => {
                                    setCurrentSeasonEdit(season.seasonNumber);
                                    setCurrentEpisodeEdit(1);
                                  }}
                                >
                                  Season {season.seasonNumber}
                                  {episodesWithLinks > 0 && (
                                    <span className="check-icon" style={{ marginLeft: '4px' }}>
                                      ({episodesWithLinks}/{season.totalEpisodes})
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Form nhập số tập của season đang chọn */}
                          <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <div style={{ marginBottom: '15px' }}>
                              <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '5px' }}>
                                Số tập Season {currentSeasonEdit} <span className="required">*</span>
                              </label>
                              <input
                                type="number"
                                placeholder="VD: 25"
                                value={form.seasons.find(s => s.seasonNumber === currentSeasonEdit)?.totalEpisodes || ""}
                                onChange={(e) => handleSeasonEpisodesChange(currentSeasonEdit, e)}
                                min="1"
                                style={{ width: '150px' }}
                              />
                            </div>

                            {/* Tabs chọn tập */}
                            <div>
                              <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '8px' }}>
                                Chọn tập để nhập link video:
                              </label>
                              <div className="episode-tabs" style={{ marginBottom: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                {form.seasons.find(s => s.seasonNumber === currentSeasonEdit)?.episodes?.map((ep) => (
                                  <button
                                    key={ep.episodeNumber}
                                    type="button"
                                    className={`episode-tab ${currentEpisodeEdit === ep.episodeNumber ? 'active' : ''}`}
                                    onClick={() => setCurrentEpisodeEdit(ep.episodeNumber)}
                                    style={{ fontSize: '12px', padding: '6px 12px' }}
                                  >
                                    Tập {ep.episodeNumber}
                                    {ep.videoUrl && <span className="check-icon">✓</span>}
                                  </button>
                                ))}
                              </div>

                              <input
                                placeholder={`Nhập link video tập ${currentEpisodeEdit}...`}
                                value={form.seasons.find(s => s.seasonNumber === currentSeasonEdit)?.episodes?.find(ep => ep.episodeNumber === currentEpisodeEdit)?.videoUrl || ""}
                                onChange={(e) => handleEpisodeUrlChange(currentSeasonEdit, currentEpisodeEdit, e.target.value)}
                              />
                            </div>
                          </div>

                          <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
                            💡 Chọn Season → Nhập số tập → Chọn tập → Nhập link. Dấu ✓ = đã có link. Có thể điền sau.
                          </div>
                        </div>
                      </>
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
                      📺 Bộ ({m.totalSeasons} season)
                    </span>
                  ) : m.hasParts ? (
                    <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>
                      🎞️ Lẻ ({m.totalParts} phần)
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
                      {(() => {
                        let totalEpisodes = 0;
                        let filledEpisodes = 0;
                        m.seasons?.forEach(s => {
                          totalEpisodes += s.totalEpisodes;
                          filledEpisodes += s.episodes?.filter(ep => ep.videoUrl).length || 0;
                        });
                        return `${filledEpisodes}/${totalEpisodes} tập`;
                      })()}
                    </span>
                  ) : m.hasParts ? (
                    <span style={{ color: '#fbbf24', fontSize: '11px' }}>
                      {m.parts?.filter(p => p.videoUrl).length || 0}/{m.totalParts} phần
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

        .form-row-inline {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .small-input {
          width: 100%;
        }
      `}</style>
    </div>
  );
}