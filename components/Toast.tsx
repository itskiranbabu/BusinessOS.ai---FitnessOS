import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'error': return <AlertCircle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success': return 'border-green-100 bg-white dark:bg-slate-800 dark:border-green-900/30 text-slate-800 dark:text-slate-100';
      case 'error': return 'border-red-100 bg-white dark:bg-slate-800 dark:border-red-900/30 text-slate-800 dark:text-slate-100';
      default: return 'border-blue-100 bg-white dark:bg-slate-800 dark:border-blue-900/30 text-slate-800 dark:text-slate-100';
    }
  };

  return (
    <div className={`min-w-[300px] max-w-md p-4 rounded-xl shadow-xl border flex items-start gap-3 animate-slide-up transition-all ${getStyles()}`}>
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastContainer;