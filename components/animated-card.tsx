'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  animation?: 'fadeUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'blur';
  className?: string;
}

export function AnimatedCard({
  children,
  delay = 0,
  animation = 'fadeUp',
  className = '',
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const animationClasses = {
    fadeUp: isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
    slideLeft: isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
    slideRight: isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0',
    scale: isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
    rotate: isVisible ? 'rotate-0 opacity-100' : 'rotate-3 opacity-0',
    blur: isVisible ? 'blur-0 opacity-100' : 'blur-sm opacity-0',
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ease-out ${animationClasses[animation]} ${className}`}
    >
      {children}
    </div>
  );
}
