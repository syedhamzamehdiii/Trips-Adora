const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tripsadora.com/api/v1';

const parseErrorMessage = async (response) => {
  try {
    const data = await response.clone().json();
    if (data?.detail) {
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
  } catch (_) {
    /* ignore json parsing errors */
  }

  try {
    const text = await response.text();
    if (text) {
      return text;
    }
  } catch (_) {
    /* ignore text parsing errors */
  }

  return 'Request failed';
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const getBookings = async (userId) => {
  if (!userId) {
    throw new Error('userId is required to fetch bookings');
  }
  const response = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(userId)}`);
  const data = await handleResponse(response);
  return Array.isArray(data?.bookings) ? data.bookings : [];
};

export const createBooking = async (userId, payload) => {
  if (!userId) {
    throw new Error('userId is required to create a booking');
  }
  const response = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const cancelBooking = async (userId, bookingId, reason) => {
  if (!userId) {
    throw new Error('userId is required to cancel a booking');
  }
  if (!bookingId) {
    throw new Error('bookingId is required to cancel a booking');
  }
  const payload = { reason: reason?.trim() || '' };
  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(userId)}/${encodeURIComponent(bookingId)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
  return handleResponse(response);
};

export const deleteBooking = async (userId, bookingId) => {
  if (!userId) {
    throw new Error('userId is required to delete a booking');
  }
  if (!bookingId) {
    throw new Error('bookingId is required to delete a booking');
  }
  const response = await fetch(
    `${API_BASE_URL}/bookings/${encodeURIComponent(userId)}/${encodeURIComponent(bookingId)}/delete`,
    {
      method: 'DELETE',
    },
  );
  return handleResponse(response);
};

export default {
  getBookings,
  createBooking,
  cancelBooking,
  deleteBooking,
};


