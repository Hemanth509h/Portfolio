import { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  threshold?: number;
  triggerOnce?: boolean;
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
  triggerOnce = true,
}: ScrollRevealProps) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold,
    triggerOnce,
    rootMargin: '0px 0px -50px 0px',
  });

  // Respect user's reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getAnimationClasses = () => {
    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
      return 'opacity-100 translate-y-0 translate-x-0';
    }

    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'opacity-0 translate-y-8';
        case 'down':
          return 'opacity-0 -translate-y-8';
        case 'left':
          return 'opacity-0 translate-x-8';
        case 'right':
          return 'opacity-0 -translate-x-8';
        case 'fade':
          return 'opacity-0';
        default:
          return 'opacity-0 translate-y-8';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0';
  };

  return (
    <div
      ref={ref}
      className={`${!prefersReducedMotion ? 'transition-all duration-700 ease-out' : ''} ${getAnimationClasses()} ${className}`}
      style={!prefersReducedMotion ? { transitionDelay: `${delay}ms` } : {}}
    >
      {children}
    </div>
  );
}