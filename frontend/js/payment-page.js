// GET BOOKING DATA FROM LOCALSTORAGE
const bookingData = JSON.parse(localStorage.getItem('currentBooking'));

// Check if booking data exists
if (!bookingData) {
    alert('No booking found! Please complete your booking first.');
    window.location.href = 'booking-page.html';
}

// DISPLAY BOOKING SUMMARY ON PAGE LOAD
if (bookingData) {
    // Display in summary section (if you have these elements on your page)
    if (document.getElementById('summaryRoute')) {
        document.getElementById('summaryRoute').textContent = `${bookingData.from} → ${bookingData.to}`;
    }
    if (document.getElementById('summaryAgent')) {
        document.getElementById('summaryAgent').textContent = bookingData.agent;
    }
    if (document.getElementById('summaryPlate')) {
        document.getElementById('summaryPlate').textContent = bookingData.plate;
    }
    if (document.getElementById('summaryDate')) {
        document.getElementById('summaryDate').textContent = bookingData.date;
    }
    if (document.getElementById('summaryTime')) {
        document.getElementById('summaryTime').textContent = bookingData.time;
    }
    if (document.getElementById('summaryPassengers')) {
        document.getElementById('summaryPassengers').textContent = bookingData.passengers;
    }
    if (document.getElementById('summarySeats')) {
        document.getElementById('summarySeats').textContent = bookingData.seats.join(', ');
    }
    if (document.getElementById('summaryTotal')) {
        document.getElementById('summaryTotal').textContent = `${bookingData.total.toLocaleString()} Rwf`;
    }
}

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
    // if (!selectedPaymentMethod){
    //     alert('Please select a payment method first!');
    //     return;
    // }
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
    const qrContainer = document.querySelector('.qr-code');
    if (!qrContainer) {
        console.warn('QR container not found');
        return;
    }

    const payload = `EXPRESSGO|REF:${reference}|AGENT:${bookingData?.agent || 'UNKNOWN'}|DATE:${bookingData?.date || ''}|TIME:${bookingData?.time || ''}`;

    if (typeof QRious !== 'function') {
        qrContainer.innerHTML = `
            <div style="font-size: 0.75rem; padding: 0.75rem; text-align: center;">
                <div style="font-weight: bold; margin-bottom: 0.4rem;">${reference}</div>
                <div style="color: #c0392b;">QR unavailable</div>
            </div>
        `;
        return;
    }

    if (!qrCodeInstance) {
        const canvas = document.createElement('canvas');
        canvas.id = 'ticketQrCanvas';
        qrContainer.innerHTML = '';
        qrContainer.appendChild(canvas);

        qrCodeInstance = new QRious({
            element: canvas,
            value: payload,
            size: 140,
            background: '#ffffff',
            foreground: '#2c3e50',
            level: 'H',
            padding: 10
        });
    } else {
        qrCodeInstance.set({ value: payload });
    }
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

        const fileName = `ExpressGo-Ticket-${bookingData?.reference || 'booking'}.pdf`;
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