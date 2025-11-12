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

// Generate seats
const seatSelection = document.getElementById('seatSelection');
const totalSeats = 40;
const occupiedSeats = [5, 12, 18, 23, 29, 35]; // Example occupied seats
let selectedSeats = [];

for (let i = 1; i <= totalSeats; i++) {
    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.textContent = i;
    seat.dataset.seat = i;

    if (occupiedSeats.includes(i)) {
    seat.classList.add('occupied');
    } else {
    seat.addEventListener('click', function() {
        const maxPassengers = parseInt(document.getElementById('passengers').value);
        
        if (this.classList.contains('selected')) {
        this.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s !== i);
        } else if (selectedSeats.length < maxPassengers) {
        this.classList.add('selected');
        selectedSeats.push(i);
        } else {
        alert(`You can only select ${maxPassengers} seat(s)`);
        }
        
        updateSummary();
    });
    }

    seatSelection.appendChild(seat);
}

// Form elements
const toSelect = document.getElementById('to');
const routeInfo = document.getElementById('routeInfo');
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
    const date = departDate.value;
    const time = departTime.value;
    const passengers = passengersInput.value;
    const price = toSelect.options[toSelect.selectedIndex].dataset.price || 0;

    document.getElementById('summaryRoute').textContent = 
    (from && to) ? `${from} → ${to}` : '-';
    document.getElementById('summaryDate').textContent = date || '-';
    document.getElementById('summaryTime').textContent = time || '-';
    document.getElementById('summaryPassengers').textContent = passengers;
    document.getElementById('summarySeats').textContent = 
    selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None';
    document.getElementById('summaryPricePerSeat').textContent = `${price} Rwf`;
    
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
