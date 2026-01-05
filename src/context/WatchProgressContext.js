// src/context/WatchProgressContext.js
// 🎬 Context để share watch progress state across app

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import watchProgressService from '../services/watchProgressService';
import { useAuth } from '../store/useAuth';

const WatchProgressContext = createContext(null);

export const WatchProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [allProgress, setAllProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress khi user thay đổi
  useEffect(() => {
    if (user?.id) {
      loadProgress();
    } else {
      setAllProgress([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Load tất cả progress
   */
  const loadProgress = useCallback(() => {
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
   * Lưu/Update progress
   */
  const saveProgress = useCallback((progressData) => {
    if (!user?.id) return false;

    const success = watchProgressService.save(user.id, progressData);
    
    if (success) {
      loadProgress();
    }

    return success;
  }, [user?.id, loadProgress]);

  /**
   * Xóa progress
   */
  const removeProgress = useCallback((movieId) => {
    if (!user?.id) return false;

    const success = watchProgressService.remove(user.id, movieId);
    
    if (success) {
      setAllProgress(prev => prev.filter(p => p.movieId !== movieId));
    }

    return success;
  }, [user?.id]);

  /**
   * Clear all progress
   */
  const clearAll = useCallback(() => {
    if (!user?.id) return false;

    const success = watchProgressService.clearAll(user.id);
    
    if (success) {
      setAllProgress([]);
    }

    return success;
  }, [user?.id]);

  /**
   * Lấy progress của phim
   */
  const getProgress = useCallback((movieId) => {
    return allProgress.find(p => p.movieId === movieId) || null;
  }, [allProgress]);

  /**
   * Check có progress không
   */
  const hasProgress = useCallback((movieId) => {
    return allProgress.some(p => p.movieId === movieId);
  }, [allProgress]);

  const value = {
    allProgress,
    isLoading,
    saveProgress,
    removeProgress,
    clearAll,
    getProgress,
    hasProgress,
    reload: loadProgress,
  };

  return (
    <WatchProgressContext.Provider value={value}>
      {children}
    </WatchProgressContext.Provider>
  );
};

/**
 * Hook để sử dụng WatchProgressContext
 */
export const useWatchProgressContext = () => {
  const context = useContext(WatchProgressContext);
  
  if (!context) {
    throw new Error('useWatchProgressContext must be used within WatchProgressProvider');
  }
  
  return context;
};

export default WatchProgressContext;