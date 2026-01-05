// src/utils/storageKeys.js
// 🔑 Tất cả localStorage keys được định nghĩa ở đây để dễ quản lý

export const STORAGE_KEYS = {
  // 👤 User data
  USER: 'user',
  
  // 🎬 Watch Progress - Tiến độ xem phim
  WATCH_PROGRESS: 'vmovie_watch_progress',
  
  // 🎉 Watch Party - Phòng xem chung
  WATCH_PARTIES: 'vmovie_watch_parties',
  ACTIVE_PARTY: 'vmovie_active_party',
  PARTY_SYNC: 'vmovie_party_sync',
  
  // 🚨 Reports - Báo lỗi phim
  REPORTS: 'vmovie_reports',
  
  // 🎨 Preview Cache - Cache preview thumbnails
  PREVIEW_CACHE: 'vmovie_preview_cache',
  
  // 📜 History - Lịch sử xem (đã có sẵn, format: history_${userId})
  // HISTORY: (userId) => `history_${userId}`,
};

// 🛡️ Helper: Tạo key với userId
export const getUserKey = (baseKey, userId) => {
  return `${baseKey}_${userId}`;
};

// 🧹 Helper: Xóa tất cả data của user khi logout
export const clearUserData = (userId) => {
  if (!userId) return;
  
  // Xóa các key liên quan đến user
  localStorage.removeItem(getUserKey(STORAGE_KEYS.WATCH_PROGRESS, userId));
  localStorage.removeItem(`history_${userId}`);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_PARTY);
  
  console.log(`✅ Đã xóa data của user: ${userId}`);
};

export default STORAGE_KEYS;