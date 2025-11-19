// Authentication utilities
const API_BASE_URL = 'http://localhost:3000/api';

// Get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Set token in localStorage
function setToken(token) {
  localStorage.setItem('token', token);
}

// Remove token from localStorage
function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Get user from localStorage
function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Set user in localStorage
function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Check if user is authenticated
function isAuthenticated() {
  return getToken() !== null;
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Login function
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.data && data.data.token) {
      setToken(data.data.token);
      setUser(data.data.user);
      return data.data;
    }

    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout function
async function logout() {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
    window.location.href = 'index.html';
  }
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Navigation handling
function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const targetSection = document.getElementById(`${sectionName}-section`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update active nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === sectionName) {
      link.classList.add('active');
    }
  });
}

// Initialize navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      if (section) {
        showSection(section);
      }
    });
  });

  // Handle "View All Bookings" link
  const viewAllLink = document.querySelector('.view-all[data-section]');
  if (viewAllLink) {
    viewAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('bookings');
    });
  }

  // Default to overview section if no section is active
  const activeSection = document.querySelector('.content-section.active');
  if (!activeSection) {
    showSection('overview');
  }
}

// Profile dropdown handlers
function initProfileDropdown(profileBtnId, dropdownId, logoutBtnId) {
  const profileMenuBtn = document.getElementById(profileBtnId);
  const profileDropdown = document.getElementById(dropdownId);
  const logoutBtn = document.getElementById(logoutBtnId);

  if (profileMenuBtn && profileDropdown) {
    profileMenuBtn.addEventListener('click', () => {
      profileDropdown.classList.toggle('hidden');
    });
  }

  // Close dropdown if clicking outside
  if (profileMenuBtn && profileDropdown) {
    window.addEventListener('click', (event) => {
      if (!profileMenuBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.add('hidden');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (profileDropdown) {
        profileDropdown.classList.add('hidden');
      }
      await logout();
    });
  }
}

// FAQ accordion functionality
function initFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(button => {
    button.addEventListener('click', () => {
      const answer = button.nextElementSibling;
      button.classList.toggle('active');

      if (button.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = 0;
      }
    });
  });
}

// Chart initialization
function initChart() {
  const ctx = document.getElementById('performanceChart');

  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['June', 'July', 'August', 'September', 'October', 'November'],
        datasets: [
          {
            label: 'Bookings',
            data: [120, 190, 150, 250, 220, 300],
            borderColor: '#0055ff',
            backgroundColor: 'rgba(0, 85, 255, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
          },
          {
            label: 'Revenue (in RWF)',
            data: [300000, 450000, 400000, 600000, 550000, 720000],
            borderColor: '#ff8c00',
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Number of Bookings' },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Revenue (RWF)' },
            grid: {
              drawOnChartArea: false, // only draw grid for first Y axis
            },
          },
        },
      },
    });
  }
}

// Theme toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      // In a real app, you would add a 'dark-mode' class to the body
      // and define dark theme styles in your CSS.
      alert('Dark mode toggled! (Implementation pending)');
    });
  }
}

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
  // In a real application, you would leave this check active.
  // For development, you can comment it out to work on the page without logging in.
  /*
  if (!requireAuth()) { // First, check if the user is logged in at all.
    return;
  }
  */

  // Next, check if the logged-in user is an admin.
  const user = getUser();
  if (!user || user.role !== 'admin') {
    // If not an admin, redirect them away.
    // You can show an "Access Denied" message or redirect to the homepage.
    console.error('Access Denied: User is not an admin.');
    // window.location.href = 'index.html'; 
    // return; // Uncomment the two lines above to enforce admin-only access.
  }

  // Initialize navigation
  initNavigation();

  // Initialize profile dropdowns (for different sections)
  initProfileDropdown('profileMenuBtn', 'profileDropdown', 'logoutBtn');
  initProfileDropdown('profileMenuBtnBookings', 'profileDropdownBookings', 'logoutBtnBookings');

  // Initialize FAQ accordion
  initFAQ();

  // Initialize chart (only when overview section is shown)
  const overviewSection = document.getElementById('overview-section');
  if (overviewSection && overviewSection.classList.contains('active')) {
    initChart();
  }

  // Reinitialize chart when overview section is shown
  const overviewNavLink = document.querySelector('[data-section="overview"]');
  if (overviewNavLink) {
    overviewNavLink.addEventListener('click', () => {
      setTimeout(initChart, 100); // Small delay to ensure section is visible
    });
  }

  // Initialize theme toggle
  initThemeToggle();

  // Populate admin info in the dropdown
  if (user) {
    const profileInfoElements = document.querySelectorAll('.profile-info');
    profileInfoElements.forEach(profileInfo => {
      if (profileInfo) {
        profileInfo.innerHTML = `
          <p><strong>${user.company_name || 'ExpressGo'}</strong></p>
          <p class="email">${user.email}</p>
        `;
      }
    });
  }
});

