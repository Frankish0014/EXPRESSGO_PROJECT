// Booking Management JavaScript
class BookingManager {
  constructor() {
    this.bookings = [];
    this.filteredBookings = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.filters = {
      status: '',
      route: '',
      date: '',
      search: ''
    };
    this.selectedBookings = new Set();
    this.routes = [];
  }

  init() {
    this.bindEvents();
    this.loadInitialData();
  }

  bindEvents() {
    // Header actions
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadBookings());
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportBookings());

    // Filter events
    const statusFilter = document.getElementById('statusFilter');
    const routeFilter = document.getElementById('routeFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchInput');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');

    if (statusFilter) statusFilter.addEventListener('change', () => this.applyFilters());
    if (routeFilter) routeFilter.addEventListener('change', () => this.applyFilters());
    if (dateFilter) dateFilter.addEventListener('change', () => this.applyFilters());
    if (searchInput) searchInput.addEventListener('input', () => this.applyFilters());
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => this.clearFilters());
    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => this.applyFilters());

    // Table actions
    const selectAll = document.getElementById('selectAll');
    const applyBulkBtn = document.getElementById('applyBulkBtn');
    if (selectAll) selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
    if (applyBulkBtn) applyBulkBtn.addEventListener('click', () => this.applyBulkAction());

    // Pagination
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => this.previousPage());
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => this.nextPage());

    // Modal events
    const closeStatusModalBtn = document.getElementById('closeStatusModalBtn');
    const cancelStatusBtn = document.getElementById('cancelStatusBtn');
    const confirmStatusBtn = document.getElementById('confirmStatusBtn');
    if (closeStatusModalBtn) closeStatusModalBtn.addEventListener('click', () => this.closeStatusModal());
    if (cancelStatusBtn) cancelStatusBtn.addEventListener('click', () => this.closeStatusModal());
    if (confirmStatusBtn) confirmStatusBtn.addEventListener('click', () => this.confirmStatusUpdate());

    const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
    const updateStatusFromDetailsBtn = document.getElementById('updateStatusFromDetailsBtn');
    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', () => this.closeDetailsModal());
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => this.closeDetailsModal());
    if (updateStatusFromDetailsBtn) updateStatusFromDetailsBtn.addEventListener('click', () => this.showStatusModalFromDetails());

    // Click outside modal to close
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeStatusModal();
        this.closeDetailsModal();
      }
    });
  }

  async loadInitialData() {
    this.showLoading();
    try {
      // Use dummy data instead of API calls
      this.loadMockRoutes();
      this.loadMockBookings();
      this.showSuccess('Booking management loaded successfully (using demo data)');
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showError('Failed to load initial data');
    } finally {
      this.hideLoading();
    }
  }

  loadMockRoutes() {
    // Generate mock routes for the filter dropdown
    this.routes = [
      'Kigali - Butare',
      'Kigali - Huye',
      'Kigali - Nyagatare',
      'Kigali - Rubavu',
      'Kigali - Rusizi',
      'Butare - Nyanza',
      'Huye - Nyamagabe',
      'Nyagatare - Kayonza',
      'Rubavu - Karongi',
      'Rusizi - Nyamasheke'
    ];
    this.populateRouteFilter();
  }

  loadMockBookings() {
    // Use the existing mock booking generator
    this.bookings = this.generateMockBookings();
    this.updateStats();
    this.applyFilters();
  }

  async loadRoutes() {
    try {
      // Try to fetch from API
      const response = await fetch('/api/routes');
      if (response.ok) {
        const data = await response.json();
        this.routes = data.routes || data;
      } else {
        throw new Error('Failed to fetch routes');
      }
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to mock data
      this.routes = [
        { id: 1, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Musanze' },
        { id: 2, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rubavu' },
        { id: 3, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Huye' },
        { id: 4, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rusizi' },
        { id: 5, departure_city: 'Kigali - Nyabugogo', arrival_city: 'Rwamagana' }
      ];
    }
    this.populateRouteFilter();
  }

  populateRouteFilter() {
    const routeFilter = document.getElementById('routeFilter');
    routeFilter.innerHTML = '<option value="">All Routes</option>';
    
    this.routes.forEach(route => {
      const option = document.createElement('option');
      if (typeof route === 'string') {
        // Simple string format
        option.value = route;
        option.textContent = route;
      } else {
        // Object format
        option.value = `${route.departure_city} - ${route.arrival_city}`;
        option.textContent = `${route.departure_city} → ${route.arrival_city}`;
      }
      routeFilter.appendChild(option);
    });
  }

  async loadBookings() {
    // Use dummy data instead of API calls
    this.showLoading();
    try {
      this.bookings = this.generateMockBookings();
      this.showSuccess('Bookings refreshed successfully (using demo data)');
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.showError('Failed to load bookings');
    } finally {
      this.hideLoading();
    }
    
    this.updateStats();
    this.applyFilters();
  }

  generateMockBookings() {
    const mockBookings = [];
    const statuses = ['confirmed', 'pending', 'checked-in', 'canceled'];
    const passengers = [
      { name: 'Jean Baptiste Uwimana', email: 'jean.uwimana@email.com', phone: '+250788123456' },
      { name: 'Marie Claire Mukamana', email: 'marie.mukamana@email.com', phone: '+250788234567' },
      { name: 'David Nshimiyimana', email: 'david.nshimi@email.com', phone: '+250788345678' },
      { name: 'Grace Uwamahoro', email: 'grace.uwama@email.com', phone: '+250788456789' },
      { name: 'Peter Habimana', email: 'peter.habima@email.com', phone: '+250788567890' },
      { name: 'Sarah Umuziranenge', email: 'sarah.umuzi@email.com', phone: '+250788678901' },
      { name: 'Robert Nzeyimana', email: 'robert.nzeyi@email.com', phone: '+250788789012' },
      { name: 'Agnes Nyiramahoro', email: 'agnes.nyira@email.com', phone: '+250788890123' }
    ];

    for (let i = 1; i <= 25; i++) {
      const passenger = passengers[Math.floor(Math.random() * passengers.length)];
      const route = this.routes[Math.floor(Math.random() * this.routes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const travelDate = new Date();
      travelDate.setDate(travelDate.getDate() + Math.floor(Math.random() * 30));
      
      const seatCount = Math.floor(Math.random() * 3) + 1;
      const seats = Array.from({length: seatCount}, (_, idx) => Math.floor(Math.random() * 40) + 1);
      const pricePerSeat = 2000 + Math.floor(Math.random() * 5000);
      
      mockBookings.push({
        id: i,
        booking_code: `EXG${String(i).padStart(6, '0')}`,
        passenger_name: passenger.name,
        passenger_email: passenger.email,
        passenger_phone: passenger.phone,
        route: `${route.departure_city} - ${route.arrival_city}`,
        departure_city: route.departure_city,
        arrival_city: route.arrival_city,
        travel_date: travelDate.toISOString().split('T')[0],
        departure_time: ['06:00', '08:00', '10:00', '14:00', '16:00'][Math.floor(Math.random() * 5)],
        seat_numbers: seats,
        seat_count: seatCount,
        price_per_seat: pricePerSeat,
        total_amount: pricePerSeat * seatCount,
        status: status,
        booking_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: ['cash', 'mobile_money', 'bank_card'][Math.floor(Math.random() * 3)],
        bus_plate: `RAD ${String(Math.floor(Math.random() * 999)).padStart(3, '0')} A`
      });
    }

    return mockBookings;
  }

  updateStats() {
    const stats = {
      confirmed: this.bookings.filter(b => b.status === 'confirmed').length,
      pending: this.bookings.filter(b => b.status === 'pending').length,
      'checked-in': this.bookings.filter(b => b.status === 'checked-in').length,
      canceled: this.bookings.filter(b => b.status === 'canceled').length
    };

    Object.entries(stats).forEach(([status, count]) => {
      const element = document.getElementById(`${status.replace('-', '')}Count`);
      if (element) {
        element.textContent = count;
      }
    });
  }

  applyFilters() {
    this.filters.status = document.getElementById('statusFilter').value;
    this.filters.route = document.getElementById('routeFilter').value;
    this.filters.date = document.getElementById('dateFilter').value;
    this.filters.search = document.getElementById('searchInput').value.toLowerCase();

    this.filteredBookings = this.bookings.filter(booking => {
      const matchesStatus = !this.filters.status || booking.status === this.filters.status;
      const matchesRoute = !this.filters.route || booking.route === this.filters.route;
      const matchesDate = !this.filters.date || booking.travel_date === this.filters.date;
      const matchesSearch = !this.filters.search || 
        booking.booking_code.toLowerCase().includes(this.filters.search) ||
        booking.passenger_name.toLowerCase().includes(this.filters.search) ||
        booking.passenger_email.toLowerCase().includes(this.filters.search) ||
        booking.passenger_phone.includes(this.filters.search);

      return matchesStatus && matchesRoute && matchesDate && matchesSearch;
    });

    this.currentPage = 1;
    this.renderBookings();
    this.updatePagination();
  }

  clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('routeFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('searchInput').value = '';
    this.applyFilters();
  }

  renderBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (this.filteredBookings.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageBookings = this.filteredBookings.slice(startIndex, endIndex);

    tbody.innerHTML = pageBookings.map(booking => `
      <tr>
        <td><input type="checkbox" value="${booking.id}" class="booking-select"></td>
        <td>
          <span class="booking-code">${booking.booking_code}</span>
        </td>
        <td>
          <div class="passenger-info">
            <div class="passenger-name">${booking.passenger_name}</div>
            <div class="passenger-email">${booking.passenger_email}</div>
          </div>
        </td>
        <td>
          <div class="contact-info">
            <div>${booking.passenger_phone}</div>
            <div style="font-size: 0.85rem; color: #666;">${booking.payment_method.replace('_', ' ').toUpperCase()}</div>
          </div>
        </td>
        <td>
          <div class="route-info">
            <div class="route-cities">${booking.departure_city} → ${booking.arrival_city}</div>
            <div class="route-details">Bus: ${booking.bus_plate}</div>
          </div>
        </td>
        <td>
          <div class="travel-date">${new Date(booking.travel_date).toLocaleDateString()}</div>
          <div class="travel-time">${this.formatTime(booking.departure_time)}</div>
        </td>
        <td>
          <div class="seats-info">
            <div class="seat-numbers">${booking.seat_numbers.join(', ')}</div>
            <div class="seat-count">${booking.seat_count} seat${booking.seat_count > 1 ? 's' : ''}</div>
          </div>
        </td>
        <td>
          <div class="amount-info">
            <div class="total-amount">${booking.total_amount.toLocaleString()} RWF</div>
            <div class="amount-breakdown">${booking.price_per_seat.toLocaleString()} × ${booking.seat_count}</div>
          </div>
        </td>
        <td>
          <span class="status-badge ${booking.status}">${this.formatStatus(booking.status)}</span>
        </td>
        <td>
          <div style="font-size: 0.85rem;">
            ${new Date(booking.booking_date).toLocaleDateString()}
            <br>
            <span style="color: #666;">${new Date(booking.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-view" onclick="bookingManager.viewBooking(${booking.id})" title="View Details">
              👁️
            </button>
            <button class="btn-action btn-update" onclick="bookingManager.updateStatus(${booking.id})" title="Update Status">
              📝
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Bind checkbox events
    document.querySelectorAll('.booking-select').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const bookingId = parseInt(e.target.value);
        if (e.target.checked) {
          this.selectedBookings.add(bookingId);
        } else {
          this.selectedBookings.delete(bookingId);
        }
        this.updateSelectAllState();
      });
    });

    this.updateSelectAllState();
  }

  formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  }

  formatStatus(status) {
    const statusMap = {
      'confirmed': 'Confirmed',
      'pending': 'Pending',
      'checked-in': 'Checked In',
      'canceled': 'Canceled'
    };
    return statusMap[status] || status;
  }

  updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.booking-select');
    const checkedBoxes = document.querySelectorAll('.booking-select:checked');
    
    if (checkedBoxes.length === 0) {
      selectAllCheckbox.indeterminate = false;
      selectAllCheckbox.checked = false;
    } else if (checkedBoxes.length === checkboxes.length) {
      selectAllCheckbox.indeterminate = false;
      selectAllCheckbox.checked = true;
    } else {
      selectAllCheckbox.indeterminate = true;
    }
  }

  toggleSelectAll(checked) {
    document.querySelectorAll('.booking-select').forEach(checkbox => {
      checkbox.checked = checked;
      const bookingId = parseInt(checkbox.value);
      if (checked) {
        this.selectedBookings.add(bookingId);
      } else {
        this.selectedBookings.delete(bookingId);
      }
    });
  }

  updatePagination() {
    const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredBookings.length);

    // Update pagination info
    document.getElementById('paginationInfo').textContent = 
      `Showing ${startItem}-${endItem} of ${this.filteredBookings.length} bookings`;

    // Update pagination controls
    document.getElementById('prevPageBtn').disabled = this.currentPage === 1;
    document.getElementById('nextPageBtn').disabled = this.currentPage === totalPages;

    // Update page numbers
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(totalPages, this.currentPage + 2); i++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
      pageLink.textContent = i;
      pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentPage = i;
        this.renderBookings();
        this.updatePagination();
      });
      pageNumbers.appendChild(pageLink);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderBookings();
      this.updatePagination();
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderBookings();
      this.updatePagination();
    }
  }

  // Status update functionality
  updateStatus(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) {
      this.showError('Booking not found');
      return;
    }

    this.currentBooking = booking;
    this.showStatusModal(booking);
  }

  showStatusModal(booking) {
    const modal = document.getElementById('statusModal');
    const detailsContainer = document.getElementById('statusBookingDetails');
    
    detailsContainer.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Booking Code:</span>
        <span class="detail-value">${booking.booking_code}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Passenger:</span>
        <span class="detail-value">${booking.passenger_name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Route:</span>
        <span class="detail-value">${booking.departure_city} → ${booking.arrival_city}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Travel Date:</span>
        <span class="detail-value">${new Date(booking.travel_date).toLocaleDateString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Current Status:</span>
        <span class="detail-value"><span class="status-badge ${booking.status}">${this.formatStatus(booking.status)}</span></span>
      </div>
    `;

    // Populate available status options (excluding current status)
    const statusSelect = document.getElementById('newStatus');
    const allStatuses = [
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'checked-in', label: 'Checked In' },
      { value: 'canceled', label: 'Canceled' }
    ];

    statusSelect.innerHTML = '<option value="">Select Status</option>';
    allStatuses
      .filter(status => status.value !== booking.status)
      .forEach(status => {
        const option = document.createElement('option');
        option.value = status.value;
        option.textContent = status.label;
        statusSelect.appendChild(option);
      });

    // Clear form
    document.getElementById('statusReason').value = '';
    document.getElementById('notifyPassenger').checked = true;

    modal.style.display = 'block';
    modal.classList.add('show');
  }

  closeStatusModal() {
    const modal = document.getElementById('statusModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    this.currentBooking = null;
  }

  async confirmStatusUpdate() {
    const newStatus = document.getElementById('newStatus').value;
    const reason = document.getElementById('statusReason').value;
    const notify = document.getElementById('notifyPassenger').checked;

    if (!newStatus) {
      this.showError('Please select a new status');
      return;
    }

    if (!this.currentBooking) {
      this.showError('No booking selected');
      return;
    }

    try {
      // Update booking status
      await this.performStatusUpdate(this.currentBooking.id, newStatus, reason, notify);
      
      // Update local data
      this.currentBooking.status = newStatus;
      
      // Refresh display
      this.updateStats();
      this.renderBookings();
      
      this.closeStatusModal();
      this.showSuccess(`Booking status updated to ${this.formatStatus(newStatus)}`);
      
    } catch (error) {
      console.error('Error updating status:', error);
      this.showError('Failed to update booking status');
    }
  }

  async performStatusUpdate(bookingId, newStatus, reason, notify) {
    // Use dummy data simulation instead of API calls
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update the booking in our local data
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = newStatus;
          booking.last_updated = new Date().toISOString();
          if (reason) booking.status_reason = reason;
        }
        console.log(`Mock: Updated booking ${bookingId} status to ${newStatus}`, 
                   notify ? '(notification sent)' : '(no notification)');
        resolve({ success: true });
      }, 500); // Simulate network delay
    });
  }

  // Bulk actions
  applyBulkAction() {
    const action = document.getElementById('bulkActionSelect').value;
    
    if (!action) {
      this.showError('Please select a bulk action');
      return;
    }

    if (this.selectedBookings.size === 0) {
      this.showError('Please select at least one booking');
      return;
    }

    const statusMap = {
      'confirm': 'confirmed',
      'check-in': 'checked-in',
      'cancel': 'canceled'
    };

    const newStatus = statusMap[action];
    const selectedCount = this.selectedBookings.size;

    if (confirm(`Are you sure you want to ${action.replace('-', ' ')} ${selectedCount} booking(s)?`)) {
      this.processBulkStatusUpdate(newStatus);
    }
  }

  async processBulkStatusUpdate(newStatus) {
    const selectedIds = Array.from(this.selectedBookings);
    let successCount = 0;
    let failureCount = 0;

    for (const bookingId of selectedIds) {
      try {
        await this.performStatusUpdate(bookingId, newStatus, 'Bulk update', true);
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = newStatus;
        }
        successCount++;
      } catch (error) {
        console.error(`Failed to update booking ${bookingId}:`, error);
        failureCount++;
      }
    }

    // Clear selections
    this.selectedBookings.clear();
    document.getElementById('selectAll').checked = false;
    document.getElementById('bulkActionSelect').value = '';

    // Refresh display
    this.updateStats();
    this.renderBookings();

    // Show results
    if (failureCount === 0) {
      this.showSuccess(`Successfully updated ${successCount} booking(s) to ${this.formatStatus(newStatus)}`);
    } else {
      this.showError(`Updated ${successCount} booking(s), but ${failureCount} failed`);
    }
  }

  // Booking details
  viewBooking(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) {
      this.showError('Booking not found');
      return;
    }

    this.showBookingDetails(booking);
  }

  showBookingDetails(booking) {
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('bookingDetailsContent');
    
    content.innerHTML = `
      <div class="booking-details">
        <h3>Booking Information</h3>
        <div class="detail-row">
          <span class="detail-label">Booking Code:</span>
          <span class="detail-value">${booking.booking_code}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value"><span class="status-badge ${booking.status}">${this.formatStatus(booking.status)}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking Date:</span>
          <span class="detail-value">${new Date(booking.booking_date).toLocaleDateString()} at ${new Date(booking.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      <div class="booking-details">
        <h3>Passenger Information</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${booking.passenger_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${booking.passenger_email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-value">${booking.passenger_phone}</span>
        </div>
      </div>

      <div class="booking-details">
        <h3>Travel Information</h3>
        <div class="detail-row">
          <span class="detail-label">Route:</span>
          <span class="detail-value">${booking.departure_city} → ${booking.arrival_city}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Travel Date:</span>
          <span class="detail-value">${new Date(booking.travel_date).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Departure Time:</span>
          <span class="detail-value">${this.formatTime(booking.departure_time)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bus:</span>
          <span class="detail-value">${booking.bus_plate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Seat Numbers:</span>
          <span class="detail-value">${booking.seat_numbers.join(', ')}</span>
        </div>
      </div>

      <div class="booking-details">
        <h3>Payment Information</h3>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${booking.payment_method.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Price per Seat:</span>
          <span class="detail-value">${booking.price_per_seat.toLocaleString()} RWF</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Number of Seats:</span>
          <span class="detail-value">${booking.seat_count}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value"><strong>${booking.total_amount.toLocaleString()} RWF</strong></span>
        </div>
      </div>
    `;

    this.currentBooking = booking;
    modal.style.display = 'block';
    modal.classList.add('show');
  }

  closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    this.currentBooking = null;
  }

  showStatusModalFromDetails() {
    if (this.currentBooking) {
      this.closeDetailsModal();
      this.showStatusModal(this.currentBooking);
    }
  }

  // Export functionality
  exportBookings() {
    const dataToExport = this.filteredBookings.map(booking => ({
      'Booking Code': booking.booking_code,
      'Passenger Name': booking.passenger_name,
      'Email': booking.passenger_email,
      'Phone': booking.passenger_phone,
      'Route': booking.route,
      'Travel Date': booking.travel_date,
      'Departure Time': booking.departure_time,
      'Seats': booking.seat_numbers.join(', '),
      'Total Amount (RWF)': booking.total_amount,
      'Status': this.formatStatus(booking.status),
      'Booking Date': new Date(booking.booking_date).toLocaleDateString()
    }));

    this.downloadCSV(dataToExport, 'bookings_export.csv');
    this.showSuccess(`Exported ${dataToExport.length} booking(s) to CSV`);
  }

  downloadCSV(data, filename) {
    if (data.length === 0) return;

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Loading states
  showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
  }

  hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
  }

  // Notification system
  showSuccess(message) {
    this.showNotification('success', 'Success!', message);
  }

  showError(message) {
    this.showNotification('error', 'Error!', message);
  }

  showNotification(type, title, message) {
    const notificationId = `${type}Notification`;
    const notification = document.getElementById(notificationId);
    const messageElement = document.getElementById(`${type}Message`);
    
    if (notification && messageElement) {
      messageElement.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        this.closeNotification(notificationId);
      }, 5000);
    }
  }

  closeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
      notification.classList.remove('show');
      notification.classList.add('hide');
      
      setTimeout(() => {
        notification.classList.remove('hide');
      }, 500);
    }
  }
}

// Initialize the Booking Manager when the page loads
let bookingManager;

document.addEventListener('DOMContentLoaded', () => {
  bookingManager = new BookingManager();
  bookingManager.init();
});

// Global function to close notifications
function closeNotification(notificationId) {
  if (bookingManager) {
    bookingManager.closeNotification(notificationId);
  }
}

// Global function to clear filters (for empty state button)
function clearFilters() {
  if (bookingManager) {
    bookingManager.clearFilters();
  }
}