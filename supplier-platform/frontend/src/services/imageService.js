import { apiService } from './api';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const imageService = {
  uploadImage: async (file, { folder = 'products', onUploadProgress } = {}) => {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const formData = new FormData();
    formData.append('file', file);

    return await apiService.upload(
      `/images/upload${buildQuery({ folder })}`,
      formData,
      onUploadProgress
    );
  },

  uploadImages: async (files, { folder = 'products', onUploadProgress } = {}) => {
    if (!files?.length) {
      throw new Error('No files provided for upload');
    }
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return await apiService.upload(
      `/images/upload/multiple${buildQuery({ folder })}`,
      formData,
      onUploadProgress
    );
  },

  deleteImage: async (publicId) => {
    if (!publicId) return;
    // Encode slashes to ensure valid URL
    const encodedId = encodeURIComponent(publicId);
    return await apiService.delete(`/images/${encodedId}`);
  },
};

export default imageService;


