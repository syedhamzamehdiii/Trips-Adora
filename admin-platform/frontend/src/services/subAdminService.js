// Sub-Admin Service
import { apiService } from './api';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://admin.tripsadora.com/api';

class SubAdminService {
  // Invite a sub-admin
  async inviteSubAdmin(email, permissions, personalMessage = null) {
    try {
      // Get admin token using authService
      const adminToken = authService.getToken();
      if (!adminToken) {
        throw new Error('Admin authentication required. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/sub-admins/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          email,
          permissions,
          personal_message: personalMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // If token is invalid/expired, clear auth and redirect to login
        if (response.status === 401) {
          authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(error.detail || 'Failed to send invite');
      }

      return await response.json();
    } catch (error) {
      console.error('Error inviting sub-admin:', error);
      throw error;
    }
  }

  // List all sub-admins
  async listSubAdmins(page = 1, pageSize = 20) {
    try {
      // Get admin token using authService
      const adminToken = authService.getToken();
      if (!adminToken) {
        throw new Error('Admin authentication required. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/sub-admins/list?page=${page}&page_size=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      if (!response.ok) {
        // If token is invalid/expired, clear auth and redirect to login
        if (response.status === 401) {
          authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to fetch sub-admins');
      }
      return await response.json();
    } catch (error) {
      console.error('Error listing sub-admins:', error);
      throw error;
    }
  }

  // Login sub-admin (supports direct token-based access)
  async login(email, token = null) {
    try {
      // If token is provided, use query params for direct access
      const url = token && email
        ? `${API_BASE_URL}/api/v1/sub-admins/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        : `${API_BASE_URL}/api/v1/sub-admins/login${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: email ? JSON.stringify({ email }) : JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user info
      if (data.access_token) {
        localStorage.setItem('sub_admin_token', data.access_token);
        localStorage.setItem('sub_admin_user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Error logging in sub-admin:', error);
      throw error;
    }
  }

  // Update sub-admin permissions
  async updatePermissions(subAdminId, permissions) {
    try {
      // Get admin token using authService
      const adminToken = authService.getToken();
      if (!adminToken) {
        throw new Error('Admin authentication required. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/sub-admins/${subAdminId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(permissions),
      });

      if (!response.ok) {
        const error = await response.json();
        // If token is invalid/expired, clear auth and redirect to login
        if (response.status === 401) {
          authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(error.detail || 'Failed to update permissions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  }

  // Delete/deactivate sub-admin
  async deleteSubAdmin(subAdminId) {
    try {
      // Get admin token using authService
      const adminToken = authService.getToken();
      if (!adminToken) {
        throw new Error('Admin authentication required. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/sub-admins/${subAdminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        // If token is invalid/expired, clear auth and redirect to login
        if (response.status === 401) {
          authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(error.detail || 'Failed to delete sub-admin');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting sub-admin:', error);
      throw error;
    }
  }
}

const subAdminService = new SubAdminService();
export default subAdminService;

