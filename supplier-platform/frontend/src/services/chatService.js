// supplier-platform/frontend/src/services/chatService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Send a message to a customer
 */
export const sendMessage = async (customerId, message, productId = null) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipient_id: customerId,
        product_id: productId,
        message: message,
        message_type: 'general'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get all conversations for a supplier
 */
export const getConversations = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { conversations: [], total: 0 };
  }
};

/**
 * Get all messages in a conversation
 */
export const getMessages = async (conversationId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

