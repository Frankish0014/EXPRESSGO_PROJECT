// Trip Details Page - Main Script
let currentTrip = null;
let tripId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Get trip ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  tripId = urlParams.get('id');

  if (!tripId) {
    showError('No trip ID provided');
    return;
  }

  // Check authentication
  if (!ApiClient.isAuthenticated()) {
    AppState.requireAuth();
    return;
  }

  // Check if user is admin
  const user = ApiClient.getUser();
  if (!user || user.role !== 'admin') {
    showError('Access denied. Admin privileges required.');
    return;
  }

  // Load trip data
  loadTripDetails();

  // Setup event listeners
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'admin.html?section=trips';
  });

  document.getElementById('startTripBtn').addEventListener('click', () => {
    updateTripStatus('in-progress');
  });

  document.getElementById('completeTripBtn').addEventListener('click', () => {
    updateTripStatus('completed');
  });

  document.getElementById('cancelTripBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel this trip? This action cannot be undone.')) {
      updateTripStatus('cancelled');
    }
  });
}

// Load trip details
async function loadTripDetails() {
  try {
    showLoading();

    const response = await ApiClient.get(`/trips/${tripId}`, {}, true);
    currentTrip = response.trip;

    renderTripDetails(currentTrip);
    hideLoading();
  } catch (error) {
    console.error('Error loading trip:', error);
    showError(error.message || 'Failed to load trip details');
  }
}

// Render trip details
function renderTripDetails(trip) {
  // Update status badge
  updateStatusBadge(trip.status);

  // Update trip info
  document.getElementById('tripRoute').textContent =
    `${trip.schedule.route.departure_city} → ${trip.schedule.route.arrival_city}`;

  document.getElementById('tripBus').textContent =
    `${trip.schedule.bus.plate_number} (${trip.schedule.bus.bus_type})`;

  document.getElementById('tripDate').textContent = formatDate(trip.trip_date);

  document.getElementById('tripTime').textContent =
    `${formatTime(trip.departure_time)} - ${formatTime(trip.arrival_time)}`;

  document.getElementById('tripCompany').textContent = trip.schedule.bus.company.name;

  const occupancyPercent = ((trip.booked_seats / trip.total_seats) * 100).toFixed(1);
  document.getElementById('tripOccupancy').textContent =
    `${trip.booked_seats}/${trip.total_seats} (${occupancyPercent}%)`;

  // Update action buttons based on status
  updateActionButtons(trip.status);

  // Render seat map
  renderSeatMap(trip);

  // Render passengers list
  renderPassengersList(trip.bookings);
}

// Update status badge
function updateStatusBadge(status) {
  const badge = document.getElementById('tripStatusBadge');
  const statusText = badge.querySelector('.status-text');

  badge.className = 'trip-status-badge ' + status;
  statusText.textContent = formatStatus(status);
}

// Format status text
function formatStatus(status) {
  const statusMap = {
    'scheduled': 'Scheduled',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
}

// Update action buttons
function updateActionButtons(status) {
  const startBtn = document.getElementById('startTripBtn');
  const completeBtn = document.getElementById('completeTripBtn');
  const cancelBtn = document.getElementById('cancelTripBtn');

  // Reset all buttons
  startBtn.disabled = false;
  completeBtn.disabled = false;
  cancelBtn.disabled = false;

  // Disable based on current status
  if (status === 'scheduled') {
    completeBtn.disabled = true;
  } else if (status === 'in-progress') {
    startBtn.disabled = true;
  } else if (status === 'completed' || status === 'cancelled') {
    startBtn.disabled = true;
    completeBtn.disabled = true;
    cancelBtn.disabled = true;
  }
}

// Render seat map
function renderSeatMap(trip) {
  const seatsGrid = document.getElementById('seatsGrid');
  seatsGrid.innerHTML = '';

  const totalSeats = trip.total_seats;
  const bookedSeats = new Map();

  // Create a map of booked seats with passenger info
  if (trip.bookings && trip.bookings.length > 0) {
    trip.bookings.forEach(booking => {
      if (booking.status === 'confirmed') {
        bookedSeats.set(booking.seat_number, {
          name: booking.user.full_name,
          email: booking.user.email,
          phone: booking.user.phone_number,
          bookingCode: booking.booking_code
        });
      }
    });
  }

  // Generate seats
  for (let i = 1; i <= totalSeats; i++) {
    const seat = document.createElement('div');
    const isBooked = bookedSeats.has(i);

    seat.className = `seat ${isBooked ? 'booked' : 'available'}`;

    const seatNumber = document.createElement('div');
    seatNumber.className = 'seat-number';
    seatNumber.textContent = i;
    seat.appendChild(seatNumber);

    if (isBooked) {
      const passenger = bookedSeats.get(i);
      const passengerName = document.createElement('div');
      passengerName.className = 'seat-passenger';
      passengerName.textContent = passenger.name.split(' ')[0]; // First name only
      seat.appendChild(passengerName);

      // Add tooltip
      seat.title = `${passenger.name}\n${passenger.phone}`;
    }

    seatsGrid.appendChild(seat);
  }
}

// Render passengers list
function renderPassengersList(bookings) {
  const passengersList = document.getElementById('passengersList');
  const passengerCount = document.getElementById('passengerCount');

  // Filter only confirmed bookings
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  passengerCount.textContent = `${confirmedBookings.length} passenger${confirmedBookings.length !== 1 ? 's' : ''}`;

  if (confirmedBookings.length === 0) {
    passengersList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>No passengers yet</p>
      </div>
    `;
    return;
  }

  // Sort by seat number
  confirmedBookings.sort((a, b) => a.seat_number - b.seat_number);

  passengersList.innerHTML = confirmedBookings.map(booking => `
    <div class="passenger-card">
      <div class="passenger-header">
        <div class="passenger-name">
          <i class="fas fa-user"></i> ${booking.user.full_name}
        </div>
        <div class="seat-badge">Seat ${booking.seat_number}</div>
      </div>
      <div class="passenger-details">
        <div class="passenger-detail">
          <i class="fas fa-envelope"></i>
          <span>${booking.user.email}</span>
        </div>
        <div class="passenger-detail">
          <i class="fas fa-phone"></i>
          <span>${booking.user.phone_number}</span>
        </div>
        <div class="booking-code">
          <i class="fas fa-ticket-alt"></i>
          <span>${booking.booking_code}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Update trip status
async function updateTripStatus(newStatus) {
  try {
    const response = await ApiClient.put(
      `/trips/${tripId}/status`,
      { status: newStatus },
      true
    );

    // Update current trip
    currentTrip.status = newStatus;

    // Re-render status badge and buttons
    updateStatusBadge(newStatus);
    updateActionButtons(newStatus);

    // Show success message
    showSuccessMessage(`Trip status updated to ${formatStatus(newStatus)}`);
  } catch (error) {
    console.error('Error updating trip status:', error);
    alert(error.message || 'Failed to update trip status');
  }
}

// Show success message
function showSuccessMessage(message) {
  // Create a temporary success notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: #38a169;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span style="margin-left: 0.5rem;">${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Show loading state
function showLoading() {
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('mainContent').classList.add('hidden');
  document.getElementById('errorState').classList.add('hidden');
}

// Hide loading state
function hideLoading() {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('mainContent').classList.remove('hidden');
}

// Show error state
function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorState').classList.remove('hidden');
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('mainContent').classList.add('hidden');
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

// Format time
function formatTime(timeString) {
  if (!timeString) return '—';

  // Handle time format (HH:MM:SS)
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  return timeString;
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
