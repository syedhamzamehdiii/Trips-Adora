// customer-platform/frontend/src/services/chatService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

/**
 * Send a message to a supplier
 */
export const sendMessage = async (
  customerId,
  supplierId,
  message,
  { productId = null, replyToMessageId = null } = {}
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/send?customer_id=${customerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_id: supplierId,
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
 * Get all conversations for a customer
 */
export const getConversations = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/conversations?customer_id=${customerId}`);
    
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
export const getMessages = async (conversationId, customerId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/messages?customer_id=${customerId}`
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

export const deleteConversation = async (conversationId, customerId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}?customer_id=${customerId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

export const getUnreadCount = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/unread-count?customer_id=${customerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { unread_count: 0 };
  }
};

