// src/utils/iconMapper.js

/**
 * Time-based 3D icons with enhanced gradients
 */
export const TIME_BASED_ICONS = {
  morning: {
    url: "https://img.icons8.com/fluency/188/coffee-to-go.png",
    alt: "Morning Coffee",
    gradient: "from-orange-400 to-amber-500",
    label: "Good Morning",
    timeRange: "6:00 AM - 12:00 PM"
  },
  afternoon: {
    url: "https://img.icons8.com/fluency/188/sun--v1.png",
    alt: "Afternoon Sun",
    gradient: "from-yellow-400 to-orange-500",
    label: "Good Afternoon",
    timeRange: "12:00 PM - 6:00 PM"
  },
  evening: {
    url: "https://img.icons8.com/fluency/188/sunrise--v1.png",
    alt: "Evening Sunset",
    gradient: "from-purple-400 to-pink-500",
    label: "Good Evening",
    timeRange: "6:00 PM - 10:00 PM"
  },
  night: {
    url: "https://img.icons8.com/fluency/188/crescent-moon.png",
    alt: "Night Moon",
    gradient: "from-indigo-500 to-purple-600",
    label: "Good Night",
    timeRange: "10:00 PM - 6:00 AM"
  }
};

/**
 * Streak-based 3D icons with progression levels
 * ✅ UPDATED: More granular levels for better motivation
 */
export const STREAK_ICONS = {
  starting: {
    url: "https://img.icons8.com/fluency/188/sprout.png",
    alt: "Just Starting",
    gradient: "from-green-300 to-emerald-400",
    label: "Growing",
    description: "Keep it up! 🌱",
    minStreak: 0,
    maxStreak: 2
  },
  seedling: {
    url: "https://img.icons8.com/fluency/188/potted-plant.png",
    alt: "Seedling",
    gradient: "from-green-400 to-emerald-500",
    label: "Seedling",
    description: "Great progress! 🪴",
    minStreak: 3,
    maxStreak: 6
  },
  building: {
    url: "https://img.icons8.com/fluency/188/fire-element--v1.png",
    alt: "Building Streak",
    gradient: "from-orange-400 to-red-500",
    label: "On Fire",
    description: "You're on fire! 🔥",
    minStreak: 7,
    maxStreak: 13
  },
  strong: {
    url: "https://img.icons8.com/fluency/188/rocket.png",
    alt: "Strong Streak",
    gradient: "from-blue-500 to-purple-600",
    label: "Unstoppable",
    description: "Unstoppable! 🚀",
    minStreak: 14,
    maxStreak: 29
  },
  champion: {
    url: "https://img.icons8.com/fluency/188/medal.png",
    alt: "Champion",
    gradient: "from-purple-500 to-pink-600",
    label: "Champion",
    description: "Champion level! 🏅",
    minStreak: 30,
    maxStreak: 99
  },
  master: {
    url: "https://img.icons8.com/fluency/188/trophy.png",
    alt: "Streak Master",
    gradient: "from-yellow-400 to-amber-500",
    label: "Legendary",
    description: "Absolute legend! 🏆",
    minStreak: 100,
    maxStreak: Infinity
  }
};

/**
 * ✅ Get icon configuration based on CURRENT time of day
 * @returns {Object} Icon configuration object
 */
export const getTimeBasedIcon = () => {
  const hour = new Date().getHours();
  
  // Morning: 6 AM - 12 PM
  if (hour >= 6 && hour < 12) {
    console.log(`☀️ Time-based icon: Morning (${hour}:00)`);
    return TIME_BASED_ICONS.morning;
  }
  
  // Afternoon: 12 PM - 6 PM
  if (hour >= 12 && hour < 18) {
    console.log(`🌤️ Time-based icon: Afternoon (${hour}:00)`);
    return TIME_BASED_ICONS.afternoon;
  }
  
  // Evening: 6 PM - 10 PM
  if (hour >= 18 && hour < 22) {
    console.log(`🌆 Time-based icon: Evening (${hour}:00)`);
    return TIME_BASED_ICONS.evening;
  }
  
  // Night: 10 PM - 6 AM
  console.log(`🌙 Time-based icon: Night (${hour}:00)`);
  return TIME_BASED_ICONS.night;
};

