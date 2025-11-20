// Enhanced Registration JavaScript Functionality
class RegistrationManager {
  constructor() {
    this.passwordRequirements = {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
  }

  bindEvents() {
    const form = document.getElementById('registerForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleRegistration(e));
    }

    // Password strength validation
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => this.validatePasswordStrength());
    }

    // Real-time validation
    const inputs = {
      email: () => this.validateEmail(),
      phone: () => this.validatePhone(),
      confirmPassword: () => this.validateConfirmPassword()
    };

    Object.entries(inputs).forEach(([id, validator]) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('blur', validator);
        input.addEventListener('input', validator);
      }
    });

    // Name validation
    ['firstName', 'lastName'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('blur', () => this.validateName(id));
      }
    });

    // Social registration buttons (demo only)
    document.querySelectorAll('.social-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleSocialRegistration(btn));
    });

    // Terms checkbox
    const termsCheckbox = document.getElementById('terms');
    const submitBtn = document.getElementById('submitBtn');
    if (termsCheckbox && submitBtn) {
      termsCheckbox.addEventListener('change', () => {
        submitBtn.disabled = !termsCheckbox.checked;
      });
    }
  }

  checkExistingSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      // Redirect to user booking history if already logged in
      window.location.href = 'user-booking-history.html';
    }
  }

  async handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const registrationData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      terms: formData.has('terms')
    };
    
    // Validate all inputs
    if (!this.validateRegistrationData(registrationData)) {
      return;
    }

    // Show loading state
    this.setLoadingState(true);

    try {
      // Simulate registration API call
      const result = await this.registerUser(registrationData);
      
      if (result.success) {
        // Store user data and session
        this.storeUserData(result.user);
        
        // Show success message
        this.showSuccess(`Registration successful! Welcome to ExpressGo, ${result.user.firstName}!`);
        
        // Redirect after delay
        setTimeout(() => {
          window.location.href = 'user-booking-history.html';
        }, 2000);
        
      } else {
        this.showError(result.message || 'Registration failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      this.showError('Registration failed. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  async registerUser(registrationData) {
    // Simulate API registration with validation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if email already exists (demo)
        const existingEmails = [
          'john.doe@example.com',
          'jane.smith@example.com',
          'admin@expressgo.com'
        ];
        
        if (existingEmails.includes(registrationData.email)) {
          resolve({ 
            success: false, 
            message: 'An account with this email already exists' 
          });
          return;
        }
        
        // Create new user
        const newUser = {
          id: Date.now(), // Use timestamp as ID for demo
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: registrationData.email,
          phone: registrationData.phone,
          dateOfBirth: '',
          gender: '',
          address: '',
          profilePhoto: null,
          preferences: {
            language: 'en',
            currency: 'RWF',
            timezone: 'Africa/Kigali',
            defaultDepartureCity: '',
            autoFillInfo: true,
            seatPreference: 'any'
          },
          notifications: {
            emailBookingConfirmation: true,
            emailBookingReminders: true,
            emailScheduleChanges: true,
            emailPromotions: false,
            smsBookingConfirmation: false,
            smsTripReminders: false
          },
          security: {
            twoFactorAuth: false,
            loginNotifications: true,
            sessionTimeout: 60
          },
          privacy: {
            dataCollection: true,
            marketingCommunications: false
          },
          registrationDate: new Date().toISOString()
        };
        
        resolve({ 
          success: true, 
          user: newUser,
          token: 'demo_token_' + Date.now()
        });
      }, 1500); // Simulate network delay
    });
  }

  validateRegistrationData(data) {
    let isValid = true;
    
    if (!this.validateName('firstName')) isValid = false;
    if (!this.validateName('lastName')) isValid = false;
    if (!this.validateEmail()) isValid = false;
    if (!this.validatePhone()) isValid = false;
    if (!this.validatePasswordStrength()) isValid = false;
    if (!this.validateConfirmPassword()) isValid = false;
    if (!this.validateTerms()) isValid = false;
    
    return isValid;
  }

  validateName(fieldId) {
    const input = document.getElementById(fieldId);
    const name = input.value.trim();
    const fieldName = fieldId === 'firstName' ? 'First name' : 'Last name';
    
    if (!name) {
      this.showFieldError(fieldId, `${fieldName} is required`);
      return false;
    }
    
    if (name.length < 2) {
      this.showFieldError(fieldId, `${fieldName} must be at least 2 characters long`);
      return false;
    }
    
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      this.showFieldError(fieldId, `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
      return false;
    }
    
    this.clearFieldError(fieldId);
    return true;
  }

  validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (!email) {
      this.showFieldError('email', 'Email address is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showFieldError('email', 'Please enter a valid email address');
      return false;
    }
    
    this.clearFieldError('email');
    return true;
  }

  validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    
    if (!phone) {
      this.showFieldError('phone', 'Phone number is required');
      return false;
    }
    
    // Rwanda phone number validation
    const phoneRegex = /^\+?250\s?7[0-9]{8}$|^07[0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      this.showFieldError('phone', 'Please enter a valid Rwandan phone number');
      return false;
    }
    
    this.clearFieldError('phone');
    return true;
  }

  validatePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    // Reset requirements
    this.passwordRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?\":{}|<>]/.test(password)
    };
    
    this.updatePasswordStrength();
    
    if (!password) {
      this.showFieldError('password', 'Password is required');
      return false;
    }
    
    const allRequirementsMet = Object.values(this.passwordRequirements).every(req => req);
    if (!allRequirementsMet) {
      this.showFieldError('password', 'Password does not meet all requirements');
      return false;
    }
    
    this.clearFieldError('password');
    return true;
  }

  updatePasswordStrength() {
    const metRequirements = Object.values(this.passwordRequirements).filter(req => req).length;
    const strengthBar = document.getElementById('passwordStrengthBar');
    
    const strengthLevels = [
      { min: 0, max: 1, class: 'weak', text: 'Very Weak' },
      { min: 2, max: 2, class: 'weak', text: 'Weak' },
      { min: 3, max: 3, class: 'medium', text: 'Fair' },
      { min: 4, max: 4, class: 'medium', text: 'Good' },
      { min: 5, max: 5, class: 'strong', text: 'Strong' }
    ];
    
    const currentLevel = strengthLevels.find(level => 
      metRequirements >= level.min && metRequirements <= level.max
    ) || strengthLevels[0];
    
    if (strengthBar) {
      strengthBar.className = 'password-strength-bar ' + currentLevel.class;
    }
  }

  validateConfirmPassword() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
      this.showFieldError('confirmPassword', 'Please confirm your password');
      return false;
    }
    
    if (password !== confirmPassword) {
      this.showFieldError('confirmPassword', 'Passwords do not match');
      return false;
    }
    
    this.clearFieldError('confirmPassword');
    return true;
  }

  validateTerms() {
    const termsCheckbox = document.getElementById('terms');
    
    if (!termsCheckbox.checked) {
      this.showError('Please accept the Terms of Service and Privacy Policy');
      return false;
    }
    
    return true;
  }

  showFieldError(fieldName, message) {
    const inputElement = document.getElementById(fieldName);
    
    if (inputElement) {
      inputElement.classList.add('error');
      
      // Use existing error element or create new one
      let errorElement = document.getElementById(`${fieldName}Error`);
      if (!errorElement) {
        errorElement = inputElement.parentNode.querySelector('.error-message');
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'error-message';
          errorElement.id = `${fieldName}Error`;
          inputElement.parentNode.appendChild(errorElement);
        }
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      errorElement.classList.add('show');
    }
  }

  clearFieldError(fieldName) {
    const inputElement = document.getElementById(fieldName);
    
    if (inputElement) {
      inputElement.classList.remove('error');
      
      let errorElement = document.getElementById(`${fieldName}Error`);
      if (!errorElement) {
        errorElement = inputElement.parentNode.querySelector('.error-message');
      }
      
      if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.classList.remove('show');
      }
    }
  }

  storeUserData(user) {
    // Store login state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('sessionToken', 'demo_token_' + Date.now());
    
    // Set session expiry (demo: 24 hours)
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('sessionExpiry', expiryTime.toString());
  }

  handleSocialRegistration(button) {
    const provider = button.textContent.trim();
    this.showError(`${provider} registration is not implemented in this demo`);
  }

  setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    
    if (submitBtn) {
      if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.classList.add('loading');
      } else {
        const termsCheckbox = document.getElementById('terms');
        submitBtn.disabled = !termsCheckbox.checked;
        submitBtn.textContent = 'Create Account';
        submitBtn.classList.remove('loading');
      }
    }
  }

  showSuccess(message) {
    this.showNotification('success', message);
  }

  showError(message) {
    this.showNotification('error', message);
  }

  showNotification(type, message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById(`${type}Notification`);
    if (!notification) {
      notification = this.createNotificationElement(type);
      document.body.appendChild(notification);
    }
    
    const messageElement = notification.querySelector('.notification-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    
    notification.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 5000);
  }

  createNotificationElement(type) {
    const notification = document.createElement('div');
    notification.id = `${type}Notification`;
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icon}</span>
        <span class="notification-message"></span>
        <button class="notification-close" onclick="this.parentElement.parentElement.classList.remove('show')">×</button>
      </div>
    `;
    
    return notification;
  }
}

// Initialize registration manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  new RegistrationManager();
});