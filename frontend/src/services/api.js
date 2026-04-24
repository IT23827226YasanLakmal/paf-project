const API_BASE_URL = 'http://localhost:8080/api';

const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Default to application/json if no Content-Type is provided and it's not FormData
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    } else if (options.body instanceof FormData) {
        delete headers['Content-Type']; // Let browser set multipart/form-data with boundary
    }

    const response = await fetch(url, { ...options, headers });
    return response;
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
    body: JSON.stringify({ status, rejectionReason, adminNote }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));

    console.error(" Backend error:", errData); // helpful debug

    const err = new Error(
      errData.message || errData.error || 'Failed to update booking status'
    );
    err.response = { status: response.status, data: errData };
    throw err;
  }

  return response.json();
};

export const deleteBooking = async ({ id }) => {
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

//  NOTIFICATIONS
export const fetchNotifications = async () => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
};

export const deleteNotification = async (id) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to delete notification");
};

export const markAsRead = async (id) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to mark as read");
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
};
