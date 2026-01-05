// src/hooks/useWatchProgress.js
// 🎬 Custom hook để quản lý tiến độ xem phim

import { useState, useEffect, useCallback, useRef } from 'react';
import watchProgressService from '../services/watchProgressService';
import { useAuth } from '../store/useAuth';

/**
 * Hook quản lý watch progress với auto-save
 */
export const useWatchProgress = (movieId = null) => {
  const { user } = useAuth();
  const [allProgress, setAllProgress] = useState([]);
  const [currentProgress, setCurrentProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto-save timer
  const autoSaveTimerRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  // Load tất cả progress khi component mount
  useEffect(() => {
    if (user?.id) {
      loadAllProgress();
    } else {
      setAllProgress([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load progress của phim hiện tại
  useEffect(() => {
    if (user?.id && movieId) {
      loadCurrentProgress();
    } else {
      setCurrentProgress(null);
    }
  }, [user?.id, movieId]);

  /**
   * Load tất cả tiến độ xem
   */
  const loadAllProgress = useCallback(() => {
    if (!user?.id) return;
    
    try {
      const progress = watchProgressService.getAll(user.id);
      setAllProgress(progress);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading watch progress:', error);
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Load progress của phim hiện tại
   */
  const loadCurrentProgress = useCallback(() => {
    if (!user?.id || !movieId) return;
    
    const progress = watchProgressService.get(user.id, movieId);
    setCurrentProgress(progress);
  }, [user?.id, movieId]);

  /**
   * Lưu progress (manual)
   */
  const saveProgress = useCallback((progressData) => {
    if (!user?.id) {
      console.warn('Cannot save progress: user not logged in');
      return false;
    }

    const success = watchProgressService.save(user.id, progressData);
    
    if (success) {
      // Reload data
      loadAllProgress();
      if (movieId) loadCurrentProgress();
    }

    return success;
  }, [user?.id, movieId, loadAllProgress, loadCurrentProgress]);

  /**
   * Auto-save progress (throttled)
   * Chỉ lưu nếu đã qua 5 giây từ lần lưu trước
   */
  const autoSaveProgress = useCallback((progressData) => {
    if (!user?.id) return;

    // Clear timer cũ
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set timer mới - throttle 5 giây
    autoSaveTimerRef.current = setTimeout(() => {
      const now = Date.now();
      
      // Chỉ lưu nếu đã qua 5 giây từ lần lưu trước
      if (now - lastSavedTimeRef.current >= 5000) {
        saveProgress(progressData);
        lastSavedTimeRef.current = now;
      }
    }, 1000); // Delay 1s để tránh gọi liên tục

  }, [user?.id, saveProgress]);

  /**
   * Xóa progress của 1 phim
   */
  const removeProgress = useCallback((targetMovieId) => {
    if (!user?.id) return false;

    const success = watchProgressService.remove(user.id, targetMovieId);
    
    if (success) {
      loadAllProgress();
      if (targetMovieId === movieId) {
        setCurrentProgress(null);
      }
    }

    return success;
  }, [user?.id, movieId, loadAllProgress]);

  /**
   * Xóa tất cả progress
   */
  const clearAllProgress = useCallback(() => {
    if (!user?.id) return false;

    const success = watchProgressService.clearAll(user.id);
    
    if (success) {
      setAllProgress([]);
      setCurrentProgress(null);
    }

    return success;
  }, [user?.id]);

  /**
   * Lấy top N phim xem gần đây
   */
  const getRecentProgress = useCallback((limit = 10) => {
    if (!user?.id) return [];
    return watchProgressService.getRecent(user.id, limit);
  }, [user?.id]);

  /**
   * Kiểm tra phim có progress không
   */
  const hasProgress = useCallback((targetMovieId) => {
    if (!user?.id || !targetMovieId) return false;
    return watchProgressService.has(user.id, targetMovieId);
  }, [user?.id]);

  /**
   * Cleanup timers khi unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    // Data
    allProgress,
    currentProgress,
    isLoading,
    
    // Methods
    saveProgress,
    autoSaveProgress,
    removeProgress,
    clearAllProgress,
    getRecentProgress,
    hasProgress,
    reload: loadAllProgress,
  };
};

/**
 * Hook đơn giản chỉ để lấy danh sách Continue Watching
 */
export const useContinueWatching = (limit = 10) => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const progress = watchProgressService.getRecent(user.id, limit);
      setMovies(progress);
      setIsLoading(false);
    } else {
      setMovies([]);
      setIsLoading(false);
    }
  }, [user?.id, limit]);

  const remove = useCallback((movieId) => {
    if (!user?.id) return false;
    
    const success = watchProgressService.remove(user.id, movieId);
    
    if (success) {
      setMovies(prev => prev.filter(m => m.movieId !== movieId));
    }
    
    return success;
  }, [user?.id]);

  return {
    movies,
    isLoading,
    remove,
  };
};

export default useWatchProgress;