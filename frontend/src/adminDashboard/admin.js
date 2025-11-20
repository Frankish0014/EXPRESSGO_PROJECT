/* global ApiClient, AppState, Chart */

const statsRefs = {
  total: document.getElementById('statTotalBookings'),
  completed: document.getElementById('statCompletedBookings'),
  pending: document.getElementById('statPendingBookings'),
  cancelled: document.getElementById('statCancelledBookings'),
};

const revenueRefs = {
  current: document.getElementById('revenueCurrentMonth'),
  trend: document.getElementById('revenueTrend'),
  average: document.getElementById('revenueAverageDaily'),
};

const recentBookingsBody = document.getElementById('recentBookingsBody');
const popularRoutesList = document.getElementById('popularRoutesList');
const adminBookingsTableBody = document.getElementById('adminBookingsTableBody');
const bookingsTableFooter = document.getElementById('bookingsTableFooter');
const adminMessageEl = document.getElementById('adminMessage');

let performanceChart;
let latestChartData = null;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'RWF',
  minimumFractionDigits: 0,
});

function formatCurrency(amount) {
  if (Number.isNaN(Number(amount))) return 'RWF 0';
  return currencyFormatter.format(Number(amount)).replace('RWF', 'RWF ');
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function showAdminMessage(message, variant = 'info') {
  if (!adminMessageEl) return;
  adminMessageEl.textContent = message;
  adminMessageEl.classList.add('show');
  adminMessageEl.classList.toggle('error', variant === 'error');
  adminMessageEl.classList.toggle('success', variant === 'success');
}

function clearAdminMessage() {
  if (!adminMessageEl) return;
  adminMessageEl.textContent = '';
  adminMessageEl.classList.remove('show', 'error', 'success');
}

function showSection(sectionName) {
  document.querySelectorAll('.content-section').forEach((section) => {
    section.classList.remove('active');
  });
  const target = document.getElementById(`${sectionName}-section`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('data-section') === sectionName);
  });
}

function initNavigation() {
  document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      if (section) showSection(section);
    });
  });

  const viewAllLink = document.querySelector('.view-all[data-section]');
  if (viewAllLink) {
    viewAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('bookings');
    });
  }

  if (!document.querySelector('.content-section.active')) {
    showSection('overview');
  }
}

function initFAQ() {
  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.nextElementSibling;
      button.classList.toggle('active');
      if (button.classList.contains('active')) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      } else {
        answer.style.maxHeight = 0;
      }
    });
  });
}

