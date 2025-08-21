/**
 * Main Application Script
 * Handles core functionality, UI interactions, and advanced effects
 */

class KTLApplication {
  constructor() {
    this.isInitialized = false;
    this.spotlightCursor = null;
    this.scrollProgress = null;
    this.themeToggle = null;
    this.mobileMenuToggle = null;
    this.currentTheme = 'dark';
    this.animationObserver = null;
    this.prefersReducedMotion = false;

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Wait for DOM to be ready
      await this.waitForDOM();

      // Check for reduced motion preference
      this.checkReducedMotionPreference();

      // Initialize core components
      this.initializeTheme();
      this.initializeNavigation();
      this.initializeScrollProgress();
      this.initializeSpotlightCursor();
      this.initializeMobileMenu();
      this.initializeGlobalAnimations();
      this.initializeAccessibilityFeatures();
      this.initializePerformanceOptimizations();
      
      // Initialize service worker if supported
      this.initializeServiceWorker();

      // Mark as initialized
      this.isInitialized = true;

      // Dispatch ready event
      this.dispatchReadyEvent();

    } catch (error) {
      console.error('Application initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Wait for DOM to be ready
   */
  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * Check for reduced motion preference
   */
  checkReducedMotionPreference() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      this.updateAnimationSettings();
    });
  }

  /**
   * Update animation settings based on preference
   */
  updateAnimationSettings() {
    const body = document.body;
    
    if (this.prefersReducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }

  /**
   * Initialize theme system
   */
  initializeTheme() {
    // Get saved theme or detect preference
    const savedTheme = localStorage.getItem(getConfig('THEME.STORAGE_KEY', 'ktl-theme-preference'));
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    this.currentTheme = savedTheme || (getConfig('THEME.AUTO_DETECT', true) ? systemTheme : getConfig('THEME.DEFAULT', 'dark'));

    // Apply theme
    this.applyTheme(this.currentTheme);

    // Initialize theme toggle
    this.themeToggle = document.querySelector('.theme-toggle');
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Listen for system theme changes
    if (getConfig('THEME.AUTO_DETECT', true)) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!savedTheme) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /**
   * Apply theme to document
   * @param {string} theme - Theme name ('dark' or 'light')
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    
    // Update theme toggle icon
    if (this.themeToggle) {
      this.themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }

    // Smooth transition for theme change
    if (!this.prefersReducedMotion) {
      document.documentElement.style.transition = 'color-scheme 0.3s ease, background-color 0.3s ease';
      setTimeout(() => {
        document.documentElement.style.transition = '';
      }, 300);
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    localStorage.setItem(getConfig('THEME.STORAGE_KEY', 'ktl-theme-preference'), newTheme);

    // Announce to screen readers
    this.announceToScreenReader(`Switched to ${newTheme} theme`);
  }

  /**
   * Initialize navigation functionality
   */
  initializeNavigation() {
    const nav = document.querySelector('.liquid-nav');
    if (!nav) return;

    // Handle scroll effects on navigation
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNavOnScroll = () => {
      const scrollY = window.scrollY;
      const navHeight = nav.offsetHeight;

      // Add backdrop blur when scrolled
      if (scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      // Hide/show navigation based on scroll direction
      if (scrollY > navHeight && scrollY > lastScrollY) {
        nav.classList.add('nav-hidden');
      } else if (scrollY < lastScrollY) {
        nav.classList.remove('nav-hidden');
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateNavOnScroll);
        ticking = true;
      }
    });

    // Initialize liquid nav hover effects
    this.initializeLiquidNavEffects();
  }

  /**
   * Initialize liquid navigation hover effects
   */
  initializeLiquidNavEffects() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        if (this.prefersReducedMotion) return;
        
        // Create ripple effect
        this.createRippleEffect(e.target, e);
      });
    });
  }

  /**
   * Create ripple effect on element
   * @param {HTMLElement} element - Target element
   * @param {Event} event - Mouse event
   */
  createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * Initialize scroll progress bar
   */
  initializeScrollProgress() {
    this.scrollProgress = document.querySelector('.scroll-progress');
    if (!this.scrollProgress) return;

    let ticking = false;

    const updateScrollProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      this.scrollProgress.style.width = scrolled + '%';
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    });
  }

  /**
   * Initialize spotlight cursor effect
   */
  initializeSpotlightCursor() {
    this.spotlightCursor = document.querySelector('.spotlight-cursor');
    if (!this.spotlightCursor || this.prefersReducedMotion) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Animate spotlight cursor
    const animateSpotlight = () => {
      // Smooth following animation
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      
      this.spotlightCursor.style.left = (cursorX - 100) + 'px';
      this.spotlightCursor.style.top = (cursorY - 100) + 'px';
      
      requestAnimationFrame(animateSpotlight);
    };

    animateSpotlight();

    // Show/hide spotlight on navigation hover
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
      navContainer.addEventListener('mouseenter', () => {
        this.spotlightCursor.style.opacity = '1';
      });

      navContainer.addEventListener('mouseleave', () => {
        this.spotlightCursor.style.opacity = '0';
      });
    }
  }

  /**
   * Initialize mobile menu functionality
   */
  initializeMobileMenu() {
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    
    if (!this.mobileMenuToggle || !mobileNavOverlay) return;

    this.mobileMenuToggle.addEventListener('click', () => {
      const isOpen = this.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      
      // Toggle menu state
      this.mobileMenuToggle.setAttribute('aria-expanded', !isOpen);
      mobileNavOverlay.setAttribute('aria-hidden', isOpen);
      
      // Toggle body scroll
      document.body.style.overflow = !isOpen ? 'hidden' : '';
      
      // Announce to screen readers
      this.announceToScreenReader(!isOpen ? 'Mobile menu opened' : 'Mobile menu closed');
    });

    // Close menu when clicking outside
    mobileNavOverlay.addEventListener('click', (e) => {
      if (e.target === mobileNavOverlay) {
        this.closeMobileMenu();
      }
    });

    // Close menu when pressing escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
        this.closeMobileMenu();
      }
    });

    // Close menu when clicking nav links
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileNavOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    this.announceToScreenReader('Mobile menu closed');
  }

  /**
   * Initialize global animations
   */
  initializeGlobalAnimations() {
    if (this.prefersReducedMotion) return;

    // Initialize intersection observer for scroll animations
    this.animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Stagger animation for child elements
          const children = entry.target.querySelectorAll('.stagger-child');
          children.forEach((child, index) => {
            child.style.animationDelay = `${index * 100}ms`;
            child.classList.add('animate-in');
          });
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Initialize parallax effects
    this.initializeParallaxEffects();
    
    // Initialize floating elements
    this.initializeFloatingElements();
    
    // Initialize glow effects
    this.initializeGlowEffects();
  }

  /**
   * Initialize parallax effects
   */
  initializeParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    if (parallaxElements.length === 0) return;

    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
        const yPos = -(scrollY * speed);
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
      
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }

  /**
   * Initialize floating elements
   */
  initializeFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
      const amplitude = parseFloat(element.dataset.amplitude) || 20;
      const speed = parseFloat(element.dataset.speed) || 1;
      const delay = index * 0.5;
      
      let startTime = Date.now() + delay * 1000;
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const y = Math.sin(elapsed * speed) * amplitude;
        
        element.style.transform = `translateY(${y}px)`;
        requestAnimationFrame(animate);
      };
      
      animate();
    });
  }

  /**
   * Initialize glow effects
   */
  initializeGlowEffects() {
    const glowElements = document.querySelectorAll('.glow-element');
    
    glowElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        if (!this.prefersReducedMotion) {
          element.classList.add('glowing');
        }
      });
      
      element.addEventListener('mouseleave', () => {
        element.classList.remove('glowing');
      });
    });
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibilityFeatures() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Keyboard navigation enhancements
    this.initializeKeyboardNavigation();
    
    // ARIA live regions
    this.initializeAriaLiveRegions();
    
    // Focus management
    this.initializeFocusManagement();
  }

  /**
   * Initialize keyboard navigation
   */
  initializeKeyboardNavigation() {
    // Tab trap for modal dialogs
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modals = document.querySelectorAll('.modal[aria-hidden="false"]');
        if (modals.length > 0) {
          this.trapTabInModal(e, modals[modals.length - 1]);
        }
      }
    });

    // Arrow key navigation for menus
    const menus = document.querySelectorAll('[role="menu"], [role="menubar"]');
    menus.forEach(menu => {
      this.addArrowKeyNavigation(menu);
    });
  }

  /**
   * Add arrow key navigation to menu
   * @param {HTMLElement} menu - Menu element
   */
  addArrowKeyNavigation(menu) {
    const menuItems = menu.querySelectorAll('[role="menuitem"]');
    
    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        let targetIndex;
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            targetIndex = (index + 1) % menuItems.length;
            menuItems[targetIndex].focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            targetIndex = (index - 1 + menuItems.length) % menuItems.length;
            menuItems[targetIndex].focus();
            break;
          case 'Home':
            e.preventDefault();
            menuItems[0].focus();
            break;
          case 'End':
            e.preventDefault();
            menuItems[menuItems.length - 1].focus();
            break;
        }
      });
    });
  }

  /**
   * Trap tab key in modal
   * @param {Event} e - Keyboard event
   * @param {HTMLElement} modal - Modal element
   */
  trapTabInModal(e, modal) {
    const focusableElements = modal.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Initialize ARIA live regions
   */
  initializeAriaLiveRegions() {
    // Create live region for announcements
    if (!document.getElementById('aria-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
  }

  /**
   * Initialize focus management
   */
  initializeFocusManagement() {
    // Store last focused element when modal opens
    this.lastFocusedElement = null;
    
    document.addEventListener('focus', (e) => {
      if (!e.target.closest('.modal')) {
        this.lastFocusedElement = e.target;
      }
    });

    // Restore focus when modal closes
    document.addEventListener('modalClosed', () => {
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }
    });
  }

  /**
   * Initialize performance optimizations
   */
  initializePerformanceOptimizations() {
    // Lazy load images
    this.initializeLazyLoading();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Initialize resource hints
    this.initializeResourceHints();
    
    // Monitor performance
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize lazy loading
   */
  initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: `${getConfig('PERFORMANCE.LAZY_LOAD_OFFSET', 100)}px`
      });

      // Observe all lazy images
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without Intersection Observer
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    const criticalResources = [
      'partials/home.html',
      'partials/about.html',
      'partials/contact.html'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  /**
   * Initialize resource hints
   */
  initializeResourceHints() {
    // DNS prefetch for external domains
    const externalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'api.ktlbd.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring() {
    if (!isFeatureEnabled('DEV.PERFORMANCE_MONITORING')) return;

    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ onCLS, onFID, onLCP }) => {
        onCLS(console.log);
        onFID(console.log);
        onLCP(console.log);
      });
    }

    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const loadTime = nav.loadEventEnd - nav.loadEventStart;
        
        if (getConfig('DEV.CONSOLE_LOGS', false)) {
          console.log(`Page load time: ${loadTime}ms`);
        }
      }, 0);
    });
  }

  /**
   * Initialize service worker
   */
  async initializeServiceWorker() {
    if (!isFeatureEnabled('SERVICE_WORKER.ENABLED') || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateNotification();
          }
        });
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Show update notification
   */
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <p>A new version is available!</p>
        <button onclick="location.reload()" class="btn btn-sm btn-primary">Update</button>
        <button onclick="this.parentElement.parentElement.remove()" class="btn btn-sm btn-secondary">Later</button>
      </div>
    `;
    
    document.body.appendChild(notification);
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  /**
   * Handle initialization errors
   * @param {Error} error - Error object
   */
  handleInitializationError(error) {
    console.error('KTL Application failed to initialize:', error);
    
    // Show user-friendly error message
    const errorElement = document.createElement('div');
    errorElement.className = 'init-error';
    errorElement.innerHTML = `
      <div class="error-content">
        <h2>Application Error</h2>
        <p>We're having trouble loading the application. Please refresh the page or try again later.</p>
        <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
      </div>
    `;
    
    document.body.appendChild(errorElement);
  }

  /**
   * Dispatch application ready event
   */
  dispatchReadyEvent() {
    const readyEvent = new CustomEvent('ktlAppReady', {
      detail: { version: getConfig('PERFORMANCE.CACHE_VERSION', '1.0.0') }
    });
    
    document.dispatchEvent(readyEvent);
    
    if (getConfig('DEV.CONSOLE_LOGS', false)) {
      console.log('🚀 KTL Application initialized successfully');
    }
  }

  /**
   * Utility method to debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately
   */
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  /**
   * Utility method to throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Get application instance (singleton pattern)
   */
  static getInstance() {
    if (!KTLApplication.instance) {
      KTLApplication.instance = new KTLApplication();
    }
    return KTLApplication.instance;
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  window.ktlApp = KTLApplication.getInstance();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KTLApplication;
}

// Global utility functions
window.ktlUtils = {
  /**
   * Format number with commas
   * @param {number} num - Number to format
   */
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Animate counter to target value
   * @param {HTMLElement} element - Target element
   * @param {number} target - Target value
   * @param {number} duration - Animation duration in ms
   */
  animateCounter: (element, target, duration = 2000) => {
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const animate = () => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        element.textContent = target;
      } else {
        element.textContent = Math.floor(current);
        requestAnimationFrame(animate);
      }
    };

    animate();
  },

  /**
   * Create particle explosion effect
   * @param {HTMLElement} element - Source element
   * @param {Object} options - Effect options
   */
  createParticleExplosion: (element, options = {}) => {
    const defaults = {
      particleCount: 30,
      colors: ['#00d4ff', '#5b63f7', '#00ff88'],
      duration: 2000
    };
    
    const config = { ...defaults, ...options };
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < config.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: ${config.colors[i % config.colors.length]};
        pointer-events: none;
        border-radius: 50%;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        z-index: 1000;
      `;
      
      document.body.appendChild(particle);
      
      // Animate particle
      const angle = (i / config.particleCount) * Math.PI * 2;
      const velocity = Math.random() * 200 + 100;
      const gravity = 0.5;
      
      let x = 0, y = 0, vx = Math.cos(angle) * velocity, vy = Math.sin(angle) * velocity;
      
      const animateParticle = () => {
        x += vx * 0.016;
        y += vy * 0.016;
        vy += gravity;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = Math.max(0, 1 - (Date.now() - startTime) / config.duration);
        
        if (particle.style.opacity > 0) {
          requestAnimationFrame(animateParticle);
        } else {
          particle.remove();
        }
      };
      
      const startTime = Date.now();
      requestAnimationFrame(animateParticle);
    }
  }
};


(function applyOverrides(){
  const html = localStorage.getItem('ktl-site-html');
  const css  = localStorage.getItem('ktl-site-css');
  if (css) {
    let tag = document.getElementById('ktl-custom-css');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'ktl-custom-css';
      document.head.appendChild(tag);
    }
    tag.textContent = css;
  }
  if (html) {
    const app = document.getElementById('app');
    if (app) app.innerHTML = html;
  }
})();
