const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

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
  uploadImage: async (file, { folder = 'customer', onUploadProgress } = {}) => {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onUploadProgress) {
          const percentCompleted = Math.round((e.loaded * 100) / e.total);
          onUploadProgress(percentCompleted);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || error.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      const token = localStorage.getItem('access_token');
      xhr.open('POST', `${API_BASE_URL}/images/upload${buildQuery({ folder })}`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  },

  deleteImage: async (publicId) => {
    if (!publicId) return;
    const encodedId = encodeURIComponent(publicId);
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/images/${encodedId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
    return response.json();
  },
};

export default imageService;

