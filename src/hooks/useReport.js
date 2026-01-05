// src/hooks/useReport.js
// 🚨 Custom hook để quản lý báo lỗi phim

import { useState, useEffect, useCallback } from 'react';
import reportService from '../services/reportService';
import { useAuth } from '../store/useAuth';

/**
 * Hook quản lý reports
 */
export const useReport = (movieId = null) => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reports khi component mount
  useEffect(() => {
    loadReports();
    loadStats();
  }, [movieId]);

  /**
   * Load tất cả reports (có filter)
   */
  const loadReports = useCallback((filters = {}) => {
    setIsLoading(true);
    
    try {
      // Nếu có movieId, filter theo movie
      const finalFilters = movieId ? { ...filters, movieId } : filters;
      const allReports = reportService.getAll(finalFilters);
      
      setReports(allReports);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading reports:', error);
      setIsLoading(false);
    }
  }, [movieId]);

  /**
   * Load statistics
   */
  const loadStats = useCallback(() => {
    try {
      const reportStats = reportService.getStats();
      setStats(reportStats);
    } catch (error) {
      console.error('Error loading report stats:', error);
    }
  }, []);

  /**
   * Tạo report mới
   */
  const createReport = useCallback(async (reportData) => {
    if (!user) {
      throw new Error('Bạn cần đăng nhập để báo lỗi');
    }

    setIsSubmitting(true);

    try {
      // Thêm thông tin user vào report
      const fullReportData = {
        ...reportData,
        userId: user.id || user.email,
        userName: user.username || user.name || user.email,
        userEmail: user.email,
      };

      const newReport = reportService.create(fullReportData);

      if (!newReport) {
        throw new Error('Không thể tạo báo cáo. Vui lòng thử lại!');
      }

      // Reload reports và stats
      loadReports();
      loadStats();
      setIsSubmitting(false);

      return newReport;
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }, [user, loadReports, loadStats]);

  /**
   * Update report status (Admin only)
   */
  const updateReportStatus = useCallback((reportId, status, adminNote = '') => {
    if (!user) {
      throw new Error('Bạn cần đăng nhập');
    }

    const success = reportService.updateStatus(
      reportId,
      status,
      adminNote,
      user.id || user.email
    );

    if (success) {
      loadReports();
      loadStats();
    }

    return success;
  }, [user, loadReports, loadStats]);

  /**
   * Xóa report (Admin only)
   */
  const deleteReport = useCallback((reportId) => {
    if (!user) {
      throw new Error('Bạn cần đăng nhập');
    }

    const success = reportService.delete(reportId);

    if (success) {
      loadReports();
      loadStats();
    }

    return success;
  }, [user, loadReports, loadStats]);

  /**
   * Lấy reports của user hiện tại
   */
  const getUserReports = useCallback(() => {
    if (!user?.id) return [];
    return reportService.getUserReports(user.id);
  }, [user?.id]);

  /**
   * Lấy reports của phim
   */
  const getMovieReports = useCallback((targetMovieId) => {
    return reportService.getMovieReports(targetMovieId);
  }, []);

  return {
    // Data
    reports,
    stats,
    isLoading,
    isSubmitting,
    
    // Methods
    createReport,
    updateReportStatus,
    deleteReport,
    getUserReports,
    getMovieReports,
    loadReports,
    
    // Constants
    TYPES: reportService.TYPES,
    STATUS: reportService.STATUS,
    TYPE_LABELS: reportService.TYPE_LABELS,
  };
};

/**
 * Hook đơn giản để tạo report (dùng trong modal)
 */
export const useReportModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    setError(null);
    setSuccess(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setError(null);
    setSuccess(false);
  }, []);

  const submitReport = useCallback(async (reportData) => {
    if (!user) {
      setError('Bạn cần đăng nhập để báo lỗi');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fullReportData = {
        ...reportData,
        userId: user.id || user.email,
        userName: user.username || user.name || user.email,
        userEmail: user.email,
      };

      const newReport = reportService.create(fullReportData);

      if (!newReport) {
        throw new Error('Không thể tạo báo cáo');
      }

      setSuccess(true);
      setIsSubmitting(false);
      
      // Auto close sau 2 giây
      setTimeout(() => {
        close();
      }, 2000);

      return true;
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
      return false;
    }
  }, [user, close]);

  return {
    isOpen,
    isSubmitting,
    error,
    success,
    open,
    close,
    submitReport,
    TYPES: reportService.TYPES,
    TYPE_LABELS: reportService.TYPE_LABELS,
  };
};

export default useReport;