// src/hooks/useStreak.js
import { useState, useEffect, useCallback } from 'react';
import { todoAPI } from '../api/client';

/**
 * Hook for managing streak data
 * Fetches user's completion streak from backend
 */
export function useStreak() {
  const [streakData, setStreakData] = useState({
    streak: 0,
    completionsByDay: {},
    uniqueDates: [],
    totalCompleted: 0,
    loading: true,
    error: null
  });

  // Fetch streak from backend
  const fetchStreak = useCallback(async () => {
    try {
      setStreakData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await todoAPI.getStreak();
      const data = response.data;
      
      setStreakData({
        streak: data.streak || 0,
        completionsByDay: data.completionsByDay || {},
        uniqueDates: data.uniqueDates || [],
        totalCompleted: data.totalCompleted || 0,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('❌ Failed to fetch streak:', error);
      setStreakData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load streak data'
      }));
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak: streakData.streak,
    completionsByDay: streakData.completionsByDay,
    uniqueDates: streakData.uniqueDates,
    totalCompleted: streakData.totalCompleted,
    loading: streakData.loading,
    error: streakData.error,
    reloadStreak: fetchStreak
  };
}
