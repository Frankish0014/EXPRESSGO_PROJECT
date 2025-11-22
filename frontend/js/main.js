const bookingForm = document.getElementById('bookingForm');
const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
const returnDateField = document.querySelector('.return-date');
const multiCityContainer = document.getElementById('multiCityContainer');
const addCityBtn = document.getElementById('addCityBtn');
const searchBtn = document.getElementById('searchBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const formError = document.getElementById('formError');

let cityCount = 0;

const setMinDate = () => {
  const today = new Date().toISOString().split('T')[0];
  const departDateInput = document.getElementById('departDate');
  const returnDateInput = document.getElementById('returnDate');
  
  if (departDateInput) {
    departDateInput.setAttribute('min', today);
  }
  if (returnDateInput) {
    returnDateInput.setAttribute('min', today);
  }
};

const validateForm = () => {
  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();
  const departDate = document.getElementById('departDate').value;
  const passengers = document.getElementById('passengers').value;
  
  clearErrors();
  let isValid = true;

  if (!from) {
    showError('fromError', 'Please enter departure city');
    isValid = false;
  }

  if (!to) {
    showError('toError', 'Please enter destination city');
    isValid = false;
  }

  if (from && to && from.toLowerCase() === to.toLowerCase()) {
    showError('toError', 'Departure and destination must be different');
    isValid = false;
  }

  if (!departDate) {
    showError('departDateError', 'Please select departure date');
    isValid = false;
  } else {
    const selectedDate = new Date(departDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showError('departDateError', 'Departure date cannot be in the past');
      isValid = false;
    }
  }

  if (tripType === 'round') {
    const returnDate = document.getElementById('returnDate').value;
    if (!returnDate) {
      showError('returnDateError', 'Please select return date');
      isValid = false;
    } else if (returnDate && departDate && returnDate < departDate) {
      showError('returnDateError', 'Return date must be after departure date');
      isValid = false;
    }
  }

  if (!passengers || passengers < 1 || passengers > 10) {
    showError('passengersError', 'Please enter a valid number of passengers (1-10)');
    isValid = false;
  }

  if (tripType === 'multi') {
    const multiSegments = multiCityContainer.querySelectorAll('.city-segment');
    if (multiSegments.length === 0) {
      showFormError('Please add at least one city segment for multi-city trip');
      isValid = false;
    }
  }

  return isValid;
};

const showError = (errorId, message) => {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
};

const clearErrors = () => {
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.remove('show');
    el.textContent = '';
  });
  hideFormError();
};

const showFormError = (message) => {
  if (formError) {
    formError.textContent = message;
    formError.classList.add('show');
  }
};

const hideFormError = () => {
  if (formError) {
    formError.classList.remove('show');
    formError.textContent = '';
  }
};

const setLoading = (isLoading) => {
  if (isLoading) {
    searchBtn.disabled = true;
    if (btnText) btnText.classList.add('hidden');
    if (btnLoader) btnLoader.classList.add('show');
  } else {
    searchBtn.disabled = false;
    if (btnText) btnText.classList.remove('hidden');
    if (btnLoader) btnLoader.classList.remove('show');
  }
};

const handleFormSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const formData = new FormData(bookingForm);

  const payload = {
    type: tripType,
    from: formData.get('from').trim(),
    to: formData.get('to').trim(),
    passengers: parseInt(formData.get('passengers'), 10) || 1,
    departDate: formData.get('departDate'),
    returnDate: formData.get('returnDate') || null,
  };

  if (tripType === 'multi') {
    showFormError('Multi-city booking is not yet available. Please select One Way or Round Trip.');
    return;
  }

  setLoading(true);
  hideFormError();
  AppState.saveSearchQuery(payload);
  AppState.clearSelectedSchedule();

  setTimeout(() => {
    window.location.href = './src/search-results.html';
    setLoading(false);
  }, 300);
};

tripTypeRadios.forEach(radio => {
  radio.addEventListener('change', e => {
    const type = e.target.value;

    returnDateField.classList.toggle('hidden', type !== 'round');
    multiCityContainer.classList.toggle('hidden', type !== 'multi');
    addCityBtn.classList.toggle('hidden', type !== 'multi');

    if (type !== 'multi') {
      multiCityContainer.innerHTML = '';
      cityCount = 0;
    }
    
    clearErrors();
  });
});

