/**
 * Stock Market and Financial Data Visualization
 * Handles investor relations charts, financial metrics, and real-time data
 */

class StockVisualization {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.data = [];
    this.isAnimating = false;
    this.glowIntensity = 0;
    this.mousePosition = { x: 0, y: 0 };
    
    this.init();
  }

  /**
   * Initialize the stock visualization
   */
  init() {
    // Find canvas element
    this.canvas = document.getElementById('investor-chart');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    
    // Set up canvas
    this.setupCanvas();
    
    // Generate sample data
    this.generateSampleData();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start animation
    this.startAnimation();
  }

  /**
   * Setup canvas properties and sizing
   */
  setupCanvas() {
    const container = this.canvas.parentElement;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set actual size
    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    
    // Set display size
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    // Scale context
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Handle resize
    window.addEventListener('resize', this.debounce(() => {
      this.setupCanvas();
    }, 250));
  }

  /**
   * Generate sample financial data
   */
  generateSampleData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseValue = 100;
    let currentValue = baseValue;
    
    this.data = months.map((month, index) => {
      // Generate realistic stock movement
      const volatility = 0.1;
      const trend = 0.02; // Slight upward trend
      const change = (Math.random() - 0.5) * volatility + trend;
      
      currentValue *= (1 + change);
      
      return {
        label: month,
        value: currentValue,
        x: 0, // Will be calculated during render
        y: 0, // Will be calculated during render
        targetX: 0,
        targetY: 0
      };
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition.x = e.clientX - rect.left;
      this.mousePosition.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseenter', () => {
      this.isHovering = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isHovering = false;
    });
  }

  /**
   * Start the animation loop
   */
  startAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.animate();
  }

  /**
   * Stop the animation loop
   */
  stopAnimation() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  /**
   * Main animation loop
   */
  animate() {
    if (!this.isAnimating) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update glow intensity
    this.glowIntensity = Math.sin(Date.now() * 0.002) * 0.3 + 0.7;
    
    // Calculate positions
    this.calculatePositions();
    
    // Draw background grid
    this.drawGrid();
    
    // Draw glow effect
    this.drawGlow();
    
    // Draw line chart
    this.drawLineChart();
    
    // Draw data points
    this.drawDataPoints();
    
    // Draw hover tooltip
    this.drawTooltip();
    
    // Draw metrics
    this.drawMetrics();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Calculate chart positions
   */
  calculatePositions() {
    const padding = 60;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const minValue = Math.min(...this.data.map(d => d.value));
    const maxValue = Math.max(...this.data.map(d => d.value));
    const valueRange = maxValue - minValue;
    
    this.data.forEach((point, index) => {
      const targetX = padding + (index / (this.data.length - 1)) * chartWidth;
      const targetY = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      
      // Smooth animation towards target position
      point.x += (targetX - point.x) * 0.1;
      point.y += (targetY - point.y) * 0.1;
      
      point.targetX = targetX;
      point.targetY = targetY;
    });
  }

  /**
   * Draw background grid
   */
  drawGrid() {
    const padding = 60;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    
    this.ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i < this.data.length; i++) {
      const x = padding + (i / (this.data.length - 1)) * (width - padding * 2);
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, height - padding);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i / gridLines) * (height - padding * 2);
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(width - padding, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw glow effect behind the line
   */
  drawGlow() {
    if (this.data.length < 2) return;
    
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.clientHeight);
    gradient.addColorStop(0, `rgba(0, 212, 255, ${0.3 * this.glowIntensity})`);
    gradient.addColorStop(1, `rgba(91, 99, 247, ${0.1 * this.glowIntensity})`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.moveTo(this.data[0].x, this.canvas.clientHeight - 60);
    
    // Draw line to all points
    this.data.forEach((point, index) => {
      if (index === 0) {
        this.ctx.lineTo(point.x, point.y);
      } else {
        const prevPoint = this.data[index - 1];
        const cpx = (prevPoint.x + point.x) / 2;
        this.ctx.quadraticCurveTo(cpx, prevPoint.y, point.x, point.y);
      }
    });
    
    // Complete the area
    this.ctx.lineTo(this.data[this.data.length - 1].x, this.canvas.clientHeight - 60);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw the main line chart
   */
  drawLineChart() {
    if (this.data.length < 2) return;
    
    // Create gradient for line
    const lineGradient = this.ctx.createLinearGradient(0, 0, this.canvas.clientWidth, 0);
    lineGradient.addColorStop(0, '#00d4ff');
    lineGradient.addColorStop(0.5, '#5b63f7');
    lineGradient.addColorStop(1, '#00ff88');
    
    this.ctx.strokeStyle = lineGradient;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Add glow effect
    this.ctx.shadowColor = '#00d4ff';
    this.ctx.shadowBlur = 10 * this.glowIntensity;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.data[0].x, this.data[0].y);
    
    // Draw smooth curve through all points
    for (let i = 1; i < this.data.length; i++) {
      const prevPoint = this.data[i - 1];
      const currentPoint = this.data[i];
      const cpx = (prevPoint.x + currentPoint.x) / 2;
      
      this.ctx.quadraticCurveTo(cpx, prevPoint.y, currentPoint.x, currentPoint.y);
    }
    
    this.ctx.stroke();
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw data points
   */
  drawDataPoints() {
    this.data.forEach((point, index) => {
      // Outer glow circle
      const glowGradient = this.ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 15);
      glowGradient.addColorStop(0, `rgba(0, 212, 255, ${0.8 * this.glowIntensity})`);
      glowGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Inner circle
      const innerGradient = this.ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 6);
      innerGradient.addColorStop(0, '#ffffff');
      innerGradient.addColorStop(0.7, '#00d4ff');
      innerGradient.addColorStop(1, '#5b63f7');
      
      this.ctx.fillStyle = innerGradient;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pulse effect on hover
      if (this.isHovering && this.getDistanceToMouse(point.x, point.y) < 30) {
        const pulseRadius = 8 + Math.sin(Date.now() * 0.01) * 2;
        
        this.ctx.strokeStyle = `rgba(0, 212, 255, ${0.6 * this.glowIntensity})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, pulseRadius, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    });
  }

  /**
   * Draw tooltip on hover
   */
  drawTooltip() {
    if (!this.isHovering) return;
    
    // Find closest point to mouse
    let closestPoint = null;
    let closestDistance = Infinity;
    
    this.data.forEach(point => {
      const distance = this.getDistanceToMouse(point.x, point.y);
      if (distance < closestDistance && distance < 50) {
        closestDistance = distance;
        closestPoint = point;
      }
    });
    
    if (!closestPoint) return;
    
    // Draw tooltip
    const tooltipText = `${closestPoint.label}: $${closestPoint.value.toFixed(2)}`;
    this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textMetrics = this.ctx.measureText(tooltipText);
    
    const tooltipWidth = textMetrics.width + 20;
    const tooltipHeight = 30;
    const tooltipX = this.mousePosition.x - tooltipWidth / 2;
    const tooltipY = this.mousePosition.y - tooltipHeight - 10;
    
    // Tooltip background
    const tooltipGradient = this.ctx.createLinearGradient(tooltipX, tooltipY, tooltipX, tooltipY + tooltipHeight);
    tooltipGradient.addColorStop(0, 'rgba(26, 35, 50, 0.95)');
    tooltipGradient.addColorStop(1, 'rgba(42, 52, 65, 0.95)');
    
    this.ctx.fillStyle = tooltipGradient;
    this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
    this.ctx.lineWidth = 1;
    
    this.ctx.beginPath();
    this.ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Tooltip text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(tooltipText, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight / 2);
    
    // Reset text alignment
    this.ctx.textAlign = 'start';
    this.ctx.textBaseline = 'alphabetic';
  }

  /**
   * Draw financial metrics
   */
  drawMetrics() {
    if (this.data.length < 2) return;
    
    const currentValue = this.data[this.data.length - 1].value;
    const previousValue = this.data[this.data.length - 2].value;
    const change = currentValue - previousValue;
    const changePercent = (change / previousValue) * 100;
    
    const isPositive = change >= 0;
    const color = isPositive ? '#00ff88' : '#ff4757';
    
    // Current value
    this.ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`$${currentValue.toFixed(2)}`, 20, 40);
    
    // Change
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.ctx.fillStyle = color;
    const changeText = `${isPositive ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(1)}%)`;
    this.ctx.fillText(changeText, 20, 65);
    
    // Trend arrow
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    if (isPositive) {
      // Up arrow
      this.ctx.moveTo(180, 55);
      this.ctx.lineTo(190, 45);
      this.ctx.lineTo(200, 55);
      this.ctx.lineTo(195, 55);
      this.ctx.lineTo(195, 65);
      this.ctx.lineTo(185, 65);
      this.ctx.lineTo(185, 55);
    } else {
      // Down arrow
      this.ctx.moveTo(180, 55);
      this.ctx.lineTo(190, 65);
      this.ctx.lineTo(200, 55);
      this.ctx.lineTo(195, 55);
      this.ctx.lineTo(195, 45);
      this.ctx.lineTo(185, 45);
      this.ctx.lineTo(185, 55);
    }
    this.ctx.fill();
  }

  /**
   * Get distance from mouse to point
   * @param {number} x - Point X coordinate
   * @param {number} y - Point Y coordinate
   * @returns {number} Distance to mouse
   */
  getDistanceToMouse(x, y) {
    const dx = this.mousePosition.x - x;
    const dy = this.mousePosition.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Debounce utility function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Destroy the visualization
   */
  destroy() {
    this.stopAnimation();
    
    if (this.canvas) {
      // Remove event listeners
      this.canvas.removeEventListener('mousemove', () => {});
      this.canvas.removeEventListener('mouseenter', () => {});
      this.canvas.removeEventListener('mouseleave', () => {});
    }
  }
}

/**
 * Initialize charts when the investor page loads
 */
function initializeCharts() {
  // Initialize main stock chart
  if (document.getElementById('investor-chart')) {
    window.stockChart = new StockVisualization();
  }

  // Initialize financial metrics cards
  initializeMetricsCards();
  
  // Initialize performance indicators
  initializePerformanceIndicators();
}

/**
 * Initialize metrics cards with animations
 */
function initializeMetricsCards() {
  const metricsCards = document.querySelectorAll('.metric-card');
  
  metricsCards.forEach((card, index) => {
    // Add intersection observer for animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Animate counter if present
          const counter = entry.target.querySelector('.metric-value[data-target]');
          if (counter) {
            const target = parseInt(counter.dataset.target);
            animateCounter(counter, target);
          }
          
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(card);
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });
}

/**
 * Animate counter to target value
 * @param {HTMLElement} element - Counter element
 * @param {number} target - Target value
 */
function animateCounter(element, target) {
  const duration = 2000;
  const start = parseInt(element.textContent) || 0;
  const increment = (target - start) / (duration / 16);
  let current = start;

  const animate = () => {
    current += increment;
    
    if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
      element.textContent = formatNumber(target);
    } else {
      element.textContent = formatNumber(Math.floor(current));
      requestAnimationFrame(animate);
    }
  };

  animate();
}

/**
 * Format number with appropriate suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Initialize performance indicators
 */
function initializePerformanceIndicators() {
  const indicators = document.querySelectorAll('.performance-indicator');
  
  indicators.forEach(indicator => {
    const progressBar = indicator.querySelector('.progress-bar');
    const targetValue = parseFloat(indicator.dataset.value) || 0;
    
    if (progressBar) {
      // Animate progress bar
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              progressBar.style.width = `${targetValue}%`;
            }, 100);
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(indicator);
    }
  });
}

/**
 * Create financial report visualization
 */
class FinancialReport {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.init();
  }
  
  init() {
    this.createReportStructure();
    this.animateReportEntries();
  }
  
  createReportStructure() {
    const reportData = [
      { label: 'Revenue Growth', value: '+23.5%', trend: 'up' },
      { label: 'Production Efficiency', value: '94.2%', trend: 'up' },
      { label: 'Export Orders', value: '+18.7%', trend: 'up' },
      { label: 'Sustainability Score', value: '92/100', trend: 'up' },
      { label: 'Employee Satisfaction', value: '4.7/5', trend: 'up' },
      { label: 'Market Share', value: '12.3%', trend: 'up' }
    ];
    
    const reportHTML = reportData.map(item => `
      <div class="report-item" data-trend="${item.trend}">
        <div class="report-label">${item.label}</div>
        <div class="report-value">${item.value}</div>
        <div class="report-trend">
          ${item.trend === 'up' ? '📈' : '📉'}
        </div>
      </div>
    `).join('');
    
    this.container.innerHTML = `
      <div class="financial-report">
        <h3>Financial Highlights</h3>
        <div class="report-grid">
          ${reportHTML}
        </div>
      </div>
    `;
  }
  
  animateReportEntries() {
    const reportItems = this.container.querySelectorAll('.report-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animate-in');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    });
    
    reportItems.forEach(item => observer.observe(item));
  }
}

// Export functions for global access
window.initializeCharts = initializeCharts;
window.StockVisualization = StockVisualization;
window.FinancialReport = FinancialReport;

// Auto-initialize if on investor page
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash.includes('investors')) {
    initializeCharts();
  }
});

// Listen for route changes to initialize charts
document.addEventListener('routeChanged', (e) => {
  if (e.detail && e.detail.route === 'investors') {
    setTimeout(initializeCharts, 100);
  }
});
