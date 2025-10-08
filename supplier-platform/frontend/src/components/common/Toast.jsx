import { toast as toastify } from 'react-toastify';

export const toast = {
  success: (message, options = {}) => {
    toastify.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  error: (message, options = {}) => {
    toastify.error(message, {
      position: 'top-right',
      autoClose: 3000,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toastify.warning(message, {
      position: 'top-right',
      autoClose: 3000,
      ...options,
    });
  },

  info: (message, options = {}) => {
    toastify.info(message, {
      position: 'top-right',
      autoClose: 3000,
      ...options,
    });
  },
};

export default toast;
