/**
 * Configuration Module
 * Centralizes all app configuration and environment variables
 */

const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: 'https://api.ktlbd.com',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    ENDPOINTS: {
      NEWS: '/api/news',
      CONTACT: '/api/contact',
      RFQ: '/api/rfq',
      CAREERS: '/api/careers',
      STOCKS: '/api/stocks'
    }
  },

  // Feature Flags
  FEATURES: {
    ANIMATIONS: true,
    SOUND_EFFECTS: false,
    ADVANCED_CHARTS: true,
    LIVE_CHAT: false,
    ANALYTICS: true,
    SERVICE_WORKER: true
  },

  // Theme Configuration
  THEME: {
    DEFAULT: 'dark',
    STORAGE_KEY: 'ktl-theme-preference',
    AUTO_DETECT: true
  },

  // Animation Configuration
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500
    },
    EASING: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      SMOOTH: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    RESPECT_REDUCED_MOTION: true
  },

  // Carousel and Interactive Elements
  CAROUSEL: {
    AUTO_PLAY: true,
    INTERVAL: 5000,
    PAUSE_ON_HOVER: true,
    INFINITE_LOOP: true
  },

  // Company Information
  COMPANY: {
    NAME: 'Kattali Textile Ltd.',
    SHORT_NAME: 'KTL',
    LOCATION: 'Chattogram, Bangladesh',
    FOUNDED: 2010,
    PRODUCTION_LINES: 12,
    TEAM_SIZE: '850+',
    CERTIFICATIONS: ['OEKO-TEX', 'ISO 9001', 'BSCI', 'WRAP'],
    EXPORT_MARKETS: ['USA', 'Canada', 'UK', 'EU'],
    EMAIL: 'info@ktlbd.com',
    PHONE: '+880 123 456 7890',
    WEBSITE: 'https://ktlbd.com'
  },

  // SEO and Meta Configuration
  SEO: {
    DEFAULT_TITLE: 'Kattali Textile Ltd. - Future-ready Apparal Manufacturing',
    TITLE_TEMPLATE: '%s | Kattali Textile Ltd.',
    DEFAULT_DESCRIPTION: 'Leading textile manufacturer in Bangladesh with 12 production lines, 850+ team members. ISO-certified, ethical, sustainable production for global markets.',
    DEFAULT_KEYWORDS: 'textile manufacturing, garment production, sustainable fashion, Bangladesh textiles, ethical manufacturing, OEKO-TEX certified',
    CANONICAL_URL: 'https://ktlbd.com',
    SOCIAL_IMAGE: '/img/social-preview.jpg'
  },

  // Performance Configuration
  PERFORMANCE: {
    LAZY_LOAD_OFFSET: 100,
    IMAGE_QUALITY: 85,
    PREFETCH_DELAY: 2000,
    CACHE_VERSION: '1.0.0'
  },

  // Error Handling
  ERROR_HANDLING: {
    RETRY_DELAY: 1000,
    MAX_RETRIES: 3,
    FALLBACK_ENABLED: true,
    LOG_ERRORS: true,
    SHOW_DETAILED_ERRORS: false // Set to true in development
  },

  // Analytics (if enabled)
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: null, // Set from environment variable
    TRACK_PAGE_VIEWS: true,
    TRACK_EVENTS: true,
    ANONYMIZE_IP: true
  },

  // Service Worker Configuration
  SERVICE_WORKER: {
    ENABLED: true,
    UPDATE_CHECK_INTERVAL: 60000, // 1 minute
    CACHE_STRATEGY: 'cache-first',
    OFFLINE_PAGE: '/offline.html'
  },

  // Development Configuration
  DEV: {
    CONSOLE_LOGS: true,
    PERFORMANCE_MONITORING: true,
    ERROR_OVERLAY: true
  }
};

/**
 * Get configuration value by path
 * @param {string} path - Dot notation path (e.g., 'API.BASE_URL')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value
 */
function getConfig(path, defaultValue = null) {
  return path.split('.').reduce((obj, key) => {
    return obj && obj[key] !== undefined ? obj[key] : defaultValue;
  }, CONFIG);
}

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature
 * @returns {boolean} Whether the feature is enabled
 */
function isFeatureEnabled(featureName) {
  return getConfig(`FEATURES.${featureName}`, false);
}

/**
 * Get environment-specific configuration
 */
function initializeConfig() {
  // Override with environment variables if available
  if (typeof process !== 'undefined' && process.env) {
    CONFIG.API.BASE_URL = process.env.API_BASE_URL || CONFIG.API.BASE_URL;
    CONFIG.ANALYTICS.GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || CONFIG.ANALYTICS.GOOGLE_ANALYTICS_ID;
    CONFIG.DEV.CONSOLE_LOGS = process.env.NODE_ENV !== 'production';
    CONFIG.ERROR_HANDLING.SHOW_DETAILED_ERRORS = process.env.NODE_ENV === 'development';
  }

  // Browser-specific overrides
  if (typeof window !== 'undefined') {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      CONFIG.FEATURES.ANIMATIONS = false;
      CONFIG.CAROUSEL.AUTO_PLAY = false;
      CONFIG.ANIMATION.DURATION.FAST = 1;
      CONFIG.ANIMATION.DURATION.NORMAL = 1;
      CONFIG.ANIMATION.DURATION.SLOW = 1;
    }

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      CONFIG.FEATURES.ANIMATIONS = false;
    }

    // Performance-based feature detection
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        CONFIG.FEATURES.ANIMATIONS = false;
        CONFIG.FEATURES.ADVANCED_CHARTS = false;
        CONFIG.CAROUSEL.AUTO_PLAY = false;
      }
    }

    // Device capability detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      CONFIG.FEATURES.SOUND_EFFECTS = false;
      CONFIG.PERFORMANCE.LAZY_LOAD_OFFSET = 50;
    }
  }

  // Validate configuration
  validateConfig();
}

/**
 * Validate configuration values
 */
function validateConfig() {
  const errors = [];

  // Validate API configuration
  if (!CONFIG.API.BASE_URL) {
    errors.push('API.BASE_URL is required');
  }

  if (CONFIG.API.TIMEOUT < 1000) {
    errors.push('API.TIMEOUT should be at least 1000ms');
  }

  // Validate animation durations
  Object.values(CONFIG.ANIMATION.DURATION).forEach(duration => {
    if (duration < 0) {
      errors.push('Animation durations must be positive');
    }
  });

  // Log validation errors in development
  if (errors.length > 0 && CONFIG.DEV.CONSOLE_LOGS) {
    console.warn('Configuration validation errors:', errors);
  }
}

/**
 * Export configuration object and utility functions
 */
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    CONFIG,
    getConfig,
    isFeatureEnabled,
    initializeConfig
  };
} else {
  // Browser environment
  window.CONFIG = CONFIG;
  window.getConfig = getConfig;
  window.isFeatureEnabled = isFeatureEnabled;
  window.initializeConfig = initializeConfig;
}

// Initialize configuration when module loads
initializeConfig();
