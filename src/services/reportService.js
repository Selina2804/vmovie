// src/services/reportService.js
// 🚨 Service quản lý báo lỗi phim

import storage from './localStorageService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { now } from '../utils/dateUtils';

// Các loại báo lỗi
export const REPORT_TYPES = {
  BROKEN_LINK: 'broken_link',
  SUBTITLE_ERROR: 'subtitle_error',
  AUDIO_ERROR: 'audio_error',
  VIDEO_QUALITY: 'video_quality',
  REQUEST_MOVIE: 'request_movie',
  OTHER: 'other',
};

// Trạng thái báo lỗi
export const REPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

// Labels cho report types
export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.BROKEN_LINK]: '🔗 Link bị hỏng',
  [REPORT_TYPES.SUBTITLE_ERROR]: '📝 Lỗi phụ đề',
  [REPORT_TYPES.AUDIO_ERROR]: '🔊 Lỗi âm thanh',
  [REPORT_TYPES.VIDEO_QUALITY]: '📹 Lỗi chất lượng video',
  [REPORT_TYPES.REQUEST_MOVIE]: '🎬 Yêu cầu phim',
  [REPORT_TYPES.OTHER]: '❓ Khác',
};

/**
 * Tạo report mới
 * @param {object} reportData - data của report
 * @returns {object|null} report object hoặc null nếu lỗi
 */
export const createReport = (reportData) => {
  try {
    const {
      movieId,
      movieTitle,
      userId,
      userName,
      userEmail,
      type,
      description,
      episode = null,
      season = null,
      serverNumber = null,
    } = reportData;

    // Validate required fields
    if (!movieId || !movieTitle || !userId || !type || !description) {
      console.error('❌ Missing required fields for report');
      return null;
    }

    // Validate report type
    if (!Object.values(REPORT_TYPES).includes(type)) {
      console.error('❌ Invalid report type:', type);
      return null;
    }

    // Tạo unique ID cho report
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Tạo report object
    const newReport = {
      id: reportId,
      movieId,
      movieTitle,
      userId,
      userName,
      userEmail,
      type,
      description: description.trim(),
      episode,
      season,
      serverNumber,
      status: REPORT_STATUS.PENDING,
      adminNote: '',
      createdAt: now(),
      updatedAt: now(),
      resolvedAt: null,
      resolvedBy: null,
    };

    // Lấy tất cả reports hiện tại
    const allReports = storage.get(STORAGE_KEYS.REPORTS, { reports: [] });

    // Thêm report mới vào đầu mảng
    allReports.reports.unshift(newReport);

    // Lưu lại
    const success = storage.set(STORAGE_KEYS.REPORTS, allReports);

    if (success) {
      console.log(`✅ Created report ${reportId} for movie ${movieId}`);
      return newReport;
    }

    return null;
  } catch (error) {
    console.error('❌ Error creating report:', error);
    return null;
  }
};

/**
 * Lấy tất cả reports
 * @param {object} filters - filters (status, movieId, userId)
 * @returns {array} array of reports
 */
export const getAllReports = (filters = {}) => {
  try {
    const allReports = storage.get(STORAGE_KEYS.REPORTS, { reports: [] });
    let reports = allReports.reports || [];

    // Apply filters
    if (filters.status) {
      reports = reports.filter(r => r.status === filters.status);
    }

    if (filters.movieId) {
      reports = reports.filter(r => r.movieId === filters.movieId);
    }

    if (filters.userId) {
      reports = reports.filter(r => r.userId === filters.userId);
    }

    if (filters.type) {
      reports = reports.filter(r => r.type === filters.type);
    }

    // Sort by createdAt (newest first)
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return reports;
  } catch (error) {
    console.error('❌ Error getting reports:', error);
    return [];
  }
};

/**
 * Lấy report theo ID
 * @param {string} reportId - ID của report
 * @returns {object|null} report object hoặc null
 */
