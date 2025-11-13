// Route data with distances and durations
const routeData = {
    'Bugesera': { distance: '50 km', duration: '1 hour' },
    'Gatsibo': { distance: '130 km', duration: '2.5 hours' },
    'Kayonza': { distance: '75 km', duration: '1.5 hours' },
    'Kirehe': { distance: '110 km', duration: '2 hours' },
    'Ngoma': { distance: '95 km', duration: '2 hours' },
    'Nyagatare': { distance: '170 km', duration: '3 hours' },
    'Rwamagana': { distance: '45 km', duration: '1 hour' },
    'Burera': { distance: '110 km', duration: '2.5 hours' },
    'Gakenke': { distance: '95 km', duration: '2 hours' },
    'Gicumbi': { distance: '100 km', duration: '2 hours' },
    'Musanze': { distance: '85 km', duration: '2 hours' },
    'Rulindo': { distance: '65 km', duration: '1.5 hours' },
    'Gisagara': { distance: '110 km', duration: '2.5 hours' },
    'Huye': { distance: '135 km', duration: '2.5 hours' },
    'Kamonyi': { distance: '40 km', duration: '1 hour' },
    'Muhanga': { distance: '50 km', duration: '1 hour' },
    'Nyamagabe': { distance: '160 km', duration: '3 hours' },
    'Nyanza': { distance: '85 km', duration: '2 hours' },
    'Nyaruguru': { distance: '180 km', duration: '3.5 hours' },
    'Ruhango': { distance: '60 km', duration: '1.5 hours' },
    'Karongi': { distance: '150 km', duration: '3 hours' },
    'Ngororero': { distance: '120 km', duration: '2.5 hours' },
    'Nyabihu': { distance: '110 km', duration: '2.5 hours' },
    'Nyamasheke': { distance: '210 km', duration: '4 hours' },
    'Rubavu': { distance: '155 km', duration: '3 hours' },
    'Rusizi': { distance: '240 km', duration: '5 hours' },
    'Rutsiro': { distance: '140 km', duration: '3 hours' }
};

// Get HTML elements
const agentSelect = document.getElementById('agentInfo');
const seatSelection = document.getElementById('seatSelection');

let selectedSeats = [];
let occupiedSeats = [5, 12, 18, 23]; // Example occupied seats

// Define number of seats for each agent
const agentSeatConfig = {
  RITCO: 70,
  VOLCANO: 28,
  EXPRESS: 28,
  EXCELL: 28,
  MATUNDA: 28,
  OMEGA: 28,
  OTHERS: 28
};

// Function to generate seats
function generateSeats(totalSeats) {
  seatSelection.innerHTML = ''; // Clear previous seats
  for (let i = 1; i <= totalSeats; i++) {
    const seat = document.createElement('div');
    seat.classList.add('seat');

    if (occupiedSeats.includes(i)) {
      seat.classList.add('occupied');
    }

    seat.textContent = i;

    // Seat selection logic
    seat.addEventListener('click', () => {
      if (!seat.classList.contains('occupied')) {
        seat.classList.toggle('selected');
        if (seat.classList.contains('selected')) {
          selectedSeats.push(i);
        } else {
          selectedSeats = selectedSeats.filter(s => s !== i);
        }
        updateSummary();
      }
    });

    seatSelection.appendChild(seat);
  }
}

// When user selects an agent
agentSelect.addEventListener('change', (e) => {
  const agent = e.target.value;
  const totalSeats = agentSeatConfig[agent] || 28; // Default to 28 if not found
  generateSeats(totalSeats);
});

// Optional: generate default seats on page load
generateSeats(28);


const agentCars = {
  ritco: {
    "RAB 001 D": 70,
    "RAC 002 F" : 70,
    "RAF 444 G" : 70,
    "RAB 244 D": 70,
    "RAC 522 F" : 70,
    "RAF 545 G" : 70
  },
  "volcano": {
    "RAC 101 F": 28,
    "RAE 102 G": 28,
    "RAC 445 F": 28,
    "RAE 552 G": 28,
    "RAC 111 F": 28,
    "RAE 133 G": 28,
  },
  "alpha express": {
    "RAH 453 H": 28,
    "RAH 245 F": 28,
    "RAH 443 H": 28,
    "RAH 244 F": 28,
    "RAH 422 H": 28,
    "RAH 244 F": 28
  },
  "matunda express ltd": {
    "RAH 542 G": 28,
    "RAF 928 H": 28,
    "RAH 541 G": 28,
    "RAF 923 H": 28,
    "RAH 541 G": 28,
    "RAF 924 H": 28
  },
  "city express": {
    "RAG 501 H": 28,
    "RAC 402 F": 28,
    "RAG 503 H": 28,
    "RAC 404 F": 28,
    "RAG 506 H": 28,
    "RAC 408 F": 28
  },
  "select express ltd": {
    "RAB 458 G": 28,
    "RAH 998 N":28,
    "RAB 453 G": 28,
    "RAH 992 N":28,
    "RAB 451 G": 28,
    "RAH 997 N":28,
  },
  "yahoo express": {
    "RAF 984 C": 28,
    "RAF 398 H": 28,
    "RAF 761 C": 28,
    "RAF 233 H": 28,
    "RAF 123 C": 28,
    "RAF 311 H": 28
  }
};

