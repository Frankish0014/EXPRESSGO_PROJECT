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

const form = document.getElementById('registerForm');
const emailInput = document.getElementById('email');
const confirmPasswordInput = document.getElementById('confirmPassword');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const registerMessage = document.getElementById('registerMessage');
const submitBtn = document.getElementById('submitBtn');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const showMessage = (message, isSuccess = false) => {
    if (!registerMessage) return;
    registerMessage.textContent = message;
    registerMessage.classList.add('show');
    registerMessage.classList.toggle('success', isSuccess);
};

const clearMessage = () => {
    registerMessage.textContent = '';
    registerMessage.classList.remove('show', 'success');
};

const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Creating account...' : 'Create Account';
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    let isValid = true;

    if (!emailRegex.test(emailInput.value.trim())) {
        emailError.classList.add('show');
        isValid = false;
    } else {
        emailError.classList.remove('show');
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
        passwordError.classList.add('show');
        isValid = false;
    } else {
        passwordError.classList.remove('show');
    }

    if (!isValid) {
        return;
    }

    const payload = {
        full_name: `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`.trim(),
        email: emailInput.value.trim(),
        phone_number: document.getElementById('phone').value.trim(),
        password: passwordInput.value,
    };

    setLoading(true);

    try {
        await ApiClient.post('/auth/register', payload);
        showMessage('Registration successful! Redirecting you to login...', true);
        form.reset();
        strengthBar.className = 'password-strength-bar';
        setTimeout(() => {
            window.location.href = 'user-log-in.html';
        }, 1500);
    } catch (error) {
        showMessage(error.message || 'Unable to create account. Please try again.');
    } finally {
        setLoading(false);
    }
});

confirmPasswordInput.addEventListener('input', function() {
    if (this.value && passwordInput.value !== this.value) {
        passwordError.classList.add('show');
    } else {
        passwordError.classList.remove('show');
    }
});