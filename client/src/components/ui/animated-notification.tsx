import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
    iconColor: 'text-green-500'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
    iconColor: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500'
  }
};

export function AnimatedNotification({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const notificationRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const config = notificationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (!notificationRef.current) return;

    const element = notificationRef.current;
    
    // Entry animation
    gsap.fromTo(element, 
      { 
        x: 400, 
        opacity: 0, 
        scale: 0.8,
        rotationY: 90
      },
      { 
        x: 0, 
        opacity: 1, 
        scale: 1,
        rotationY: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }
    );

    // Progress bar animation
    if (progressRef.current && duration > 0) {
      gsap.fromTo(progressRef.current,
        { scaleX: 1 },
        { 
          scaleX: 0,
          duration: duration / 1000,
          ease: "none",
          transformOrigin: "left center"
        }
      );
    }

    // Auto close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    if (!notificationRef.current) return;

    setIsVisible(false);
    
    // Exit animation
    gsap.to(notificationRef.current, {
      x: 400,
      opacity: 0,
      scale: 0.8,
      rotationY: -90,
      duration: 0.4,
      ease: "back.in(1.7)",
      onComplete: () => onClose(id)
    });
  };

  if (!isVisible) return null;

  return (
    <div
      ref={notificationRef}
      className={cn(
        'relative overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        'min-w-[320px] max-w-[400px]',
        config.className
      )}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
          <div
            ref={progressRef}
            className="h-full bg-current opacity-30"
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          {message && (
            <p className="text-sm opacity-90 mt-1">{message}</p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Notification container
export function NotificationContainer({ 
  notifications, 
  onClose 
}: { 
  notifications: NotificationProps[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <AnimatedNotification
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id, onClose: removeNotification }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    addNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    addNotification({ type: 'error', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    addNotification({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    addNotification({ type: 'info', title, message });
  };

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification
  };
}