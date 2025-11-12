    // Sample booking data
    const bookings = [
      {
        id: 'BK001234',
        status: 'confirmed',
        from: 'Kigali - Nyabugogo',
        to: 'Musanze',
        date: '2025-11-15',
        time: '08:00 AM',
        passengers: 2,
        seats: [12, 13],
        price: 4400,
        bookingDate: '2025-11-10'
      },
      {
        id: 'BK001235',
        status: 'confirmed',
        from: 'Kigali - Nyabugogo',
        to: 'Rubavu',
        date: '2025-11-20',
        time: '10:00 AM',
        passengers: 1,
        seats: [8],
        price: 4200,
        bookingDate: '2025-11-08'
      },
      {
        id: 'BK001236',
        status: 'pending',
        from: 'Kigali - Nyabugogo',
        to: 'Huye',
        date: '2025-11-18',
        time: '06:00 AM',
        passengers: 3,
        seats: [15, 16, 17],
        price: 9000,
        bookingDate: '2025-11-11'
      },
      {
        id: 'BK001230',
        status: 'completed',
        from: 'Kigali - Nyabugogo',
        to: 'Rwamagana',
        date: '2025-11-05',
        time: '14:00 PM',
        passengers: 1,
        seats: [22],
        price: 2000,
        bookingDate: '2025-11-01'
      },
      {
        id: 'BK001229',
        status: 'completed',
        from: 'Kigali - Nyabugogo',
        to: 'Rusizi',
        date: '2025-10-28',
        time: '06:00 AM',
        passengers: 2,
        seats: [5, 6],
        price: 15000,
        bookingDate: '2025-10-20'
      },
      {
        id: 'BK001228',
        status: 'completed',
        from: 'Kigali - Nyabugogo',
        to: 'Nyagatare',
        date: '2025-10-15',
        time: '08:00 AM',
        passengers: 1,
        seats: [10],
        price: 5000,
        bookingDate: '2025-10-10'
      },
      {
        id: 'BK001220',
        status: 'cancelled',
        from: 'Kigali - Nyabugogo',
        to: 'Karongi',
        date: '2025-10-05',
        time: '12:00 PM',
        passengers: 2,
        seats: [18, 19],
        price: 10000,
        bookingDate: '2025-09-28'
      }
    ];

    function renderBookings(bookingsToRender) {
      const bookingsList = document.getElementById('bookingsList');
      
      if (bookingsToRender.length === 0) {
        bookingsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🎫</div>
            <h3>No bookings found</h3>
            <p>You haven't made any bookings yet or no bookings match your filter.</p>
            <button class="btn btn-primary" onclick="window.location.href='booking-page.html'">Book Your First Trip</button>
          </div>
        `;
        return;
      }

      bookingsList.innerHTML = bookingsToRender.map(booking => `
        <div class="booking-card" data-status="${booking.status}" data-destination="${booking.to}">
          <div class="booking-header">
            <span class="booking-id">Booking #${booking.id}</span>
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
                <p>Arrival time varies</p>
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
                <span class="detail-label">Total Amount</span>
                <span class="detail-value">${booking.price.toLocaleString()} Rwf</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Booked On</span>
                <span class="detail-value">${booking.bookingDate}</span>
              </div>
            </div>
            <div class="booking-actions">
              ${booking.status === 'confirmed' ? `
                <button class="btn btn-primary" onclick="viewTicket('${booking.id}')">View Ticket</button>
                <button class="btn btn-secondary" onclick="modifyBooking('${booking.id}')">Modify</button>
                <button class="btn btn-danger" onclick="cancelBooking('${booking.id}')">Cancel</button>
              ` : ''}
              ${booking.status === 'completed' ? `
                <button class="btn btn-primary" onclick="viewTicket('${booking.id}')">View Receipt</button>
                <button class="btn btn-secondary" onclick="rebookTrip('${booking.id}')">Book Again</button>
              ` : ''}
              ${booking.status === 'cancelled' ? `
                <button class="btn btn-secondary" onclick="rebookTrip('${booking.id}')">Book Again</button>
              ` : ''}
              ${booking.status === 'pending' ? `
                <button class="btn btn-primary" onclick="completePayment('${booking.id}')">Complete Payment</button>
                <button class="btn btn-danger" onclick="cancelBooking('${booking.id}')">Cancel</button>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }

    // Initial render
    renderBookings(bookings);

    // Filter functionality
    document.getElementById('statusFilter').addEventListener('change', function() {
      const status = this.value;
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      filterBookings(status, searchTerm);
    });

    document.getElementById('searchInput').addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const status = document.getElementById('statusFilter').value;
      filterBookings(status, searchTerm);
    });

    function filterBookings(status, searchTerm) {
      let filtered = bookings;
      
      if (status !== 'all') {
        filtered = filtered.filter(b => b.status === status);
      }
      
      if (searchTerm) {
        filtered = filtered.filter(b => 
          b.to.toLowerCase().includes(searchTerm) || 
          b.from.toLowerCase().includes(searchTerm) ||
          b.id.toLowerCase().includes(searchTerm)
        );
      }
      
      renderBookings(filtered);
    }

    // Action functions
    function viewTicket(bookingId) {
      alert(`Viewing ticket for booking ${bookingId}\n\nYour ticket would be displayed here or downloaded as PDF.`);
    }

    function modifyBooking(bookingId) {
      alert(`Modify booking ${bookingId}\n\nYou would be redirected to the modification page.`);
    }

    function cancelBooking(bookingId) {
      if (confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
        alert(`Booking ${bookingId} has been cancelled.\n\nRefund will be processed within 3-5 business days.`);
        // Here you would update the booking status and refresh the list
      }
    }

    function rebookTrip(bookingId) {
      alert(`Rebooking trip from ${bookingId}\n\nYou would be redirected to the booking page with pre-filled information.`);
    }

    function completePayment(bookingId) {
      alert(`Complete payment for booking ${bookingId}\n\nYou would be redirected to the payment gateway.`);
    }