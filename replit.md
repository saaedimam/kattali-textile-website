# KTLBD Web Project

## Overview

KTLBD Web is a futuristic, interactive corporate website for Kattali Textile Ltd., a Bangladesh-based textile manufacturing company. The site showcases the company's capabilities, certifications, sustainability practices, and global reach through a modern single-page application with animated components and advanced visual effects.

The project is built as a static website using vanilla HTML, CSS, and JavaScript with a hash-based router for client-side navigation. It features a modular architecture with partial loading, advanced animations, and accessibility compliance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Hash-based routing system that loads content partials dynamically without page refreshes
- **Modular Component Structure**: Each page section is stored as separate HTML partials in `/public/partials/` directory
- **Progressive Enhancement**: Core functionality works without JavaScript, with enhanced interactions when available
- **Responsive Design**: Mobile-first approach with fluid layouts and adaptive components

### File Organization
- **Static Assets Root**: All deliverable files are contained within `/public/` directory for zero-build deployment
- **Partials System**: Individual page content stored in `/public/partials/` for dynamic loading
- **Centralized Configuration**: Application settings managed through `/public/scripts/config.js`
- **Script Modularity**: Separate JavaScript modules for routing, main application logic, and specialized features

### Styling Architecture
- **CSS Custom Properties**: Comprehensive theming system with dark/light mode support
- **Component-Based Styles**: Modular CSS with reusable component classes
- **Animation Framework**: Built-in animation system with reduced-motion respect and performance optimization
- **Grid System**: Flexible CSS Grid and Flexbox layouts for responsive design

### JavaScript Architecture
- **Class-Based Modules**: ES6 classes for Router, KTLApplication, and StockVisualization components
- **Event-Driven Design**: Observer pattern for component communication and state management
- **Performance Optimization**: Intersection Observer for scroll animations, requestAnimationFrame for smooth effects
- **Accessibility First**: WCAG compliance with keyboard navigation and screen reader support

### Animation System
- **Hardware Acceleration**: CSS transforms and opacity changes for smooth 60fps animations
- **Reduced Motion Support**: Automatic detection and respect for user motion preferences
- **Progressive Effects**: Layered animation complexity based on device capabilities
- **Canvas Visualizations**: WebGL-compatible chart rendering for financial data displays

### Content Management
- **Static Content**: All content embedded in HTML partials for fast loading and SEO optimization
- **Dynamic Elements**: Client-side rendering for interactive components and data visualizations
- **Asset Optimization**: Lazy loading for images and progressive enhancement for media

## External Dependencies

### Third-Party Services
- **Content Delivery**: Pixabay images used as placeholder content for development
- **Font Loading**: System font stack with web font fallbacks for optimal performance
- **Analytics Integration**: Configured for Google Analytics and performance monitoring (when enabled)

### Browser APIs
- **Web APIs**: Intersection Observer, RequestAnimationFrame, Local Storage, and Service Worker
- **Canvas API**: For custom chart visualizations and interactive graphics
- **CSS APIs**: CSS Custom Properties, CSS Grid, Flexbox, and CSS Animations

### Media Assets
- **Video Background**: MP4 video file (`/public/video/fabric-waves.mp4`) for hero section background
- **Image Assets**: Placeholder images with progressive loading and responsive sizing
- **Icon System**: SVG icons embedded inline for optimal performance and customization

### Development Tools
- **Build Process**: Zero-build deployment strategy for static hosting compatibility
- **Version Control**: Git-based workflow with deployment-ready file structure
- **Hosting Compatibility**: Designed for Vercel, Netlify, and other static hosting platforms

### Optional Enhancements
- **Service Worker**: Progressive Web App capabilities for offline functionality
- **API Integration**: Prepared endpoints for dynamic content loading (news, contact forms, stock data)
- **Express Server**: Optional local development server for Replit environment testing