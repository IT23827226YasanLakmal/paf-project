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
