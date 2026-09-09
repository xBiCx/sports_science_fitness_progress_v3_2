/* Sports Science Fitness Club API Client */
(() => {
  const API_BASE = 'http://localhost:5050/api';

  function getToken() {
    return localStorage.getItem('ssf_token') || '';
  }

  function setToken(token) {
    if (token) localStorage.setItem('ssf_token', token);
    else localStorage.removeItem('ssf_token');
  }

  async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
      return data;
    } catch (err) {
      console.warn(`[API Call Fallback] ${endpoint}:`, err.message);
      throw err;
    }
  }

  window.SSFAPI = {
    getToken,
    setToken,
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    googleLogin: (credential, demo = false, profile = null) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential, demo, profile }) }),
    getCurrentUser: () => request('/auth/me'),

    getHealthProfile: () => request('/health/me'),
    saveHealthProfile: (data) => request('/health/me', { method: 'POST', body: JSON.stringify(data) }),

    getTrainers: () => request('/trainers'),
    getTrainerById: (id) => request(`/trainers/${id}`),

    getPackages: () => request('/packages'),

    getBookings: () => request('/bookings/my-bookings'),
    createBooking: (data) => request('/bookings/create', { method: 'POST', body: JSON.stringify(data) }),
    getCheckinStatus: () => request('/bookings/checkin-status'),
    performCheckin: () => request('/bookings/checkin', { method: 'POST' })
  };
})();
