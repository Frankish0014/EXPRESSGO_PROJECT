// Password strength checker
const passwordInput = document.getElementById('password');
const strengthBar = document.getElementById('passwordStrengthBar');

passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    strengthBar.className = 'password-strength-bar';
    if (strength <= 1) {
    strengthBar.classList.add('weak');
    } else if (strength <= 3) {
    strengthBar.classList.add('medium');
    } else {
    strengthBar.classList.add('strong');
    }
});

// Form validation
const form = document.getElementById('registerForm');
const emailInput = document.getElementById('email');
const confirmPasswordInput = document.getElementById('confirmPassword');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
    emailError.classList.add('show');
    isValid = false;
    } else {
    emailError.classList.remove('show');
    }

    // Password match validation
    if (passwordInput.value !== confirmPasswordInput.value) {
    passwordError.classList.add('show');
    isValid = false;
    } else {
    passwordError.classList.remove('show');
    }

    if (isValid) {
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: emailInput.value,
        phone: document.getElementById('phone').value,
        password: passwordInput.value
    };

    alert('Registration successful!\n\nWelcome to ExpressGo, ' + formData.firstName + '!');
    // Here you would typically send the data to your server
    // Example: fetch('/api/register', { method: 'POST', body: JSON.stringify(formData) })
    }
});

// Real-time password match validation
confirmPasswordInput.addEventListener('input', function() {
    if (this.value && passwordInput.value !== this.value) {
    passwordError.classList.add('show');
    } else {
    passwordError.classList.remove('show');
    }
});