addCityBtn.addEventListener('click', () => {
  if (cityCount >= 3) {
    showFormError('Maximum 3 cities allowed.');
    return;
  }
  cityCount++;

  const div = document.createElement('div');
  div.className = 'city-segment';
  div.innerHTML = `
    <div class="form-group">
      <label for="multiFrom${cityCount}">From</label>
      <input type="text" id="multiFrom${cityCount}" placeholder="City ${cityCount} Start" name="multiFrom${cityCount}" list="cities" />
    </div>
    <div class="form-group">
      <label for="multiTo${cityCount}">To</label>
      <input type="text" id="multiTo${cityCount}" placeholder="City ${cityCount} Destination" name="multiTo${cityCount}" list="cities" />
    </div>
    <div class="form-group">
      <label for="multiDate${cityCount}">Date</label>
      <input type="date" id="multiDate${cityCount}" name="multiDate${cityCount}" />
    </div>
  `;
  multiCityContainer.appendChild(div);
  
  const dateInput = div.querySelector(`#multiDate${cityCount}`);
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
  e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.querySelectorAll('.nav-content a').forEach(link => {
        link.classList.remove('active');
      });
      this.classList.add('active');
    }
  });
});

bookingForm.addEventListener('submit', handleFormSubmit);

document.getElementById('departDate').addEventListener('change', (e) => {
  const returnDateInput = document.getElementById('returnDate');
  if (returnDateInput && !returnDateInput.disabled) {
    returnDateInput.setAttribute('min', e.target.value);
  }
});

setMinDate();

