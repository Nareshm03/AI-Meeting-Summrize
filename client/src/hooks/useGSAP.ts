import { useEffect, useRef, RefObject } from 'react';
import { gsap } from 'gsap';
import { pageTransitions, cardAnimations, buttonAnimations, textAnimations } from '@/lib/animations';

// Custom hook for GSAP animations
export const useGSAP = () => {
  return {
    pageTransitions,
    cardAnimations,
    buttonAnimations,
    textAnimations,
    gsap
  };
};

// Hook for element references with animations
export const useAnimatedRef = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  
  const animate = {
    fadeIn: (delay = 0) => {
      if (ref.current) pageTransitions.fadeIn(ref.current);
    },
    slideInLeft: (delay = 0) => {
      if (ref.current) pageTransitions.slideInFromLeft(ref.current, delay);
    },
    slideInRight: (delay = 0) => {
      if (ref.current) pageTransitions.slideInFromRight(ref.current, delay);
    },
    scaleIn: (delay = 0) => {
      if (ref.current) pageTransitions.scaleIn(ref.current, delay);
    }
  };

  return { ref, animate };
};

// Hook for card hover animations
export const useCardHover = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const hoverTl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (ref.current) {
      hoverTl.current = cardAnimations.hover(ref.current);
      
      const element = ref.current;
      
      const handleMouseEnter = () => {
        hoverTl.current?.play();
      };
      
      const handleMouseLeave = () => {
        hoverTl.current?.reverse();
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        hoverTl.current?.kill();
      };
    }
  }, []);

  const handleClick = () => {
    if (ref.current) {
      cardAnimations.click(ref.current);
    }
  };

  return { ref, handleClick };
};

// Hook for button animations
export const useButtonAnimation = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const hoverTl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (ref.current) {
      hoverTl.current = buttonAnimations.hover(ref.current);
      
      const element = ref.current;
      
      const handleMouseEnter = () => {
        hoverTl.current?.play();
      };
      
      const handleMouseLeave = () => {
        hoverTl.current?.reverse();
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        hoverTl.current?.kill();
      };
    }
  }, []);

  const handleClick = () => {
    if (ref.current) {
      buttonAnimations.click(ref.current);
    }
  };

  return { ref, handleClick };
};

// Hook for stagger animations (optimized for performance)
export const useStaggerAnimation = <T extends HTMLElement>(
  selector: string,
  animationType: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn' = 'fadeIn'
) => {
  const containerRef = useRef<T>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const triggerAnimation = () => {
    if (!containerRef.current) return;
    
    // Kill existing timeline to prevent conflicts
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const elements = containerRef.current.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    if (elements.length === 0) return;
    
    // Use a single timeline for better performance
    timelineRef.current = gsap.timeline();
    
    switch (animationType) {
      case 'fadeIn':
        timelineRef.current.fromTo(elements, 
          { opacity: 0 },
          { 
            opacity: 1, 
            duration: 0.3, // Reduced duration
            stagger: 0.05, // Reduced stagger
            ease: "power2.out"
          }
        );
        break;
      case 'slideInLeft':
        timelineRef.current.fromTo(elements,
          { x: -20, opacity: 0 }, // Reduced distance
          { 
            x: 0, 
            opacity: 1, 
            duration: 0.4, // Reduced duration
            stagger: 0.05, // Reduced stagger
            ease: "power2.out"
          }
        );
        break;
      case 'slideInRight':
        timelineRef.current.fromTo(elements,
          { x: 20, opacity: 0 }, // Reduced distance
          { 
            x: 0, 
            opacity: 1, 
            duration: 0.4, // Reduced duration
            stagger: 0.05, // Reduced stagger
            ease: "power2.out"
          }
        );
        break;
      case 'scaleIn':
        timelineRef.current.fromTo(elements,
          { scale: 0.95, opacity: 0 }, // Less dramatic scale
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.3, // Reduced duration
            stagger: 0.05, // Reduced stagger
            ease: "power2.out"
          }
        );
        break;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return { containerRef, triggerAnimation };
};

// Hook for text animations
export const useTextAnimation = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  const animate = {
    typewriter: (text: string) => {
      if (ref.current) textAnimations.typewriter(ref.current, text);
    },
    fadeInWords: () => {
      if (ref.current) textAnimations.fadeInWords(ref.current);
    },
    slideInFromBottom: () => {
      if (ref.current) textAnimations.slideInFromBottom(ref.current);
    }
  };

  return { ref, animate };
};

// Hook for loading animations
export const useLoadingAnimation = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      
      // Start spinner animation
      gsap.to(element, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "none"
      });

      return () => {
        gsap.killTweensOf(element);
      };
    }
  }, []);

  return ref;
};

// Hook for scroll-triggered animations
export const useScrollAnimation = <T extends HTMLElement>(
  animationType: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' = 'fadeIn'
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      
      let fromVars: gsap.TweenVars = {};
      let toVars: gsap.TweenVars = {};

      switch (animationType) {
        case 'fadeIn':
          fromVars = { opacity: 0, y: 50 };
          toVars = { opacity: 1, y: 0 };
          break;
        case 'slideUp':
          fromVars = { opacity: 0, y: 100 };
          toVars = { opacity: 1, y: 0 };
          break;
        case 'slideLeft':
          fromVars = { opacity: 0, x: 100 };
          toVars = { opacity: 1, x: 0 };
          break;
        case 'slideRight':
          fromVars = { opacity: 0, x: -100 };
          toVars = { opacity: 1, x: 0 };
          break;
        case 'scale':
          fromVars = { opacity: 0, scale: 0.8 };
          toVars = { opacity: 1, scale: 1 };
          break;
      }

      gsap.fromTo(element, fromVars, {
        ...toVars,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      return () => {
        gsap.killTweensOf(element);
      };
    }
  }, [animationType]);

  return ref;
};