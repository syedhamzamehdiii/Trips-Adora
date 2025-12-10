import { apiService } from './api';

export const messageService = {
  getConversations: async ({ participantType, search } = {}) => {
    const params = {};
    if (participantType) params.participant_type = participantType;
    if (search) params.search = search;
    return await apiService.get('/messages/conversations', params);
  },
  getMessages: async (conversationId) => {
    return await apiService.get(`/messages/conversations/${conversationId}/messages`);
  },
  sendMessage: async ({ recipientType, recipientId, message, adminName = 'Admin' }) => {
    return await apiService.post('/messages/send', {
      recipient_type: recipientType,
      recipient_id: recipientId,
      message,
      admin_name: adminName,
    });
  },
  deleteConversation: async (conversationId) => {
    return await apiService.delete(`/messages/conversations/${conversationId}`);
  },
};

