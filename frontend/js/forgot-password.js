// Forgot Password JavaScript Functionality
class ForgotPasswordManager {
  constructor() {
    this.currentStep = 'email';
    this.isDemo = true; // Set to true for demo mode
    this.init();
  }

  init() {
    this.bindEvents();
    this.validateInitialState();
  }

  bindEvents() {
    // Form submission
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPasswordSubmit(e));
    }

    // Resend email button
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
      resendBtn.addEventListener('click', () => this.resendResetEmail());
    }

    // Email input validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.addEventListener('input', () => this.validateEmail());
      emailInput.addEventListener('blur', () => this.validateEmail());
    }

    // Notification close buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-close')) {
        const notificationId = e.target.closest('.notification').id;
        this.closeNotification(notificationId);
      }
    });
  }

  validateInitialState() {
    // Check if there's a pending reset request
    const pendingReset = localStorage.getItem('pendingPasswordReset');
    if (pendingReset) {
      const resetData = JSON.parse(pendingReset);
      const now = new Date().getTime();
      const requestTime = new Date(resetData.timestamp).getTime();
      const timeDiff = now - requestTime;
      
      // If reset was requested less than 5 minutes ago, show success step
      if (timeDiff < 300000) { // 5 minutes
        this.showSuccessStep(resetData.email);
        return;
      } else {
        // Clear expired reset request
        localStorage.removeItem('pendingPasswordReset');
      }
    }
  }

  async handleForgotPasswordSubmit(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    // Validate email
    if (!this.validateEmail()) {
      return;
    }

    // Show loading state
    this.setLoadingState(true);
    
    try {
      // Simulate API call
      await this.sendPasswordResetEmail(email);
      
      // Store reset request data
      const resetData = {
        email: email,
        timestamp: new Date().toISOString(),
        token: this.generateDemoToken()
      };
      localStorage.setItem('pendingPasswordReset', JSON.stringify(resetData));
      
      // Show success step
      if (this.isDemo) {
        setTimeout(() => {
          this.showDemoStep(email);
        }, 1000);
      } else {
        this.showSuccessStep(email);
      }
      
    } catch (error) {
      console.error('Error sending reset email:', error);
      this.showError('Failed to send reset email. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  async sendPasswordResetEmail(email) {
    // Simulate API call with dummy data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate different scenarios based on email
        if (email.includes('invalid')) {
          reject(new Error('Invalid email address'));
        } else if (email.includes('notfound')) {
          reject(new Error('Email not found in our records'));
        } else {
          resolve({ success: true, message: 'Password reset email sent' });
        }
      }, 1500); // Simulate network delay
    });
  }

  validateEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
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

  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = document.getElementById(fieldName);
    
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
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    
    if (inputElement) {
      inputElement.classList.remove('error');
    }
  }

  showSuccessStep(email) {
    this.hideAllSteps();
    const successStep = document.getElementById('successStep');
    const successMessage = document.getElementById('successMessage');
    
    if (successStep) {
      successStep.classList.add('active');
    }
    
    if (successMessage) {
      successMessage.innerHTML = `
        We've sent a password reset link to <strong>${email}</strong>. 
        Please check your inbox and follow the instructions to reset your password.
      `;
    }
    
    this.currentStep = 'success';
  }

  showDemoStep(email) {
    this.hideAllSteps();
    const demoStep = document.getElementById('demoStep');
    
    if (demoStep) {
      demoStep.classList.add('active');
    }
    
    this.currentStep = 'demo';
  }

  hideAllSteps() {
    const steps = document.querySelectorAll('.step-container');
    steps.forEach(step => step.classList.remove('active'));
  }

  async resendResetEmail() {
    const resetData = localStorage.getItem('pendingPasswordReset');
    if (!resetData) {
      this.showError('No pending reset request found');
      return;
    }
    
    const data = JSON.parse(resetData);
    
    try {
      await this.sendPasswordResetEmail(data.email);
      
      // Update timestamp
      data.timestamp = new Date().toISOString();
      localStorage.setItem('pendingPasswordReset', JSON.stringify(data));
      
      this.showSuccess('Password reset email has been resent');
      
    } catch (error) {
      this.showError('Failed to resend email. Please try again.');
    }
  }

  generateDemoToken() {
    // Generate a demo token for development
    return 'demo_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setLoadingState(isLoading) {
    const sendResetBtn = document.getElementById('sendResetBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnText = sendResetBtn.querySelector('.btn-text');
    
    if (isLoading) {
      sendResetBtn.disabled = true;
      sendResetBtn.classList.add('loading');
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      if (btnText) btnText.textContent = 'Sending...';
    } else {
      sendResetBtn.disabled = false;
      sendResetBtn.classList.remove('loading');
      if (loadingSpinner) loadingSpinner.style.display = 'none';
      if (btnText) btnText.textContent = 'Send Reset Link';
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
  if (window.forgotPasswordManager) {
    window.forgotPasswordManager.closeNotification(notificationId);
  }
}

// Initialize the Forgot Password Manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.forgotPasswordManager = new ForgotPasswordManager();
});