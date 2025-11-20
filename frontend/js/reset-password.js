// Reset Password JavaScript Functionality
class ResetPasswordManager {
  constructor() {
    this.token = this.getTokenFromUrl();
    this.isValidToken = false;
    this.currentStep = 'validating';
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
    this.validateToken();
  }

  bindEvents() {
    // Form submission
    const passwordResetForm = document.getElementById('passwordResetForm');
    if (passwordResetForm) {
      passwordResetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
    }

    // Password validation
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
      newPasswordInput.addEventListener('input', () => this.validatePassword());
      newPasswordInput.addEventListener('blur', () => this.validatePassword());
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => this.validateConfirmPassword());
      confirmPasswordInput.addEventListener('blur', () => this.validateConfirmPassword());
    }

    // Password toggle buttons
    document.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
    });

    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.showResetForm());
    }

    // Notification close buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-close')) {
        const notificationId = e.target.closest('.notification').id;
        this.closeNotification(notificationId);
      }
    });
  }

  getTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  }

  async validateToken() {
    if (!this.token) {
      this.showInvalidToken();
      return;
    }

    try {
      // Simulate token validation
      await this.verifyResetToken(this.token);
      this.isValidToken = true;
      this.showResetForm();
    } catch (error) {
      console.error('Token validation failed:', error);
      this.showInvalidToken();
    }
  }

  async verifyResetToken(token) {
    // Simulate API call for token verification
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Demo tokens are always valid
        if (token.includes('demo_token')) {
          resolve({ valid: true });
        } else if (token === 'expired') {
          reject(new Error('Token has expired'));
        } else if (token === 'invalid') {
          reject(new Error('Invalid token'));
        } else {
          // For demo, most tokens are valid
          resolve({ valid: true });
        }
      }, 2000); // Simulate network delay
    });
  }

  showInvalidToken() {
    this.hideAllSteps();
    const invalidTokenStep = document.getElementById('invalidToken');
    if (invalidTokenStep) {
      invalidTokenStep.classList.add('active');
    }
    this.currentStep = 'invalid';
  }

  showResetForm() {
    this.hideAllSteps();
    const resetFormStep = document.getElementById('resetForm');
    if (resetFormStep) {
      resetFormStep.classList.add('active');
    }
    this.currentStep = 'reset';
  }

  hideAllSteps() {
    const steps = document.querySelectorAll('.step-container');
    steps.forEach(step => step.classList.remove('active'));
  }

  async handlePasswordReset(e) {
    e.preventDefault();
    
    if (!this.validatePassword() || !this.validateConfirmPassword()) {
      return;
    }

    const newPassword = document.getElementById('newPassword').value;
    
    // Show loading state
    this.setLoadingState(true);
    
    try {
      // Simulate password reset API call
      await this.resetPassword(this.token, newPassword);
      
      // Clear any stored reset data
      localStorage.removeItem('pendingPasswordReset');
      
      this.showSuccessStep();
      
    } catch (error) {
      console.error('Password reset failed:', error);
      this.showErrorStep(error.message);
    } finally {
      this.setLoadingState(false);
    }
  }

  async resetPassword(token, newPassword) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate for demo
          resolve({ success: true });
        } else {
          reject(new Error('Password reset failed. Please try again.'));
        }
      }, 1500);
    });
  }

  validatePassword() {
    const passwordInput = document.getElementById('newPassword');
    const password = passwordInput.value;
    
    // Reset requirements
    this.passwordRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?\":{}|<>]/.test(password)
    };
    
    // Update visual indicators
    this.updatePasswordRequirements();
    this.updatePasswordStrength();
    
    // Check if all requirements are met
    const allRequirementsMet = Object.values(this.passwordRequirements).every(req => req);
    
    if (!password) {
      this.showFieldError('password', 'Password is required');
      return false;
    }
    
    if (!allRequirementsMet) {
      this.showFieldError('password', 'Password does not meet all requirements');
      return false;
    }
    
    this.clearFieldError('password');
    return true;
  }

  validateConfirmPassword() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
      this.showFieldError('confirmPassword', 'Please confirm your password');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      this.showFieldError('confirmPassword', 'Passwords do not match');
      return false;
    }
    
    this.clearFieldError('confirmPassword');
    return true;
  }

  updatePasswordRequirements() {
    const requirementElements = {
      'req-length': this.passwordRequirements.length,
      'req-uppercase': this.passwordRequirements.uppercase,
      'req-lowercase': this.passwordRequirements.lowercase,
      'req-number': this.passwordRequirements.number,
      'req-special': this.passwordRequirements.special
    };
    
    Object.entries(requirementElements).forEach(([elementId, met]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.toggle('met', met);
      }
    });
  }

  updatePasswordStrength() {
    const metRequirements = Object.values(this.passwordRequirements).filter(req => req).length;
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    
    const strengthLevels = [
      { min: 0, max: 1, class: 'very-weak', text: 'Very Weak' },
      { min: 2, max: 2, class: 'weak', text: 'Weak' },
      { min: 3, max: 3, class: 'fair', text: 'Fair' },
      { min: 4, max: 4, class: 'good', text: 'Good' },
      { min: 5, max: 5, class: 'strong', text: 'Strong' }
    ];
    
    const currentLevel = strengthLevels.find(level => 
      metRequirements >= level.min && metRequirements <= level.max
    ) || strengthLevels[0];
    
    if (strengthBar) {
      strengthBar.className = 'password-strength-bar ' + currentLevel.class;
      strengthBar.style.width = `${(metRequirements / 5) * 100}%`;
    }
    
    if (strengthText) {
      strengthText.textContent = currentLevel.text;
      strengthText.className = 'password-strength-text ' + currentLevel.class;
    }
  }

  togglePasswordVisibility(e) {
    e.preventDefault();
    const button = e.target;
    const targetId = button.getAttribute('data-target') || 
                   button.closest('.password-input-container').querySelector('input').id;
    const input = document.getElementById(targetId);
    
    if (input) {
      const isPasswordType = input.type === 'password';
      input.type = isPasswordType ? 'text' : 'password';
      button.textContent = isPasswordType ? '🙈' : '👁️';
    }
  }

  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = document.getElementById(fieldName === 'password' ? 'newPassword' : fieldName);
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    
    if (inputElement) {
      inputElement.classList.add('error');
    }
  }

  clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = document.getElementById(fieldName === 'password' ? 'newPassword' : fieldName);
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    
    if (inputElement) {
      inputElement.classList.remove('error');
    }
  }

  showSuccessStep() {
    this.hideAllSteps();
    const successStep = document.getElementById('successStep');
    if (successStep) {
      successStep.classList.add('active');
    }
    this.currentStep = 'success';
  }

  showErrorStep(errorMessage) {
    this.hideAllSteps();
    const errorStep = document.getElementById('errorStep');
    const errorMessageElement = document.getElementById('errorMessage');
    
    if (errorStep) {
      errorStep.classList.add('active');
    }
    
    if (errorMessageElement) {
      errorMessageElement.textContent = errorMessage;
    }
    
    this.currentStep = 'error';
  }

  setLoadingState(isLoading) {
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnText = resetPasswordBtn.querySelector('.btn-text');
    
    if (isLoading) {
      resetPasswordBtn.disabled = true;
      resetPasswordBtn.classList.add('loading');
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      if (btnText) btnText.textContent = 'Resetting Password...';
    } else {
      resetPasswordBtn.disabled = false;
      resetPasswordBtn.classList.remove('loading');
      if (loadingSpinner) loadingSpinner.style.display = 'none';
      if (btnText) btnText.textContent = 'Reset Password';
    }
  }

  showSuccess(message) {
    this.showNotification('success', message);
  }

  showError(message) {
    this.showNotification('error', message);
  }

  showNotification(type, message) {
    const notificationId = `${type}Notification`;
    const notification = document.getElementById(notificationId);
    const messageElement = document.getElementById(`${type}NotificationMessage`);
    
    if (notification && messageElement) {
      messageElement.textContent = message;
      notification.classList.add('show');
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        this.closeNotification(notificationId);
      }, 5000);
    }
  }

  closeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
      notification.classList.remove('show');
    }
  }
}

// Utility function for closing notifications (called from HTML)
function closeNotification(notificationId) {
  if (window.resetPasswordManager) {
    window.resetPasswordManager.closeNotification(notificationId);
  }
}

// Initialize the Reset Password Manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.resetPasswordManager = new ResetPasswordManager();
});