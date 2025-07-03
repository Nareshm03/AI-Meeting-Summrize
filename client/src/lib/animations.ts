import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Animation configurations
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
  },
  ease: {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.3)",
    sharp: "power3.inOut",
  },
  stagger: {
    fast: 0.1,
    normal: 0.2,
    slow: 0.3,
  }
};

// Page transition animations
export const pageTransitions = {
  fadeIn: (element: HTMLElement) => {
    gsap.fromTo(element, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: ANIMATION_CONFIG.duration.normal, ease: ANIMATION_CONFIG.ease.smooth }
    );
  },

  slideInFromLeft: (element: HTMLElement, delay = 0) => {
    gsap.fromTo(element,
      { opacity: 0, x: -100 },
      { opacity: 1, x: 0, duration: ANIMATION_CONFIG.duration.normal, ease: ANIMATION_CONFIG.ease.smooth, delay }
    );
  },

  slideInFromRight: (element: HTMLElement, delay = 0) => {
    gsap.fromTo(element,
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: ANIMATION_CONFIG.duration.normal, ease: ANIMATION_CONFIG.ease.smooth, delay }
    );
  },

  scaleIn: (element: HTMLElement, delay = 0) => {
    gsap.fromTo(element,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: ANIMATION_CONFIG.duration.normal, ease: ANIMATION_CONFIG.ease.bounce, delay }
    );
  },

  staggerIn: (elements: HTMLElement[]) => {
    gsap.fromTo(elements,
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: ANIMATION_CONFIG.duration.normal, 
        ease: ANIMATION_CONFIG.ease.smooth,
        stagger: ANIMATION_CONFIG.stagger.normal
      }
    );
  }
};

// Card animations
export const cardAnimations = {
  hover: (element: HTMLElement) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, {
      y: -10,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.smooth
    });
    return tl;
  },

  click: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  },

  pulse: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.05,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }
};

// Button animations
export const buttonAnimations = {
  hover: (element: HTMLElement) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, {
      scale: 1.05,
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.smooth
    });
    return tl;
  },

  click: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  },

  loading: (element: HTMLElement) => {
    gsap.to(element, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: "none"
    });
  }
};

// Text animations
export const textAnimations = {
  typewriter: (element: HTMLElement, text: string) => {
    const chars = text.split('');
    element.innerHTML = '';
    
    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '0';
      element.appendChild(span);
    });

    gsap.to(element.children, {
      opacity: 1,
      duration: 0.05,
      stagger: 0.05,
      ease: "none"
    });
  },

  fadeInWords: (element: HTMLElement) => {
    const words = element.textContent?.split(' ') || [];
    element.innerHTML = words.map(word => `<span style="opacity: 0">${word}</span>`).join(' ');
    
    gsap.to(element.children, {
      opacity: 1,
      duration: ANIMATION_CONFIG.duration.fast,
      stagger: ANIMATION_CONFIG.stagger.fast,
      ease: ANIMATION_CONFIG.ease.smooth
    });
  },

  slideInFromBottom: (element: HTMLElement) => {
    gsap.fromTo(element,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: ANIMATION_CONFIG.duration.normal, ease: ANIMATION_CONFIG.ease.smooth }
    );
  }
};

// Loading animations
export const loadingAnimations = {
  spinner: (element: HTMLElement) => {
    gsap.to(element, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: "none"
    });
  },

  pulse: (element: HTMLElement) => {
    gsap.to(element, {
      opacity: 0.3,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  },

  wave: (elements: HTMLElement[]) => {
    gsap.to(elements, {
      y: -10,
      duration: 0.6,
      yoyo: true,
      repeat: -1,
      stagger: 0.1,
      ease: "sine.inOut"
    });
  }
};

// Progress animations
export const progressAnimations = {
  fillBar: (element: HTMLElement, progress: number) => {
    gsap.to(element, {
      width: `${progress}%`,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.smooth
    });
  },

  countUp: (element: HTMLElement, from: number, to: number) => {
    const obj = { value: from };
    gsap.to(obj, {
      value: to,
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.ease.smooth,
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString();
      }
    });
  }
};

// Scroll animations
export const scrollAnimations = {
  parallax: (element: HTMLElement, speed = 0.5) => {
    gsap.to(element, {
      yPercent: -50 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  },

  fadeInOnScroll: (element: HTMLElement) => {
    gsap.fromTo(element,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: ANIMATION_CONFIG.duration.normal,
        ease: ANIMATION_CONFIG.ease.smooth,
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }
};

// Utility functions
export const animationUtils = {
  killAll: () => {
    gsap.killTweensOf("*");
  },

  refresh: () => {
    ScrollTrigger.refresh();
  },

  createTimeline: (config?: gsap.TimelineVars) => {
    return gsap.timeline(config);
  }
};

// Export GSAP for direct use
export { gsap };