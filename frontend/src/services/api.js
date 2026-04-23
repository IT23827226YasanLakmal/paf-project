const API_BASE_URL = 'http://localhost:8080/api';

export const fetchResources = async (type = null) => {
    const url = type ? `${API_BASE_URL}/resources?type=${type}` : `${API_BASE_URL}/resources`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch resources');
    return response.json();
};

export const createResource = async (resource) => {
    const response = await fetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource),
    });
    if (!response.ok) throw new Error('Failed to create resource');
    return response.json();
};

export const updateResourceStatus = async (id, status) => {
    const resourceResponse = await fetch(`${API_BASE_URL}/resources/${id}`);
    if (!resourceResponse.ok) throw new Error('Failed to fetch resource details');
    const resource = await resourceResponse.json();
    
    resource.status = status;
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource),
    });
    if (!response.ok) throw new Error('Failed to update resource');
    return response.json();
};

export const deleteResource = async (id) => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete resource');
};

export const createBooking = async (data) => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
};

export const updateBookingStatus = async ({ id, status, rejectionReason, adminNote }) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'X-User-Id': '1',        
      'X-Is-Admin': 'true'   
    },
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
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    method: 'DELETE',
    headers: {
      'X-User-Id': '1',
      'X-Is-Admin': 'true'
    }
  });

  if (!response.ok) throw new Error('Failed to delete booking');
};
export const uploadResourceImage = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/resources/${id}/image`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
};
