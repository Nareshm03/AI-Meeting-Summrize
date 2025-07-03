import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Brain, Zap, Sparkles } from 'lucide-react';

interface AnimatedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'wave' | 'brain' | 'dots';
  text?: string;
  className?: string;
}

export function AnimatedLoader({ 
  size = 'md', 
  variant = 'brain', 
  text = 'Processing...', 
  className = '' 
}: AnimatedLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ repeat: -1 });

    switch (variant) {
      case 'brain':
        // Brain pulsing animation
        if (iconRef.current) {
          tl.to(iconRef.current, {
            scale: 1.2,
            duration: 0.8,
            ease: "sine.inOut"
          })
          .to(iconRef.current, {
            scale: 1,
            duration: 0.8,
            ease: "sine.inOut"
          });

          // Add glow effect
          gsap.to(iconRef.current, {
            filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))",
            duration: 1.6,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        }
        break;

      case 'spinner':
        if (iconRef.current) {
          gsap.to(iconRef.current, {
            rotation: 360,
            duration: 1,
            repeat: -1,
            ease: "none"
          });
        }
        break;

      case 'pulse':
        if (iconRef.current) {
          tl.to(iconRef.current, {
            opacity: 0.3,
            scale: 0.8,
            duration: 0.6,
            ease: "sine.inOut"
          })
          .to(iconRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "sine.inOut"
          });
        }
        break;

      case 'wave':
        if (dotsRef.current) {
          const dots = dotsRef.current.children;
          gsap.to(dots, {
            y: -8,
            duration: 0.6,
            yoyo: true,
            repeat: -1,
            stagger: 0.1,
            ease: "sine.inOut"
          });
        }
        break;

      case 'dots':
        if (dotsRef.current) {
          const dots = dotsRef.current.children;
          gsap.to(dots, {
            opacity: 0.3,
            duration: 0.6,
            yoyo: true,
            repeat: -1,
            stagger: 0.2,
            ease: "sine.inOut"
          });
        }
        break;
    }

    // Text animation
    if (textRef.current && text) {
      gsap.to(textRef.current, {
        opacity: 0.6,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }

    return () => {
      tl.kill();
      gsap.killTweensOf([iconRef.current, dotsRef.current, textRef.current]);
    };
  }, [variant, text]);

  const renderIcon = () => {
    switch (variant) {
      case 'brain':
        return <Brain className={`${sizeClasses[size]} text-blue-500`} />;
      case 'spinner':
        return <Zap className={`${sizeClasses[size]} text-blue-500`} />;
      case 'pulse':
        return <Sparkles className={`${sizeClasses[size]} text-blue-500`} />;
      default:
        return <Brain className={`${sizeClasses[size]} text-blue-500`} />;
    }
  };

  const renderDots = () => {
    if (variant !== 'wave' && variant !== 'dots') return null;
    
    return (
      <div ref={dotsRef} className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {(variant === 'wave' || variant === 'dots') ? (
        renderDots()
      ) : (
        <div ref={iconRef}>
          {renderIcon()}
        </div>
      )}
      
      {text && (
        <div ref={textRef} className="text-sm text-muted-foreground font-medium">
          {text}
        </div>
      )}
    </div>
  );
}

// Specialized loaders for different contexts
export function AIProcessingLoader({ 
  className = '', 
  size = 'lg' 
}: { 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <AnimatedLoader
      variant="brain"
      size={size}
      text="AI is analyzing your meeting..."
      className={className}
    />
  );
}

export function TranscriptionLoader({ 
  className = '', 
  size = 'md' 
}: { 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <AnimatedLoader
      variant="wave"
      size={size}
      text="Transcribing audio..."
      className={className}
    />
  );
}

export function UploadLoader({ 
  className = '', 
  size = 'md' 
}: { 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <AnimatedLoader
      variant="pulse"
      size={size}
      text="Uploading file..."
      className={className}
    />
  );
}