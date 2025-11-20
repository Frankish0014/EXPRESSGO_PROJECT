const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const submitBtn = document.getElementById('loginSubmit');

const showLoginMessage = (message, isSuccess = false) => {
  if (!loginMessage) return;
  loginMessage.textContent = message;
  loginMessage.classList.add('show');
  loginMessage.classList.toggle('success', isSuccess);
};

const clearLoginMessage = () => {
  loginMessage.textContent = '';
  loginMessage.classList.remove('show', 'success');
};

const setLoginLoading = (isLoading) => {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Signing in...' : 'Log In';
};

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearLoginMessage();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showLoginMessage('Please enter your email and password.');
    return;
  }

  setLoginLoading(true);

  try {
    const response = await ApiClient.post('/auth/login', { email, password });
    console.log('The login response is: ',response);

    // Extract token and user from response structure
    const token = response.data?.token || response.token;
    const user = response.data?.user || response.user;

    if (!token || !user) {
      console.error('Login response structure:', response);
      throw new Error('Invalid login response: missing token or user data');
    }

    // Save session using ApiClient helper
    ApiClient.setSession({ token, user });
    
    // Force a synchronous check by directly accessing localStorage
    const directTokenCheck = localStorage.getItem('expressgo_auth_token');
    const directUserCheck = localStorage.getItem('expressgo_auth_user');
    
    // Verify session was saved immediately
    const savedToken = ApiClient.getToken();
    const savedUser = ApiClient.getUser();
    console.log('Session saved - Verification:', {
      tokenSaved: !!savedToken,
      userSaved: !!savedUser,
      userRole: savedUser?.role,
      tokenLength: savedToken?.length,
      directTokenCheck: !!directTokenCheck,
      directUserCheck: !!directUserCheck,
      tokensMatch: savedToken === directTokenCheck
    });
    
    if (!ApiClient.isAuthenticated() || !directTokenCheck) {
      console.error('Failed to save session - token not found after setSession');
      console.error('Attempted to save token:', token?.substring(0, 20) + '...');
      console.error('localStorage keys:', Object.keys(localStorage));
      throw new Error('Failed to save login session. Please try again.');
    }

    console.log('Login successful, user role:', user.role);
    showLoginMessage('Login successful! Redirecting...', true);

    // Redirect based on user role
    if (user.role === 'admin') {
      // Use absolute path to avoid relative path issues
      const adminPath = window.location.pathname.includes('/src/') 
        ? './adminDashboard/admin.html' 
        : './src/adminDashboard/admin.html';
      console.log('Redirecting admin to:', adminPath);
      // Longer delay to ensure localStorage is fully persisted
      setTimeout(() => {
        // Double-check authentication before redirect
        if (!ApiClient.isAuthenticated()) {
          console.error('Authentication lost before redirect!');
          showLoginMessage('Session error. Please try logging in again.', false);
          return;
        }
        window.location.href = adminPath;
      }, 800);
    } else {
      const redirectUrl = AppState.consumePostLoginRedirect() || 'user-booking-history.html';
      console.log('Redirecting user to:', redirectUrl);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 800);
    }
  } catch (error) {
    showLoginMessage(error.message || 'Unable to log in. Please try again.');
  } finally {
    setLoginLoading(false);
  }
});