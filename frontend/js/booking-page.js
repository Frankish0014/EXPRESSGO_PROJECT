// Enhanced Booking Page JavaScript with Interactive Seat Selection and Validation
class BookingManager {
  constructor() {
    this.availableSchedules = [];
    this.selectedSchedule = null;
    this.passengerCount = 1;
    this.selectedSeats = [];
    this.occupiedSeats = [5, 12, 18, 23, 28, 35, 42]; // Mock occupied seats
    this.premiumSeats = [1, 2, 3, 4, 47, 48, 49, 50]; // Front and back rows
    this.validationRules = {};
    this.formErrors = [];
    
    this.init();
  }

  init() {
    this.setupValidationRules();
    this.bindEvents();
    this.loadAvailableSchedules();
    this.setupDateRestrictions();
    this.addValidationListeners();
  }

  setupValidationRules() {
    this.validationRules = {
      from: {
        required: true,
        message: 'Departure point is required'
      },
      to: {
        required: true,
        message: 'Destination is required'
      },
      departDate: {
        required: true,
        validate: (value) => {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectedDate >= today;
        },
        message: 'Departure date must be today or in the future'
      },
      departTime: {
        required: true,
        message: 'Departure time is required'
      },
      agentInfo: {
        required: true,
        message: 'Please select a bus agent/company'
      },
      plateNumber: {
        required: true,
        message: 'Please select a bus/plate number'
      },
      passengers: {
        required: true,
        validate: (value) => {
          const num = parseInt(value);
          return num >= 1 && num <= 10;
        },
        message: 'Number of passengers must be between 1 and 10'
      },
      fullName: {
        required: true,
        validate: (value) => {
          return value.trim().split(' ').length >= 2 && value.length >= 3;
        },
        message: 'Full name must contain at least first and last name'
      },
      email: {
        required: true,
        validate: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please enter a valid email address'
      },
      phone: {
        required: true,
        validate: (value) => {
          // Rwanda phone number format: +250 7XX XXX XXX
          const phoneRegex = /^(\+250|250)?\s?[0-9]{9}$/;
          return phoneRegex.test(value.replace(/\s/g, ''));
        },
        message: 'Please enter a valid phone number (format: +250 7XX XXX XXX)'
      },
      idNumber: {
        required: true,
        validate: (value) => {
          // Rwanda ID or passport validation
          return value.length >= 8 && /^[A-Za-z0-9]+$/.test(value);
        },
        message: 'ID/Passport number must be at least 8 characters (alphanumeric)'
      }
    };
  }

