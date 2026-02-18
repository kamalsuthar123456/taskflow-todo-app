import axios from 'axios';

// ============================================
// 🔥 ENVIRONMENT HELPERS
// ============================================

const isDev = import.meta.env.DEV;

const log = {
  warn: (...args) => isDev && console.warn(...args),
  error: (...args) => isDev && console.error(...args),
};

// ============================================
// 🔥 API CLIENT CONFIGURATION
// ============================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
  (error) => Promise.reject(error)
);

// ============================================
// 🔥 RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (error.code === 'ECONNABORTED' || message?.includes('timeout')) {
      log.warn('⏱️ [API] Request timed out:', error.config?.url);
      return Promise.reject({
        message: 'Request timed out. Please check your connection.',
        status: undefined,
        data: undefined,
        isTimeout: true,
      });
    }

    if (!error.response) {
      log.warn('🔌 [API] Network error — backend may be offline');
      return Promise.reject({
        message: 'Cannot connect to server.',
        status: undefined,
        data: undefined,
        isNetworkError: true,
      });
    }

    // ✅ FIX 2: Correct auth redirect path to match your router
    if (status === 401) {
      localStorage.removeItem('userId');
      const currentPath = window.location.pathname;
      const authPaths = ['/auth', '/login', '/register'];
      const alreadyOnAuth = authPaths.some((p) => currentPath.includes(p));
      if (!alreadyOnAuth) {
        window.location.href = '/auth';
      }
    }

    // ✅ 409 conflict on user sync — treat as success
    if (status === 409 && error.config?.url?.includes('/users/sync')) {
      return Promise.resolve(error.response);
    }

    // ✅ Rate limit
    if (status === 429) {
      log.warn('⚠️ [API] Rate limit exceeded');
    }

    // ✅ Server error
    if (status === 500) {
      log.error('💥 [API] Internal server error:', error.config?.url);
    }

    return Promise.reject({
      message,
      status,
      data: error.response?.data,
    });
  }
);

// ============================================
// 🔥 USER SYNC — DUPLICATE GUARD + COOLDOWN
// ============================================

let syncInProgress = false;
let lastSyncTime = null;
const SYNC_COOLDOWN_MS = 30000;

export const userAPI = {

  sync: async (firebaseUser) => {
    // Guard: prevent parallel sync calls
    if (syncInProgress) {
      return { success: true, message: 'Sync already in progress' };
    }

    // Guard: cooldown — skip if recently synced
    const now = Date.now();
    if (lastSyncTime && (now - lastSyncTime) < SYNC_COOLDOWN_MS) {
      return { success: true, message: 'Recently synced' };
    }

    // ✅ Save userId immediately — app works even if backend is offline
    localStorage.setItem('userId', firebaseUser.uid);

    syncInProgress = true;

    try {
      const response = await api.post(
        '/api/users/sync',
        {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName:
            firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified || false,
        },
        { timeout: 5000 }
      );

      lastSyncTime = Date.now();
      return response.data;

    } catch (error) {
      // Timeout or network — silent degradation
      if (error.isTimeout || error.isNetworkError) {
        return { success: false, offline: true };
      }

      // 409 — user already exists, that is fine
      if (error.status === 409) {
        lastSyncTime = Date.now();
        return { success: true, message: 'User already synced' };
      }

      // Any other error — do not crash
      log.error('❌ [userAPI] sync failed:', error.message);
      return { success: false, error: error.message };

    } finally {
      // ✅ FIX 5: Always release lock even on HMR/unexpected errors
      syncInProgress = false;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      log.error('❌ [userAPI] getProfile failed:', error.message);
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.patch('/api/users/me', data);
      return response.data;
    } catch (error) {
      log.error('❌ [userAPI] updateProfile failed:', error.message);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await api.delete('/api/users/me');
      return response.data;
    } catch (error) {
      log.error('❌ [userAPI] deleteAccount failed:', error.message);
      throw error;
    }
  },
};

// ============================================
// 🔥 BOARD API — WITH ERROR HANDLING
// ============================================

export const boardAPI = {

  // ✅ FIX 3: Added try/catch to all board methods
  getAll: async () => {
    try {
      const response = await api.get('/api/boards');
      return response.data;
    } catch (error) {
      log.error('❌ [boardAPI] getAll failed:', error.message);
      throw error;
    }
  },

  create: async (boardData) => {
    try {
      const response = await api.post('/api/boards', boardData);
      return response.data;
    } catch (error) {
      log.error('❌ [boardAPI] create failed:', error.message);
      throw error;
    }
  },

  update: async (boardId, boardData) => {
    try {
      const response = await api.put(`/api/boards/${boardId}`, boardData);
      return response.data;
    } catch (error) {
      log.error('❌ [boardAPI] update failed:', error.message);
      throw error;
    }
  },

  delete: async (boardId) => {
    try {
      const response = await api.delete(`/api/boards/${boardId}`);
      return response.data;
    } catch (error) {
      log.error('❌ [boardAPI] delete failed:', error.message);
      throw error;
    }
  },
};

// ============================================
// 🔥 TODO API — WITH ERROR HANDLING
// ============================================

export const todoAPI = {

  getByBoard: async (boardId) => {
    try {
      const response = await api.get(`/api/boards/${boardId}/todos`);
      return response.data;
    } catch (error) {
      log.error('❌ [todoAPI] getByBoard failed:', error.message);
      throw error;
    }
  },

  create: async (boardId, todoData) => {
    try {
      const response = await api.post(`/api/boards/${boardId}/todos`, todoData);
      return response.data;
    } catch (error) {
      log.error('❌ [todoAPI] create failed:', error.message);
      throw error;
    }
  },

  update: async (boardId, todoId, todoData) => {
    try {
      const response = await api.put(
        `/api/boards/${boardId}/todos/${todoId}`,
        todoData
      );
      return response.data;
    } catch (error) {
      log.error('❌ [todoAPI] update failed:', error.message);
      throw error;
    }
  },

  toggle: async (boardId, todoId) => {
    try {
      const response = await api.patch(
        `/api/boards/${boardId}/todos/${todoId}/toggle`
      );
      return response.data;
    } catch (error) {
      log.error('❌ [todoAPI] toggle failed:', error.message);
      throw error;
    }
  },

  delete: async (boardId, todoId) => {
    try {
      const response = await api.delete(
        `/api/boards/${boardId}/todos/${todoId}`
      );
      return response.data;
    } catch (error) {
      log.error('❌ [todoAPI] delete failed:', error.message);
      throw error;
    }
  },

  // ✅ FIX 6: Streak is a standalone route — not board-scoped
  getStreak: async () => {
    try {
      const response = await api.get('/api/todos/streak');
      return response.data;
    } catch (error) {
      log.error('❌ [todoAPI] getStreak failed:', error.message);
      throw error;
    }
  },
};

export default api;
