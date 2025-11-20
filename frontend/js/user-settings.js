// User Settings JavaScript Functionality
class UserSettingsManager {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.currentTab = 'profile';
    this.unsavedChanges = false;
    this.originalData = {};
    this.activeSessions = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadUserData();
    this.generateActiveSessions();
    this.checkAuthState();
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => this.switchTab(e));
    });

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
      profileForm.addEventListener('input', () => this.markUnsavedChanges());
    }

    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => this.handlePasswordUpdate(e));
    }

    // Preferences form
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
      preferencesForm.addEventListener('submit', (e) => this.handlePreferencesUpdate(e));
      preferencesForm.addEventListener('input', () => this.markUnsavedChanges());
    }

    // Notifications form
    const notificationsForm = document.getElementById('notificationsForm');
    if (notificationsForm) {
      notificationsForm.addEventListener('submit', (e) => this.handleNotificationsUpdate(e));
      notificationsForm.addEventListener('input', () => this.markUnsavedChanges());
    }

    // Photo upload
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }

    // Remove photo
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', () => this.removePhoto());
    }

    // Password toggles
    document.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
    });

    // Password strength validation
    const newPasswordInput = document.getElementById('newPasswordSettings');
    if (newPasswordInput) {
      newPasswordInput.addEventListener('input', () => this.validatePasswordStrength());
    }

    // Account management actions
    const deactivateAccountBtn = document.getElementById('deactivateAccountBtn');
    if (deactivateAccountBtn) {
      deactivateAccountBtn.addEventListener('click', () => this.deactivateAccount());
    }

    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', () => this.showDeleteAccountModal());
    }

    // Delete account modal
    this.bindDeleteAccountModal();

    // Data management actions
    const downloadDataBtn = document.getElementById('downloadDataBtn');
    if (downloadDataBtn) {
      downloadDataBtn.addEventListener('click', () => this.downloadUserData());
    }

    const deleteDataBtn = document.getElementById('deleteDataBtn');
    if (deleteDataBtn) {
      deleteDataBtn.addEventListener('click', () => this.requestDataDeletion());
    }

    // Cancel buttons
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    if (cancelProfileBtn) {
      cancelProfileBtn.addEventListener('click', () => this.cancelProfileChanges());
    }

    // Before unload warning
    window.addEventListener('beforeunload', (e) => {
      if (this.unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  getCurrentUser() {
    // Get user data from localStorage or use default
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    
    return {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+250 788 123 456',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      address: 'Kigali, Rwanda',
      profilePhoto: null,
      preferences: {
        language: 'en',
        currency: 'RWF',
        timezone: 'Africa/Kigali',
        defaultDepartureCity: 'kigali',
        autoFillInfo: true,
        seatPreference: 'window'
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
      }
    };
  }

  loadUserData() {
    // Store original data for comparison
    this.originalData = JSON.parse(JSON.stringify(this.currentUser));
    
    // Populate profile form
    const fields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address'];
    fields.forEach(field => {
      const element = document.getElementById(field);
      if (element && this.currentUser[field]) {
        element.value = this.currentUser[field];
      }
    });

    // Populate preferences
    if (this.currentUser.preferences) {
      Object.entries(this.currentUser.preferences).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = value;
          } else {
            element.value = value;
          }
        }
      });
    }

    // Populate notifications
    if (this.currentUser.notifications) {
      Object.entries(this.currentUser.notifications).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element && element.type === 'checkbox') {
          element.checked = value;
        }
      });
    }

    // Populate security settings
    if (this.currentUser.security) {
      Object.entries(this.currentUser.security).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = value;
          } else {
            element.value = value;
          }
        }
      });
    }

    // Populate privacy settings
    if (this.currentUser.privacy) {
      Object.entries(this.currentUser.privacy).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element && element.type === 'checkbox') {
          element.checked = value;
        }
      });
    }

    // Update header user name
    const headerUserName = document.getElementById('headerUserName');
    if (headerUserName) {
      headerUserName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }

    // Load profile photo
    this.loadProfilePhoto();
  }

  loadProfilePhoto() {
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto) {
      if (this.currentUser.profilePhoto) {
        profilePhoto.src = this.currentUser.profilePhoto;
      } else {
        profilePhoto.src = 'images/default-avatar.png';
      }
    }
  }

  switchTab(e) {
    e.preventDefault();
    
    if (this.unsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to switch tabs?')) {
        return;
      }
      this.unsavedChanges = false;
    }

    const targetTab = e.target.getAttribute('data-tab');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    e.target.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    const targetContent = document.getElementById(targetTab);
    if (targetContent) {
      targetContent.classList.add('active');
    }

    this.currentTab = targetTab;
  }

  async handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = Object.fromEntries(formData.entries());
    
    // Validate profile data
    if (!this.validateProfileData(profileData)) {
      return;
    }

    try {
      // Simulate API call
      await this.updateProfile(profileData);
      
      // Update current user data
      Object.assign(this.currentUser, profileData);
      this.saveUserData();
      
      this.showSuccess('Profile updated successfully');
      this.unsavedChanges = false;
      
    } catch (error) {
      console.error('Profile update failed:', error);
      this.showError('Failed to update profile. Please try again.');
    }
  }

  async handlePasswordUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const passwordData = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPasswordSettings'),
      confirmPassword: formData.get('confirmNewPassword')
    };
    
    // Validate password data
    if (!this.validatePasswordData(passwordData)) {
      return;
    }

    try {
      // Simulate API call
      await this.updatePassword(passwordData);
      
      this.showSuccess('Password updated successfully');
      e.target.reset();
      
    } catch (error) {
      console.error('Password update failed:', error);
      this.showError('Failed to update password. Please try again.');
    }
  }

  async handlePreferencesUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const preferencesData = {};
    
    // Process form data including checkboxes
    for (const [key, value] of formData.entries()) {
      preferencesData[key] = value;
    }
    
    // Handle checkboxes that might not be in formData if unchecked
    const checkboxes = e.target.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      preferencesData[checkbox.name] = checkbox.checked;
    });

    try {
      // Simulate API call
      await this.updatePreferences(preferencesData);
      
      // Update current user preferences
      this.currentUser.preferences = { ...this.currentUser.preferences, ...preferencesData };
      this.saveUserData();
      
      this.showSuccess('Preferences updated successfully');
      this.unsavedChanges = false;
      
    } catch (error) {
      console.error('Preferences update failed:', error);
      this.showError('Failed to update preferences. Please try again.');
    }
  }

  async handleNotificationsUpdate(e) {
    e.preventDefault();
    
    const notificationsData = {};
    
    // Handle checkboxes
    const checkboxes = e.target.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      notificationsData[checkbox.id] = checkbox.checked;
    });

    try {
      // Simulate API call
      await this.updateNotifications(notificationsData);
      
      // Update current user notifications
      this.currentUser.notifications = { ...this.currentUser.notifications, ...notificationsData };
      this.saveUserData();
      
      this.showSuccess('Notification settings updated successfully');
      this.unsavedChanges = false;
      
    } catch (error) {
      console.error('Notifications update failed:', error);
      this.showError('Failed to update notification settings. Please try again.');
    }
  }

  handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.showError('Image file size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const profilePhoto = document.getElementById('profilePhoto');
      if (profilePhoto) {
        profilePhoto.src = e.target.result;
        this.currentUser.profilePhoto = e.target.result;
        this.saveUserData();
        this.showSuccess('Profile photo updated successfully');
      }
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    if (confirm('Are you sure you want to remove your profile photo?')) {
      this.currentUser.profilePhoto = null;
      this.saveUserData();
      this.loadProfilePhoto();
      this.showSuccess('Profile photo removed successfully');
    }
  }

  togglePasswordVisibility(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('data-target');
    const input = document.getElementById(targetId);
    
    if (input) {
      const isPasswordType = input.type === 'password';
      input.type = isPasswordType ? 'text' : 'password';
      e.target.textContent = isPasswordType ? '🙈' : '👁️';
    }
  }

  validatePasswordStrength() {
    const passwordInput = document.getElementById('newPasswordSettings');
    const password = passwordInput.value;
    
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?\":{}|<>]/.test(password)
    };
    
    const metRequirements = Object.values(requirements).filter(req => req).length;
    const strengthBar = document.getElementById('passwordStrengthBarSettings');
    const strengthText = document.getElementById('passwordStrengthTextSettings');
    
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
    }
  }

  validateProfileData(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!data.firstName || data.firstName.trim().length < 2) {
      this.showError('First name must be at least 2 characters long');
      return false;
    }
    
    if (!data.lastName || data.lastName.trim().length < 2) {
      this.showError('Last name must be at least 2 characters long');
      return false;
    }
    
    if (!data.email || !emailRegex.test(data.email)) {
      this.showError('Please enter a valid email address');
      return false;
    }
    
    if (!data.phone || data.phone.trim().length < 10) {
      this.showError('Please enter a valid phone number');
      return false;
    }
    
    return true;
  }

  validatePasswordData(data) {
    // In a real app, you'd verify the current password
    if (!data.currentPassword) {
      this.showError('Current password is required');
      return false;
    }
    
    if (!data.newPassword || data.newPassword.length < 8) {
      this.showError('New password must be at least 8 characters long');
      return false;
    }
    
    if (data.newPassword !== data.confirmPassword) {
      this.showError('New passwords do not match');
      return false;
    }
    
    return true;
  }

  generateActiveSessions() {
    this.activeSessions = [
      {
        id: 1,
        device: 'Chrome on Windows',
        location: 'Kigali, Rwanda',
        lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        current: true
      },
      {
        id: 2,
        device: 'Safari on iPhone',
        location: 'Kigali, Rwanda',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        current: false
      }
    ];
    
    this.renderActiveSessions();
  }

  renderActiveSessions() {
    const container = document.getElementById('activeSessions');
    if (!container) return;
    
    container.innerHTML = this.activeSessions.map(session => `
      <div class="session-item">
        <div class="session-info">
          <div class="session-device">
            ${session.device} ${session.current ? '(Current Session)' : ''}
          </div>
          <div class="session-details">
            <span class="session-location">📍 ${session.location}</span>
            <span class="session-time">Last active: ${this.formatRelativeTime(session.lastActive)}</span>
          </div>
        </div>
        <div class="session-actions">
          ${!session.current ? `<button type="button" class="btn-danger btn-small" onclick="userSettingsManager.terminateSession(${session.id})">Terminate</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }

  terminateSession(sessionId) {
    if (confirm('Are you sure you want to terminate this session?')) {
      this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
      this.renderActiveSessions();
      this.showSuccess('Session terminated successfully');
    }
  }

  deactivateAccount() {
    if (confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) {
      // Simulate account deactivation
      this.showSuccess('Account deactivated successfully. You will be redirected to the login page.');
      setTimeout(() => {
        window.location.href = 'user-log-in.html';
      }, 2000);
    }
  }

  showDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  bindDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    const confirmInput = document.getElementById('deleteConfirmation');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');

    if (confirmInput && confirmBtn) {
      confirmInput.addEventListener('input', () => {
        confirmBtn.disabled = confirmInput.value !== 'DELETE';
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.deleteAccount());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeDeleteAccountModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeDeleteAccountModal();
        }
      });
    }
  }

  closeDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    const confirmInput = document.getElementById('deleteConfirmation');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (modal) {
      modal.style.display = 'none';
    }
    
    if (confirmInput) {
      confirmInput.value = '';
    }
    
    if (confirmBtn) {
      confirmBtn.disabled = true;
    }
  }

  deleteAccount() {
    // Simulate account deletion
    localStorage.removeItem('currentUser');
    this.showSuccess('Account deleted successfully. You will be redirected to the homepage.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }

  downloadUserData() {
    const userData = {
      profile: this.currentUser,
      exportDate: new Date().toISOString(),
      bookingHistory: [], // Would be populated from actual data
      preferences: this.currentUser.preferences
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `expressgo_user_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showSuccess('User data downloaded successfully');
  }

  requestDataDeletion() {
    if (confirm('Are you sure you want to request deletion of your personal data? This action cannot be undone.')) {
      // Simulate data deletion request
      this.showSuccess('Data deletion request submitted. You will receive a confirmation email within 24 hours.');
    }
  }

  markUnsavedChanges() {
    this.unsavedChanges = true;
  }

  cancelProfileChanges() {
    if (this.unsavedChanges) {
      if (confirm('Are you sure you want to discard your changes?')) {
        this.loadUserData();
        this.unsavedChanges = false;
        this.showSuccess('Changes discarded');
      }
    }
  }

  checkAuthState() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to login page
      window.location.href = 'user-log-in.html';
      return;
    }
  }

  saveUserData() {
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  // Simulated API calls
  async updateProfile(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  async updatePassword(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  async updatePreferences(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  async updateNotifications(data) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
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

// Global functions
function logout() {
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'user-log-in.html';
  }
}

function closeNotification(notificationId) {
  if (window.userSettingsManager) {
    window.userSettingsManager.closeNotification(notificationId);
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.userSettingsManager = new UserSettingsManager();
});