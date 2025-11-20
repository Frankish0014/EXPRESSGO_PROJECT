(function () {
  const DEFAULT_API_BASE = 'http://localhost:3000/api';
  const STORAGE_KEYS = {
    token: 'expressgo_auth_token',
    user: 'expressgo_auth_user',
    searchQuery: 'expressgo_search_query',
    selectedSchedule: 'expressgo_selected_schedule',
    bookingCheckout: 'expressgo_booking_checkout',
    postLoginRedirect: 'expressgo_post_login_redirect',
  };

  const resolveApiBase = () => {
    if (window.__EXPRESSGO_API_BASE__) {
      return window.__EXPRESSGO_API_BASE__;
    }
    const meta = document.querySelector('meta[name="expressgo-api-base"]');
    return meta?.content || DEFAULT_API_BASE;
  };

  const ApiClient = {
    baseUrl: resolveApiBase(),

    getToken() {
      return localStorage.getItem(STORAGE_KEYS.token);
    },

    getUser() {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },

    isAuthenticated() {
      return Boolean(this.getToken());
    },

    setSession({ token, user }) {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.token, token);
      }
      if (user) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      }
    },

    clearSession() {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
    },

    async request(path, options = {}, requiresAuth = false) {
      const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
      const headers = new Headers(options.headers || {});

      if (!headers.has('Content-Type') && options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      if (requiresAuth) {
        const token = this.getToken();
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        headers.set('Authorization', `Bearer ${token}`);
      }

      let body = options.body;
      if (headers.get('Content-Type') === 'application/json' && body && typeof body === 'object' && !(body instanceof FormData)) {
        body = JSON.stringify(body);
      }

      const response = await fetch(url, { ...options, headers, body });
      const contentType = response.headers.get('content-type') || '';
      let payload;

      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }

      if (!response.ok) {
        const message = typeof payload === 'string' ? payload : payload?.error || payload?.message || 'Request failed';
        throw new Error(message);
      }

      return payload;
    },

    get(path, options = {}, requiresAuth = false) {
      return this.request(path, { ...options, method: 'GET' }, requiresAuth);
    },

    post(path, body, requiresAuth = false) {
      return this.request(path, { method: 'POST', body }, requiresAuth);
    },

    put(path, body, requiresAuth = false) {
      return this.request(path, { method: 'PUT', body }, requiresAuth);
    },

    delete(path, requiresAuth = false) {
      return this.request(path, { method: 'DELETE' }, requiresAuth);
    },
  };

  const AppState = {
    saveSearchQuery(query) {
      sessionStorage.setItem(STORAGE_KEYS.searchQuery, JSON.stringify(query));
    },

    getSearchQuery() {
      const raw = sessionStorage.getItem(STORAGE_KEYS.searchQuery);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },

    clearSearchQuery() {
      sessionStorage.removeItem(STORAGE_KEYS.searchQuery);
    },

    saveSelectedSchedule(selection) {
      sessionStorage.setItem(STORAGE_KEYS.selectedSchedule, JSON.stringify(selection));
    },

    getSelectedSchedule() {
      const raw = sessionStorage.getItem(STORAGE_KEYS.selectedSchedule);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },

    clearSelectedSchedule() {
      sessionStorage.removeItem(STORAGE_KEYS.selectedSchedule);
    },

    saveBookingCheckout(payload) {
      sessionStorage.setItem(STORAGE_KEYS.bookingCheckout, JSON.stringify(payload));
    },

    getBookingCheckout() {
      const raw = sessionStorage.getItem(STORAGE_KEYS.bookingCheckout);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },

    clearBookingCheckout() {
      sessionStorage.removeItem(STORAGE_KEYS.bookingCheckout);
    },

    setPostLoginRedirect(url) {
      sessionStorage.setItem(STORAGE_KEYS.postLoginRedirect, url);
    },

    consumePostLoginRedirect() {
      const url = sessionStorage.getItem(STORAGE_KEYS.postLoginRedirect);
      if (url) {
        sessionStorage.removeItem(STORAGE_KEYS.postLoginRedirect);
      }
      return url;
    },

    requireAuth(redirectUrl) {
      if (ApiClient.isAuthenticated()) {
        return true;
      }
      const targetUrl = redirectUrl || window.location.href;
      this.setPostLoginRedirect(targetUrl);

      const isInSrcDirectory = window.location.pathname.includes('/src/');
      const loginPath = isInSrcDirectory ? 'user-log-in.html' : './src/user-log-in.html';
      window.location.href = loginPath;
      return false;
    },
  };

  window.ApiClient = ApiClient;
  window.AppState = AppState;
})();