export const getReportById = (reportId) => {
  try {
    const allReports = storage.get(STORAGE_KEYS.REPORTS, { reports: [] });
    return allReports.reports.find(r => r.id === reportId) || null;
  } catch (error) {
    console.error('❌ Error getting report by ID:', error);
    return null;
  }
};

/**
 * Update report status (Admin function)
 * @param {string} reportId - ID của report
 * @param {string} status - new status
 * @param {string} adminNote - ghi chú của admin
 * @param {string} adminId - ID của admin
 * @returns {boolean} success status
 */
export const updateReportStatus = (reportId, status, adminNote = '', adminId = null) => {
  try {
    if (!Object.values(REPORT_STATUS).includes(status)) {
      console.error('❌ Invalid report status:', status);
      return false;
    }

    const allReports = storage.get(STORAGE_KEYS.REPORTS, { reports: [] });
    const reportIndex = allReports.reports.findIndex(r => r.id === reportId);

    if (reportIndex === -1) {
      console.error('❌ Report not found:', reportId);
      return false;
    }

    // Update report
    allReports.reports[reportIndex] = {
      ...allReports.reports[reportIndex],
      status,
      adminNote: adminNote.trim(),
      updatedAt: now(),
      resolvedAt: status === REPORT_STATUS.RESOLVED ? now() : allReports.reports[reportIndex].resolvedAt,
      resolvedBy: status === REPORT_STATUS.RESOLVED ? adminId : allReports.reports[reportIndex].resolvedBy,
    };

    const success = storage.set(STORAGE_KEYS.REPORTS, allReports);

    if (success) {
      console.log(`✅ Updated report ${reportId} status to ${status}`);
    }

    return success;
  } catch (error) {
    console.error('❌ Error updating report status:', error);
    return false;
  }
};

/**
 * Xóa report (Admin function)
 * @param {string} reportId - ID của report
 * @returns {boolean} success status
 */
export const deleteReport = (reportId) => {
  try {
    const allReports = storage.get(STORAGE_KEYS.REPORTS, { reports: [] });
    const initialLength = allReports.reports.length;

    allReports.reports = allReports.reports.filter(r => r.id !== reportId);

    if (allReports.reports.length < initialLength) {
      const success = storage.set(STORAGE_KEYS.REPORTS, allReports);
      
      if (success) {
        console.log(`✅ Deleted report ${reportId}`);
      }
      
      return success;
    }

    return false;
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    return false;
  }
};

/**
 * Lấy reports của user
 * @param {string} userId - ID người dùng
 * @returns {array} array of reports
 */
export const getUserReports = (userId) => {
  return getAllReports({ userId });
};

/**
 * Lấy reports của phim
 * @param {string} movieId - ID phim
 * @returns {array} array of reports
 */
export const getMovieReports = (movieId) => {
  return getAllReports({ movieId });
};

/**
 * Lấy số lượng reports theo status
 * @returns {object} object chứa count của từng status
 */
export const getReportStats = () => {
  try {
    const allReports = storage.get(STORAGE_KEYS.REPORTS, { reports: [] });
    
    const stats = {
      total: allReports.reports.length,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };

    allReports.reports.forEach(report => {
      if (stats[report.status] !== undefined) {
        stats[report.status]++;
      }
    });

    return stats;
  } catch (error) {
    console.error('❌ Error getting report stats:', error);
    return { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 };
  }
};

/**
 * Xóa tất cả reports (Admin function)
 * @returns {boolean} success status
 */
export const clearAllReports = () => {
  try {
    const success = storage.set(STORAGE_KEYS.REPORTS, { reports: [] });
    
    if (success) {
      console.log('✅ Cleared all reports');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error clearing reports:', error);
    return false;
  }
};

// Export default object
export default {
  create: createReport,
  getAll: getAllReports,
  getById: getReportById,
  updateStatus: updateReportStatus,
  delete: deleteReport,
  getUserReports,
  getMovieReports,
  getStats: getReportStats,
  clearAll: clearAllReports,
  TYPES: REPORT_TYPES,
  STATUS: REPORT_STATUS,
  TYPE_LABELS: REPORT_TYPE_LABELS,
};