import { toast, ToastOptions, TypeOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastConfig extends ToastOptions {
  type?: TypeOptions;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  progress?: number | undefined;
  theme?: 'light' | 'dark' | 'colored';
}

const defaultConfig: ToastConfig = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

export function useToast() {
  const showToast = (
    message: string,
    type: TypeOptions = 'info',
    config: Partial<ToastConfig> = {}
  ) => {
    const toastConfig: ToastConfig = {
      ...defaultConfig,
      ...config,
      type,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastConfig);
        break;
      case 'error':
        toast.error(message, toastConfig);
        break;
      case 'warning':
        toast.warning(message, toastConfig);
        break;
      case 'info':
      default:
        toast.info(message, toastConfig);
        break;
    }
  };

  const success = (message: string, config: Partial<ToastConfig> = {}) => {
    showToast(message, 'success', config);
  };

  const error = (message: string, config: Partial<ToastConfig> = {}) => {
    showToast(message, 'error', config);
  };

  const warning = (message: string, config: Partial<ToastConfig> = {}) => {
    showToast(message, 'warning', config);
  };

  const info = (message: string, config: Partial<ToastConfig> = {}) => {
    showToast(message, 'info', config);
  };

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const loading = (message: string, config: Partial<ToastConfig> = {}) => {
    const toastId = toast.loading(message, {
      ...defaultConfig,
      ...config,
      isLoading: true,
    });
    return toastId;
  };

  const update = (
    toastId: string | number,
    message: string,
    type: TypeOptions = 'info',
    config: Partial<ToastOptions> = {}
  ) => {
    toast.update(toastId, {
      render: message,
      type,
      isLoading: false,
      autoClose: 5000,
      ...config,
    });
  };

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    config: Partial<ToastConfig> = {}
  ) => {
    const toastId = loading(messages.pending, config);

    promise
      .then((data) => {
        const successMessage = typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success;
        
        update(toastId, successMessage, 'success', {
          ...config,
          autoClose: 3000,
        });
        
        return data;
      })
      .catch((error) => {
        const errorMessage = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error;
        
        update(toastId, errorMessage, 'error', {
          ...config,
          autoClose: 5000,
        });
        
        throw error;
      });

    return promise;
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    update,
    promise,
    toast, // Direct access to the toast object for advanced usage
  };
}

export default useToast;
