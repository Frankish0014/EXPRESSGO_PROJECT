let selectedPaymentMethod = null;
let uploadedFile = null;

// Sample booking data (would come from your booking form)
const bookingData = {
    reference: 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    from: 'Kigali - Nyabugogo',
    to: 'Bugesera',
    agent: 'RITCO',
    plate: 'RAD 001 A',
    date: '2025-11-13',
    time: '06:00',
    passengers: 3,
    seats: [1, 2, 7],
    pricePerSeat: 750,
    total: 2250
};

function openPaymentModal() {
    document.getElementById('paymentModal').classList.add('show');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('show');
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Remove selected class from all methods
    document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('selected');
    });
    
    // Add selected class to clicked method
    event.currentTarget.classList.add('selected');
    
    // Hide all payment details
    document.querySelectorAll('.payment-details').forEach(el => {
    el.classList.remove('show');
    });
    
    // Show selected payment details
    if (method === 'momo') {
    document.getElementById('momoDetails').classList.add('show');
    } else if (method === 'bank') {
    document.getElementById('bankDetails').classList.add('show');
    } else if (method === 'card') {
    document.getElementById('cardDetails').classList.add('show');
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
    uploadedFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('previewImage');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // Update upload area
    document.getElementById('uploadArea').classList.add('has-file');
    document.getElementById('uploadArea').innerHTML = `
        <div class="upload-icon">✅</div>
        <p style="color: #27ae60; font-weight: 600;">Payment proof uploaded!</p>
        <p style="color: #7f8c8d; font-size: 0.85rem; margin-top: 0.5rem;">Click to change</p>
    `;
    
    // Enable confirm button
    document.getElementById('confirmPaymentBtn').disabled = false;
    }
}

function processPayment() {
    // In real application, this would upload the screenshot and create booking
    // For demo, we'll just show the ticket
    
    closePaymentModal();
    
    // Populate ticket with booking data
    document.getElementById('bookingRef').textContent = bookingData.reference;
    document.getElementById('ticketFrom').textContent = bookingData.from.split(' - ')[1] || bookingData.from;
    document.getElementById('ticketTo').textContent = bookingData.to;
    document.getElementById('ticketAgent').textContent = bookingData.agent;
    document.getElementById('ticketPlate').textContent = bookingData.plate;
    document.getElementById('ticketDate').textContent = bookingData.date;
    
    const hour = parseInt(bookingData.time.split(':')[0]);
    document.getElementById('ticketTime').textContent = hour < 12 ? `${bookingData.time} AM` : `${bookingData.time} PM`;
    
    document.getElementById('ticketPassengers').textContent = bookingData.passengers;
    document.getElementById('ticketSeats').textContent = bookingData.seats.join(', ');
    document.getElementById('ticketTotal').textContent = `${bookingData.total.toLocaleString()} Rwf`;
    
    // Generate QR code (in real app, this would contain booking reference + payment proof link)
    generateQRCode(bookingData.reference);
    
    // Show ticket
    document.getElementById('ticketContainer').classList.add('show');
    
    // Scroll to ticket
    document.getElementById('ticketContainer').scrollIntoView({ behavior: 'smooth' });
}

function generateQRCode(reference) {
    // In real application, use a QR code library like qrcode.js
    // QR code would contain: booking reference + link to payment screenshot
    const qrData = `EXPRESSGO:${reference}:VERIFIED`;
    
    // For demo, just show the reference
    document.querySelector('.qr-code').innerHTML = `
    <div style="font-size: 0.8rem; padding: 1rem; text-align: center;">
        <div style="font-weight: bold; margin-bottom: 0.5rem;">${reference}</div>
        <div style="font-size: 0.7rem; color: #7f8c8d;">Scan to verify</div>
    </div>
    `;
}

function downloadTicket() {
    alert('In a real application, this would generate and download a PDF ticket with all the details and QR code.');
    // You would use a library like jsPDF to generate the PDF
}