// Load routes dynamically for destinations section
async function loadRoutesForDestinations() {
  try {
    // Fetch both routes and schedules to get accurate pricing
    const [routesResponse, schedulesResponse] = await Promise.all([
      ApiClient.get('/routes'),
      ApiClient.get('/schedules')
    ]);
    
    const routes = routesResponse?.routes || [];
    const schedules = schedulesResponse?.schedules || [];
    
    // Get unique routes (group by departure/arrival) with pricing from schedules
    const routeMap = new Map();
    routes.forEach(route => {
      const key = `${route.departure_city}-${route.arrival_city}`;
      if (!routeMap.has(key)) {
        // Find schedules for this route to get pricing
        const routeSchedules = schedules.filter(s => 
          s.route && 
          s.route.departure_city === route.departure_city && 
          s.route.arrival_city === route.arrival_city &&
          s.is_active
        );
        
        // Get minimum price from active schedules
        const prices = routeSchedules.map(s => parseFloat(s.price || 0)).filter(p => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : null;
        
        // Get time range from schedules
        const times = routeSchedules
          .map(s => {
            if (s.departure_time) {
              const time = s.departure_time.substring(0, 5); // HH:MM
              const [hours, minutes] = time.split(':').map(Number);
              return hours * 60 + minutes; // Convert to minutes for comparison
            }
            return null;
          })
          .filter(t => t !== null);
        
        const minTime = times.length > 0 ? Math.min(...times) : null;
        const maxTime = times.length > 0 ? Math.max(...times) : null;
        
        const formatTime = (minutes) => {
          if (minutes === null) return null;
          const h = Math.floor(minutes / 60);
          const m = minutes % 60;
          const period = h >= 12 ? 'PM' : 'AM';
          const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
          return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
        };
        
        routeMap.set(key, {
          ...route,
          minPrice,
          timeRange: minTime !== null && maxTime !== null 
            ? `${formatTime(minTime)} - ${formatTime(maxTime)}`
            : '6:00 AM - 8:00 PM'
        });
      }
    });
    
    const uniqueRoutes = Array.from(routeMap.values()).slice(0, 8);
    const destinationsGrid = document.querySelector('#destinations .grid-4');
    
    if (!destinationsGrid) return;
    
    // Clear existing cards and create new ones dynamically
    destinationsGrid.innerHTML = '';
    
    // City images mapping (fallback to first available)
    const cityImages = {
      'Rusizi': 'rusizi.jpg',
      'Rubavu': 'rubavu.jpg',
      'Musanze': 'musanze.jpg',
      'Nyagatare': 'nyagatare.jpg',
      'Huye': 'huye.jpg',
      'Karongi': 'karongi.jpg',
      'Rwamagana': 'rwamagana.jpg',
      'Muhanga': 'muhanga.jpg'
    };
    
    uniqueRoutes.forEach((route) => {
      const arrivalCity = route.arrival_city;
      const imageName = cityImages[arrivalCity] || 'rusizi.jpg'; // Default fallback
      const price = route.minPrice 
        ? `${Math.round(route.minPrice).toLocaleString()} Rwf`
        : '2,000 Rwf';
      
      const distance = route.distance_km 
        ? `~${route.distance_km} km`
        : 'N/A';
      
      const duration = route.estimated_duration_minutes
        ? `~${Math.round(route.estimated_duration_minutes / 60 * 10) / 10} hours`
        : 'N/A';
      
      const cardHTML = `
        <div class="destination-card card-3d">
          <div class="card-inner">
            <div class="card-front">
              <div class="card-image-wrapper">
                <img src="images/${imageName}" alt="${arrivalCity}" onerror="this.src='images/rusizi.jpg'" />
                <div class="card-overlay"></div>
              </div>
              <div class="info">
                <h4>${route.departure_city} → ${route.arrival_city}</h4>
                <p class="price">${price}</p>
              </div>
            </div>
            <div class="card-back">
              <div class="card-back-content">
                <h4>${route.departure_city} → ${route.arrival_city}</h4>
                <p class="price">${price}</p>
                <p class="route-info">
                  Distance: ${distance}<br>
                  Duration: ${duration}<br>
                  Daily Departures: ${route.timeRange}
                </p>
                <button class="btn-card" data-route-from="${route.departure_city}" data-route-to="${route.arrival_city}">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      destinationsGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    // Attach event listeners to "Book Now" buttons
    destinationsGrid.querySelectorAll('.btn-card').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const from = button.dataset.routeFrom;
        const to = button.dataset.routeTo;
        
        if (from && to) {
          AppState.saveSearchQuery({
            type: 'oneway',
            from: from,
            to: to,
            departDate: new Date().toISOString().split('T')[0],
            passengers: 1
          });
          window.location.href = './src/search-results.html';
        }
      });
    });
    
    // If no routes found, show a message
    if (uniqueRoutes.length === 0) {
      destinationsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p>No routes available at the moment. Please check back later.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load routes for destinations:', error);
    // Show error message but keep static content as fallback
    const destinationsGrid = document.querySelector('#destinations .grid-4');
    if (destinationsGrid && destinationsGrid.children.length === 0) {
      destinationsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p>Unable to load routes. Please refresh the page or try again later.</p>
        </div>
      `;
    }
  }
}

// Load routes when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadRoutesForDestinations);
} else {
  loadRoutesForDestinations();
}

const contactForm = document.getElementById('contactForm');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');
const contactFormError = document.getElementById('contactFormError');
const contactFormSuccess = document.getElementById('contactFormSuccess');

const validateContactForm = () => {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value.trim();
  
  clearContactErrors();
  let isValid = true;

  if (!name) {
    showError('contactNameError', 'Please enter your name');
    isValid = false;
  }

  if (!email) {
    showError('contactEmailError', 'Please enter your email');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('contactEmailError', 'Please enter a valid email address');
    isValid = false;
  }

  if (!subject) {
    showError('contactSubjectError', 'Please select a subject');
    isValid = false;
  }

  if (!message) {
    showError('contactMessageError', 'Please enter your message');
    isValid = false;
  } else if (message.length < 10) {
    showError('contactMessageError', 'Message must be at least 10 characters long');
    isValid = false;
  }

  return isValid;
};

const clearContactErrors = () => {
  document.querySelectorAll('#contactForm .error-message').forEach(el => {
    el.classList.remove('show');
    el.textContent = '';
  });
  hideContactFormError();
  hideContactFormSuccess();
};

const showContactFormError = (message) => {
  if (contactFormError) {
    contactFormError.textContent = message;
    contactFormError.classList.remove('hidden');
    contactFormError.classList.add('show');
  }
};

const hideContactFormError = () => {
  if (contactFormError) {
    contactFormError.classList.remove('show');
    contactFormError.classList.add('hidden');
    contactFormError.textContent = '';
  }
};

const showContactFormSuccess = (message) => {
  if (contactFormSuccess) {
    contactFormSuccess.textContent = message;
    contactFormSuccess.classList.remove('hidden');
    contactFormSuccess.classList.add('show');
  }
};

const hideContactFormSuccess = () => {
  if (contactFormSuccess) {
    contactFormSuccess.classList.remove('show');
    contactFormSuccess.classList.add('hidden');
    contactFormSuccess.textContent = '';
  }
};

const setContactLoading = (isLoading) => {
  if (isLoading) {
    contactSubmitBtn.disabled = true;
    const btnText = contactSubmitBtn.querySelector('.btn-text');
    const btnLoader = contactSubmitBtn.querySelector('.btn-loader');
    if (btnText) btnText.classList.add('hidden');
    if (btnLoader) btnLoader.classList.add('show');
  } else {
    contactSubmitBtn.disabled = false;
    const btnText = contactSubmitBtn.querySelector('.btn-text');
    const btnLoader = contactSubmitBtn.querySelector('.btn-loader');
    if (btnText) btnText.classList.remove('hidden');
    if (btnLoader) btnLoader.classList.remove('show');
  }
};

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateContactForm()) {
      return;
    }

    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    setContactLoading(true);
    hideContactFormError();
    hideContactFormSuccess();

    try {
      // Submit to backend (for now, we'll use a simple approach)
      // In production, you'd have a /api/contact endpoint
      console.log('Contact form submission:', data);
      
      // Simulate API call - replace with actual endpoint when available
      // await ApiClient.post('/contact', data);
      
      showContactFormSuccess('Thank you for contacting us! We will get back to you soon.');
      contactForm.reset();
      
      setTimeout(() => {
        hideContactFormSuccess();
      }, 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      showContactFormError('Failed to send message. Please try again later.');
    } finally {
      setContactLoading(false);
    }
  });
}
