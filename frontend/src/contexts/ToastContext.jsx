import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiX, FiInfo, FiXCircle } from 'react-icons/fi';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    // Auto-dismiss logic should be handled by individual toast or via effect
    // But handled here for simplicity
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);
  const info = (message, duration) => addToast(message, 'info', duration);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ message, type, onRemove }) => {
  useEffect(() => {
    // Animation logic usually requires mounting/unmounting states
    // keeping it simple for now
  }, []);

  const styles = {
    success: 'bg-white border-l-4 border-green-500 text-gray-800',
    error: 'bg-white border-l-4 border-red-500 text-gray-800',
    warning: 'bg-white border-l-4 border-yellow-500 text-gray-800',
    info: 'bg-white border-l-4 border-blue-500 text-gray-800',
  };

  const icons = {
    success: <FiCheckCircle className="w-5 h-5 text-green-500" />,
    error: <FiXCircle className="w-5 h-5 text-red-500" />,
    warning: <FiAlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <FiInfo className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className={`pointer-events-auto flex items-start p-4 rounded shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 ${styles[type]}`}>
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