/**
 * ✅ FIXED: Get icon configuration based on REAL streak count from backend
 * @param {number} streak - Current streak count from backend
 * @returns {Object} Icon configuration object
 */
export const getStreakIcon = (streak = 0) => {
  const numStreak = Number(streak) || 0; // Ensure it's a number
  
  console.log(`🔥 Calculating streak icon for: ${numStreak} days`);
  
  // Find the appropriate icon based on streak range
  const iconEntry = Object.entries(STREAK_ICONS).find(([key, config]) => {
    return numStreak >= config.minStreak && numStreak <= config.maxStreak;
  });
  
  if (iconEntry) {
    const [key, icon] = iconEntry;
    console.log(`✅ Streak icon: ${icon.label} (${icon.description})`);
    return icon;
  }
  
  // Fallback to starting icon
  console.log(`⚠️ Streak fallback: Using starting icon`);
  return STREAK_ICONS.starting;
};

/**
 * ✅ Get motivational message based on streak
 * @param {number} streak - Current streak count
 * @returns {string} Motivational message
 */
export const getStreakMessage = (streak = 0) => {
  const numStreak = Number(streak) || 0;
  
  if (numStreak === 0) return "Start your journey today!";
  if (numStreak === 1) return "Great start! Keep going!";
  if (numStreak < 7) return `${numStreak} days strong! 💪`;
  if (numStreak < 14) return `${numStreak} days on fire! 🔥`;
  if (numStreak < 30) return `${numStreak} days unstoppable! 🚀`;
  if (numStreak < 100) return `${numStreak} days champion! 🏅`;
  return `${numStreak} days legendary! 🏆`;
};

/**
 * ✅ Get completion percentage for progress bar
 * @param {number} completed - Number of completed tasks
 * @param {number} total - Total number of tasks
 * @returns {number} Percentage (0-100)
 */
export const getCompletionPercentage = (completed, total) => {
  if (!total || total === 0) return 0;
  const percentage = Math.round((completed / total) * 100);
  console.log(`📊 Completion: ${completed}/${total} = ${percentage}%`);
  return percentage;
};

/**
 * ✅ Preload all icons for better performance
 * @returns {Promise<void>}
 */
export const preloadAllDashboardIcons = () => {
  const allIcons = [
    ...Object.values(TIME_BASED_ICONS),
    ...Object.values(STREAK_ICONS)
  ];

  console.log(`🖼️ Preloading ${allIcons.length} dashboard icons...`);

  return Promise.all(
    allIcons.map(icon => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log(`✅ Loaded: ${icon.alt}`);
          resolve();
        };
        img.onerror = () => {
          console.warn(`⚠️ Failed to load: ${icon.alt}`);
          resolve();
        };
        img.src = icon.url;
      });
    })
  ).then(() => {
    console.log(`✅ All dashboard icons preloaded`);
  });
};

/**
 * ✅ Check if it's a new day (for streak tracking)
 * @param {string} lastCompletionDate - Last completion date (YYYY-MM-DD)
 * @returns {boolean} True if it's a new day
 */
export const isNewDay = (lastCompletionDate) => {
  if (!lastCompletionDate) return true;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(lastCompletionDate);
  lastDate.setHours(0, 0, 0, 0);
  
  return today.getTime() !== lastDate.getTime();
};

/**
 * ✅ Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return 'Never';
  
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateOnly = new Date(d);
  dateOnly.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - dateOnly.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default {
  TIME_BASED_ICONS,
  STREAK_ICONS,
  getTimeBasedIcon,
  getStreakIcon,
  getStreakMessage,
  getCompletionPercentage,
  preloadAllDashboardIcons,
  isNewDay,
  formatDate
};
