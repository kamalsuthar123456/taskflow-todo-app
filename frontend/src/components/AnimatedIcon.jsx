// src/components/AnimatedIcon.jsx

import { motion } from "framer-motion";
import { useState } from "react";

/**
 * AnimatedIcon Component
 * Reusable 3D icon with animations and loading states
 */
const AnimatedIcon = ({ 
  iconConfig, 
  size = 'md', 
  animationType = 'float',
  showLabel = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  // Animation variants
  const animations = {
    float: {
      y: [0, -12, 0],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    rotate: {
      rotate: [0, 360],
      scale: [1, 1.05, 1],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, ...animations[animationType] }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Glow Background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${iconConfig.gradient} rounded-2xl blur-2xl opacity-30`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Glass Container */}
        <div className={`relative ${sizeClasses[size]} rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 overflow-hidden shadow-2xl`}>
          {/* 3D Icon Image - FIXED: Always visible */}
          {!imageError ? (
            <img
              src={iconConfig.url}
              alt={iconConfig.alt}
              className={`${iconSizeClasses[size]} object-contain`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="eager"
            />
          ) : (
            // Fallback Icon
            <div className={`${iconSizeClasses[size]} flex items-center justify-center text-white/50`}>
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          )}

          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0"
            animate={{
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          />
        </div>
      </motion.div>

      {/* Optional Label */}
      {showLabel && imageLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-xs font-semibold text-white/70"
        >
          {iconConfig.label}
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedIcon;
