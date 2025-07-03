import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Search, X, Filter, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions?: string[];
  showFilters?: boolean;
  filters?: { label: string; value: string; active: boolean }[];
  onFilterChange?: (filters: { label: string; value: string; active: boolean }[]) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'minimal';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg'
};

export function AnimatedSearch({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  suggestions = [],
  showFilters = false,
  filters = [],
  onFilterChange,
  size = 'md',
  variant = 'default',
  className = ''
}: AnimatedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const searchIconRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase()) && suggestion !== value
  );

  useEffect(() => {
    if (!containerRef.current) return;

    if (isFocused) {
      // Focus animation
      gsap.to(containerRef.current, {
        scale: 1.02,
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        duration: 0.2,
        ease: "power2.out"
      });

      // Search icon animation
      if (searchIconRef.current) {
        gsap.to(searchIconRef.current, {
          scale: 1.1,
          color: '#3b82f6',
          duration: 0.2,
          ease: "power2.out"
        });
      }
    } else {
      // Blur animation
      gsap.to(containerRef.current, {
        scale: 1,
        boxShadow: '0 0 0 0px rgba(59, 130, 246, 0)',
        duration: 0.2,
        ease: "power2.out"
      });

      if (searchIconRef.current) {
        gsap.to(searchIconRef.current, {
          scale: 1,
          color: '#6b7280',
          duration: 0.2,
          ease: "power2.out"
        });
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (!suggestionsRef.current) return;

    if (showSuggestions && filteredSuggestions.length > 0) {
      gsap.fromTo(suggestionsRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
        }
      );

      // Stagger suggestion items
      const items = suggestionsRef.current.querySelectorAll('.suggestion-item');
      gsap.fromTo(items,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.2,
          stagger: 0.05,
          delay: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [showSuggestions, filteredSuggestions.length]);

  useEffect(() => {
    if (!filtersRef.current) return;

    if (showFiltersPanel) {
      gsap.fromTo(filtersRef.current,
        { opacity: 0, height: 0 },
        { 
          opacity: 1, 
          height: 'auto',
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  }, [showFiltersPanel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSearch?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const toggleFilters = () => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  const handleFilterToggle = (filterValue: string) => {
    if (!onFilterChange) return;
    
    const updatedFilters = filters.map(filter =>
      filter.value === filterValue
        ? { ...filter, active: !filter.active }
        : filter
    );
    onFilterChange(updatedFilters);
  };

  const getContainerClasses = () => {
    const baseClasses = 'relative transition-all duration-200';
    
    switch (variant) {
      case 'floating':
        return cn(
          baseClasses,
          'bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700',
          sizeClasses[size]
        );
      case 'minimal':
        return cn(
          baseClasses,
          'bg-transparent border-b-2 border-gray-200 dark:border-gray-700 rounded-none',
          sizeClasses[size]
        );
      default:
        return cn(
          baseClasses,
          'bg-background border border-border rounded-lg',
          sizeClasses[size]
        );
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Main search container */}
      <div
        ref={containerRef}
        className={getContainerClasses()}
      >
        <div className="flex items-center px-3">
          {/* Search icon */}
          <div ref={searchIconRef} className="flex-shrink-0">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
          />

          {/* Clear button */}
          {value && (
            <button
              onClick={handleClear}
              className="flex-shrink-0 p-1 rounded-full hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Filter button */}
          {showFilters && (
            <button
              onClick={toggleFilters}
              className={cn(
                'flex-shrink-0 p-1 rounded-full transition-colors ml-1',
                showFiltersPanel
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground'
              )}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between group"
            >
              <span className="text-foreground">{suggestion}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div
          ref={filtersRef}
          className={cn(
            'overflow-hidden transition-all duration-300',
            showFiltersPanel ? 'mt-2' : 'h-0'
          )}
        >
          <div className="bg-accent/50 rounded-lg p-3 border border-border">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterToggle(filter.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-all duration-200',
                    filter.active
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background text-muted-foreground hover:bg-accent'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized search variants
export function FloatingSearch(props: Omit<AnimatedSearchProps, 'variant'>) {
  return <AnimatedSearch {...props} variant="floating" />;
}

export function MinimalSearch(props: Omit<AnimatedSearchProps, 'variant'>) {
  return <AnimatedSearch {...props} variant="minimal" />;
}