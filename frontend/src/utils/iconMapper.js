// src/utils/iconMapper.js

/**
 * 3D Icon Configuration for Dashboard
 * Using verified working URLs from Icons8 CDN
 */

/**
 * Time-based 3D icons (changes based on time of day)
 */
export const TIME_BASED_ICONS = {
  morning: {
    url: "https://img.icons8.com/fluency/188/coffee-to-go.png",
    alt: "Morning Coffee",
    gradient: "from-orange-400 to-amber-500",
    label: "Good Morning"
  },
  afternoon: {
    url: "https://img.icons8.com/fluency/188/sun--v1.png",
    alt: "Afternoon Sun",
    gradient: "from-yellow-400 to-orange-500",
    label: "Good Afternoon"
  },
  evening: {
    url: "https://img.icons8.com/fluency/188/sunrise--v1.png",
    alt: "Evening Sunset",
    gradient: "from-purple-400 to-pink-500",
    label: "Good Evening"
  },
  night: {
    url: "https://img.icons8.com/fluency/188/crescent-moon.png",
    alt: "Night Moon",
    gradient: "from-indigo-500 to-purple-600",
    label: "Good Night"
  }
};

/**
 * Streak-based 3D icons
 */
export const STREAK_ICONS = {
  starting: {
    url: "https://img.icons8.com/fluency/188/sprout.png",
    alt: "Just Starting",
    gradient: "from-green-300 to-emerald-400",
    label: "Growing"
  },
  building: {
    url: "https://img.icons8.com/fluency/188/fire-element--v1.png",
    alt: "Building Streak",
    gradient: "from-orange-400 to-red-500",
    label: "Building Momentum"
  },
  strong: {
    url: "https://img.icons8.com/fluency/188/rocket.png",
    alt: "Strong Streak",
    gradient: "from-blue-500 to-purple-600",
    label: "Unstoppable"
  },
  master: {
    url: "https://img.icons8.com/fluency/188/trophy.png",
    alt: "Streak Master",
    gradient: "from-yellow-400 to-amber-500",
    label: "Streak Master"
  }
};

/**
 * Get icon configuration based on time of day
 * @returns {Object} Icon configuration object
 */
export const getTimeBasedIcon = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) return TIME_BASED_ICONS.morning;
  if (hour >= 12 && hour < 18) return TIME_BASED_ICONS.afternoon;
  if (hour >= 18 && hour < 22) return TIME_BASED_ICONS.evening;
  return TIME_BASED_ICONS.night;
};

/**
 * Get icon configuration based on streak count
 * @returns {Object} Icon configuration object
 */
export const getStreakIcon = (streak) => {
  if (streak < 3) return STREAK_ICONS.starting;
  if (streak < 8) return STREAK_ICONS.building;
  if (streak < 15) return STREAK_ICONS.strong;
  return STREAK_ICONS.master;
};

/**
 * Preload icons for better performance
 * @returns {Promise<void>}
 */
export const preloadAllDashboardIcons = () => {
  const allIcons = [
    ...Object.values(TIME_BASED_ICONS),
    ...Object.values(STREAK_ICONS)
  ];

  return Promise.all(
    allIcons.map(icon => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = icon.url;
      });
    })
  );
};
