import { forwardRef, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCardHover, useScrollAnimation } from '@/hooks/useGSAP';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'none';
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale';
  hover?: boolean;
  onClick?: () => void;
}

const gradientClasses = {
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800',
  green: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800',
  orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800',
  pink: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800',
  none: 'bg-card border-border'
};

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(({
  children,
  className = '',
  title,
  subtitle,
  icon,
  gradient = 'none',
  animation = 'fadeIn',
  hover = true,
  onClick
}, ref) => {
  const scrollRef = useScrollAnimation<HTMLDivElement>(animation);
  const { ref: hoverRef, handleClick } = useCardHover<HTMLDivElement>();

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    // Set our internal refs
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (hoverRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    
    // Forward to the external ref if provided
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    }
  };

  const handleCardClick = () => {
    if (hover) handleClick();
    if (onClick) onClick();
  };

  return (
    <Card
      ref={combinedRef}
      className={cn(
        'transition-all duration-300 cursor-pointer overflow-hidden',
        gradientClasses[gradient],
        hover && 'hover:shadow-xl',
        className
      )}
      onClick={handleCardClick}
    >
      {(title || subtitle || icon) && (
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <CardTitle className={cn(
                  "text-lg font-semibold",
                  gradient === 'blue' && "text-blue-700 dark:text-blue-300",
                  gradient === 'green' && "text-green-700 dark:text-green-300",
                  gradient === 'purple' && "text-purple-700 dark:text-purple-300",
                  gradient === 'orange' && "text-orange-700 dark:text-orange-300",
                  gradient === 'pink' && "text-pink-700 dark:text-pink-300",
                  gradient === 'none' && "text-foreground"
                )}>
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <p className={cn(
                  "text-sm mt-1",
                  gradient === 'blue' && "text-blue-600 dark:text-blue-400",
                  gradient === 'green' && "text-green-600 dark:text-green-400",
                  gradient === 'purple' && "text-purple-600 dark:text-purple-400",
                  gradient === 'orange' && "text-orange-600 dark:text-orange-400",
                  gradient === 'pink' && "text-pink-600 dark:text-pink-400",
                  gradient === 'none' && "text-muted-foreground"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
});

AnimatedCard.displayName = 'AnimatedCard';

// Specialized card variants
export function StatsCard({ 
  title, 
  value, 
  icon, 
  gradient = 'blue', 
  trend, 
  className = '' 
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  trend?: { value: number; isPositive: boolean };
  className?: string;
}) {
  return (
    <AnimatedCard
      gradient={gradient}
      icon={icon}
      animation="scale"
      className={className}
    >
      <div className="space-y-2">
        <p className={cn(
          "text-sm font-medium",
          gradient === 'blue' && "text-blue-700 dark:text-blue-300",
          gradient === 'green' && "text-green-700 dark:text-green-300",
          gradient === 'purple' && "text-purple-700 dark:text-purple-300",
          gradient === 'orange' && "text-orange-700 dark:text-orange-300",
          gradient === 'pink' && "text-pink-700 dark:text-pink-300"
        )}>
          {title}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive 
                ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
                : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
  gradient = 'blue',
  className = '',
  onClick
}: {
  title: string;
  description: string;
  icon: ReactNode;
  gradient?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  className?: string;
  onClick?: () => void;
}) {
  return (
    <AnimatedCard
      title={title}
      gradient={gradient}
      icon={icon}
      animation="slideUp"
      className={className}
      onClick={onClick}
    >
      <p className={cn(
        "text-sm",
        gradient === 'blue' && "text-blue-600 dark:text-blue-400",
        gradient === 'green' && "text-green-600 dark:text-green-400",
        gradient === 'purple' && "text-purple-600 dark:text-purple-400",
        gradient === 'orange' && "text-orange-600 dark:text-orange-400",
        gradient === 'pink' && "text-pink-600 dark:text-pink-400"
      )}>
        {description}
      </p>
    </AnimatedCard>
  );
}