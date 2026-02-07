import axios from 'axios';


// ============================================
// 🔥 API CLIENT CONFIGURATION
// ============================================


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});


// ============================================
// 🔥 REQUEST INTERCEPTOR
// ============================================


api.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);


// ============================================
// 🔥 RESPONSE INTERCEPTOR (FIXED)
// ============================================


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    console.error(`❌ [API] Error (${status}):`, message);
    
    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('userId');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
        
      case 403:
        break;
        
      case 404:
        break;
        
      case 409:
        // ✅ FIX: Handle conflict errors gracefully for user sync
        if (error.config?.url?.includes('/users/sync')) {
          // Don't reject, return the response
          return Promise.resolve(error.response);
        }
        break;
        
      case 429:
        console.warn('⚠️  Rate limit exceeded - Please slow down');
        break;
        
      case 500:
        console.error('💥 Server error');
        break;
        
      default:
        console.error('❌ Unknown error');
    }
    
    return Promise.reject({
      message,
      status,
      data: error.response?.data
    });
  }
);


// ============================================
// 🔥 USER API (FIXED)
// ============================================


export const userAPI = {
  /**
   * Sync user with backend (handles create and update)
   */
  sync: async (firebaseUser) => {
    try {
      const response = await api.post('/api/users/sync', {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified || false,
      });
      
      // Save userId to localStorage
      localStorage.setItem('userId', firebaseUser.uid);
      
      return response.data;
      
    } catch (error) {
      // ✅ GRACEFUL DEGRADATION: Don't fail if sync fails
      if (error.status === 409 || error.status === 200) {
        localStorage.setItem('userId', firebaseUser.uid);
        return { success: true, message: 'User already exists' };
      }
      
      console.error('❌ User sync failed:', error.message);
      
      // Still save userId for offline functionality
      localStorage.setItem('userId', firebaseUser.uid);
      
      // Don't throw error - allow user to continue
      return { success: false, error: error.message };
    }
  },


  getProfile: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },


  updateProfile: async (data) => {
    const response = await api.patch('/api/users/me', data);
    return response.data;
  },


  deleteAccount: async () => {
    const response = await api.delete('/api/users/me');
    return response.data;
  },
};


// ============================================
// 🔥 BOARD API
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
// 🔥 TODO API
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


  getStreak: async () => {
    const response = await api.get('/api/todos/streak');
    return response.data;
  }
};


export default api;
