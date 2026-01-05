// src/services/watchProgressService.js
// 📺 Service quản lý tiến độ xem phim (Continue Watching)

import storage from './localStorageService';
import { STORAGE_KEYS, getUserKey } from '../utils/storageKeys';
import { now, calculatePercentage } from '../utils/dateUtils';

/**
 * Lưu tiến độ xem phim
 * @param {string} userId - ID người dùng
 * @param {object} progressData - data tiến độ
 * @returns {boolean} success status
 */
export const saveWatchProgress = (userId, progressData) => {
  if (!userId) {
    console.warn('⚠️ Cannot save progress: userId is required');
    return false;
  }

  try {
    const {
      movieId,
      title,
      engTitle,
      image,
      poster,
      currentTime,
      duration,
      episode = null,
      season = null,
      genre,
      country,
      year,
    } = progressData;

    // Validate required fields
    if (!movieId || !title || currentTime === undefined || !duration) {
      console.error('❌ Missing required fields for watch progress');
      return false;
    }

    // Tính phần trăm đã xem
    const percentage = calculatePercentage(currentTime, duration);

    // Nếu đã xem >95% thì xem như đã xem xong, không lưu nữa
    if (percentage >= 95) {
      removeWatchProgress(userId, movieId);
      return true;
    }

    // Lấy data hiện tại
    const key = getUserKey(STORAGE_KEYS.WATCH_PROGRESS, userId);
    const allProgress = storage.get(key, {});

    // Tạo/update progress item
    allProgress[movieId] = {
      movieId,
      title,
      engTitle,
      image,
      poster,
      currentTime,
      duration,
      percentage: parseFloat(percentage),
      episode,
      season,
      genre,
      country,
      year,
      lastWatched: now(),
      updatedAt: Date.now(),
    };

    // Lưu lại
    const success = storage.set(key, allProgress);
    
    if (success) {
      console.log(`✅ Saved watch progress for movie ${movieId}: ${percentage}%`);
    }

    return success;
  } catch (error) {
    console.error('❌ Error saving watch progress:', error);
    return false;
  }
};

/**
 * Lấy tất cả tiến độ xem của user
 * @param {string} userId - ID người dùng
 * @returns {array} array of progress items, sorted by lastWatched (newest first)
 */
export const getAllWatchProgress = (userId) => {
  if (!userId) return [];

  try {
    const key = getUserKey(STORAGE_KEYS.WATCH_PROGRESS, userId);
    const allProgress = storage.get(key, {});

    // Convert object to array và sort theo thời gian xem gần nhất
    const progressArray = Object.values(allProgress).sort((a, b) => {
      return new Date(b.lastWatched) - new Date(a.lastWatched);
    });

    return progressArray;
  } catch (error) {
    console.error('❌ Error getting watch progress:', error);
    return [];
  }
};

/**
 * Lấy tiến độ xem của 1 phim cụ thể
 * @param {string} userId - ID người dùng
 * @param {string} movieId - ID phim
 * @returns {object|null} progress data hoặc null
 */
export const getWatchProgress = (userId, movieId) => {
  if (!userId || !movieId) return null;

  try {
    const key = getUserKey(STORAGE_KEYS.WATCH_PROGRESS, userId);
    const allProgress = storage.get(key, {});
    return allProgress[movieId] || null;
  } catch (error) {
    console.error('❌ Error getting watch progress:', error);
    return null;
  }
};

/**
 * Xóa tiến độ xem của 1 phim
 * @param {string} userId - ID người dùng
 * @param {string} movieId - ID phim
 * @returns {boolean} success status
 */
export const removeWatchProgress = (userId, movieId) => {
  if (!userId || !movieId) return false;

  try {
    const key = getUserKey(STORAGE_KEYS.WATCH_PROGRESS, userId);
    const allProgress = storage.get(key, {});

    if (allProgress[movieId]) {
      delete allProgress[movieId];
      const success = storage.set(key, allProgress);
      
      if (success) {
        console.log(`✅ Removed watch progress for movie ${movieId}`);
      }
      
      return success;
    }

    return false;
  } catch (error) {
    console.error('❌ Error removing watch progress:', error);
    return false;
  }
};

/**
 * Xóa tất cả tiến độ xem của user
 * @param {string} userId - ID người dùng
 * @returns {boolean} success status
 */
export const clearAllWatchProgress = (userId) => {
  if (!userId) return false;

  try {
    const key = getUserKey(STORAGE_KEYS.WATCH_PROGRESS, userId);
    const success = storage.remove(key);
    
    if (success) {
      console.log(`✅ Cleared all watch progress for user ${userId}`);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error clearing watch progress:', error);
    return false;
  }
};

/**
 * Xóa các tiến độ cũ (>30 ngày không xem)
 * @param {string} userId - ID người dùng
 * @returns {number} số lượng items đã xóa
 */
export const cleanOldProgress = (userId) => {
  if (!userId) return 0;

  try {
    const key = getUserKey(STORAGE_KEYS.WATCH_PROGRESS, userId);
    const allProgress = storage.get(key, {});
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    let removedCount = 0;
    Object.keys(allProgress).forEach(movieId => {
      const item = allProgress[movieId];
      if (item.updatedAt < thirtyDaysAgo) {
        delete allProgress[movieId];
        removedCount++;
      }
    });

    if (removedCount > 0) {
      storage.set(key, allProgress);
      console.log(`✅ Cleaned ${removedCount} old progress items`);
    }

    return removedCount;
  } catch (error) {
    console.error('❌ Error cleaning old progress:', error);
    return 0;
  }
};

/**
 * Kiểm tra xem phim có đang xem dở không
 * @param {string} userId - ID người dùng
 * @param {string} movieId - ID phim
 * @returns {boolean}
 */
export const hasWatchProgress = (userId, movieId) => {
  return getWatchProgress(userId, movieId) !== null;
};

/**
 * Lấy top N phim xem gần đây nhất
 * @param {string} userId - ID người dùng
 * @param {number} limit - số lượng phim
 * @returns {array} array of progress items
 */
export const getRecentWatchProgress = (userId, limit = 10) => {
  const allProgress = getAllWatchProgress(userId);
  return allProgress.slice(0, limit);
};

// Export default object
export default {
  save: saveWatchProgress,
  get: getWatchProgress,
  getAll: getAllWatchProgress,
  remove: removeWatchProgress,
  clearAll: clearAllWatchProgress,
  cleanOld: cleanOldProgress,
  has: hasWatchProgress,
  getRecent: getRecentWatchProgress,
};