function initProfileDropdown(profileBtnId, dropdownId, logoutBtnId, logoutHandler) {
  const profileBtn = document.getElementById(profileBtnId);
  const dropdown = document.getElementById(dropdownId);
  const logoutBtn = document.getElementById(logoutBtnId);

  if (profileBtn && dropdown) {
    profileBtn.addEventListener('click', () => dropdown.classList.toggle('hidden'));
    window.addEventListener('click', (event) => {
      if (!profileBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      dropdown?.classList.add('hidden');
      await logoutHandler();
    });
  }
}

function updateStats(stats) {
  if (!stats) return;
  if (statsRefs.total) statsRefs.total.textContent = stats.total ?? 0;
  if (statsRefs.completed) statsRefs.completed.textContent = stats.completed ?? 0;
  if (statsRefs.pending) statsRefs.pending.textContent = stats.pending ?? 0;
  if (statsRefs.cancelled) statsRefs.cancelled.textContent = stats.cancelled ?? 0;
}

function updateRevenue(revenue) {
  if (!revenue) return;
  if (revenueRefs.current) revenueRefs.current.textContent = formatCurrency(revenue.currentMonth || 0);
  if (revenueRefs.average) revenueRefs.average.textContent = formatCurrency(revenue.averageDaily || 0);

  if (revenueRefs.trend) {
    const trendValue = revenue.trend || 0;
    const trendText = `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%`;
    revenueRefs.trend.textContent = trendText;
    revenueRefs.trend.classList.toggle('positive', trendValue >= 0);
    revenueRefs.trend.classList.toggle('negative', trendValue < 0);
  }
}

function renderRecentBookings(bookings = []) {
  if (!recentBookingsBody) return;
  if (bookings.length === 0) {
    recentBookingsBody.innerHTML = '<tr><td colspan="4">No recent bookings found.</td></tr>';
    return;
  }

  recentBookingsBody.innerHTML = bookings
    .map(
      (booking) => `
      <tr>
        <td>#${booking.code}</td>
        <td>${booking.passenger || '—'}</td>
        <td>${booking.route || '—'}</td>
        <td><span class="status ${booking.status}">${booking.status.toUpperCase()}</span></td>
      </tr>
    `
    )
    .join('');
}

function renderPopularRoutes(routes = []) {
  if (!popularRoutesList) return;
  if (!routes.length) {
    popularRoutesList.innerHTML = '<li>No route data available</li>';
    return;
  }

  popularRoutesList.innerHTML = routes
    .map((route) => `<li>${route.route} <span>(${route.count} bookings)</span></li>`)
    .join('');
}

function renderChart(chartData) {
  const ctx = document.getElementById('performanceChart');
  if (!ctx || !chartData) return;

  if (performanceChart) {
    performanceChart.destroy();
  }

  performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Bookings',
          data: chartData.bookings,
          borderColor: '#0055ff',
          backgroundColor: 'rgba(0, 85, 255, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Revenue (RWF)',
          data: chartData.revenue,
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
          title: { display: true, text: 'Bookings' },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Revenue (RWF)' },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}

function renderBookingsTable(bookings = []) {
  if (!adminBookingsTableBody) return;

  if (!bookings.length) {
    adminBookingsTableBody.innerHTML = '<tr><td colspan="7">No bookings found.</td></tr>';
    bookingsTableFooter.textContent = 'Showing 0 bookings';
    return;
  }

  adminBookingsTableBody.innerHTML = bookings
    .map((booking) => {
      const route = booking.schedule?.route
        ? `${booking.schedule.route.departure_city} → ${booking.schedule.route.arrival_city}`
        : '—';
      const amount = Number(booking.schedule?.price || 0);
      return `
        <tr>
          <td>#${booking.id}</td>
          <td>${booking.user?.full_name || '—'}<br><small>${booking.user?.email || ''}</small></td>
          <td>${route}</td>
          <td>${formatDate(booking.travel_date)}</td>
          <td>${formatCurrency(amount)}</td>
          <td><span class="status ${booking.status}">${booking.status.toUpperCase()}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary" data-booking-id="${booking.id}" data-status="confirmed" ${
        booking.status === 'confirmed' ? 'disabled' : ''
      }>Confirm</button>
              <button class="btn btn-primary" data-booking-id="${booking.id}" data-status="completed" ${
        booking.status === 'completed' ? 'disabled' : ''
      }>Complete</button>
              <button class="btn btn-danger" data-booking-id="${booking.id}" data-status="cancelled" ${
        booking.status === 'cancelled' ? 'disabled' : ''
      }>Cancel</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  bookingsTableFooter.textContent = `Showing ${bookings.length} bookings`;
}

async function loadOverview() {
  try {
    const data = await ApiClient.get('/admin/overview', {}, true);
    updateStats(data.stats);
    updateRevenue(data.revenue);
    latestChartData = data.chart;
    renderChart(latestChartData);
    renderRecentBookings(data.recentBookings);
    renderPopularRoutes(data.popularRoutes);
  } catch (error) {
    console.error(error);
    showAdminMessage(error.message || 'Failed to load overview data', 'error');
  }
}

async function loadBookingsTable() {
  try {
    clearAdminMessage();
    const response = await ApiClient.get('/bookings', {}, true);
    renderBookingsTable(response.bookings || []);
  } catch (error) {
    console.error(error);
    showAdminMessage(error.message || 'Failed to load bookings', 'error');
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    await ApiClient.put(`/bookings/${bookingId}/status`, { status }, true);
    showAdminMessage(`Booking #${bookingId} updated to ${status}.`, 'success');
    await Promise.all([loadOverview(), loadBookingsTable()]);
  } catch (error) {
    console.error(error);
    showAdminMessage(error.message || 'Failed to update booking', 'error');
  }
}

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode', themeToggle.checked);
    });
  }
}

