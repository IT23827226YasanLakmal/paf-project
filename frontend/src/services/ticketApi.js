const API_BASE_URL = 'http://localhost:8080/api/tickets';

export const getTickets = async (status, resourceId) => {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (resourceId) params.append('resourceId', resourceId);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch tickets');
    return response.json();
};

export const createTicket = async (ticket) => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
    });
    if (!response.ok) throw new Error('Failed to create ticket');
    return response.json();
};

export const updateTicketStatus = async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update ticket');
    return response.json();
};

export const deleteTicket = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete ticket');
};

export const getTicketComments = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}/comments`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
};

export const createTicketComment = async (id, comment) => {
    const response = await fetch(`${API_BASE_URL}/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
};

export const deleteTicketComment = async (commentId) => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete comment');
};
