// Frontend/src/services/messageService.js
import { apiService } from './api';
import config from '@/config';

export const messageService = {
  getMessages: async (params = {}) => {
    return await apiService.get(config.endpoints.messages.list, params);
  },

  getMessage: async (id) => {
    return await apiService.get(config.endpoints.messages.detail(id));
  },

  sendMessage: async (messageData) => {
    return await apiService.post(config.endpoints.messages.send, messageData);
  },

  markAsRead: async (id) => {
    return await apiService.put(config.endpoints.messages.markRead(id));
  },
};