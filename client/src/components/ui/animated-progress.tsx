import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'striped' | 'pulse';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500'
};

const gradientClasses = {
  blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
  green: 'bg-gradient-to-r from-green-400 to-green-600',
  red: 'bg-gradient-to-r from-red-400 to-red-600',
  yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
  purple: 'bg-gradient-to-r from-purple-400 to-purple-600'
};

export function AnimatedProgress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  color = 'blue',
  showValue = false,
  animated = true,
  className = ''
}: AnimatedProgressProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (!fillRef.current) return;

    if (animated) {
      // Animate the progress fill
      gsap.fromTo(fillRef.current,
        { width: '0%' },
        { 
          width: `${percentage}%`,
          duration: 1.2,
          ease: "power2.out"
        }
      );

      // Animate the value counter
      if (showValue && valueRef.current) {
        gsap.fromTo({ value: 0 },
          { value: percentage },
          {
            duration: 1.2,
            ease: "power2.out",
            onUpdate: function() {
              if (valueRef.current) {
                valueRef.current.textContent = `${Math.round(this.targets()[0].value)}%`;
              }
            }
          }
        );
      }
    } else {
      gsap.set(fillRef.current, { width: `${percentage}%` });
      if (showValue && valueRef.current) {
        valueRef.current.textContent = `${Math.round(percentage)}%`;
      }
    }
  }, [percentage, animated, showValue]);

  const getProgressClasses = () => {
    let classes = '';
    
    switch (variant) {
      case 'gradient':
        classes = gradientClasses[color];
        break;
      case 'striped':
        classes = `${colorClasses[color]} bg-stripes`;
        break;
      case 'pulse':
        classes = `${colorClasses[color]} animate-pulse`;
        break;
      default:
        classes = colorClasses[color];
    }

    return classes;
  };

  return (
    <div className={cn('relative', className)}>
      {showValue && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span ref={valueRef} className="text-sm font-medium text-muted-foreground">
            0%
          </span>
        </div>
      )}
      
      <div
        ref={progressRef}
        className={cn(
          'relative overflow-hidden rounded-full bg-secondary',
          sizeClasses[size]
        )}
      >
        <div
          ref={fillRef}
          className={cn(
            'h-full rounded-full transition-all duration-300',
            getProgressClasses()
          )}
          style={{ width: '0%' }}
        />
        
        {variant === 'striped' && (
          <div className="absolute inset-0 bg-stripes opacity-30" />
        )}
      </div>
    </div>
  );
}

// Circular progress component
export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'blue',
  showValue = true,
  animated = true,
  className = ''
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    purple: '#8b5cf6'
  };

  useEffect(() => {
    if (!circleRef.current) return;

    if (animated) {
      gsap.fromTo(circleRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: offset,
          duration: 1.5,
          ease: "power2.out"
        }
      );

      if (showValue && valueRef.current) {
        gsap.fromTo({ value: 0 },
          { value: percentage },
          {
            duration: 1.5,
            ease: "power2.out",
            onUpdate: function() {
              if (valueRef.current) {
                valueRef.current.textContent = `${Math.round(this.targets()[0].value)}%`;
              }
            }
          }
        );
      }
    } else {
      gsap.set(circleRef.current, { strokeDashoffset: offset });
      if (showValue && valueRef.current) {
        valueRef.current.textContent = `${Math.round(percentage)}%`;
      }
    }
  }, [percentage, animated, showValue, offset, circumference]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-secondary"
        />
        
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      
      {showValue && (
        <span
          ref={valueRef}
          className="absolute text-sm font-semibold text-foreground"
        >
          0%
        </span>
      )}
    </div>
  );
}

// Multi-step progress component
export function StepProgress({
  steps,
  currentStep,
  animated = true,
  className = ''
}: {
  steps: string[];
  currentStep: number;
  animated?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !animated) return;

    const stepElements = containerRef.current.querySelectorAll('.step-item');
    const lineElements = containerRef.current.querySelectorAll('.step-line');

    stepElements.forEach((step, index) => {
      const isCompleted = index < currentStep;
      const isCurrent = index === currentStep;
      
      if (isCompleted || isCurrent) {
        gsap.to(step, {
          scale: 1.1,
          duration: 0.3,
          ease: "back.out(1.7)",
          delay: index * 0.1
        });
      }
    });

    lineElements.forEach((line, index) => {
      if (index < currentStep) {
        gsap.to(line, {
          scaleX: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: index * 0.1
        });
      }
    });
  }, [currentStep, animated]);

  return (
    <div ref={containerRef} className={cn('flex items-center', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {/* Step circle */}
          <div
            className={cn(
              'step-item flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
              index < currentStep
                ? 'bg-primary border-primary text-primary-foreground'
                : index === currentStep
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-background border-muted text-muted-foreground'
            )}
          >
            {index < currentStep ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>

          {/* Step label */}
          <span className={cn(
            'ml-2 text-sm font-medium',
            index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {step}
          </span>

          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-4 h-0.5 bg-muted relative overflow-hidden">
              <div
                className={cn(
                  'step-line absolute inset-0 bg-primary origin-left',
                  index < currentStep ? 'scale-x-100' : 'scale-x-0'
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}