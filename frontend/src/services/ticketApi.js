import { authFetch } from './api';

const API_BASE_URL = 'http://127.0.0.1:8080/api/resources/tickets';

export const getTickets = async ({ status, resourceId, userId } = {}) => {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (resourceId) params.append('resourceId', resourceId);
    if (userId) params.append('userId', userId);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await authFetch(url);
    if (!response.ok) throw new Error('Failed to fetch tickets');
    return response.json();
};

export const createTicket = async (ticket) => {
    console.log("[TicketAPI] Creating ticket at:", API_BASE_URL);
    const response = await authFetch(API_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(ticket)
    });
    if (!response.ok) throw new Error('Failed to create ticket');
    return response.json();
};

export const updateTicketStatus = async (id, status) => {
    const response = await authFetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update ticket status');
    return response.json();
};

export const updateTicket = async (id, ticketData) => {
    const response = await authFetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(ticketData)
    });
    if (!response.ok) throw new Error('Failed to update ticket');
    return response.json();
};

export const deleteTicket = async (id) => {
    const response = await authFetch(`${API_BASE_URL}/${id}`, { 
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete ticket');
};

export const getTicketComments = async (id) => {
    const response = await authFetch(`${API_BASE_URL}/${id}/comments`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
};

export const createTicketComment = async (id, comment) => {
    const response = await authFetch(`${API_BASE_URL}/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(comment)
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
};

export const deleteTicketComment = async (commentId) => {
    const response = await authFetch(`${API_BASE_URL}/comments/${commentId}`, { 
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete comment');
};

export const uploadTicketImages = async (id, files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await authFetch(`${API_BASE_URL}/${id}/images`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Failed to upload images');
    return response.json();
};
