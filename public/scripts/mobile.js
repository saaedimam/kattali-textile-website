// Mobile nav - Fixed version
(function () {
  'use strict';
  
  console.log('Mobile nav script loading...');
  
  function initMobileNav() {
    const toggle = document.querySelector('.stairs-toggle');
    const nav = document.querySelector('.stairs-nav');
    const backdrop = document.querySelector('.nav-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');
    
    console.log('Initializing mobile nav:', {
      toggle: !!toggle,
      nav: !!nav, 
      backdrop: !!backdrop,
      navLinks: navLinks.length
    });

    if (!toggle || !nav) {
      console.error('Required mobile nav elements not found');
      return;
    }

    let isOpen = false;

    function setMenuOpen(open) {
      isOpen = open;
      console.log('Setting menu:', open ? 'OPEN' : 'CLOSED');
      
      // Update classes
      nav.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      
      // Update aria attributes
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.setAttribute('aria-hidden', open ? 'false' : 'true');
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = open ? 'hidden' : '';
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }

    // Toggle on button click
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Toggle clicked, current state:', isOpen);
      setMenuOpen(!isOpen);
    });

    // Close on backdrop click
    if (backdrop) {
      backdrop.addEventListener('click', function(e) {
        console.log('Backdrop clicked');
        setMenuOpen(false);
      });
    }

    // Close when clicking nav links
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        console.log('Nav link clicked, closing menu');
        setTimeout(function() {
          setMenuOpen(false);
        }, 150);
      });
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        console.log('Escape pressed, closing menu');
        setMenuOpen(false);
      }
    });

    // Close if clicking outside
    document.addEventListener('click', function(e) {
      if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
        console.log('Clicked outside, closing menu');
        setMenuOpen(false);
      }
    });

    console.log('Mobile nav initialized successfully');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }

  // Update year in footer
  function updateYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  updateYear();
})();