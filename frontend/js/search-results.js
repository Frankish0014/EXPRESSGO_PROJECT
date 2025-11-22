const outboundContainer = document.getElementById('outboundResults');
const inboundContainer = document.getElementById('inboundResults');
const outboundSection = document.getElementById('outboundSection');
const inboundSection = document.getElementById('inboundSection');
const tripTypeLabel = document.getElementById('tripTypeLabel');
const routeLabel = document.getElementById('routeLabel');
const dateLabel = document.getElementById('dateLabel');
const passengerCountEl = document.getElementById('passengerCount');
const outboundDateEl = document.getElementById('outboundDate');
const inboundDateEl = document.getElementById('inboundDate');
const newSearchBtn = document.getElementById('newSearchBtn');

const searchQuery = AppState.getSearchQuery();

const createLoader = () => `
  <div class="loader">
    <span></span><span></span><span></span>
  </div>
`;

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString()} Rwf`;
};

const renderEmptyState = (container, message) => {
  container.innerHTML = `
    <div class="empty-state">
      <h3>No trips found</h3>
      <p>${message}</p>
      <button class="btn-outline" onclick="window.location.href='../index.html#home'">Start a new search</button>
    </div>
  `;
};

const renderErrorState = (container, message) => {
  container.innerHTML = `
    <div class="error-state">
      <h3>Unable to load schedules</h3>
      <p>${message}</p>
      <button class="btn-outline" onclick="window.location.reload()">Try again</button>
    </div>
  `;
};

const getAvailabilityBadge = (availableSeats, totalSeats) => {
  if (availableSeats <= 0) {
    return `<span class="status-badge status-full">Sold out</span>`;
  }

  if (availableSeats <= Math.max(2, Math.round(totalSeats * 0.15))) {
    return `<span class="status-badge status-limited">Few seats left</span>`;
  }

  return `<span class="status-badge status-available">Seats available</span>`;
};

const handleScheduleSelection = (schedule, travelDate, directionLabel) => {
  const payload = {
    scheduleId: schedule.id,
    travelDate,
    passengers: searchQuery.passengers,
    direction: directionLabel,
    schedule,
  };

  AppState.saveSelectedSchedule(payload);
  window.location.href = 'booking-page.html';
};

const renderSchedules = (container, schedules, travelDate, directionLabel) => {
  if (!schedules || schedules.length === 0) {
    renderEmptyState(container, `No trips available for ${directionLabel.toLowerCase()} on ${travelDate}`);
    return;
  }

  container.innerHTML = '';

  schedules.forEach((schedule) => {
    const card = document.createElement('article');
    card.className = 'schedule-card';

    const companyName = schedule?.bus?.company?.name || 'ExpressGo Partner';
    const plateNumber = schedule?.bus?.plate_number || 'N/A';
    const totalSeats = schedule?.bus?.total_seats || 0;
    const availability = schedule?.availability?.total_available ?? null;
    const availableSeats = availability !== null ? availability : '—';
    const badge = availability !== null ? getAvailabilityBadge(availability, totalSeats) : '';
    const disableSelection = availability !== null && availability <= 0;

    card.innerHTML = `
      <div class="times">
        <strong>${schedule.departure_time}</strong>
        <span>Arrives ${schedule.arrival_time}</span>
        <span>${schedule.route?.distance_km || '--'} km • ~${schedule.route?.estimated_duration_minutes || '--'} mins</span>
      </div>
      <div class="operator">
        <div class="company">${companyName}</div>
        <div class="meta">Plate: ${plateNumber}</div>
        <div class="meta">Bus type: ${schedule?.bus?.bus_type || 'Standard'}</div>
      </div>
      <div>
        <div class="price">${formatCurrency(schedule.price)}</div>
        <div class="meta">${availableSeats === '—' ? 'Seats info pending' : `${availableSeats} seats left`}</div>
        ${badge}
      </div>
      <div>
        <button class="btn-select" ${disableSelection ? 'disabled' : ''}>
          Select
        </button>
      </div>
    `;

    const selectBtn = card.querySelector('button');
    selectBtn.addEventListener('click', () => handleScheduleSelection(schedule, travelDate, directionLabel));

    container.appendChild(card);
  });
};

const fetchSchedules = async (from, to, travelDate) => {
  if (!from || !to || !travelDate) {
    return [];
  }

  const params = new URLSearchParams({
    departure: from,
    arrival: to,
    travel_date: travelDate,
  });

  const data = await ApiClient.get(`/schedules/search?${params.toString()}`);
  return data?.schedules || [];
};

const populateSummary = () => {
  if (!searchQuery) {
    tripTypeLabel.textContent = 'No search in progress';
    routeLabel.textContent = 'Start a new search to see available trips';
    dateLabel.textContent = '';
    passengerCountEl.textContent = '—';
    return;
  }

  tripTypeLabel.textContent = searchQuery.type === 'round' ? 'Round Trip' : 'One Way';
  routeLabel.textContent = `${searchQuery.from} → ${searchQuery.to}`;
  passengerCountEl.textContent = searchQuery.passengers;
  dateLabel.textContent = searchQuery.type === 'round'
    ? `Depart ${searchQuery.departDate} • Return ${searchQuery.returnDate}`
    : `Travel date: ${searchQuery.departDate}`;

  outboundDateEl.textContent = searchQuery.departDate;

  if (searchQuery.type === 'round') {
    inboundDateEl.textContent = searchQuery.returnDate;
    inboundSection.style.display = 'block';
  } else {
    inboundSection.style.display = 'none';
  }
};

const initialize = async () => {
  if (!searchQuery) {
    renderEmptyState(outboundContainer, 'We could not find your last search. Please start over.');
    return;
  }

  populateSummary();

  outboundContainer.innerHTML = createLoader();
  try {
    const outboundSchedules = await fetchSchedules(searchQuery.from, searchQuery.to, searchQuery.departDate);
    renderSchedules(outboundContainer, outboundSchedules, searchQuery.departDate, 'Outbound');
  } catch (error) {
    console.error(error);
    renderErrorState(outboundContainer, error.message);
  }

  if (searchQuery.type === 'round') {
    inboundContainer.innerHTML = createLoader();
    try {
      const inboundSchedules = await fetchSchedules(searchQuery.to, searchQuery.from, searchQuery.returnDate);
      renderSchedules(inboundContainer, inboundSchedules, searchQuery.returnDate, 'Return');
    } catch (error) {
      console.error(error);
      renderErrorState(inboundContainer, error.message);
    }
  }
};

if (newSearchBtn) {
  newSearchBtn.addEventListener('click', () => {
    AppState.clearSelectedSchedule();
    AppState.clearSearchQuery();
    window.location.href = '../index.html#home';
  });
}

initialize();

