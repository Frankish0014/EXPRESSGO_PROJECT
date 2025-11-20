const bookingContext = AppState.getBookingCheckout();

if (!bookingContext) {
    alert('No confirmed booking found. Please complete a booking first.');
    window.location.href = 'booking-page.html';
}

const bookingsList = bookingContext?.bookings || [];
const firstBooking = bookingsList[0];
const scheduleData = bookingContext?.schedule?.schedule || {};
const routeData = scheduleData.route || {};
const seats = bookingContext?.seats || [];
const passengersCount = seats.length || bookingContext?.schedule?.passengers || 1;
const totalAmountText = bookingContext.total || `${(Number(scheduleData.price) || 0) * passengersCount} Rwf`;

const setIfExists = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
        el.textContent = value;
    }
};

setIfExists('summaryRoute', `${routeData.departure_city || 'Departure'} → ${routeData.arrival_city || 'Arrival'}`);
setIfExists('summaryAgent', scheduleData?.bus?.company?.name || 'ExpressGo');
setIfExists('summaryPlate', scheduleData?.bus?.plate_number || 'N/A');
setIfExists('summaryDate', bookingContext?.schedule?.travelDate || '');
setIfExists('summaryTime', scheduleData?.departure_time || '');
setIfExists('summaryPassengers', passengersCount);
setIfExists('summarySeats', seats.join(', '));
setIfExists('summaryTotal', totalAmountText);
setIfExists('momoPaymentAmount', totalAmountText);
setIfExists('bankPaymentAmount', totalAmountText);

let selectedPaymentMethod = null;
let uploadedFile = null;
let qrCodeInstance = null;

