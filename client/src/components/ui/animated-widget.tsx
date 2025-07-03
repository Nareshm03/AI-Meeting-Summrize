import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, MoreHorizontal, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCard } from './animated-card';
import { CircularProgress } from './animated-progress';

interface AnimatedWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  change?: {
    value: number;
    period?: string;
  };
  progress?: {
    value: number;
    max?: number;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  };
  chart?: {
    data: number[];
    color?: string;
  };
  actions?: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
  }[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'minimal';
  className?: string;
  loading?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export function AnimatedWidget({
  title,
  value,
  subtitle,
  icon,
  trend,
  change,
  progress,
  chart,
  actions,
  size = 'md',
  variant = 'default',
  className = '',
  loading = false,
  refreshable = false,
  onRefresh
}: AnimatedWidgetProps) {
  const valueRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const refreshRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  // Animate value counter (simplified for performance)
  useEffect(() => {
    if (!valueRef.current || loading) return;

    const numericValue = typeof value === 'string' ? 
      parseFloat(value.replace(/[^0-9.-]/g, '')) : value;

    if (!isNaN(numericValue) && numericValue < 1000) { // Only animate small numbers
      gsap.fromTo({ value: 0 },
        { value: numericValue },
        {
          duration: 0.8, // Reduced duration
          ease: "power2.out",
          onUpdate: function() {
            if (valueRef.current) {
              const currentValue = this.targets()[0].value;
              if (typeof value === 'string') {
                const formatted = value.replace(/[0-9.-]/g, '').replace(/^/, Math.round(currentValue).toString());
                valueRef.current.textContent = formatted;
              } else {
                valueRef.current.textContent = Math.round(currentValue).toString();
              }
            }
          }
        }
      );
    } else {
      // For large numbers or non-numeric values, just set directly
      if (valueRef.current) {
        valueRef.current.textContent = value.toString();
      }
    }
  }, [value, loading]);

  // Animate mini chart
  useEffect(() => {
    if (!chartRef.current || !chart || loading) return;

    const svg = chartRef.current;
    const width = 100;
    const height = 40;
    const data = chart.data;
    
    if (data.length === 0) return;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Create path
    const pathData = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Create and animate path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', chart.color || '#3b82f6');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(path);

    // Animate path drawing (simplified)
    const pathLength = path.getTotalLength();
    gsap.fromTo(path,
      { strokeDasharray: pathLength, strokeDashoffset: pathLength },
      { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" } // Reduced duration
    );

    return () => {
      if (svg.contains(path)) {
        svg.removeChild(path);
      }
    };
  }, [chart, loading]);

  const handleRefresh = () => {
    if (!refreshRef.current) return;

    // Refresh animation
    gsap.to(refreshRef.current, {
      rotation: 360,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(refreshRef.current, { rotation: 0 });
      }
    });

    onRefresh?.();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20';
      case 'minimal':
        return 'bg-transparent border-0 shadow-none';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <AnimatedCard className={cn(sizeClasses[size], getVariantClasses(), className)}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard 
      className={cn(sizeClasses[size], getVariantClasses(), className)}
      animation="scale"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && (
              <div className="flex-shrink-0 text-primary">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
          
          <div className="flex items-center space-x-1">
            {refreshable && (
              <button
                ref={refreshRef}
                onClick={handleRefresh}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            
            {actions && actions.length > 0 && (
              <div className="relative group">
                <button className="p-1 rounded-full hover:bg-accent transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
                
                {/* Actions dropdown */}
                <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          {/* Value */}
          <div className="flex items-end space-x-2">
            <div ref={valueRef} className="text-2xl font-bold text-foreground">
              {loading ? '...' : value}
            </div>
            
            {(trend || change) && (
              <div className={cn(
                'flex items-center space-x-1 text-sm font-medium',
                trend ? (trend.isPositive ? 'text-green-600' : 'text-red-600') : 
                change ? (change.value >= 0 ? 'text-green-600' : 'text-red-600') : 'text-muted-foreground'
              )}>
                {trend ? (
                  trend.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )
                ) : change ? (
                  change.value >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )
                ) : null}
                <span>
                  {trend ? `${Math.abs(trend.value)}%` : 
                   change ? `${change.value >= 0 ? '+' : ''}${change.value.toFixed(1)}%` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}

          {/* Trend/Change Label */}
          {(trend?.label || change?.period) && (
            <p className="text-xs text-muted-foreground">
              {trend?.label || (change?.period ? `vs ${change.period}` : '')}
            </p>
          )}
        </div>

        {/* Progress */}
        {progress && (
          <div className="space-y-2">
            <CircularProgress
              value={progress.value}
              max={progress.max}
              size={60}
              color={progress.color}
              showValue={true}
              animated={true}
            />
          </div>
        )}

        {/* Mini Chart */}
        {chart && chart.data.length > 0 && (
          <div className="mt-4">
            <svg
              ref={chartRef}
              width="100"
              height="40"
              className="w-full h-10"
              viewBox="0 0 100 40"
            />
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

// Specialized widget variants
export function MetricWidget({
  title,
  value,
  change,
  ...props
}: Omit<AnimatedWidgetProps, 'trend'> & {
  change?: { value: number; period: string };
}) {
  return (
    <AnimatedWidget
      title={title}
      value={value}
      trend={change ? {
        value: Math.abs(change.value),
        isPositive: change.value >= 0,
        label: `vs ${change.period}`
      } : undefined}
      {...props}
    />
  );
}

export function ProgressWidget({
  title,
  current,
  target,
  unit = '',
  ...props
}: Omit<AnimatedWidgetProps, 'value' | 'progress'> & {
  current: number;
  target: number;
  unit?: string;
}) {
  const percentage = Math.round((current / target) * 100);
  
  return (
    <AnimatedWidget
      title={title}
      value={`${current}${unit}`}
      subtitle={`of ${target}${unit} target`}
      progress={{
        value: current,
        max: target,
        color: percentage >= 100 ? 'green' : percentage >= 75 ? 'blue' : 'yellow'
      }}
      {...props}
    />
  );
}