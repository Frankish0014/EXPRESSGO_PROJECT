const bookingForm = document.getElementById('bookingForm');
const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
const returnDateField = document.querySelector('.return-date');
const multiCityContainer = document.getElementById('multiCityContainer');
const addCityBtn = document.getElementById('addCityBtn');

let cityCount = 0;

// Toggle trip type behavior
tripTypeRadios.forEach(radio => {
  radio.addEventListener('change', e => {
    const type = e.target.value;

    // Hide/Show sections
    returnDateField.classList.toggle('hidden', type !== 'round');
    multiCityContainer.classList.toggle('hidden', type !== 'multi');
    addCityBtn.classList.toggle('hidden', type !== 'multi');

    // Reset multi-city fields if not selected
    if (type !== 'multi') {
      multiCityContainer.innerHTML = '';
      cityCount = 0;
    }
  });
});

// Add city for multi-trip
addCityBtn.addEventListener('click', () => {
  if (cityCount >= 3) {
    alert('Maximum 3 cities allowed.');
    return;
  }
  cityCount++;

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
});

// Submit
bookingForm.addEventListener('submit', e => {
  e.preventDefault();
  alert('Searching trips based on selected route type...');
});
