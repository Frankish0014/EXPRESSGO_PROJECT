// Enhanced Login JavaScript Functionality
class LoginManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
    this.setupRememberMe();
  }

  bindEvents() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Real-time validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail());
    }

    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validatePassword());
    }

    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'forgot-password.html';
      });
    }

    // Social login buttons (demo only)
    document.querySelectorAll('.social-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleSocialLogin(btn));
    });
  }

  checkExistingSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (isLoggedIn === 'true' && rememberMe === 'true') {
      // Redirect to user booking history
      window.location.href = 'user-booking-history.html';
    }
  }

  setupRememberMe() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.querySelector('input[name="remember"]');
    
    if (savedEmail && emailInput) {
      emailInput.value = savedEmail;
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password'),
      remember: formData.has('remember')
    };
    
    // Validate inputs
    if (!this.validateLoginData(loginData)) {
      return;
    }

    // Show loading state
    this.setLoadingState(true);

    try {
      // Simulate login API call
      const result = await this.authenticateUser(loginData);
      
      if (result.success) {
        // Store session data
        this.storeSessionData(loginData, result.user);
        
        // Show success message and redirect
        this.showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = 'user-booking-history.html';
        }, 1500);
        
      } else {
        this.showError(result.message || 'Login failed. Please check your credentials.');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Login failed. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  async authenticateUser(loginData) {
    // Simulate API authentication with dummy data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Demo users for testing
        const demoUsers = [
          { 
            email: 'john.doe@example.com', 
            password: 'password123',
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              phone: '+250 788 123 456'
            }
          },
          { 
            email: 'jane.smith@example.com', 
            password: 'password123',
            user: {
              id: 2,
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
              phone: '+250 788 234 567'
            }
          },
          { 
            email: 'admin@expressgo.com', 
            password: 'admin123',
            user: {
              id: 3,
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@expressgo.com',
              phone: '+250 788 345 678',
              role: 'admin'
            }
          }
        ];
        
        const user = demoUsers.find(u => 
          u.email === loginData.email && u.password === loginData.password
        );
        
        if (user) {
          resolve({ 
            success: true, 
            user: user.user,
            token: 'demo_token_' + Date.now()
          });
        } else {
          resolve({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }
      }, 1000); // Simulate network delay
    });
  }

  validateLoginData(data) {
    let isValid = true;
    
    if (!this.validateEmail()) {
      isValid = false;
    }
    
    if (!this.validatePassword()) {
      isValid = false;
    }
    
    return isValid;
  }

  validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (!email) {
      this.showFieldError('email', 'Email is required');
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

  validatePassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    if (!password) {
      this.showFieldError('password', 'Password is required');
      return false;
    }
    
    if (password.length < 6) {
      this.showFieldError('password', 'Password must be at least 6 characters');
      return false;
    }
    
    this.clearFieldError('password');
    return true;
  }

  showFieldError(fieldName, message) {
    const inputElement = document.getElementById(fieldName);
    
    if (inputElement) {
      inputElement.classList.add('error');
      
      // Create or update error message
      let errorElement = inputElement.parentNode.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        inputElement.parentNode.appendChild(errorElement);
      }
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearFieldError(fieldName) {
    const inputElement = document.getElementById(fieldName);
    
    if (inputElement) {
      inputElement.classList.remove('error');
      
      const errorElement = inputElement.parentNode.querySelector('.error-message');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }
  }

  storeSessionData(loginData, user) {
    // Store login state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('sessionToken', 'demo_token_' + Date.now());
    
    // Handle remember me
    if (loginData.remember) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedEmail', loginData.email);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
    }
    
    // Set session expiry (demo: 24 hours)
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('sessionExpiry', expiryTime.toString());
  }

  handleSocialLogin(button) {
    const provider = button.textContent.trim();
    this.showError(`${provider} login is not implemented in this demo`);
  }

  setLoadingState(isLoading) {
    const submitBtn = document.querySelector('.btn-primary');
    
    if (submitBtn) {
      if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Logging in...</span>';
        submitBtn.classList.add('loading');
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<a href="user-booking-history.html">Log In</a>';
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

// Initialize login manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  new LoginManager();
});