// Slecting plate numbers 
const plateSelect = document.getElementById("plateNumber");

agentSelect.addEventListener("change", () => {
  const agent = agentSelect.value.toLowerCase();

  // clear previous plates
  plateSelect.innerHTML = '<option value="">Select plate number</option>';

  if (agentCars[agent]) {
    Object.keys(agentCars[agent]).forEach((plate) => {
      const option = document.createElement("option");
      option.value = plate;
      option.textContent = plate;
      plateSelect.appendChild(option);
    });
  }

  // reset seats when agent changes
  selectedSeats = [];
  seatSelection.innerHTML = "";
  updateSummary();
});


plateSelect.addEventListener("change", () => {
  const agent = agentSelect.value.toLowerCase();
  const plate = plateSelect.value;

  if (agent && plate && agentCars[agent][plate]) {
    const totalSeats = agentCars[agent][plate];
    generateSeats(totalSeats);
    updateSummary();
  }
});



// Form elements
const toSelect = document.getElementById('to');
const routeInfo = document.getElementById('routeInfo');
const agentInfo =  document.getElementById('agentInfo');
const departDate = document.getElementById('departDate');
const departTime = document.getElementById('departTime');
const passengersInput = document.getElementById('passengers');
const confirmBtn = document.getElementById('confirmBooking');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
departDate.setAttribute('min', today);

// Update route info when destination changes
toSelect.addEventListener('change', function() {
    const destination = this.value;
    const price = this.options[this.selectedIndex].dataset.price;
    
    if (destination && routeData[destination]) {
    document.getElementById('distance').textContent = routeData[destination].distance;
    document.getElementById('duration').textContent = routeData[destination].duration;
    document.getElementById('pricePerSeat').textContent = price;
    routeInfo.classList.add('show');
    } else {
    routeInfo.classList.remove('show');
    }
    
    updateSummary();
});

// Update summary when passengers change
passengersInput.addEventListener('change', function() {
    // Reset selected seats
    document.querySelectorAll('.seat.selected').forEach(seat => {
    seat.classList.remove('selected');
    });
    selectedSeats = [];
    updateSummary();
});

// Update summary
function updateSummary() {
    const from = document.getElementById('from').value;
    const to = toSelect.value;
    const agents = agentInfo.value;
    const date = departDate.value;
    const time = departTime.value;
    const passengers = passengersInput.value;
    const price = toSelect.options[toSelect.selectedIndex].dataset.price || 0;
    const plate = plateSelect.value;


    document.getElementById('summaryRoute').textContent = 
    (from && to) ? `${from} → ${to}` : '-';
    document.getElementById('summaryAgents').textContent = agents;
    document.getElementById('summaryDate').textContent = date || '-';
    document.getElementById('summaryTime').textContent = time || '-';
    document.getElementById('summaryPassengers').textContent = passengers;
    document.getElementById('summarySeats').textContent = 
    selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None';
    document.getElementById('summaryPricePerSeat').textContent = `${price} Rwf`;
    document.getElementById('summaryAgents').textContent = agents + (plate ? ` (${plate})` : '');

    
    const total = price * selectedSeats.length;
    document.getElementById('summaryTotal').textContent = `${total.toLocaleString()} Rwf`;

    // Enable/disable confirm button
    confirmBtn.disabled = !(from && to && date && time && selectedSeats.length === parseInt(passengers));
}

departDate.addEventListener('change', updateSummary);
departTime.addEventListener('change', updateSummary);

// Confirm booking
confirmBtn.addEventListener('click', function() {
    const bookingData = {
    from: document.getElementById('from').value,
    to: toSelect.value,
    agents: agentInfo.value,
    date: departDate.value,
    time: departTime.value,
    passengers: passengersInput.value,
    seats: selectedSeats,
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    idNumber: document.getElementById('idNumber').value,
    total: document.getElementById('summaryTotal').textContent
    };

    if (!bookingData.fullName || !bookingData.email || !bookingData.phone || !bookingData.idNumber) {
    alert('Please fill in all passenger information');
    return;
    }

    alert(`Booking Confirmed!\n\nRoute: ${bookingData.from} → ${bookingData.to}\nDate: ${bookingData.date} at ${bookingData.time}\nSeats: ${bookingData.seats.join(', ')}\nTotal: ${bookingData.total}\n\nA confirmation email will be sent to ${bookingData.email}`);
    
    // Here you would send the booking data to your server
    // Example: fetch('/api/bookings', { method: 'POST', body: JSON.stringify(bookingData) })
});
