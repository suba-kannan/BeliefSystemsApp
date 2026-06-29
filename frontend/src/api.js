import { storage } from './utils/storage';

const getHeaders = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = await storage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  request: async (endpoint, options = {}) => {
    const baseUrl = await storage.getApiUrl();
    // Normalize trailing slash
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${cleanBaseUrl}${cleanEndpoint}`;

    const headers = await getHeaders();
    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error.message);
      throw error;
    }
  },

  login: async (email, password) => {
    return api.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password, role) => {
    return api.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  getProfile: async () => {
    return api.request('/users/profile');
  },

  getStudents: async () => {
    return api.request('/users/students');
  },

  updateMarks: async (studentId, marks) => {
    return api.request(`/users/students/${studentId}/marks`, {
      method: 'PUT',
      body: JSON.stringify(marks),
    });
  },

  createUpdate: async (title, content) => {
    return api.request('/users/updates', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  },

  getUpdates: async () => {
    return api.request('/users/updates');
  },

  getStats: async () => {
    return api.request('/users/stats');
  }
};
