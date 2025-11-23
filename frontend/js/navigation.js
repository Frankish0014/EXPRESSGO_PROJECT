/**
 * Shared Navigation Utility
 * Renders navigation bar consistently across all pages based on authentication status
 */

(function() {
  'use strict';

  // Determine base path for navigation links based on current page location
  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/src/')) {
      return '../';
    } else if (path.includes('/adminDashboard/')) {
      return '../../';
    }
    return './';
  }

  // Get the correct path to a specific page
  function getPagePath(page) {
    const base = getBasePath();
    const pathMap = {
      'home': `${base}index.html`,
      'about': `${base}index.html#about`,
      'destinations': `${base}index.html#destinations`,
      'contact': `${base}index.html#contact`,
      'book-now': `${base}src/booking-page.html`,
      'my-bookings': `${base}src/user-booking-history.html`,
      'login': `${base}src/user-log-in.html`,
      'register': `${base}src/register-page.html`
    };
    return pathMap[page] || '#';
  }

  // Render navigation based on authentication status
  function renderNavigation() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) {
      console.warn('Navigation: .navbar element not found');
      return;
    }

    const navContent = navbar.querySelector('.nav-content');
    if (!navContent) {
      console.warn('Navigation: .nav-content element not found');
      return;
    }

    const isAuthenticated = window.ApiClient && window.ApiClient.isAuthenticated();
    const user = window.ApiClient && window.ApiClient.getUser();
    const isAdmin = user && user.role === 'admin';

    // Don't render navigation for admin dashboard (it has its own navigation)
    if (window.location.pathname.includes('/adminDashboard/')) {
      return;
    }

    // Get or create nav element
    let nav = navContent.querySelector('nav');
    if (!nav) {
      nav = document.createElement('nav');
      navContent.appendChild(nav);
    }

    // Clear existing navigation
    nav.innerHTML = '';

    // Create navigation list
    const ul = document.createElement('ul');
    
    if (isAuthenticated && !isAdmin) {
      // Logged in user navigation
      ul.innerHTML = `
        <li><a href="${getPagePath('home')}">Home</a></li>
        <li><a href="${getPagePath('book-now')}">Book Now</a></li>
        <li><a href="${getPagePath('my-bookings')}">My Bookings</a></li>
        <li><a href="#" id="logoutLink" class="nav-link login-link">Logout</a></li>
      `;
    } else {
      // Logged out user navigation - "Book Now" goes to login page
      ul.innerHTML = `
        <li><a href="${getPagePath('home')}">Home</a></li>
        <li><a href="${getPagePath('about')}">About</a></li>
        <li><a href="${getPagePath('destinations')}">Destinations</a></li>
        <li><a href="${getPagePath('login')}" class="nav-link register-link">Book Now</a></li>
      `;
    }

    nav.appendChild(ul);

    // Attach logout handler if user is logged in
    if (isAuthenticated && !isAdmin) {
      const logoutLink = document.getElementById('logoutLink');
      if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
      }
    }

    // Update active link based on current page
    updateActiveLink();
  }

  // Update active navigation link based on current page
  function updateActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.navbar nav a');
    
    links.forEach(link => {
      link.classList.remove('active');
      
      const href = link.getAttribute('href');
      if (!href) return;

      // Check if this link matches the current page
      if (currentPath.includes('booking-page.html') && href.includes('booking-page.html')) {
        link.classList.add('active');
      } else if (currentPath.includes('user-booking-history.html') && href.includes('user-booking-history.html')) {
        link.classList.add('active');
      } else if (currentPath.includes('user-log-in.html') && href.includes('user-log-in.html')) {
        link.classList.add('active');
      } else if (currentPath.includes('register-page.html') && href.includes('register-page.html')) {
        link.classList.add('active');
      } else if (currentPath.includes('search-results.html') && href.includes('search-results.html')) {
        link.classList.add('active');
      } else if (currentPath.includes('payment-page.html') && href.includes('payment-page.html')) {
        link.classList.add('active');
      } else if ((currentPath.endsWith('index.html') || currentPath.endsWith('/')) && (href.includes('index.html') || href === '#' || href.includes('#home'))) {
        // Only mark home as active if no hash is present or hash is #home
        const hash = window.location.hash;
        if (!hash || hash === '#home' || hash === '') {
          link.classList.add('active');
        }
      } else if (href.includes('#about') && currentPath.includes('index.html')) {
        // Handle hash links on index page
        const hash = window.location.hash;
        if (hash === '#about') link.classList.add('active');
      } else if (href.includes('#destinations') && currentPath.includes('index.html')) {
        const hash = window.location.hash;
        if (hash === '#destinations') link.classList.add('active');
      }
    });
  }

  // Handle logout
  function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
      if (window.ApiClient) {
        window.ApiClient.clearSession();
      }
      
      // Clear all app state
      if (window.AppState) {
        window.AppState.clearBookingCheckout();
        window.AppState.clearSearchQuery();
        window.AppState.clearSelectedSchedule();
      }
      
      // Redirect to home page
      const base = getBasePath();
      window.location.href = `${base}index.html`;
    }
  }

  // Initialize navigation when DOM is ready
  function init() {
    // Function to attempt rendering with retries
    function attemptRender(retries = 10) {
      if (window.ApiClient) {
        renderNavigation();
      } else if (retries > 0) {
        setTimeout(() => attemptRender(retries - 1), 100);
      } else {
        console.warn('Navigation: ApiClient not available after retries, rendering default navigation');
        renderNavigation(); // Render anyway with default (logged out) state
      }
    }

    // Wait for DOM and ApiClient to be available
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        attemptRender();
      });
    } else {
      attemptRender();
    }

    // Re-render on hash change (for single-page navigation on index.html)
    window.addEventListener('hashchange', updateActiveLink);
    
    // Re-render navigation when storage changes (login/logout in another tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'expressgo_auth_token' || e.key === 'expressgo_auth_user') {
        renderNavigation();
      }
    });
  }

  // Initialize
  init();

  // Expose render function for manual updates if needed
  window.Navigation = {
    render: renderNavigation,
    updateActive: updateActiveLink
  };
})();

