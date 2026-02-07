import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * ✅ ENHANCED AnimatedIcon Component
 * Reusable 3D icon with animations, loading states, and fallbacks
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

  // ✅ ENHANCED: Animation variants with more natural movement
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
    pulse: {
      scale: [1, 1.15, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    bounce: {
      y: [0, -15, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: "easeOut"
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
    }
  };

  // ✅ Preload image on mount
  useEffect(() => {
    if (iconConfig?.url) {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(false);
        console.error(`❌ Failed to load icon: ${iconConfig.url}`);
      };
      img.src = iconConfig.url;
    }
  }, [iconConfig?.url, iconConfig?.alt]);

  if (!iconConfig) {
    return null;
  }

  // ✅ Emoji fallback map
  const getEmojiFallback = () => {
    const label = iconConfig.label?.toLowerCase() || '';
    if (label.includes('morning') || label.includes('coffee')) return '☕';
    if (label.includes('afternoon') || label.includes('sun')) return '☀️';
    if (label.includes('evening') || label.includes('sunset')) return '🌅';
    if (label.includes('night') || label.includes('moon')) return '🌙';
    if (label.includes('growing') || label.includes('sprout')) return '🌱';
    if (label.includes('seedling') || label.includes('plant')) return '🪴';
    if (label.includes('fire') || label.includes('building')) return '🔥';
    if (label.includes('rocket') || label.includes('unstoppable')) return '🚀';
    if (label.includes('champion') || label.includes('medal')) return '🏅';
    if (label.includes('legendary') || label.includes('trophy') || label.includes('master')) return '🏆';
    return '✨';
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          ...animations[animationType] 
        }}
        transition={{ duration: 0.5 }}
      >
        {/* ✅ Animated Glow Background */}
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

        {/* ✅ Glass Container */}
        <div className={`relative ${sizeClasses[size]} rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 overflow-hidden shadow-2xl`}>
          
          {/* ✅ Icon Image or Emoji Fallback */}
          {!imageError && iconConfig.url ? (
            <img
              src={iconConfig.url}
              alt={iconConfig.alt}
              className={`${iconSizeClasses[size]} object-contain ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="eager"
            />
          ) : (
            // ✅ Fallback Emoji with same size
            <div className={`${iconSizeClasses[size]} flex items-center justify-center text-5xl`}>
              {getEmojiFallback()}
            </div>
          )}

          {/* ✅ Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className={`absolute inset-3 bg-white/10 rounded-lg animate-pulse`} />
          )}

          {/* ✅ Shine Effect */}
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

      {/* ✅ Optional Label with Description */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-center"
        >
          <div className="text-xs font-semibold text-white/80">
            {iconConfig.label}
          </div>
          {iconConfig.description && (
            <div className="text-[10px] text-white/50 mt-0.5">
              {iconConfig.description}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedIcon;
