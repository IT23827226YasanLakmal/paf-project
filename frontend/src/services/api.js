const API_BASE_URL = 'http://127.0.0.1:8080/api';

export const authFetch = async (url, options = {}, retries = 3, backoff = 300) => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    if (user) {
        // Use supabaseUid (String) for the custom header
        headers['X-User-Id'] = user.supabaseUid || user.id;
        if (user.role === 'ADMIN' || user.role === 'BOOKING_OFFICER' || user.role === 'FACILITY_MANAGER') {
            headers['X-Is-Admin'] = 'true';
        }
    }
    
    Object.assign(headers, options.headers);
    
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    } else if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, { ...options, headers });
            
            // Intercept 401 Unauthenticated sessions
            if (response.status === 401) {
                const currentPath = window.location.pathname;
                if (currentPath !== '/login' && currentPath !== '/signup') {
                    console.warn('[Resilience] Unauthorized access detected. Session may be invalid.');
                    // Don't nukes the storage immediately to prevent flickering loops
                    // Only redirect if we are deep in the app
                    if (currentPath.startsWith('/app')) {
                        window.location.href = '/login?expired=true';
                    }
                }
                return response;
            }

            return response;
        } catch (error) {
            console.error(`[Resilience] Attempt ${attempt} failed for ${url}. Error:`, error);
            if (attempt === retries) throw error;
            await new Promise(res => setTimeout(res, backoff * Math.pow(2, attempt - 1)));
        }
    }
};

export const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
};

export const register = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
};

export const fetchResources = async (type = null) => {
    const url = type ? `${API_BASE_URL}/resources?type=${type}` : `${API_BASE_URL}/resources`;
    const response = await authFetch(url);
    if (!response.ok) throw new Error('Failed to fetch resources');
    return response.json();
};

export const createResource = async (resource) => {
    const response = await authFetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        body: JSON.stringify(resource),
    });
    if (!response.ok) throw new Error('Failed to create resource');
    return response.json();
};

export const updateResource = async (id, updatedData) => {
    const resourceResponse = await authFetch(`${API_BASE_URL}/resources/${id}`);
    if (!resourceResponse.ok) throw new Error('Failed to fetch resource details');
    const existing = await resourceResponse.json();
    
    const payload = { ...existing, ...updatedData };
    const response = await authFetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update resource');
    return response.json();
};

export const updateResourceStatus = async (id, status) => {
    const resourceResponse = await authFetch(`${API_BASE_URL}/resources/${id}`);
    if (!resourceResponse.ok) throw new Error('Failed to fetch resource details');
    const resource = await resourceResponse.json();
    
    resource.status = status;
    const response = await authFetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(resource),
    });
    if (!response.ok) throw new Error('Failed to update resource');
    return response.json();
};

export const deleteResource = async (id) => {
    const response = await authFetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete resource');
};

export const createBooking = async (data) => {
  const response = await authFetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.status === 409) {
    const errData = await response.json();
    const err = new Error(errData.message || 'Scheduling conflict');
    err.response = { status: 409, data: errData };
    throw err;
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const err = new Error(errData.message || 'Failed to create booking');
    err.response = { status: response.status, data: errData };
    throw err;
  }

  return response.json();
};

export const updateBooking = async (id, data) => {
  const response = await authFetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (response.status === 409) {
    const errData = await response.json();
    const err = new Error(errData.message || 'Scheduling conflict');
    err.response = { status: 409, data: errData };
    throw err;
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const err = new Error(errData.message || 'Failed to update booking');
    err.response = { status: response.status, data: errData };
    throw err;
  }

  return response.json();
};

export const fetchBookings = async ({ userId, resourceId, status } = {}) => {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  if (resourceId) params.set('resourceId', resourceId);
  if (status) params.set('status', status);

  const qs = params.toString();
  const url = `${API_BASE_URL}/bookings${qs ? `?${qs}` : ''}`;

  const response = await authFetch(url);
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
};

export const updateBookingStatus = async ({ id, status, rejectionReason, adminNote }) => {
  const response = await authFetch(`${API_BASE_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'X-Is-Admin': 'true',
      'X-User-Id': (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).supabaseUid : 'null'),
    },
    body: JSON.stringify({ status, rejectionReason, adminNote }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error("Backend error:", errData);
    const err = new Error(
      errData.message || errData.error || 'Failed to update booking status'
    );
    err.response = { status: response.status, data: errData };
    throw err;
  }

  return response.json();
};

export const deleteBooking = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to delete booking');
};

export const uploadResourceImage = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await authFetch(`${API_BASE_URL}/resources/${id}/image`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
};

export const fetchUsers = async () => {
  const response = await authFetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

export const updateUserRole = async (id, role) => {
  const response = await authFetch(`${API_BASE_URL}/users/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error("Failed to update user role");
  return response.json();
};

//  NOTIFICATIONS
export const fetchNotifications = async () => {
  const response = await authFetch(`${API_BASE_URL}/notifications`);
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
};

export const deleteNotification = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/notifications/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete notification");
};

export const markAsRead = async (id) => {
  const response = await authFetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error("Failed to mark as read");
};

export const getCurrentUser = async () => {
  const response = await authFetch(`${API_BASE_URL}/users/me`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
};

const API = {
  fetchUsers,
  updateUserRole,
  fetchNotifications,
  deleteNotification,
  markAsRead,
  getCurrentUser
};

export default API;