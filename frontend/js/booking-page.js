const scheduleBanner = document.getElementById('scheduleBanner');
const scheduleBannerContent = document.getElementById('scheduleBannerContent');
const bookingFormError = document.getElementById('bookingFormError');
const seatSelection = document.getElementById('seatSelection');
const confirmBtn = document.getElementById('confirmBooking');
const routeInfo = document.getElementById('routeInfo');

const formFields = {
  from: document.getElementById('from'),
  to: document.getElementById('to'),
  agentInfo: document.getElementById('agentInfo'),
  plateNumber: document.getElementById('plateNumber'),
  departDate: document.getElementById('departDate'),
  departTime: document.getElementById('departTime'),
  passengers: document.getElementById('passengers'),
  fullName: document.getElementById('fullName'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  idNumber: document.getElementById('idNumber'),
};

const summaryFields = {
  route: document.getElementById('summaryRoute'),
  agents: document.getElementById('summaryAgents'),
  date: document.getElementById('summaryDate'),
  time: document.getElementById('summaryTime'),
  passengers: document.getElementById('summaryPassengers'),
  seats: document.getElementById('summarySeats'),
  pricePerSeat: document.getElementById('summaryPricePerSeat'),
  total: document.getElementById('summaryTotal'),
};

const routeInfoFields = {
  distance: document.getElementById('distance'),
  duration: document.getElementById('duration'),
  price: document.getElementById('pricePerSeat'),
};

const selectedSchedule = AppState.getSelectedSchedule();
const searchQuery = AppState.getSearchQuery();
const userProfile = ApiClient.getUser();

let availableSeats = [];
let totalSeats = 0;
let selectedSeats = [];

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString()} Rwf`;
};

const showAlert = (message, variant = 'error') => {
  if (!bookingFormError) return;
  bookingFormError.textContent = message;
  bookingFormError.classList.add('show');
  bookingFormError.classList.toggle('success', variant === 'success');
};

const clearAlert = () => {
  bookingFormError.textContent = '';
  bookingFormError.classList.remove('show', 'success');
};

const disableForm = (isDisabled) => {
  Object.values(formFields).forEach((field) => {
    field.disabled = isDisabled;
  });
  confirmBtn.disabled = isDisabled;
};

const ensureOptionExists = (select, value, label) => {
  const existing = Array.from(select.options).find((opt) => opt.value === value);
  if (!existing) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label || value;
    select.appendChild(option);
  }
  select.value = value;
};

const populateFormFromSelection = () => {
  if (!selectedSchedule || !selectedSchedule.schedule) {
    // Show search section, hide booking form
    const searchSection = document.getElementById('searchSection');
    const bookingContainer = document.getElementById('bookingContainer');
    if (searchSection) searchSection.style.display = 'block';
    if (bookingContainer) bookingContainer.style.display = 'none';
    return false;
  }
  
  // Show booking form, hide search section
  const searchSection = document.getElementById('searchSection');
  const bookingContainer = document.getElementById('bookingContainer');
  if (searchSection) searchSection.style.display = 'none';
  if (bookingContainer) bookingContainer.style.display = 'flex';

  const scheduleData = selectedSchedule.schedule;
  const route = scheduleData.route || {};

  scheduleBannerContent.textContent = `${route.departure_city || 'Departure'} → ${route.arrival_city || 'Arrival'} • ${scheduleData.departure_time} (${selectedSchedule.travelDate})`;

  ensureOptionExists(formFields.from, route.departure_city || 'Kigali', route.departure_city || 'Kigali');
  ensureOptionExists(formFields.to, route.arrival_city || 'Destination', route.arrival_city || 'Destination');
  formFields.to.dispatchEvent(new Event('change'));

  formFields.departDate.value = selectedSchedule.travelDate;
  ensureOptionExists(formFields.departTime, scheduleData.departure_time, `${scheduleData.departure_time}`);
  formFields.departTime.value = scheduleData.departure_time;

  formFields.passengers.value = searchQuery?.passengers || 1;
  formFields.passengers.disabled = true;

  const companyName = scheduleData?.bus?.company?.name || 'ExpressGo Partner';
  formFields.agentInfo.innerHTML = `<option value="${companyName}">${companyName}</option>`;
  formFields.agentInfo.value = companyName;
  formFields.agentInfo.disabled = true;

  const plate = scheduleData?.bus?.plate_number || 'N/A';
  formFields.plateNumber.innerHTML = `<option value="${plate}">${plate}</option>`;
  formFields.plateNumber.value = plate;
  formFields.plateNumber.disabled = true;

  if (userProfile) {
    formFields.fullName.value = userProfile.full_name || '';
    formFields.email.value = userProfile.email || '';
    formFields.phone.value = userProfile.phone_number || '';
  }

  if (route.distance_km) {
    routeInfoFields.distance.textContent = `${route.distance_km} km`;
  }
  if (route.estimated_duration_minutes) {
    routeInfoFields.duration.textContent = `${route.estimated_duration_minutes} mins`;
  }
  routeInfoFields.price.textContent = formatCurrency(scheduleData.price);
  if (routeInfo) {
    routeInfo.classList.add('show');
  }

  return true;
};

const updateSummary = () => {
  const scheduleData = selectedSchedule?.schedule;
  const passengersTarget = parseInt(formFields.passengers.value, 10) || 1;
  summaryFields.route.textContent = `${formFields.from.value} → ${formFields.to.value}`;
  summaryFields.agents.textContent = `${formFields.agentInfo.value} (${formFields.plateNumber.value})`;
  summaryFields.date.textContent = formFields.departDate.value || '-';
  summaryFields.time.textContent = formFields.departTime.value || '-';
  summaryFields.passengers.textContent = passengersTarget;
  summaryFields.seats.textContent = selectedSeats.length ? selectedSeats.join(', ') : 'Select seats';
  const price = scheduleData ? Number(scheduleData.price) || 0 : 0;
  summaryFields.pricePerSeat.textContent = formatCurrency(price);
  summaryFields.total.textContent = formatCurrency(price * selectedSeats.length);

  confirmBtn.disabled = selectedSeats.length !== passengersTarget;
};

let seatsData = []; // Store seats with status from backend

const renderSeats = () => {
  seatSelection.innerHTML = '';
  if (!totalSeats && !seatsData.length) return;

  // Use seatsData if available (from backend), otherwise fallback to old method
  if (seatsData.length > 0) {
    seatsData.forEach((seatInfo) => {
      const seat = document.createElement('div');
      seat.className = 'seat';
      seat.textContent = seatInfo.seat_number;
      
      if (seatInfo.is_booked || !seatInfo.is_available) {
        seat.classList.add('occupied');
        seat.title = `Seat ${seatInfo.seat_number} - Booked`;
      } else {
        seat.classList.add('available');
        seat.title = `Seat ${seatInfo.seat_number} - Available`;
      }

      if (selectedSeats.includes(seatInfo.seat_number)) {
        seat.classList.add('selected');
        seat.classList.remove('available');
      }

      seat.addEventListener('click', () => {
        if (seatInfo.is_booked || !seatInfo.is_available) return;
        const passengerTarget = parseInt(formFields.passengers.value, 10) || 1;

        if (selectedSeats.includes(seatInfo.seat_number)) {
          selectedSeats = selectedSeats.filter((seat) => seat !== seatInfo.seat_number);
        } else {
          if (selectedSeats.length >= passengerTarget) {
            showAlert(`You can select up to ${passengerTarget} seat(s) for this booking.`);
            return;
          }
          selectedSeats.push(seatInfo.seat_number);
        }
        clearAlert();
        renderSeats();
        updateSummary();
      });

      seatSelection.appendChild(seat);
    });
  } else {
    // Fallback to old method if seatsData is not available
    const availableSet = new Set(availableSeats);
    for (let seatNumber = 1; seatNumber <= totalSeats; seatNumber++) {
      const seat = document.createElement('div');
      seat.className = 'seat';
      seat.textContent = seatNumber;
      const isAvailable = availableSet.has(seatNumber);

      if (!isAvailable) {
        seat.classList.add('occupied');
        seat.title = `Seat ${seatNumber} - Booked`;
      } else {
        seat.classList.add('available');
        seat.title = `Seat ${seatNumber} - Available`;
      }

      if (selectedSeats.includes(seatNumber)) {
        seat.classList.add('selected');
        seat.classList.remove('available');
      }

      seat.addEventListener('click', () => {
        if (!isAvailable) return;
        const passengerTarget = parseInt(formFields.passengers.value, 10) || 1;

        if (selectedSeats.includes(seatNumber)) {
          selectedSeats = selectedSeats.filter((seat) => seat !== seatNumber);
        } else {
          if (selectedSeats.length >= passengerTarget) {
            showAlert(`You can select up to ${passengerTarget} seat(s) for this booking.`);
            return;
          }
          selectedSeats.push(seatNumber);
        }
        clearAlert();
        renderSeats();
        updateSummary();
      });

      seatSelection.appendChild(seat);
    }
  }
};

const fetchAvailableSeats = async () => {
  if (!selectedSchedule) return;
  const params = new URLSearchParams({
    travel_date: selectedSchedule.travelDate,
  });
  const response = await ApiClient.get(`/schedules/${selectedSchedule.scheduleId}/available-seats?${params.toString()}`);
  
  // Use total_seats from response, fallback to schedule data
  totalSeats = response?.total_seats || selectedSchedule.schedule?.bus?.total_seats || 0;
  availableSeats = response?.available_seats || [];
  seatsData = response?.seats || []; // Store seats with status
  
  if (!availableSeats.length && totalSeats > 0) {
    showAlert('This departure is fully booked. Please go back and select a different schedule.');
  }
  
  renderSeats();
  updateSummary();
};

const validatePassengerInfo = () => {
  if (!formFields.fullName.value.trim() || !formFields.email.value.trim() ||
      !formFields.phone.value.trim() || !formFields.idNumber.value.trim()) {
    showAlert('Please fill in passenger contact details to continue.');
    return false;
  }
  clearAlert();
  return true;
};

const setConfirmLoading = (isLoading) => {
  if (isLoading) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';
  } else {
    confirmBtn.textContent = 'Confirm & Continue';
    updateSummary();
  }
};

const handleBooking = async () => {
  if (!selectedSchedule) {
    showAlert('Select a schedule before confirming.');
    return;
  }

  if (!validatePassengerInfo()) {
    return;
  }

  if (!AppState.requireAuth(window.location.href)) {
    return;
  }

  setConfirmLoading(true);

  try {
    const passengersTarget = parseInt(formFields.passengers.value, 10) || 1;

    if (selectedSeats.length !== passengersTarget) {
      showAlert(`Please select ${passengersTarget} seat(s) to continue.`);
      setConfirmLoading(false);
      return;
    }

    const bookings = [];
    for (const seat of selectedSeats) {
      const payload = {
        schedule_id: selectedSchedule.scheduleId,
        travel_date: selectedSchedule.travelDate,
        seat_number: seat,
      };

      const response = await ApiClient.post('/bookings', payload, true);
      bookings.push(response.booking);
    }

    AppState.saveBookingCheckout({
      bookings,
      schedule: selectedSchedule,
      seats: selectedSeats,
      passenger: {
        fullName: formFields.fullName.value.trim(),
        email: formFields.email.value.trim(),
        phone: formFields.phone.value.trim(),
        idNumber: formFields.idNumber.value.trim(),
      },
      total: summaryFields.total.textContent,
    });

    AppState.clearSelectedSchedule();
    window.location.href = 'payment-page.html';
  } catch (error) {
    console.error(error);
    showAlert(error.message || 'Failed to create booking. Please try again.');
  } finally {
    setConfirmLoading(false);
  }
};

// Search form handling
const bookingSearchForm = document.getElementById('bookingSearchForm');
const searchFormError = document.getElementById('searchFormError');
const searchTripsBtn = document.getElementById('searchTripsBtn');

const validateSearchForm = () => {
  const from = document.getElementById('searchFrom').value.trim();
  const to = document.getElementById('searchTo').value.trim();
  const departDate = document.getElementById('searchDepartDate').value;
  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const returnDate = document.getElementById('searchReturnDate').value;
  const passengers = parseInt(document.getElementById('searchPassengers').value, 10) || 1;

  if (searchFormError) {
    searchFormError.textContent = '';
    searchFormError.classList.remove('show');
  }

  if (!from) {
    showSearchError('Please enter departure city');
    return false;
  }

  if (!to) {
    showSearchError('Please enter destination city');
    return false;
  }

  if (from.toLowerCase() === to.toLowerCase()) {
    showSearchError('Departure and destination must be different');
    return false;
  }

  if (!departDate) {
    showSearchError('Please select departure date');
    return false;
  }

  const selectedDate = new Date(departDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    showSearchError('Departure date cannot be in the past');
    return false;
  }

  if (tripType === 'round' && !returnDate) {
    showSearchError('Please select return date for round trip');
    return false;
  }

  if (tripType === 'round' && returnDate && departDate && returnDate < departDate) {
    showSearchError('Return date must be after departure date');
    return false;
  }

  if (passengers < 1 || passengers > 10) {
    showSearchError('Please enter a valid number of passengers (1-10)');
    return false;
  }

  return true;
};

const showSearchError = (message) => {
  if (searchFormError) {
    searchFormError.textContent = message;
    searchFormError.classList.add('show');
  }
};

const setSearchLoading = (isLoading) => {
  if (searchTripsBtn) {
    searchTripsBtn.disabled = isLoading;
    const btnText = searchTripsBtn.querySelector('.btn-text');
    const btnLoader = searchTripsBtn.querySelector('.btn-loader');
    if (btnText) btnText.classList.toggle('hidden', isLoading);
    if (btnLoader) btnLoader.classList.toggle('hidden', !isLoading);
  }
};

const handleSearchSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateSearchForm()) {
    return;
  }

  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const formData = new FormData(bookingSearchForm);

  const payload = {
    type: tripType,
    from: formData.get('from').trim(),
    to: formData.get('to').trim(),
    passengers: parseInt(formData.get('passengers'), 10) || 1,
    departDate: formData.get('departDate'),
    returnDate: formData.get('returnDate') || null,
  };

  if (tripType === 'multi') {
    showSearchError('Multi-city booking is not yet available. Please select One Way or Round Trip.');
    return;
  }

  setSearchLoading(true);
  AppState.saveSearchQuery(payload);
  AppState.clearSelectedSchedule();

  setTimeout(() => {
    window.location.href = 'search-results.html';
    setSearchLoading(false);
  }, 300);
};

// Handle trip type change for return date visibility
const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
tripTypeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    const returnDateField = document.querySelector('.return-date-search');
    if (returnDateField) {
      returnDateField.classList.toggle('hidden', e.target.value !== 'round');
    }
  });
});

// Set minimum date for date inputs
const setMinDate = () => {
  const today = new Date().toISOString().split('T')[0];
  const departDateInput = document.getElementById('searchDepartDate');
  const returnDateInput = document.getElementById('searchReturnDate');
  
  if (departDateInput) {
    departDateInput.setAttribute('min', today);
  }
  if (returnDateInput) {
    returnDateInput.setAttribute('min', today);
  }
};

// Update return date min when departure date changes
const searchDepartDateInput = document.getElementById('searchDepartDate');
if (searchDepartDateInput) {
  searchDepartDateInput.addEventListener('change', (e) => {
    const returnDateInput = document.getElementById('searchReturnDate');
    if (returnDateInput && !returnDateInput.disabled) {
      returnDateInput.setAttribute('min', e.target.value);
    }
  });
}

// Populate districts datalist for booking page
function populateBookingDistrictsDatalist() {
  const bookingCitiesDatalist = document.getElementById('bookingCities');
  if (bookingCitiesDatalist && window.RWANDAN_DISTRICTS) {
    window.RWANDAN_DISTRICTS.forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      bookingCitiesDatalist.appendChild(option);
    });
  }
}

const initialize = async () => {
  // Set minimum dates
  setMinDate();
  
  // Populate districts datalist
  populateBookingDistrictsDatalist();
  
  // If we have a selected schedule, populate the form
  if (selectedSchedule && selectedSchedule.schedule) {
    if (!populateFormFromSelection()) {
      return;
    }

    if (selectedSchedule?.schedule?.bus?.total_seats) {
      totalSeats = selectedSchedule.schedule.bus.total_seats;
    }

    try {
      await fetchAvailableSeats();
    } catch (error) {
      console.error(error);
      showAlert('Unable to load seat availability. Please refresh the page.');
    }
    updateSummary();
  } else {
    // No selected schedule - show search form
    populateFormFromSelection();
  }
};

if (bookingSearchForm) {
  bookingSearchForm.addEventListener('submit', handleSearchSubmit);
}

confirmBtn.addEventListener('click', handleBooking);
document.addEventListener('DOMContentLoaded', initialize);