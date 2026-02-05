import axios from 'axios';

// ============================================
// API CLIENT CONFIGURATION
// ============================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config) => {
    // Get Firebase user ID from localStorage
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      config.headers['x-user-id'] = userId;
      console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url} [User: ${userId.substring(0, 8)}...]`);
    } else {
      console.warn('⚠️  No userId in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - User needs to login');
      localStorage.removeItem('userId');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// USER APIs
// ============================================

export const userAPI = {
  sync: async (firebaseUser) => {
    try {
      const response = await api.post('/api/users/sync', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        emailVerified: firebaseUser.emailVerified || false,
      });
      
      // Save userId to localStorage
      localStorage.setItem('userId', firebaseUser.uid);
      
      console.log('✅ User synced with backend');
      return response.data;
    } catch (error) {
      console.error('❌ User sync failed:', error);
      throw error;
    }
  },
};

// ============================================
// BOARD APIs
// ============================================

export const boardAPI = {
  getAll: async () => {
    const response = await api.get('/api/boards');
    return response.data;
  },

  create: async (boardData) => {
    const response = await api.post('/api/boards', boardData);
    return response.data;
  },

  update: async (boardId, boardData) => {
    const response = await api.put(`/api/boards/${boardId}`, boardData);
    return response.data;
  },

  delete: async (boardId) => {
    const response = await api.delete(`/api/boards/${boardId}`);
    return response.data;
  },
};

// ============================================
// TODO APIs
// ============================================

export const todoAPI = {
  getByBoard: async (boardId) => {
    const response = await api.get(`/api/boards/${boardId}/todos`);
    return response.data;
  },

  create: async (boardId, todoData) => {
    const response = await api.post(`/api/boards/${boardId}/todos`, todoData);
    return response.data;
  },

  update: async (boardId, todoId, todoData) => {
    const response = await api.put(`/api/boards/${boardId}/todos/${todoId}`, todoData);
    return response.data;
  },

  toggle: async (boardId, todoId) => {
    const response = await api.patch(`/api/boards/${boardId}/todos/${todoId}/toggle`);
    return response.data;
  },

  delete: async (boardId, todoId) => {
    const response = await api.delete(`/api/boards/${boardId}/todos/${todoId}`);
    return response.data;
  },
};

export default api;