  setupDateRestrictions() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      input.min = today;
    });
  }

  addValidationListeners() {
    // Add real-time validation for all form fields
    Object.keys(this.validationRules).forEach(fieldName => {
      const field = document.getElementById(fieldName);
      if (field) {
        // Add error message container
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.id = fieldName + 'Error';
        field.parentNode.appendChild(errorDiv);

        // Add success message container
        const successDiv = document.createElement('div');
        successDiv.className = 'field-success';
        successDiv.id = fieldName + 'Success';
        field.parentNode.appendChild(successDiv);

        // Add event listeners
        field.addEventListener('blur', () => this.validateField(fieldName));
        field.addEventListener('input', () => this.clearFieldError(fieldName));
      }
    });

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
    }

    // Real-time name validation
    const fullNameInput = document.getElementById('fullName');
    if (fullNameInput) {
      fullNameInput.addEventListener('input', (e) => this.formatFullName(e));
    }
  }

  formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Add Rwanda country code if not present
    if (value.length > 0 && !value.startsWith('250')) {
      if (value.startsWith('7') || value.startsWith('06') || value.startsWith('02')) {
        value = '250' + value;
      }
    }
    
    // Format the number: +250 7XX XXX XXX
    if (value.length >= 3) {
      let formatted = '+' + value.substring(0, 3);
      if (value.length > 3) {
        formatted += ' ' + value.substring(3, 4);
        if (value.length > 4) {
          formatted += value.substring(4, 6);
          if (value.length > 6) {
            formatted += ' ' + value.substring(6, 9);
            if (value.length > 9) {
              formatted += ' ' + value.substring(9, 12);
            }
          }
        }
      }
      e.target.value = formatted;
    }
  }

  formatFullName(e) {
    // Capitalize first letter of each word
    const words = e.target.value.toLowerCase().split(' ');
    const capitalizedWords = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    );
    e.target.value = capitalizedWords.join(' ');
  }

  validateField(fieldName) {
    const field = document.getElementById(fieldName);
    const rule = this.validationRules[fieldName];
    const errorDiv = document.getElementById(fieldName + 'Error');
    const successDiv = document.getElementById(fieldName + 'Success');
    
    if (!field || !rule) return true;

    const value = field.value.trim();
    const fieldGroup = field.closest('.form-group');
    
    // Check if required
    if (rule.required && !value) {
      this.showFieldError(fieldGroup, errorDiv, successDiv, rule.message);
      return false;
    }

    // Check custom validation
    if (value && rule.validate && !rule.validate(value)) {
      this.showFieldError(fieldGroup, errorDiv, successDiv, rule.message);
      return false;
    }

    // Field is valid
    this.showFieldSuccess(fieldGroup, errorDiv, successDiv);
    return true;
  }

  showFieldError(fieldGroup, errorDiv, successDiv, message) {
    fieldGroup.classList.remove('success');
    fieldGroup.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
  }

  showFieldSuccess(fieldGroup, errorDiv, successDiv) {
    fieldGroup.classList.remove('error');
    fieldGroup.classList.add('success');
    errorDiv.style.display = 'none';
    successDiv.textContent = '✓ Valid';
    successDiv.style.display = 'block';
  }

  clearFieldError(fieldName) {
    const fieldGroup = document.getElementById(fieldName).closest('.form-group');
    const errorDiv = document.getElementById(fieldName + 'Error');
    
    if (fieldGroup.classList.contains('error')) {
      fieldGroup.classList.remove('error');
      errorDiv.style.display = 'none';
    }
  }

  bindEvents() {
    // Form elements
    const agentSelect = document.getElementById('agentInfo');
    const toSelect = document.getElementById('to');
    const departDate = document.getElementById('departDate');
    const departTime = document.getElementById('departTime');
    const passengersInput = document.getElementById('passengers');
    const confirmBtn = document.getElementById('confirmBooking');
    const validateBtn = document.getElementById('validateForm');
    const resetBtn = document.getElementById('resetForm');

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

    if (validateBtn) {
      validateBtn.addEventListener('click', () => this.validateCompleteForm());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetForm());
    }

    // Plate number selection
    const plateSelect = document.getElementById('plateNumber');
    if (plateSelect) {
      plateSelect.addEventListener('change', () => this.handlePlateChange());
    }
  }

  async loadAvailableSchedules() {
    try {
      this.showLoadingState(true);
      
      // Try to load from API first
      const response = await fetch('/api/schedules');
      
      if (response.ok) {
        this.availableSchedules = await response.json();
      } else {
        // Fallback to mock data
        this.availableSchedules = this.getMockSchedules();
      }

      this.populateAgentOptions();
    } catch (error) {
      console.error('Error loading schedules:', error);
      this.availableSchedules = this.getMockSchedules();
      this.populateAgentOptions();
    } finally {
      this.showLoadingState(false);
    }
  }

  getMockSchedules() {
    return [
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
      }
      // Add more mock schedules as needed
    ];
  }

  showLoadingState(show) {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="loading-spinner"></div>';
      document.body.appendChild(overlay);
    }
    
    overlay.style.display = show ? 'flex' : 'none';
  }

  populateAgentOptions() {
    const agentSelect = document.getElementById('agentInfo');
    const toSelect = document.getElementById('to');

    if (agentSelect) {
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
      const destinations = [...new Set(this.availableSchedules.map(s => s.route.arrival_city))];
      
      toSelect.innerHTML = '<option value="">Select Destination</option>';
      destinations.forEach(destination => {
        const option = document.createElement('option');
        option.value = destination;
        option.textContent = destination;
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

    this.hideSeatSelection();

    if (selectedAgent) {
      const agentSchedules = this.availableSchedules.filter(s => s.bus.company_name === selectedAgent);
      
      // Populate plate numbers
      if (plateSelect) {
        agentSchedules.forEach(schedule => {
          const option = document.createElement('option');
          option.value = schedule.bus.plate_number;
          option.textContent = `${schedule.bus.plate_number} (${schedule.bus.total_seats} seats)`;
          option.dataset.scheduleId = schedule.id;
          plateSelect.appendChild(option);
        });
      }

      // Show route info
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

    this.resetSeatSelection();
    this.updateSummary();
  }

  handlePlateChange() {
    const plateSelect = document.getElementById('plateNumber');
    const selectedPlate = plateSelect.value;
    
    if (selectedPlate) {
      const option = plateSelect.options[plateSelect.selectedIndex];
      const scheduleId = option.dataset.scheduleId;
      
      this.selectedSchedule = this.availableSchedules.find(s => s.id == scheduleId);
      
      if (this.selectedSchedule) {
        this.showSeatSelection();
        this.generateSeats(this.selectedSchedule.bus.total_seats);
      }
    } else {
      this.selectedSchedule = null;
      this.hideSeatSelection();
    }
    
    this.updateSummary();
  }

  showSeatSelection() {
    const container = document.getElementById('seatSelectionContainer');
    const busInfo = document.getElementById('busInfo');
    
    if (container && this.selectedSchedule) {
      container.style.display = 'block';
      busInfo.textContent = `${this.selectedSchedule.bus.company_name} - ${this.selectedSchedule.bus.plate_number} (${this.selectedSchedule.bus.total_seats} seats)`;
    }
  }

  hideSeatSelection() {
    const container = document.getElementById('seatSelectionContainer');
    if (container) {
      container.style.display = 'none';
    }
  }

  handlePassengerChange() {
    const passengersInput = document.getElementById('passengers');
    const seatsToSelect = document.getElementById('seatsToSelect');
    
    this.passengerCount = parseInt(passengersInput.value) || 1;
    
    if (seatsToSelect) {
      seatsToSelect.textContent = this.passengerCount;
    }
    
    // Reset selected seats if count changed
    this.resetSeatSelection();
    this.updateSummary();
  }

  generateSeats(totalSeats) {
    const seatSelection = document.getElementById('seatSelection');
    if (!seatSelection) return;
    
    seatSelection.innerHTML = '';
    
    for (let i = 1; i <= totalSeats; i++) {
      const seat = document.createElement('div');
      seat.classList.add('seat');
      seat.textContent = i;
      seat.dataset.seatNumber = i;

      // Determine seat type
      if (this.occupiedSeats.includes(i)) {
        seat.classList.add('occupied');
        seat.title = `Seat ${i} - Occupied`;
      } else if (this.premiumSeats.includes(i)) {
        seat.classList.add('premium', 'available');
        seat.title = `Seat ${i} - Premium (+500 Rwf)`;
      } else {
        seat.classList.add('available');
        seat.title = `Seat ${i} - Available`;
      }

      // Add click handler
      seat.addEventListener('click', () => this.handleSeatClick(seat, i));

      seatSelection.appendChild(seat);
    }
  }

  handleSeatClick(seatElement, seatNumber) {
    if (seatElement.classList.contains('occupied')) {
      this.showNotification('This seat is already occupied', 'error');
      return;
    }

    if (seatElement.classList.contains('selected')) {
      // Deselect seat
      seatElement.classList.remove('selected');
      this.selectedSeats = this.selectedSeats.filter(s => s !== seatNumber);
      this.showNotification(`Seat ${seatNumber} deselected`, 'info');
    } else if (this.selectedSeats.length < this.passengerCount) {
      // Select seat
      seatElement.classList.add('selected');
      this.selectedSeats.push(seatNumber);
      
      const seatType = seatElement.classList.contains('premium') ? 'premium' : 'regular';
      this.showNotification(`Seat ${seatNumber} selected (${seatType})`, 'success');
    } else {
      this.showNotification(`You can only select ${this.passengerCount} seat(s)`, 'warning');
    }

    this.updateSelectedSeatsDisplay();
    this.updateSummary();
  }

  updateSelectedSeatsDisplay() {
    const display = document.getElementById('selectedSeatsDisplay');
    if (display) {
      if (this.selectedSeats.length === 0) {
        display.textContent = 'None';
        display.style.color = '#6c757d';
      } else {
        const sortedSeats = [...this.selectedSeats].sort((a, b) => a - b);
        display.textContent = sortedSeats.join(', ');
        display.style.color = '#3498db';
      }
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '6px',
      color: 'white',
      fontWeight: '600',
      zIndex: '10000',
      transform: 'translateX(400px)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px'
    });

    // Set background color based on type
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  resetSeatSelection() {
    this.selectedSeats = [];
    document.querySelectorAll('.seat.selected').forEach(seat => {
      seat.classList.remove('selected');
    });
    this.updateSelectedSeatsDisplay();
  }

  calculateDistance(schedule) {
    const routeDistances = {
      'Musanze': '85 km',
      'Rubavu': '155 km',
      'Huye': '135 km',
      'Rusizi': '240 km',
      'Rwamagana': '45 km',
      'Nyagatare': '170 km',
      'Karongi': '150 km',
      'Muhanga': '50 km'
    };
    return routeDistances[schedule.route.arrival_city] || '100 km';
  }

  calculateDuration(schedule) {
    const [depHour, depMin] = schedule.departure_time.split(':').map(Number);
    const [arrHour, arrMin] = schedule.arrival_time.split(':').map(Number);
    
    const depMinutes = depHour * 60 + depMin;
    const arrMinutes = arrHour * 60 + arrMin;
    const durationMinutes = arrMinutes - depMinutes;
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  validateCompleteForm() {
    this.formErrors = [];
    let isValid = true;

    // Validate all fields
    Object.keys(this.validationRules).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    });

    // Validate seat selection
    if (this.selectedSeats.length !== this.passengerCount) {
      this.formErrors.push(`Please select exactly ${this.passengerCount} seat(s)`);
      isValid = false;
    }

    // Show validation results
    this.displayValidationResults(isValid);
    
    return isValid;
  }

  displayValidationResults(isValid) {
    const errorsContainer = document.getElementById('formErrors');
    const errorsList = document.getElementById('errorsList');

    if (isValid) {
      errorsContainer.style.display = 'none';
      this.showNotification('All form data is valid! Ready to proceed.', 'success');
      
      // Enable the confirm booking button
      const confirmBtn = document.getElementById('confirmBooking');
      if (confirmBtn) {
        confirmBtn.disabled = false;
      }
    } else {
      // Add seat selection error if needed
      if (this.selectedSeats.length !== this.passengerCount) {
        this.formErrors.push(`Please select exactly ${this.passengerCount} seat(s) for your journey`);
      }

      errorsList.innerHTML = '';
      this.formErrors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorsList.appendChild(li);
      });

      errorsContainer.style.display = 'block';
      errorsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  resetForm() {
    if (confirm('Are you sure you want to reset the entire form? All data will be lost.')) {
      // Reset form fields
      document.getElementById('bookingForm').reset();
      
      // Reset seat selection
      this.resetSeatSelection();
      
      // Reset state
      this.selectedSchedule = null;
      this.passengerCount = 1;
      
      // Hide seat selection
      this.hideSeatSelection();
      
      // Clear validation states
      document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
      });
      
      document.querySelectorAll('.field-error, .field-success').forEach(msg => {
        msg.style.display = 'none';
      });

      // Hide errors
      document.getElementById('formErrors').style.display = 'none';
      
      // Update summary
      this.updateSummary();
      
      this.showNotification('Form has been reset', 'info');
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
      summaryElements.seats.textContent = this.selectedSeats.length > 0 ? this.selectedSeats.sort((a, b) => a - b).join(', ') : 'None';
    }

    // Price calculation with premium seat surcharge
    let pricePerSeat = 0;
    if (this.selectedSchedule) {
      pricePerSeat = this.selectedSchedule.price;
    } else if (to) {
      const toOption = document.querySelector(`#to option[value="${to}"]`);
      pricePerSeat = parseInt(toOption?.dataset.price) || 0;
    }

    // Calculate total with premium seat surcharge
    let total = 0;
    this.selectedSeats.forEach(seatNumber => {
      let seatPrice = pricePerSeat;
      if (this.premiumSeats.includes(seatNumber)) {
        seatPrice += 500; // Premium seat surcharge
      }
      total += seatPrice;
    });

    if (summaryElements.pricePerSeat) {
      summaryElements.pricePerSeat.textContent = `${pricePerSeat} Rwf`;
    }

    if (summaryElements.total) {
      summaryElements.total.textContent = `${total.toLocaleString()} Rwf`;
    }

    // Enable/disable confirm button based on validation
    const confirmBtn = document.getElementById('confirmBooking');
    if (confirmBtn) {
      const hasBasicInfo = from && to && date && time && agent && plate;
      const hasSeatsSelected = this.selectedSeats.length === passengers;
      confirmBtn.disabled = !(hasBasicInfo && hasSeatsSelected);
    }
  }

  confirmBooking() {
    // Final validation before booking
    if (!this.validateCompleteForm()) {
      this.showNotification('Please correct the form errors before proceeding', 'error');
      return;
    }

    const bookingData = this.collectBookingData();
    
    // Save to localStorage
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));

    this.showBookingConfirmation(bookingData);
    
    // Redirect to payment page after a short delay
    setTimeout(() => {
      window.location.href = 'payment-page.html';
    }, 2000);
  }

  collectBookingData() {
    // Calculate total with premium seat pricing
    let total = 0;
    const pricePerSeat = this.selectedSchedule?.price || 0;
    
    this.selectedSeats.forEach(seatNumber => {
      let seatPrice = pricePerSeat;
      if (this.premiumSeats.includes(seatNumber)) {
        seatPrice += 500;
      }
      total += seatPrice;
    });

    return {
      from: document.getElementById('from')?.value || 'Kigali - Nyabugogo',
      to: document.getElementById('to')?.value,
      agent: document.getElementById('agentInfo')?.value,
      plate: document.getElementById('plateNumber')?.value,
      date: document.getElementById('departDate')?.value,
      time: document.getElementById('departTime')?.value,
      passengers: this.passengerCount,
      seats: this.selectedSeats.sort((a, b) => a - b),
      premiumSeats: this.selectedSeats.filter(seat => this.premiumSeats.includes(seat)),
      fullName: document.getElementById('fullName')?.value,
      email: document.getElementById('email')?.value,
      phone: document.getElementById('phone')?.value,
      idNumber: document.getElementById('idNumber')?.value,
      schedule: this.selectedSchedule,
      basePricePerSeat: pricePerSeat,
      total: total,
      reference: 'EXG' + Date.now().toString().slice(-8),
      timestamp: new Date().toISOString()
    };
  }

  showBookingConfirmation(bookingData) {
    const premiumSeatsText = bookingData.premiumSeats.length > 0 
      ? `\nPremium seats: ${bookingData.premiumSeats.join(', ')} (+500 Rwf each)`
      : '';

    const confirmationMessage = `
      🎉 Booking Confirmed!
      
      📍 Route: ${bookingData.from} → ${bookingData.to}
      🚌 Agent: ${bookingData.agent} (${bookingData.plate})
      📅 Date: ${bookingData.date} at ${bookingData.time}
      🪑 Seats: ${bookingData.seats.join(', ')}${premiumSeatsText}
      💰 Total: ${bookingData.total.toLocaleString()} Rwf
      📧 Email: ${bookingData.email}
      🎫 Reference: ${bookingData.reference}
      
      A confirmation email will be sent to ${bookingData.email}
      
      Redirecting to payment...
    `;

    alert(confirmationMessage);
    this.showNotification('Booking confirmed! Redirecting to payment...', 'success');
  }
}

// Initialize the Booking Manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.bookingManager = new BookingManager();
});