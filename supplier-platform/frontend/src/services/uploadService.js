import { apiService } from './api';
import config from '@/config';

export const uploadService = {
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiService.upload(config.endpoints.upload, formData, onUploadProgress);
  },

  uploadMultipleFiles: async (files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    return await apiService.upload(config.endpoints.upload, formData, onUploadProgress);
  },
};