function hydrateProfileInfo(user) {
  document.querySelectorAll('.profile-info').forEach((profileInfo) => {
    profileInfo.innerHTML = `
      <p><strong>${user.company_name || 'ExpressGo'}</strong></p>
      <p class="email">${user.email}</p>
    `;
  });
}

async function logoutAdmin() {
  try {
    await ApiClient.post('/auth/logout', {}, true);
  } catch (error) {
    console.warn('Logout failed', error);
  } finally {
    ApiClient.clearSession();
    window.location.href = '../../index.html';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Longer delay to ensure localStorage is available after redirect
  await new Promise(resolve => setTimeout(resolve, 200));

  // Debug: Check authentication state - check both ApiClient and localStorage directly
  const token = ApiClient.getToken();
  const user = ApiClient.getUser();
  const directToken = localStorage.getItem('expressgo_auth_token');
  const directUser = localStorage.getItem('expressgo_auth_user');
  const allKeys = Object.keys(localStorage);
  
  console.log('Admin dashboard loaded - Auth check:', {
    hasToken: !!token,
    hasUser: !!user,
    userRole: user?.role,
    currentPath: window.location.pathname,
    directToken: !!directToken,
    directUser: !!directUser,
    tokensMatch: token === directToken,
    localStorageKeys: allKeys.filter(k => k.includes('expressgo') || k.includes('auth'))
  });

  if (!ApiClient.isAuthenticated()) {
    console.warn('Not authenticated, redirecting to login');
    console.warn('Token check:', token);
    console.warn('User check:', user);
    // Calculate correct login path based on current location
    const currentPath = window.location.pathname;
    let loginPath;
    if (currentPath.includes('/adminDashboard/')) {
      // From adminDashboard, go up one level to src, then to user-log-in.html
      loginPath = '../user-log-in.html';
    } else {
      // Fallback
      loginPath = './src/user-log-in.html';
    }
    console.warn('Redirecting to login:', loginPath);
    window.location.href = loginPath;
    return;
  }

  if (!user || user.role !== 'admin') {
    console.warn('User is not an admin:', user?.role);
    alert('Admin access required.');
    const currentPath = window.location.pathname;
    const loginPath = currentPath.includes('/adminDashboard/') 
      ? '../user-log-in.html' 
      : './src/user-log-in.html';
    window.location.href = loginPath;
    return;
  }

  hydrateProfileInfo(user);
  initNavigation();
  initFAQ();
  initThemeToggle();

  initProfileDropdown('profileMenuBtn', 'profileDropdown', 'logoutBtn', logoutAdmin);
  initProfileDropdown('profileMenuBtnBookings', 'profileDropdownBookings', 'logoutBtnBookings', logoutAdmin);

  const overviewNavLink = document.querySelector('[data-section="overview"]');
  if (overviewNavLink) {
    overviewNavLink.addEventListener('click', () => {
      setTimeout(() => renderChart(latestChartData), 100);
    });
  }

  adminBookingsTableBody?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-booking-id]');
    if (!button) return;
    const bookingId = button.getAttribute('data-booking-id');
    const status = button.getAttribute('data-status');
    if (bookingId && status) {
      updateBookingStatus(bookingId, status);
    }
  });

  await Promise.all([loadOverview(), loadBookingsTable()]);
});

