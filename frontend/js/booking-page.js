// Enhanced Booking Page JavaScript with Schedule Integration
class BookingManager {
  constructor() {
    this.availableSchedules = [];
    this.selectedSchedule = null;
    this.passengerCount = 1;
    this.selectedSeats = [];
    this.occupiedSeats = [5, 12, 18, 23]; // Mock occupied seats
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadAvailableSchedules();
    this.setupDateRestrictions();
  }

  setupDateRestrictions() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      input.min = today;
    });
  }

  bindEvents() {
    // Trip type change events (if exists)
    const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
    tripTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => this.handleTripTypeChange(e));
    });

    // Form elements
    const agentSelect = document.getElementById('agentInfo');
    const toSelect = document.getElementById('to');
    const departDate = document.getElementById('departDate');
    const departTime = document.getElementById('departTime');
    const passengersInput = document.getElementById('passengers');
    const confirmBtn = document.getElementById('confirmBooking');

    // Event listeners
    if (agentSelect) {
      agentSelect.addEventListener('change', () => this.handleAgentChange());
    }

    if (toSelect) {
      toSelect.addEventListener('change', () => this.updateSummary());
    }

    if (departDate) {
      departDate.addEventListener('change', () => this.updateSummary());
    }

    if (departTime) {
      departTime.addEventListener('change', () => this.updateSummary());
    }

    if (passengersInput) {
      passengersInput.addEventListener('change', () => this.handlePassengerChange());
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmBooking());
    }

    // Plate number selection
    const plateSelect = document.getElementById('plateNumber');
    if (plateSelect) {
      plateSelect.addEventListener('change', () => this.handlePlateChange());
    }
  }

  async loadAvailableSchedules() {
    try {
      // Load schedules from the API or use fallback data
      const response = await fetch('/api/schedules');
      
      if (response.ok) {
        this.availableSchedules = await response.json();
      } else {
        // Fallback schedules data from our schedule management
        this.availableSchedules = [
          {
            id: 1,
            bus_id: 1,
            route_id: 1,
            departure_time: '06:00:00',
            arrival_time: '09:30:00',
            price: 2200,
            available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            is_active: true,
            bus: { 
              id: 1,
              plate_number: 'RAD 001 A', 
              company_name: 'RITCO',
              total_seats: 50
            },
            route: { 
              id: 1,
              departure_city: 'Kigali - Nyabugogo', 
              arrival_city: 'Musanze' 
            }
          },
          {
            id: 2,
            bus_id: 2,
            route_id: 2,
            departure_time: '08:00:00',
            arrival_time: '13:00:00',
            price: 4200,
            available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            is_active: true,
            bus: { 
              id: 2,
              plate_number: 'RAD 002 B', 
              company_name: 'Volcano',
              total_seats: 45
            },
            route: { 
              id: 2,
              departure_city: 'Kigali - Nyabugogo', 
              arrival_city: 'Rubavu' 
            }
          },
          {
            id: 3,
            bus_id: 3,
            route_id: 3,
            departure_time: '10:00:00',
            arrival_time: '14:30:00',
            price: 3000,
            available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday',
            is_active: true,
            bus: { 
              id: 3,
              plate_number: 'RAD 003 C', 
              company_name: 'Alpha Express',
              total_seats: 40
            },
            route: { 
              id: 3,
              departure_city: 'Kigali - Nyabugogo', 
              arrival_city: 'Huye' 
            }
          }
        ];
      }

      this.populateAgentOptions();
    } catch (error) {
      console.error('Error loading schedules:', error);
      // Use fallback data
      this.availableSchedules = [
        {
          id: 1,
          bus_id: 1,
          route_id: 1,
          departure_time: '06:00:00',
          arrival_time: '09:30:00',
          price: 2200,
          available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
          is_active: true,
          bus: { 
            id: 1,
            plate_number: 'RAD 001 A', 
            company_name: 'RITCO',
            total_seats: 50
          },
          route: { 
            id: 1,
            departure_city: 'Kigali - Nyabugogo', 
            arrival_city: 'Musanze' 
          }
        }
      ];
      this.populateAgentOptions();
    }
  }

  populateAgentOptions() {
    const agentSelect = document.getElementById('agentInfo');
    const toSelect = document.getElementById('to');

    if (agentSelect) {
      // Get unique companies
      const companies = [...new Set(this.availableSchedules.map(s => s.bus.company_name))];
      
      agentSelect.innerHTML = '<option value="">Select Agent/Company</option>';
      companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        agentSelect.appendChild(option);
      });
    }

    if (toSelect) {
      // Get unique destinations
      const destinations = [...new Set(this.availableSchedules.map(s => s.route.arrival_city))];
      
      toSelect.innerHTML = '<option value="">Select Destination</option>';
      destinations.forEach(destination => {
        const option = document.createElement('option');
        option.value = destination;
        option.textContent = destination;
        // Add price data attribute from the first schedule to this destination
        const schedule = this.availableSchedules.find(s => s.route.arrival_city === destination);
        if (schedule) {
          option.dataset.price = schedule.price;
        }
        toSelect.appendChild(option);
      });
    }
  }

  handleAgentChange() {
    const agentSelect = document.getElementById('agentInfo');
    const plateSelect = document.getElementById('plateNumber');
    const routeInfo = document.getElementById('routeInfo');
    
    const selectedAgent = agentSelect.value;

    // Clear plate selection
    if (plateSelect) {
      plateSelect.innerHTML = '<option value="">Select plate number</option>';
    }

    if (selectedAgent) {
      // Filter schedules by selected agent
      const agentSchedules = this.availableSchedules.filter(s => s.bus.company_name === selectedAgent);
      
      // Populate plate numbers
      if (plateSelect) {
        agentSchedules.forEach(schedule => {
          const option = document.createElement('option');
          option.value = schedule.bus.plate_number;
          option.textContent = schedule.bus.plate_number;
          option.dataset.scheduleId = schedule.id;
          plateSelect.appendChild(option);
        });
      }

      // Show route info for the agent
      if (routeInfo && agentSchedules.length > 0) {
        const firstSchedule = agentSchedules[0];
        document.getElementById('distance').textContent = this.calculateDistance(firstSchedule);
        document.getElementById('duration').textContent = this.calculateDuration(firstSchedule);
        document.getElementById('pricePerSeat').textContent = firstSchedule.price + ' Rwf';
        routeInfo.classList.add('show');
      }
    } else if (routeInfo) {
      routeInfo.classList.remove('show');
    }

    // Reset seats and summary
    this.selectedSeats = [];
    this.clearSeatSelection();
    this.updateSummary();
  }

  calculateDistance(schedule) {
    // Mock calculation - in real app, this would come from route data
    return '85-240 km';
  }

  calculateDuration(schedule) {
    // Calculate duration from departure and arrival times
    const [depHour, depMin] = schedule.departure_time.split(':').map(Number);
    const [arrHour, arrMin] = schedule.arrival_time.split(':').map(Number);
    
    const depMinutes = depHour * 60 + depMin;
    const arrMinutes = arrHour * 60 + arrMin;
    const durationMinutes = arrMinutes - depMinutes;
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  handlePlateChange() {
    const plateSelect = document.getElementById('plateNumber');
    const selectedPlate = plateSelect.value;
    
    if (selectedPlate) {
      const option = plateSelect.options[plateSelect.selectedIndex];
      const scheduleId = option.dataset.scheduleId;
      
      this.selectedSchedule = this.availableSchedules.find(s => s.id == scheduleId);
      
      if (this.selectedSchedule) {
        this.generateSeats(this.selectedSchedule.bus.total_seats);
      }
    } else {
      this.selectedSchedule = null;
      this.clearSeatSelection();
    }
    
    this.updateSummary();
  }

  handlePassengerChange() {
    const passengersInput = document.getElementById('passengers');
    this.passengerCount = parseInt(passengersInput.value) || 1;
    
    // Reset selected seats
    document.querySelectorAll('.seat.selected').forEach(seat => {
      seat.classList.remove('selected');
    });
    this.selectedSeats = [];
    this.updateSummary();
  }

  generateSeats(totalSeats) {
    const seatSelection = document.getElementById('seatSelection');
    if (!seatSelection) return;
    
    seatSelection.innerHTML = ''; // Clear previous seats
    
    for (let i = 1; i <= totalSeats; i++) {
      const seat = document.createElement('div');
      seat.classList.add('seat');
      seat.textContent = i;

      if (this.occupiedSeats.includes(i)) {
        seat.classList.add('occupied');
      }

      // Seat selection logic
      seat.addEventListener('click', () => {
        if (!seat.classList.contains('occupied')) {
          if (seat.classList.contains('selected')) {
            // Deselect seat
            seat.classList.remove('selected');
            this.selectedSeats = this.selectedSeats.filter(s => s !== i);
          } else if (this.selectedSeats.length < this.passengerCount) {
            // Select seat if under passenger limit
            seat.classList.add('selected');
            this.selectedSeats.push(i);
          } else {
            alert(`You can only select ${this.passengerCount} seat(s)`);
          }
          this.updateSummary();
        }
      });

      seatSelection.appendChild(seat);
    }
  }

  clearSeatSelection() {
    const seatSelection = document.getElementById('seatSelection');
    if (seatSelection) {
      seatSelection.innerHTML = '';
    }
  }

  updateSummary() {
    const from = document.getElementById('from')?.value || 'Kigali - Nyabugogo';
    const to = document.getElementById('to')?.value;
    const agent = document.getElementById('agentInfo')?.value;
    const plate = document.getElementById('plateNumber')?.value;
    const date = document.getElementById('departDate')?.value;
    const time = document.getElementById('departTime')?.value;
    const passengers = this.passengerCount;

    // Update summary display
    const summaryElements = {
      route: document.getElementById('summaryRoute'),
      agents: document.getElementById('summaryAgents'),
      date: document.getElementById('summaryDate'),
      time: document.getElementById('summaryTime'),
      passengers: document.getElementById('summaryPassengers'),
      seats: document.getElementById('summarySeats'),
      pricePerSeat: document.getElementById('summaryPricePerSeat'),
      total: document.getElementById('summaryTotal')
    };

    if (summaryElements.route) {
      summaryElements.route.textContent = (from && to) ? `${from} → ${to}` : '-';
    }
    
    if (summaryElements.agents) {
      summaryElements.agents.textContent = agent + (plate ? ` (${plate})` : '');
    }
    
    if (summaryElements.date) {
      summaryElements.date.textContent = date || '-';
    }
    
    if (summaryElements.time) {
      summaryElements.time.textContent = time || '-';
    }
    
    if (summaryElements.passengers) {
      summaryElements.passengers.textContent = passengers;
    }
    
    if (summaryElements.seats) {
      summaryElements.seats.textContent = this.selectedSeats.length > 0 ? this.selectedSeats.join(', ') : 'None';
    }

    // Price calculation
    let pricePerSeat = 0;
    if (this.selectedSchedule) {
      pricePerSeat = this.selectedSchedule.price;
    } else if (to) {
      const toOption = document.querySelector(`#to option[value="${to}"]`);
      pricePerSeat = toOption?.dataset.price || 0;
    }

    if (summaryElements.pricePerSeat) {
      summaryElements.pricePerSeat.textContent = `${pricePerSeat} Rwf`;
    }

    const total = pricePerSeat * this.selectedSeats.length;
    if (summaryElements.total) {
      summaryElements.total.textContent = `${total.toLocaleString()} Rwf`;
    }

    // Enable/disable confirm button
    const confirmBtn = document.getElementById('confirmBooking');
    if (confirmBtn) {
      confirmBtn.disabled = !(from && to && date && time && this.selectedSeats.length === passengers);
    }
  }

  confirmBooking() {
    const bookingData = {
      from: document.getElementById('from')?.value || 'Kigali - Nyabugogo',
      to: document.getElementById('to')?.value,
      agent: document.getElementById('agentInfo')?.value,
      plate: document.getElementById('plateNumber')?.value,
      date: document.getElementById('departDate')?.value,
      time: document.getElementById('departTime')?.value,
      passengers: this.passengerCount,
      seats: this.selectedSeats,
      fullName: document.getElementById('fullName')?.value,
      email: document.getElementById('email')?.value,
      phone: document.getElementById('phone')?.value,
      idNumber: document.getElementById('idNumber')?.value,
      schedule: this.selectedSchedule,
      total: this.selectedSchedule ? (this.selectedSchedule.price * this.selectedSeats.length) : 0,
      reference: 'EXG' + Date.now().toString().slice(-8)
    };

    // Validate passenger information
    if (!bookingData.fullName || !bookingData.email || !bookingData.phone || !bookingData.idNumber) {
      alert('Please fill in all passenger information');
      return;
    }

    // Validate booking details
    if (!bookingData.to || !bookingData.date || !bookingData.time || this.selectedSeats.length === 0) {
      alert('Please complete all booking details and select seats');
      return;
    }

    // Save to localStorage
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));

    const confirmationMessage = `
      Booking Confirmed!
      
      Route: ${bookingData.from} → ${bookingData.to}
      Agent: ${bookingData.agent} (${bookingData.plate})
      Date: ${bookingData.date} at ${bookingData.time}
      Seats: ${bookingData.seats.join(', ')}
      Total: ${bookingData.total.toLocaleString()} Rwf
      
      A confirmation email will be sent to ${bookingData.email}
    `;

    alert(confirmationMessage);
    
    // Redirect to payment page
    window.location.href = 'payment-page.html';
  }

  handleTripTypeChange(e) {
    const type = e.target.value;
    const returnDateField = document.querySelector('.return-date');
    const multiCityContainer = document.getElementById('multiCityContainer');
    const addCityBtn = document.getElementById('addCityBtn');

    // Hide/Show sections based on trip type
    if (returnDateField) {
      returnDateField.classList.toggle('hidden', type !== 'round');
    }
    
    if (multiCityContainer) {
      multiCityContainer.classList.toggle('hidden', type !== 'multi');
    }
    
    if (addCityBtn) {
      addCityBtn.classList.toggle('hidden', type !== 'multi');
    }

    // Reset multi-city fields if not selected
    if (type !== 'multi' && multiCityContainer) {
      multiCityContainer.innerHTML = '';
      this.cityCount = 0;
    }
  }
}

