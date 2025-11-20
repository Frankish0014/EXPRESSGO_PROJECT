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
    ApiClient.setSession(response);
    showLoginMessage('Login successful! Redirecting...', true);

    const redirectUrl = AppState.consumePostLoginRedirect() || 'user-booking-history.html';
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 800);
  } catch (error) {
    showLoginMessage(error.message || 'Unable to log in. Please try again.');
  } finally {
    setLoginLoading(false);
  }
});