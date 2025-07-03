import { forwardRef, ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useButtonAnimation } from '@/hooks/useGSAP';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  pulse?: boolean;
  ripple?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(({
  children,
  className = '',
  loading = false,
  loadingText = 'Loading...',
  icon,
  iconPosition = 'left',
  gradient = false,
  pulse = false,
  ripple = false,
  onClick,
  disabled,
  ...props
}, ref) => {
  const { ref: animRef, handleClick } = useButtonAnimation<HTMLButtonElement>();

  // Combine refs
  const combinedRef = (node: HTMLButtonElement) => {
    // Set our internal ref
    (animRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    
    // Forward to the external ref if provided
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      handleClick();
      if (onClick) onClick(e);
    }
  };

  const buttonContent = loading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin mr-2" />
      {loadingText}
    </>
  ) : (
    <>
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );

  return (
    <Button
      ref={combinedRef}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        gradient && 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
        pulse && 'animate-pulse',
        ripple && 'before:absolute before:inset-0 before:bg-white before:opacity-0 before:scale-0 before:rounded-full before:transition-all before:duration-300 hover:before:opacity-20 hover:before:scale-100',
        className
      )}
      onClick={handleButtonClick}
      disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </Button>
  );
});

AnimatedButton.displayName = 'AnimatedButton';

// Specialized button variants
export function PrimaryButton({ 
  children, 
  className = '', 
  ...props 
}: AnimatedButtonProps) {
  return (
    <AnimatedButton
      className={cn('bg-primary hover:bg-primary/90', className)}
      gradient
      ripple
      {...props}
    >
      {children}
    </AnimatedButton>
  );
}

export function SecondaryButton({ 
  children, 
  className = '', 
  ...props 
}: AnimatedButtonProps) {
  return (
    <AnimatedButton
      variant="secondary"
      className={cn('hover:bg-secondary/80', className)}
      ripple
      {...props}
    >
      {children}
    </AnimatedButton>
  );
}

export function GhostButton({ 
  children, 
  className = '', 
  ...props 
}: AnimatedButtonProps) {
  return (
    <AnimatedButton
      variant="ghost"
      className={cn('hover:bg-accent/50', className)}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
}

export function FloatingActionButton({
  children,
  className = '',
  ...props
}: AnimatedButtonProps) {
  return (
    <AnimatedButton
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl',
        'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
        'text-white border-0 z-50',
        className
      )}
      gradient
      ripple
      {...props}
    >
      {children}
    </AnimatedButton>
  );
}