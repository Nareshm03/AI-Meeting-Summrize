import { useEffect, ReactNode } from 'react';
import { useStaggerAnimation } from '@/hooks/useGSAP';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  staggerSelector?: string;
  animation?: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
}

export function PageTransition({
  children,
  className = '',
  stagger = false,
  staggerSelector = '.animate-item',
  animation = 'fadeIn'
}: PageTransitionProps) {
  const { containerRef, triggerAnimation } = useStaggerAnimation<HTMLDivElement>(
    staggerSelector,
    animation
  );

  useEffect(() => {
    if (stagger) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        triggerAnimation();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [stagger, triggerAnimation]);

  return (
    <div ref={containerRef} className={`min-h-screen ${className}`}>
      {children}
    </div>
  );
}

// Specialized page transitions
export function FadeInPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <PageTransition
      animation="fadeIn"
      stagger
      className={className}
    >
      {children}
    </PageTransition>
  );
}

export function SlideInPage({ 
  children, 
  direction = 'left',
  className = '' 
}: { 
  children: ReactNode; 
  direction?: 'left' | 'right';
  className?: string;
}) {
  return (
    <PageTransition
      animation={direction === 'left' ? 'slideInLeft' : 'slideInRight'}
      stagger
      className={className}
    >
      {children}
    </PageTransition>
  );
}

export function ScaleInPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <PageTransition
      animation="scaleIn"
      stagger
      className={className}
    >
      {children}
    </PageTransition>
  );
}