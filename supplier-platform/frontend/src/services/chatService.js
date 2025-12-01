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
export const sendMessage = async (
  customerId,
  message,
  { productId = null, replyToMessageId = null } = {}
) => {
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
        message_type: 'general',
        reply_to_message_id: replyToMessageId
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

export const deleteConversation = async (conversationId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { unread_count: 0 };
  }
};

/**
 * Get simple reply analytics for supplier (replies sent per day)
 */
export const getResponseAnalytics = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/messages/response-analytics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response analytics');
    }

    const data = await response.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch (error) {
    console.error('Error fetching response analytics:', error);
    return [];
  }
};