const pdfLibrarySources = {
    html2canvas: [
        'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    ],
    jspdf: [
        'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    ]
};

let pdfLibrariesLoaded = false;
let pdfLibraryLoadingPromise = null;

function isLibraryReady(key) {
    if (key === 'html2canvas') {
        return typeof window.html2canvas === 'function';
    }
    if (key === 'jspdf') {
        return Boolean(window.jspdf && typeof window.jspdf.jsPDF === 'function');
    }
    return false;
}

function loadScript(src, dataLib) {
    return new Promise((resolve, reject) => {
        let script = document.querySelector(`script[data-lib="${dataLib}"][src="${src}"]`);

        if (script && (script.dataset.loaded === 'true' || isLibraryReady(dataLib))) {
            script.dataset.loaded = 'true';
            resolve();
            return;
        }

        if (!script) {
            script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.lib = dataLib;
            document.head.appendChild(script);
        }

        const handleLoad = () => {
            script.dataset.loaded = 'true';
            resolve();
        };

        if (isLibraryReady(dataLib)) {
            handleLoad();
            return;
        }

        script.addEventListener('load', handleLoad, { once: true });
        script.onerror = () => {
            script.remove();
            reject(new Error(`Failed to load ${src}`));
        };
    });
}

async function ensurePdfLibraries() {
    if (pdfLibrariesLoaded && typeof window.html2canvas === 'function' && window.jspdf?.jsPDF) {
        return true;
    }

    if (pdfLibraryLoadingPromise) {
        return pdfLibraryLoadingPromise;
    }

    pdfLibraryLoadingPromise = (async () => {
        const loadWithFallback = async (key) => {
            for (const url of pdfLibrarySources[key]) {
                try {
                    await loadScript(url, key);
                    if (key === 'html2canvas' && typeof window.html2canvas === 'function') return;
                    if (key === 'jspdf' && window.jspdf?.jsPDF) return;
                } catch (error) {
                    console.warn(error.message);
                }
            }
            throw new Error(`Unable to load ${key} library`);
        };

        await loadWithFallback('html2canvas');
        await loadWithFallback('jspdf');

        if (typeof window.html2canvas === 'function' && window.jspdf?.jsPDF) {
            pdfLibrariesLoaded = true;
            return true;
        }

        throw new Error('PDF libraries unavailable');
    })().finally(() => {
        pdfLibraryLoadingPromise = null;
    });

    return pdfLibraryLoadingPromise;
}

document.addEventListener('DOMContentLoaded', () => {
    ensurePdfLibraries().catch(error => {
        console.warn('PDF libraries did not preload:', error.message);
    });
});

// Sample booking data (would come from your booking form)

// reading and displaying user booking info!

function openPaymentModal() {
    if (!bookingContext) {
        alert('No booking data available. Please make a booking first.');
        window.location.href = 'booking-page.html';
        return;
    }
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
    if (!bookingContext) {
        alert('No booking data available. Please make a booking first.');
        window.location.href = 'booking-page.html';
        return;
    }
    
    closePaymentModal();
    
    const primaryBooking = firstBooking || bookingsList[0];
    const ticketSeats = seats.join(', ');
    const amountText = totalAmountText;
    const departureTime = scheduleData.departure_time || '';
    const hour = parseInt(departureTime.split(':')[0] || '0', 10);
    const timeSuffix = hour < 12 ? 'AM' : 'PM';

    document.getElementById('bookingRef').textContent = primaryBooking?.booking_code || 'N/A';
    document.getElementById('ticketFrom').textContent = routeData.departure_city || 'Departure';
    document.getElementById('ticketTo').textContent = routeData.arrival_city || 'Arrival';
    document.getElementById('ticketAgent').textContent = scheduleData?.bus?.company?.name || 'ExpressGo';
    document.getElementById('ticketPlate').textContent = scheduleData?.bus?.plate_number || 'N/A';
    document.getElementById('ticketDate').textContent = bookingContext?.schedule?.travelDate || '';
    document.getElementById('ticketTime').textContent = departureTime ? `${departureTime} ${timeSuffix}` : '--';
    document.getElementById('ticketPassengers').textContent = passengersCount;
    document.getElementById('ticketSeats').textContent = ticketSeats || 'Assigned at station';
    document.getElementById('ticketTotal').textContent = amountText;
    
    // Wait a bit to ensure QRious is loaded, then generate QR code
    setTimeout(() => {
      generateQRCode(primaryBooking?.booking_code || 'REF0000');
    }, 200);
    
    AppState.clearBookingCheckout();
    
    // Show ticket
    document.getElementById('ticketContainer').classList.add('show');
    
    // Scroll to ticket
    document.getElementById('ticketContainer').scrollIntoView({ behavior: 'smooth' });
}

function generateQRCode(reference) {
    const qrContainer = document.querySelector('.qr-code');
    if (!qrContainer) {
        console.warn('QR container not found');
        return;
    }

    const payload = `EXPRESSGO|REF:${reference}|AGENT:${scheduleData?.bus?.company?.name || 'UNKNOWN'}|DATE:${bookingContext?.schedule?.travelDate || ''}|TIME:${scheduleData?.departure_time || ''}`;

    // Wait for QRious to be available (with timeout)
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const tryGenerateQR = () => {
        attempts++;
        
        // Check if QRious is available
        if (typeof QRious !== 'undefined' && QRious) {
            try {
                // Clear existing content
                qrContainer.innerHTML = '';
                
                // Remove old canvas if exists
                const oldCanvas = document.getElementById('ticketQrCanvas');
                if (oldCanvas) {
                    oldCanvas.remove();
                }
                
                // Create canvas element
                const canvas = document.createElement('canvas');
                canvas.id = 'ticketQrCanvas';
                canvas.style.display = 'block';
                canvas.style.margin = '0 auto';
                qrContainer.appendChild(canvas);

                // Create new QR code instance
                qrCodeInstance = new QRious({
                    element: canvas,
                    value: payload,
                    size: 140,
                    background: '#ffffff',
                    foreground: '#2c3e50',
                    level: 'H',
                    padding: 10
                });
                
                console.log('QR code generated successfully for:', reference);
            } catch (error) {
                console.error('Error generating QR code:', error);
                qrContainer.innerHTML = `
                    <div style="font-size: 0.75rem; padding: 0.75rem; text-align: center;">
                        <div style="font-weight: bold; margin-bottom: 0.4rem;">${reference}</div>
                        <div style="color: #c0392b;">QR generation failed: ${error.message}</div>
                    </div>
                `;
            }
        } else if (attempts < maxAttempts) {
            // QRious not loaded yet, try again
            setTimeout(tryGenerateQR, 100);
        } else {
            // Timeout - QRious not loaded
            console.warn('QRious library not loaded after timeout');
            qrContainer.innerHTML = `
                <div style="font-size: 0.75rem; padding: 0.75rem; text-align: center;">
                    <div style="font-weight: bold; margin-bottom: 0.4rem;">${reference}</div>
                    <div style="color: #c0392b;">QR unavailable - Library not loaded</div>
                    <div style="font-size: 0.7rem; color: #7f8c8d; margin-top: 0.5rem;">Please refresh the page</div>
                </div>
            `;
        }
    };
    
    // Start trying to generate QR code
    tryGenerateQR();
}

async function downloadTicket() {
    const ticketElement = document.querySelector('.ticket');
    if (!ticketElement) {
        alert('Generate your ticket first before downloading.');
        return;
    }

    const downloadBtn = document.querySelector('.ticket-actions .btn.btn-primary');
    const originalText = downloadBtn ? downloadBtn.textContent : '';
    
    try {
        if (downloadBtn) {
            downloadBtn.textContent = 'Loading PDF tools...';
            downloadBtn.disabled = true;
        }

        await ensurePdfLibraries();

        if (downloadBtn) {
            downloadBtn.textContent = 'Rendering ticket...';
        }

        const canvas = await html2canvas(ticketElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf || {};
        if (typeof jsPDF !== 'function') {
            throw new Error('PDF generator unavailable');
        }

        const pdf = new jsPDF('p', 'pt', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 36;

        let imgWidth = pageWidth - margin * 2;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight > pageHeight - margin * 2) {
            imgHeight = pageHeight - margin * 2;
            imgWidth = (canvas.width * imgHeight) / canvas.height;
        }

        pdf.text('ExpressGo Ticket', margin, margin - 10);
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

        const fileName = `ExpressGo-Ticket-${firstBooking?.booking_code || 'booking'}.pdf`;
        pdf.save(fileName);
        
        alert('Your ticket PDF has been downloaded. Check your downloads folder.');
    } catch (error) {
        console.error('Failed to generate PDF ticket', error);
        alert(error.message.includes('PDF libraries') 
            ? 'Unable to load PDF tools. Please check your internet connection and try again.'
            : 'Something went wrong while generating the PDF. Please try again.');
    } finally {
        if (downloadBtn) {
            downloadBtn.textContent = originalText || '📥 Download Ticket (PDF)';
            downloadBtn.disabled = false;
        }
    }
}