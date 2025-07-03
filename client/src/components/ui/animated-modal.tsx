import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation?: 'scale' | 'slide' | 'fade' | 'flip' | 'bounce';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]'
};

export function AnimatedModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  animation = 'scale',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = ''
}: AnimatedModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !modalRef.current) return;

    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Entry animations
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // Modal entry animation based on type
      switch (animation) {
        case 'scale':
          gsap.fromTo(modalRef.current,
            { scale: 0.7, opacity: 0, rotationX: -15 },
            { 
              scale: 1, 
              opacity: 1, 
              rotationX: 0,
              duration: 0.4, 
              ease: "back.out(1.7)",
              delay: 0.1
            }
          );
          break;
        
        case 'slide':
          gsap.fromTo(modalRef.current,
            { y: -100, opacity: 0 },
            { 
              y: 0, 
              opacity: 1,
              duration: 0.5, 
              ease: "power3.out",
              delay: 0.1
            }
          );
          break;
        
        case 'fade':
          gsap.fromTo(modalRef.current,
            { opacity: 0 },
            { 
              opacity: 1,
              duration: 0.4,
              delay: 0.1
            }
          );
          break;
        
        case 'flip':
          gsap.fromTo(modalRef.current,
            { rotationY: -90, opacity: 0 },
            { 
              rotationY: 0, 
              opacity: 1,
              duration: 0.6, 
              ease: "back.out(1.7)",
              delay: 0.1
            }
          );
          break;
        
        case 'bounce':
          gsap.fromTo(modalRef.current,
            { scale: 0, opacity: 0, rotation: 180 },
            { 
              scale: 1, 
              opacity: 1, 
              rotation: 0,
              duration: 0.8, 
              ease: "elastic.out(1, 0.5)",
              delay: 0.1
            }
          );
          break;
      }

      // Stagger content animation
      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll('.animate-item');
        gsap.fromTo(elements,
          { y: 20, opacity: 0 },
          { 
            y: 0, 
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            delay: 0.3,
            ease: "power2.out"
          }
        );
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, animation]);

  const handleClose = () => {
    if (!overlayRef.current || !modalRef.current) return;

    // Exit animations
    gsap.to(modalRef.current, {
      scale: 0.8,
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in"
    });

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: "power2.in",
      onComplete: onClose
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative bg-background rounded-xl shadow-2xl border border-border',
          'max-h-[90vh] overflow-hidden',
          sizeClasses[size],
          className
        )}
        style={{ perspective: '1000px' }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="animate-item flex items-center justify-between p-6 border-b border-border">
            {title && (
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          ref={contentRef}
          className="overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Specialized modal variants
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}) {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      animation="bounce"
    >
      <div className="p-6 space-y-4">
        <p className="animate-item text-muted-foreground">{message}</p>
        
        <div className="animate-item flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
}