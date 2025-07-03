import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface AnimatedTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  animation?: 'fade' | 'scale' | 'slide' | 'bounce';
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function AnimatedTooltip({
  children,
  content,
  position = 'top',
  trigger = 'hover',
  delay = 300,
  animation = 'scale',
  className = '',
  contentClassName = '',
  disabled = false
}: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 200; // Approximate width
    const tooltipHeight = 40; // Approximate height
    const offset = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        y = triggerRect.top - tooltipHeight - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - tooltipWidth - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipHeight - padding));

    setTooltipPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, position]);

  useEffect(() => {
    if (!tooltipRef.current) return;

    if (isVisible) {
      // Entry animation
      switch (animation) {
        case 'fade':
          gsap.fromTo(tooltipRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.2, ease: "power2.out" }
          );
          break;
        case 'scale':
          gsap.fromTo(tooltipRef.current,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.7)" }
          );
          break;
        case 'slide':
          const slideOffset = position === 'top' || position === 'bottom' ? 
            { y: position === 'top' ? 10 : -10 } : 
            { x: position === 'left' ? 10 : -10 };
          
          gsap.fromTo(tooltipRef.current,
            { opacity: 0, ...slideOffset },
            { opacity: 1, x: 0, y: 0, duration: 0.3, ease: "power2.out" }
          );
          break;
        case 'bounce':
          gsap.fromTo(tooltipRef.current,
            { opacity: 0, scale: 0.3 },
            { opacity: 1, scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" }
          );
          break;
      }
    }
  }, [isVisible, animation, position]);

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 transform rotate-45';
    
    switch (position) {
      case 'top':
        return cn(baseClasses, 'bottom-[-4px] left-1/2 -translate-x-1/2');
      case 'bottom':
        return cn(baseClasses, 'top-[-4px] left-1/2 -translate-x-1/2');
      case 'left':
        return cn(baseClasses, 'right-[-4px] top-1/2 -translate-y-1/2');
      case 'right':
        return cn(baseClasses, 'left-[-4px] top-1/2 -translate-y-1/2');
      default:
        return baseClasses;
    }
  };

  const handleTriggerEvents = () => {
    const events: { [key: string]: () => void } = {};

    switch (trigger) {
      case 'hover':
        events.onMouseEnter = showTooltip;
        events.onMouseLeave = hideTooltip;
        break;
      case 'click':
        events.onClick = () => isVisible ? hideTooltip() : showTooltip();
        break;
      case 'focus':
        events.onFocus = showTooltip;
        events.onBlur = hideTooltip;
        break;
    }

    return events;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-block', className)}
        {...handleTriggerEvents()}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg shadow-lg pointer-events-none',
            'max-w-xs break-words',
            contentClassName
          )}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          {content}
          <div className={getArrowClasses()} />
        </div>,
        document.body
      )}
    </>
  );
}

// Specialized tooltip variants
export function InfoTooltip({ 
  children, 
  info, 
  ...props 
}: Omit<AnimatedTooltipProps, 'content'> & { info: string }) {
  return (
    <AnimatedTooltip
      content={
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{info}</span>
        </div>
      }
      animation="bounce"
      {...props}
    >
      {children}
    </AnimatedTooltip>
  );
}

export function WarningTooltip({ 
  children, 
  warning, 
  ...props 
}: Omit<AnimatedTooltipProps, 'content'> & { warning: string }) {
  return (
    <AnimatedTooltip
      content={
        <div className="flex items-center space-x-2 text-yellow-100 bg-yellow-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{warning}</span>
        </div>
      }
      contentClassName="bg-yellow-600 text-yellow-100"
      animation="bounce"
      {...props}
    >
      {children}
    </AnimatedTooltip>
  );
}