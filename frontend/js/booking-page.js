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
    showAlert('Please search for a trip on the homepage and select a schedule to continue.');
    disableForm(true);
    return false;
  }

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
  routeInfo.classList.add('show');

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

const renderSeats = () => {
  seatSelection.innerHTML = '';
  if (!totalSeats) return;

  const availableSet = new Set(availableSeats);

  for (let seatNumber = 1; seatNumber <= totalSeats; seatNumber++) {
    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.textContent = seatNumber;
    const isAvailable = availableSet.has(seatNumber);

    if (!isAvailable) {
      seat.classList.add('occupied');
    }

    if (selectedSeats.includes(seatNumber)) {
      seat.classList.add('selected');
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
};

const fetchAvailableSeats = async () => {
  if (!selectedSchedule) return;
  const params = new URLSearchParams({
    travel_date: selectedSchedule.travelDate,
  });
  const response = await ApiClient.get(`/schedules/${selectedSchedule.scheduleId}/available-seats?${params.toString()}`);
  totalSeats = selectedSchedule.schedule?.bus?.total_seats || response?.available_seats?.length || 0;
  availableSeats = response?.available_seats || [];
  if (!availableSeats.length) {
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

const initialize = async () => {
  if (!populateFormFromSelection()) {
    disableForm(true);
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
};
    
confirmBtn.addEventListener('click', handleBooking);
document.addEventListener('DOMContentLoaded', initialize);