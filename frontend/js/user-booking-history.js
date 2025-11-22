const bookingsListEl = document.getElementById('bookingsList');
const statusFilterEl = document.getElementById('statusFilter');
const searchInputEl = document.getElementById('searchInput');
const bookingsMessageEl = document.getElementById('bookingsMessage');
const logoutLink = document.getElementById('logoutLink');
const profileNameEl = document.getElementById('profileName');
const profileContactEl = document.getElementById('profileContact');
const profileMetaEl = document.getElementById('profileMeta');

const statsEls = {
  total: document.getElementById('totalBookingsStat'),
  completed: document.getElementById('completedTripsStat'),
  upcoming: document.getElementById('upcomingTripsStat'),
  spent: document.getElementById('totalSpentStat'),
};

const state = {
  bookings: [],
};

const showBookingsMessage = (message, variant = 'info') => {
  if (!bookingsMessageEl) return;
  bookingsMessageEl.textContent = message;
  bookingsMessageEl.classList.add('show');
  bookingsMessageEl.classList.toggle('error', variant === 'error');
  bookingsMessageEl.classList.toggle('success', variant === 'success');
};

const clearBookingsMessage = () => {
  if (!bookingsMessageEl) return;
  bookingsMessageEl.textContent = '';
  bookingsMessageEl.classList.remove('show', 'error', 'success');
};

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return amount.toLocaleString();
};

const normalizeBooking = (booking) => {
  const route = booking?.schedule?.route || {};
  const bus = booking?.schedule?.bus || {};
  const departureTime = booking?.schedule?.departure_time || '--:--';
  const price = Number(booking?.schedule?.price) || 0;
  return {
    code: booking.booking_code,
    status: booking.status,
    from: route.departure_city || 'Departure',
    to: route.arrival_city || 'Arrival',
    date: booking.travel_date,
    time: departureTime,
    passengers: 1,
    seats: [booking.seat_number],
    price,
    bookingDate: booking.created_at ? booking.created_at.split('T')[0] : '—',
    bus,
  };
};