// Legacy data for backward compatibility
const routeData = {
    'Musanze': { distance: '85 km', duration: '2 hours' },
    'Rubavu': { distance: '155 km', duration: '3 hours' },
    'Huye': { distance: '135 km', duration: '2.5 hours' },
    'Rusizi': { distance: '240 km', duration: '5 hours' },
    'Rwamagana': { distance: '45 km', duration: '1 hour' },
    'Nyagatare': { distance: '170 km', duration: '3 hours' },
    'Karongi': { distance: '150 km', duration: '3 hours' },
    'Muhanga': { distance: '50 km', duration: '1 hour' }
};

// Multi-city functionality
let cityCount = 0;

function addCity() {
  if (cityCount >= 3) {
    alert('Maximum 3 cities allowed.');
    return;
  }
  
  cityCount++;
  const multiCityContainer = document.getElementById('multiCityContainer');
  
  if (!multiCityContainer) return;

  const div = document.createElement('div');
  div.className = 'city-segment';
  div.innerHTML = `
    <div class="form-group">
      <label>From</label>
      <input type="text" placeholder="City ${cityCount} Start" name="multiFrom${cityCount}" />
    </div>
    <div class="form-group">
      <label>To</label>
      <input type="text" placeholder="City ${cityCount} Destination" name="multiTo${cityCount}" />
    </div>
    <div class="form-group">
      <label>Date</label>
      <input type="date" name="multiDate${cityCount}" />
    </div>
  `;
  multiCityContainer.appendChild(div);
}

// Initialize the Booking Manager when the page loads
let bookingManager;

document.addEventListener('DOMContentLoaded', () => {
  bookingManager = new BookingManager();

  // Bind add city button if it exists
  const addCityBtn = document.getElementById('addCityBtn');
  if (addCityBtn) {
    addCityBtn.addEventListener('click', addCity);
  }
});