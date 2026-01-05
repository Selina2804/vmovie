// src/utils/dateUtils.js
// 📅 Utilities cho xử lý date/time

/**
 * Format time ago (vừa xong, 5 phút trước, 2 giờ trước...)
 */
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} tuần trước`;
  
  return date.toLocaleDateString("vi-VN");
};

/**
 * Format duration từ giây sang HH:MM:SS hoặc MM:SS
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return "00:00";
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Tính phần trăm tiến độ
 */
export const calculatePercentage = (currentTime, duration) => {
  if (!duration || duration <= 0) return 0;
  const percentage = (currentTime / duration) * 100;
  return Math.min(Math.max(percentage, 0), 100).toFixed(1);
};

/**
 * Format date thành DD/MM/YYYY
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

/**
 * Format date time đầy đủ
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};

/**
 * Check xem có phải hôm nay không
 */
export const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check xem có phải trong 7 ngày qua không
 */
export const isWithinWeek = (dateString) => {
  const date = new Date(dateString);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return date >= weekAgo;
};

/**
 * Tạo timestamp hiện tại
 */
export const now = () => new Date().toISOString();

/**
 * Parse ISO string thành Date object
 */
export const parseDate = (dateString) => {
  return new Date(dateString);
};