import toast from 'react-hot-toast';

// Custom toast configurations
const toastConfig = {
  success: {
    duration: 2000,
    style: {
      background: '#10b981',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  },
  error: {
    duration: 3000,
    style: {
      background: '#ef4444',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3)',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  },
  loading: {
    style: {
      background: '#6366f1',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#6366f1',
    },
  },
};

// Custom toast functions
export const showToast = {
  success: (message) => toast.success(message, toastConfig.success),
  error: (message) => toast.error(message, toastConfig.error),
  loading: (message) => toast.loading(message, toastConfig.loading),
};

// For updating existing toast (like loading -> success)
export const updateToast = {
  success: (id, message) => toast.success(message, { id, ...toastConfig.success }),
  error: (id, message) => toast.error(message, { id, ...toastConfig.error }),
};

export default showToast;
