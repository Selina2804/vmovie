// src/store/apiService.js
import axios from "axios";

const BASE_URL = "https://69538a2aa319a928023bc426.mockapi.io";

export const fetchAll = async (resource) => {
  try {
    const res = await axios.get(`${BASE_URL}/${resource}`);
    return res.data;
  } catch (err) {
    console.error(`Lỗi fetch ${resource}:`, err);
    return [];
  }
};

export const createItem = async (resource, item) => {
  try {
    const res = await axios.post(`${BASE_URL}/${resource}`, item);
    return res.data;
  } catch (err) {
    console.error(`Lỗi tạo ${resource}:`, err);
  }
};

export const updateItem = async (resource, id, item) => {
  try {
    const res = await axios.put(`${BASE_URL}/${resource}/${id}`, item);
    return res.data;
  } catch (err) {
    console.error(`Lỗi cập nhật ${resource}:`, err);
  }
};

export const deleteItem = async (resource, id) => {
  try {
    await axios.delete(`${BASE_URL}/${resource}/${id}`);
  } catch (err) {
    console.error(`Lỗi xóa ${resource}:`, err);
  }
};

// ⭐ HÀM MỚI: Tăng lượt xem phim
export const incrementMovieViews = async (movieId) => {
  try {
    const res = await axios.get(`${BASE_URL}/movies/${movieId}`);
    const movie = res.data;
    
    const currentViews = parseInt(movie.views) || 0;
    const updatedMovie = {
      ...movie,
      views: currentViews + 1
    };
    
    await axios.put(`${BASE_URL}/movies/${movieId}`, updatedMovie);
    
    console.log(`✅ Tăng views cho phim ${movieId}: ${currentViews} → ${currentViews + 1}`);
    
    return updatedMovie;
  } catch (err) {
    console.error(`❌ Lỗi tăng views phim ${movieId}:`, err);
    throw err;
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/forgot-password`, { email });
    return res.data;
  } catch (err) {
    console.error("Lỗi gửi email quên mật khẩu:", err);
    throw new Error(err.response?.data?.message || "Gửi email thất bại");
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/reset-password`, { 
      token, 
      newPassword 
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi đặt lại mật khẩu:", err);
    throw new Error(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
  }
};