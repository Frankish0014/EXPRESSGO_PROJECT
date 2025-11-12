const API_BASE_URL = 'http://localhost:3000/api';

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

const searchSchedules = async (from, to, date) => {
  try {
    const routesResponse = await fetch(`${API_BASE_URL}/routes`);
    const routesData = await routesResponse.json();
    
    if (!routesResponse.ok) {
      throw new Error(routesData.error || 'Failed to fetch routes');
    }

    const route = routesData.routes.find(r => 
      r.departure_city.toLowerCase() === from.toLowerCase() &&
      r.arrival_city.toLowerCase() === to.toLowerCase()
    );

    if (!route) {
      return { schedules: [], message: 'No route found for this journey' };
    }

    const schedulesResponse = await fetch(`${API_BASE_URL}/schedules/route/${route.id}`);
    const schedulesData = await schedulesResponse.json();
    
    if (!schedulesResponse.ok) {
      throw new Error(schedulesData.error || 'Failed to fetch schedules');
    }

    return schedulesData;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

const handleFormSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const formData = new FormData(bookingForm);
  
  setLoading(true);
  hideFormError();

  try {
    if (tripType === 'oneway') {
      const from = formData.get('from').trim();
      const to = formData.get('to').trim();
      const date = formData.get('departDate');
      const passengers = formData.get('passengers');

      const result = await searchSchedules(from, to, date);
      
      if (result.schedules && result.schedules.length > 0) {
        sessionStorage.setItem('searchResults', JSON.stringify({
          type: 'oneway',
          from,
          to,
          date,
          passengers,
          schedules: result.schedules
        }));
        window.location.href = './src/search-results.html';
      } else {
        showFormError(result.message || 'No schedules found for this route');
      }
    } else if (tripType === 'round') {
      const from = formData.get('from').trim();
      const to = formData.get('to').trim();
      const departDate = formData.get('departDate');
      const returnDate = formData.get('returnDate');
      const passengers = formData.get('passengers');

      const [outbound, inbound] = await Promise.all([
        searchSchedules(from, to, departDate),
        searchSchedules(to, from, returnDate)
      ]);

      if (outbound.schedules && outbound.schedules.length > 0 && 
          inbound.schedules && inbound.schedules.length > 0) {
        sessionStorage.setItem('searchResults', JSON.stringify({
          type: 'round',
          from,
          to,
          departDate,
          returnDate,
          passengers,
          outbound: outbound.schedules,
          inbound: inbound.schedules
        }));
        window.location.href = './src/search-results.html';
      } else {
        showFormError('No schedules found for one or both legs of your journey');
      }
    } else {
      showFormError('Multi-city booking is not yet available. Please select One Way or Round Trip.');
    }
  } catch (error) {
    console.error('Search failed:', error);
    showFormError('Unable to search schedules. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Contact form submission:', data);
      
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