const renderEmptyState = () => {
  bookingsListEl.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🎫</div>
      <h3>No bookings found</h3>
      <p>You haven't made any bookings yet or no bookings match your filter.</p>
      <button class="btn btn-primary" onclick="window.location.href='booking-page.html'">Book Your First Trip</button>
    </div>
  `;
};

const renderBookings = (bookings) => {
  if (!bookings.length) {
    renderEmptyState();
    return;
  }

  bookingsListEl.innerHTML = bookings
    .map(
      (booking) => `
    <div class="booking-card" data-status="${booking.status}">
      <div class="booking-header">
        <span class="booking-id">Booking #${booking.code}</span>
        <span class="booking-status status-${booking.status}">${booking.status.toUpperCase()}</span>
      </div>
      <div class="booking-body">
        <div class="booking-route">
          <div class="route-point">
            <h3>${booking.from}</h3>
            <p>${booking.date} • ${booking.time}</p>
          </div>
          <div class="route-arrow">→</div>
          <div class="route-point">
            <h3>${booking.to}</h3>
            <p>Operated by ${booking.bus?.company?.name || 'ExpressGo'}</p>
          </div>
        </div>
        <div class="booking-details">
          <div class="detail-item">
            <span class="detail-label">Passengers</span>
            <span class="detail-value">${booking.passengers}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Seat(s)</span>
            <span class="detail-value">${booking.seats.join(', ')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Amount</span>
            <span class="detail-value">${formatCurrency(booking.price)} Rwf</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Booked On</span>
            <span class="detail-value">${booking.bookingDate}</span>
          </div>
        </div>
        <div class="booking-actions">
          ${booking.status === 'confirmed' ? `
            <button class="btn btn-primary" data-action="ticket" data-code="${booking.code}">View Ticket</button>
            <button class="btn btn-danger" data-action="cancel" data-code="${booking.code}">Cancel</button>
          ` : ''}
          ${booking.status === 'completed' ? `
            <button class="btn btn-primary" data-action="ticket" data-code="${booking.code}">View Receipt</button>
            <button class="btn btn-secondary" data-action="rebook" data-code="${booking.code}">Book Again</button>
          ` : ''}
          ${booking.status === 'cancelled' ? `
            <button class="btn btn-secondary" data-action="rebook" data-code="${booking.code}">Book Again</button>
          ` : ''}
        </div>
      </div>
    </div>`
    )
    .join('');
};

const updateStats = (bookings) => {
  const total = bookings.length;
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const upcoming = bookings.filter((b) => b.status === 'confirmed').length;
  const spent = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.price, 0);

  if (statsEls.total) statsEls.total.textContent = total;
  if (statsEls.completed) statsEls.completed.textContent = completed;
  if (statsEls.upcoming) statsEls.upcoming.textContent = upcoming;
  if (statsEls.spent) statsEls.spent.textContent = formatCurrency(spent);
};

const filterBookings = () => {
  const status = statusFilterEl.value;
  const searchTerm = searchInputEl.value.toLowerCase();

  let filtered = [...state.bookings];

  if (status !== 'all') {
    filtered = filtered.filter((booking) => booking.status === status);
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (booking) =>
        booking.to.toLowerCase().includes(searchTerm) ||
        booking.from.toLowerCase().includes(searchTerm) ||
        booking.code.toLowerCase().includes(searchTerm)
    );
  }

  renderBookings(filtered);
};

const loadProfile = async () => {
  try {
    const data = await ApiClient.get('/auth/profile', {}, true);
    const user = data?.data?.user || data?.user || {};
    if (profileNameEl) profileNameEl.textContent = user.full_name || 'ExpressGo Passenger';
    if (profileContactEl) {
      profileContactEl.textContent = [user.email, user.phone_number].filter(Boolean).join(' • ') || '—';
    }
    if (profileMetaEl) {
      profileMetaEl.textContent = `Member since ${user.created_at ? new Date(user.created_at).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : '—'}`;
    }
  } catch (error) {
    console.warn('Failed to load profile', error);
  }
};

const loadBookings = async () => {
  clearBookingsMessage();
  bookingsListEl.innerHTML = '<div class="empty-state"><p>Loading your bookings...</p></div>';

  try {
    const response = await ApiClient.get('/bookings/my-bookings', {}, true);
    const bookings = (response?.bookings || []).map(normalizeBooking);
    state.bookings = bookings;

    updateStats(bookings);
    filterBookings();
  } catch (error) {
    console.error(error);
    showBookingsMessage(error.message || 'Unable to load bookings.', 'error');
    renderEmptyState();
  }
};

const handleBookingAction = async (action, code) => {
  switch (action) {
    case 'ticket':
      alert(`Ticket for booking ${code} would be displayed or emailed to you.`);
      break;
    case 'rebook':
      window.location.href = 'booking-page.html';
      break;
    case 'cancel':
      if (confirm(`Cancel booking ${code}?`)) {
        try {
          await ApiClient.delete(`/bookings/${code}`, true);
          showBookingsMessage(`Booking ${code} cancelled successfully.`, 'success');
          await loadBookings();
        } catch (error) {
          showBookingsMessage(error.message || 'Failed to cancel booking.', 'error');
        }
      }
      break;
    default:
      break;
  }
};

const attachEventListeners = () => {
  statusFilterEl.addEventListener('change', filterBookings);
  searchInputEl.addEventListener('input', filterBookings);

  bookingsListEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, code } = button.dataset;
    handleBookingAction(action, code);
  });

  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      ApiClient.clearSession();
      AppState.clearBookingCheckout();
      window.location.href = '../index.html';
    });
  }
};

const init = async () => {
  if (!ApiClient.isAuthenticated()) {
    AppState.requireAuth(window.location.href);
    return;
  }

  attachEventListeners();
  await Promise.all([loadProfile(), loadBookings()]);
};

init();