import React, { useEffect, useRef } from 'react';

interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  duration = 3000,
  delay = 0,
  distance = 10,
  direction = 'up',
  className = ''
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial animation
    const keyframes = direction === 'up' || direction === 'down'
      ? [
          { transform: `translateY(0px)` },
          { transform: `translateY(${direction === 'up' ? -distance : distance}px)` },
          { transform: `translateY(0px)` }
        ]
      : [
          { transform: `translateX(0px)` },
          { transform: `translateX(${direction === 'left' ? -distance : distance}px)` },
          { transform: `translateX(0px)` }
        ];

    const animation = element.animate(keyframes, {
      duration,
      delay,
      iterations: Infinity,
      easing: 'ease-in-out'
    });

    return () => {
      animation.cancel();
    };
  }, [duration, delay, distance, direction]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default FloatingElement;
