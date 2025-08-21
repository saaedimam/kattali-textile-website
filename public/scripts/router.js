/**
 * Hash-based SPA Router
 * Handles client-side routing with prefetching and smooth transitions
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.cache = new Map();
    this.prefetchedRoutes = new Set();
    this.loadingElement = null;
    this.appContainer = null;
    this.transitionDuration = getConfig('ANIMATION.DURATION.NORMAL', 300);

    this.init();
  }

  /**
   * Initialize the router
   */
  init() {
    this.appContainer = document.getElementById('app');
    this.loadingElement = document.querySelector('.loading-skeleton');

    // Define routes
    this.defineRoutes();

    // Set up event listeners
    this.setupEventListeners();

    // Handle initial route
    this.handleRoute();

    // Prefetch critical routes
    this.prefetchCriticalRoutes();
  }

  /**
   * Define all application routes
   */
  defineRoutes() {
    const routes = [
      { path: '', component: 'home', title: 'Home' },
      { path: 'home', component: 'home', title: 'Home' },
      { path: 'about', component: 'about', title: 'About Us' },
      { path: 'sustainability', component: 'sustainability', title: 'Sustainability' },
      { path: 'certifications', component: 'certifications', title: 'Certifications' },
      { path: 'clients', component: 'clients', title: 'Our Clients' },
      { path: 'impact', component: 'impact', title: 'Impact Stories' },
      { path: 'careers', component: 'careers', title: 'Careers' },
      { path: 'news', component: 'news', title: 'News & Updates' },
      { path: 'contact', component: 'contact', title: 'Contact Us' },
      { path: 'rfq', component: 'rfq', title: 'Request for Quote' },
      { path: 'investors', component: 'investors', title: 'Investor Relations' },
      { path: 'privacy', component: 'privacy', title: 'Privacy Policy' },
      { path: 'terms', component: 'terms', title: 'Terms of Service' }
    ];

    routes.forEach(route => {
      this.routes.set(route.path, route);
    });
  }

  /**
   * Set up event listeners for routing
   */
  setupEventListeners() {
    // Handle hash change
    window.addEventListener('hashchange', () => this.handleRoute());

    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigateTo(route);
      }
    });

    // Handle back/forward buttons
    window.addEventListener('popstate', () => this.handleRoute());

    // Prefetch on hover
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        const route = link.getAttribute('data-route');
        this.prefetchRoute(route);
      }
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const routeIndex = parseInt(e.key) - 1;
        const routes = Array.from(this.routes.keys()).slice(0, 9);
        if (routes[routeIndex]) {
          this.navigateTo(routes[routeIndex]);
        }
      }
    });
  }

  /**
   * Navigate to a specific route
   * @param {string} path - Route path
   * @param {boolean} pushState - Whether to push to history
   */
  async navigateTo(path, pushState = true) {
    const normalizedPath = path.replace(/^\/+/, '');
    
    if (pushState) {
      window.location.hash = normalizedPath ? `#/${normalizedPath}` : '#/';
    }

    await this.loadRoute(normalizedPath);
  }

  /**
   * Handle current route based on hash
   */
  async handleRoute() {
    const hash = window.location.hash.slice(1);
    const path = hash.startsWith('/') ? hash.slice(1) : hash;
    
    await this.loadRoute(path || '');
  }

  /**
   * Load and render a route
   * @param {string} path - Route path
   */
  async loadRoute(path) {
    const route = this.routes.get(path) || this.routes.get('home');
    
    if (this.currentRoute === route.path) {
      return; // Already on this route
    }

    // Show loading state
    this.showLoading();

    try {
      // Load component content
      const content = await this.loadComponent(route.component);
      
      // Update page title
      this.updatePageTitle(route.title);
      
      // Update active navigation
      this.updateActiveNavigation(route.path);
      
      // Render content with transition
      await this.renderContent(content);
      
      // Update current route
      this.currentRoute = route.path;
      
      // Initialize page-specific functionality
      this.initializePageComponents(route.component);
      
      // Track page view
      this.trackPageView(route);
      
    } catch (error) {
      console.error('Error loading route:', error);
      this.handleRouteError(error);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Load component content from cache or fetch
   * @param {string} component - Component name
   * @returns {string} Component HTML content
   */
  async loadComponent(component) {
    // Check cache first
    if (this.cache.has(component)) {
      return this.cache.get(component);
    }

    try {
      const response = await fetch(`partials/${component}.html`);
      
      if (!response.ok) {
        throw new Error(`Failed to load component: ${response.status}`);
      }

      const content = await response.text();
      
      // Cache the content
      this.cache.set(component, content);
      
      return content;
    } catch (error) {
      console.error(`Error loading component ${component}:`, error);
      return this.getErrorContent(component);
    }
  }

  /**
   * Prefetch a route for faster loading
   * @param {string} path - Route path
   */
  async prefetchRoute(path) {
    if (this.prefetchedRoutes.has(path)) {
      return; // Already prefetched
    }

    const route = this.routes.get(path);
    if (!route) {
      return;
    }

    try {
      await this.loadComponent(route.component);
      this.prefetchedRoutes.add(path);
    } catch (error) {
      console.error('Error prefetching route:', error);
    }
  }

  /**
   * Prefetch critical routes for better performance
   */
  async prefetchCriticalRoutes() {
    const criticalRoutes = ['about', 'contact', 'rfq'];
    
    // Delay prefetching to not interfere with initial load
    setTimeout(async () => {
      for (const route of criticalRoutes) {
        await this.prefetchRoute(route);
        // Small delay between prefetches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }, getConfig('PERFORMANCE.PREFETCH_DELAY', 2000));
  }

  /**
   * Render content with smooth transitions
   * @param {string} content - HTML content to render
   */
  async renderContent(content) {
    if (!this.appContainer) {
      return;
    }

    // Fade out current content
    this.appContainer.style.opacity = '0';
    this.appContainer.style.transform = 'translateY(20px)';

    // Wait for transition
    await new Promise(resolve => setTimeout(resolve, this.transitionDuration / 2));

    // Update content
    this.appContainer.innerHTML = content;

    // Trigger any content-specific animations
    this.triggerContentAnimations();

    // Fade in new content
    this.appContainer.style.opacity = '1';
    this.appContainer.style.transform = 'translateY(0)';

    // Ensure accessibility focus
    this.manageFocus();
  }

  /**
   * Update page title and meta tags
   * @param {string} title - Page title
   */
  updatePageTitle(title) {
    const fullTitle = getConfig('SEO.TITLE_TEMPLATE', '%s | Kattali Textile Ltd.').replace('%s', title);
    document.title = fullTitle;

    // Update meta description if available
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const defaultDescription = getConfig('SEO.DEFAULT_DESCRIPTION', '');
      metaDescription.setAttribute('content', defaultDescription);
    }

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const baseUrl = getConfig('SEO.CANONICAL_URL', '');
      canonical.setAttribute('href', `${baseUrl}${window.location.hash}`);
    }
  }

  /**
   * Update active navigation state
   * @param {string} path - Current route path
   */
  updateActiveNavigation(path) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to current route links
    document.querySelectorAll(`[data-route="${path}"], [data-route="${path || 'home'}"]`).forEach(link => {
      link.classList.add('active');
    });
  }

  /**
   * Initialize page-specific components and functionality
   * @param {string} component - Component name
   */
  initializePageComponents(component) {
    // Initialize kinetic typography
    this.initializeKineticText();

    // Initialize intersection observers for animations
    this.initializeScrollAnimations();

    // Initialize component-specific functionality
    switch (component) {
      case 'home':
        this.initializeHomeComponents();
        break;
      case 'contact':
        this.initializeContactForm();
        break;
      case 'rfq':
        this.initializeRFQForm();
        break;
      case 'investors':
        this.initializeInvestorCharts();
        break;
      case 'careers':
        this.initializeCareersComponents();
        break;
      case 'news':
        this.initializeNewsComponents();
        break;
      default:
        // Generic initialization
        this.initializeGenericComponents();
    }

    // Initialize all tilt cards
    this.initializeTiltCards();
  }

  /**
   * Initialize kinetic text animations
   */
  initializeKineticText() {
    const kineticTexts = document.querySelectorAll('.kinetic-text');
    
    kineticTexts.forEach(textElement => {
      const text = textElement.textContent;
      const letters = text.split('').map(letter => {
        return `<span class="letter">${letter === ' ' ? '&nbsp;' : letter}</span>`;
      });
      
      textElement.innerHTML = letters.join('');
      
      // Animate letters with stagger
      setTimeout(() => {
        textElement.classList.add('animate');
        const letterElements = textElement.querySelectorAll('.letter');
        letterElements.forEach((letter, index) => {
          letter.style.transitionDelay = `${index * 50}ms`;
        });
      }, 100);
    });
  }

  /**
   * Initialize scroll-triggered animations
   */
  initializeScrollAnimations() {
    if (!window.IntersectionObserver) {
      return; // Fallback for older browsers
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe elements for animation
    document.querySelectorAll('.animate-on-scroll, .tilt-card, .stat-item').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Initialize 3D tilt cards
   */
  initializeTiltCards() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
      const cardInner = card.querySelector('.tilt-card-inner');
      if (!cardInner) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const rotateX = (y / rect.height) * 20;
        const rotateY = -(x / rect.width) * 20;
        
        cardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        cardInner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      });
    });
  }

  /**
   * Initialize home page components
   */
  initializeHomeComponents() {
    // Initialize counters
    this.initializeCounters();
    
    // Initialize hero animations
    this.initializeHeroAnimations();
    
    // Initialize marquee
    this.initializeMarquee();
  }

  /**
   * Initialize contact form
   */
  initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmission(form, 'contact');
    });
  }

  /**
   * Initialize RFQ form
   */
  initializeRFQForm() {
    const form = document.getElementById('rfq-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmission(form, 'rfq');
    });

    // Initialize multi-step form functionality
    this.initializeMultiStepForm(form);
  }

  /**
   * Initialize investor charts
   */
  initializeInvestorCharts() {
    if (typeof window.initializeCharts === 'function') {
      window.initializeCharts();
    }
  }

  /**
   * Handle form submissions
   * @param {HTMLFormElement} form - Form element
   * @param {string} type - Form type
   */
  async handleFormSubmission(form, type) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
      // Show loading state
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;

      // Collect form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Send to API
      const endpoint = getConfig(`API.ENDPOINTS.${type.toUpperCase()}`, '/api/contact');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        this.showSuccessToast('Message sent successfully!');
        form.reset();
        this.triggerConfetti();
      } else {
        throw new Error('Failed to send message');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorToast('Failed to send message. Please try again.');
    } finally {
      // Reset button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'block';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  /**
   * Show success toast notification
   * @param {string} message - Success message
   */
  showSuccessToast(message) {
    const toast = document.getElementById('success-toast');
    const messageElement = toast.querySelector('.toast-message');
    
    messageElement.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /**
   * Show error toast notification
   * @param {string} message - Error message
   */
  showErrorToast(message) {
    // Create error toast if it doesn't exist
    let toast = document.getElementById('error-toast');
    if (!toast) {
      toast = this.createErrorToast();
      document.body.appendChild(toast);
    }

    const messageElement = toast.querySelector('.toast-message');
    messageElement.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /**
   * Create error toast element
   * @returns {HTMLElement} Error toast element
   */
  createErrorToast() {
    const toast = document.createElement('div');
    toast.id = 'error-toast';
    toast.className = 'toast error-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <svg class="toast-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span class="toast-message"></span>
      </div>
    `;
    return toast;
  }

  /**
   * Trigger confetti animation
   */
  triggerConfetti() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;

    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      container.appendChild(confetti);

      // Remove after animation
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }

  /**
   * Handle route errors
   * @param {Error} error - Error object
   */
  handleRouteError(error) {
    console.error('Route error:', error);
    
    const errorContent = `
      <div class="error-page">
        <h1>Oops! Something went wrong</h1>
        <p>We're having trouble loading this page. Please try again later.</p>
        <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
      </div>
    `;
    
    this.appContainer.innerHTML = errorContent;
  }

  /**
   * Get error content for failed component loads
   * @param {string} component - Component name
   * @returns {string} Error HTML content
   */
  getErrorContent(component) {
    return `
      <div class="error-content">
        <h2>Content Unavailable</h2>
        <p>Sorry, we're having trouble loading the ${component} page content.</p>
        <p>Please check your internet connection and try again.</p>
        <button onclick="location.reload()" class="btn btn-secondary">Retry</button>
      </div>
    `;
  }

  /**
   * Manage focus for accessibility
   */
  manageFocus() {
    // Focus on main heading or first focusable element
    const mainHeading = this.appContainer.querySelector('h1, h2');
    if (mainHeading) {
      mainHeading.setAttribute('tabindex', '-1');
      mainHeading.focus();
    }
  }

  /**
   * Track page view for analytics
   * @param {Object} route - Route object
   */
  trackPageView(route) {
    if (isFeatureEnabled('ANALYTICS') && typeof gtag === 'function') {
      gtag('config', getConfig('ANALYTICS.GOOGLE_ANALYTICS_ID'), {
        page_title: route.title,
        page_location: window.location.href
      });
    }
  }

  /**
   * Trigger content-specific animations
   */
  triggerContentAnimations() {
    // Animate elements that came into view
    const animatedElements = this.appContainer.querySelectorAll('.animate-on-load');
    animatedElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 100);
    });
  }

  /**
   * Initialize counters animation
   */
  initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      updateCounter();
    });
  }

  /**
   * Initialize hero animations
   */
  initializeHeroAnimations() {
    const heroElements = document.querySelectorAll('.hero-animate');
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 200);
    });
  }

  /**
   * Initialize marquee
   */
  initializeMarquee() {
    const marquees = document.querySelectorAll('.marquee-content');
    marquees.forEach(marquee => {
      // Clone content for seamless loop
      const clone = marquee.cloneNode(true);
      marquee.parentElement.appendChild(clone);
    });
  }

  /**
   * Initialize multi-step form
   * @param {HTMLFormElement} form - Form element
   */
  initializeMultiStepForm(form) {
    const steps = form.querySelectorAll('.form-step');
    const nextButtons = form.querySelectorAll('.btn-next');
    const prevButtons = form.querySelectorAll('.btn-prev');
    let currentStep = 0;

    const showStep = (step) => {
      steps.forEach((s, index) => {
        s.style.display = index === step ? 'block' : 'none';
      });
    };

    nextButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          showStep(currentStep);
        }
      });
    });

    prevButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
        }
      });
    });

    // Initialize first step
    showStep(0);
  }

  /**
   * Initialize generic components
   */
  initializeGenericComponents() {
    // Add any generic component initialization here
    this.initializeLazyLoading();
    this.initializeTooltips();
  }

  /**
   * Initialize lazy loading for images
   */
  initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Initialize tooltips
   */
  initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target, e.target.dataset.tooltip);
      });

      element.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }

  /**
   * Show tooltip
   * @param {HTMLElement} element - Target element
   * @param {string} text - Tooltip text
   */
  showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.id = 'current-tooltip';
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    const tooltip = document.getElementById('current-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }

  /**
   * Initialize careers components
   */
  initializeCareersComponents() {
    // Initialize job application forms
    const jobForms = document.querySelectorAll('.job-application-form');
    jobForms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleFormSubmission(form, 'careers');
      });
    });
  }

  /**
   * Initialize news components
   */
  initializeNewsComponents() {
    // Initialize news filters
    const filterButtons = document.querySelectorAll('.news-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        this.filterNewsItems(category);
      });
    });
  }

  /**
   * Filter news items by category
   * @param {string} category - News category
   */
  filterNewsItems(category) {
    const newsItems = document.querySelectorAll('.news-item');
    
    newsItems.forEach(item => {
      const itemCategory = item.dataset.category;
      if (category === 'all' || itemCategory === category) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });

    // Update active filter button
    document.querySelectorAll('.news-filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
  }
}

// Initialize router when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
  });
} else {
  window.router = new Router();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}
