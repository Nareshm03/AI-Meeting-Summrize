import { useState, useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
  children?: SidebarItem[];
}

interface AnimatedSidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onToggle: () => void;
  width?: number;
  collapsedWidth?: number;
  position?: 'left' | 'right';
  variant?: 'default' | 'floating' | 'overlay';
  className?: string;
}

export function AnimatedSidebar({
  items,
  isOpen,
  onToggle,
  width = 280,
  collapsedWidth = 80,
  position = 'left',
  variant = 'default',
  className = ''
}: AnimatedSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const targetWidth = isOpen ? width : collapsedWidth;
    
    gsap.to(sidebarRef.current, {
      width: targetWidth,
      duration: 0.3,
      ease: "power2.out"
    });

    // Animate content opacity
    if (contentRef.current) {
      const labels = contentRef.current.querySelectorAll('.sidebar-label');
      const badges = contentRef.current.querySelectorAll('.sidebar-badge');
      
      if (isOpen) {
        gsap.to([labels, badges], {
          opacity: 1,
          x: 0,
          duration: 0.2,
          delay: 0.1,
          stagger: 0.02,
          ease: "power2.out"
        });
      } else {
        gsap.to([labels, badges], {
          opacity: 0,
          x: -10,
          duration: 0.15,
          ease: "power2.in"
        });
      }
    }

    // Handle overlay for mobile
    if (variant === 'overlay' && overlayRef.current) {
      if (isOpen) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [isOpen, width, collapsedWidth, variant]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const itemRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
      if (hasChildren) {
        toggleExpanded(item.id);
      } else {
        item.onClick?.();
      }

      // Click animation
      if (itemRef.current) {
        gsap.to(itemRef.current, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
    };

    return (
      <div key={item.id} className="sidebar-item">
        <div
          ref={itemRef}
          onClick={handleClick}
          className={cn(
            'flex items-center px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200 group',
            'hover:bg-accent hover:shadow-sm',
            item.active && 'bg-primary text-primary-foreground shadow-md',
            level > 0 && 'ml-4'
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {item.icon}
          </div>

          {/* Label */}
          <span className={cn(
            'sidebar-label flex-1 ml-3 text-sm font-medium truncate transition-all duration-200',
            !isOpen && 'opacity-0'
          )}>
            {item.label}
          </span>

          {/* Badge */}
          {item.badge && (
            <span className={cn(
              'sidebar-badge ml-2 px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full transition-all duration-200',
              !isOpen && 'opacity-0'
            )}>
              {item.badge}
            </span>
          )}

          {/* Expand icon */}
          {hasChildren && isOpen && (
            <div className={cn(
              'ml-2 transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getSidebarClasses = () => {
    const baseClasses = cn(
      'flex flex-col bg-background border-border transition-all duration-300 z-40',
      position === 'left' ? 'border-r' : 'border-l'
    );

    switch (variant) {
      case 'floating':
        return cn(
          baseClasses,
          'fixed top-4 bottom-4 rounded-xl shadow-2xl',
          position === 'left' ? 'left-4' : 'right-4'
        );
      case 'overlay':
        return cn(
          baseClasses,
          'fixed top-0 bottom-0 shadow-2xl',
          position === 'left' ? 'left-0' : 'right-0'
        );
      default:
        return cn(baseClasses, 'relative h-full');
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {variant === 'overlay' && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 opacity-0 pointer-events-none"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(getSidebarClasses(), className)}
        style={{ width: isOpen ? width : collapsedWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {isOpen && (
            <h2 className="sidebar-label text-lg font-semibold text-foreground">
              Navigation
            </h2>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1">
            {items.map(item => renderItem(item))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-center">
            {isOpen ? (
              <span className="sidebar-label text-xs text-muted-foreground">
                AI Meeting Summarizer
              </span>
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">AI</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Hook for managing sidebar state
export function useSidebar(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    toggle,
    open,
    close
  };
}