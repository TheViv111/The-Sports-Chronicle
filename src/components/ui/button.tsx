import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Ripple effect hook
const useRippleEffect = () => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };
  
  return { ripples, createRipple };
};

// Magnetic hover hook
const useMagneticHover = () => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const elementRef = React.useRef<HTMLElement>(null);
  
  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (event.clientX - centerX) / rect.width;
    const deltaY = (event.clientY - centerY) / rect.height;
    
    const maxDistance = 10;
    const x = Math.max(-maxDistance, Math.min(maxDistance, deltaX * maxDistance));
    const y = Math.max(-maxDistance, Math.min(maxDistance, deltaY * maxDistance));
    
    setPosition({ x, y });
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };
  
  return { position, handleMouseMove, handleMouseLeave, elementRef };
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 duration-300 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full before:transition-transform before:duration-700 hover:before:translate-x-full",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full before:transition-transform before:duration-700 hover:before:translate-x-full",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-accent/20 before:to-transparent before:-translate-x-full before:transition-transform before:duration-700 hover:before:translate-x-full",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-secondary-foreground/10 before:to-transparent before:-translate-x-full before:transition-transform before:duration-700 hover:before:translate-x-full",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:-translate-y-0.5 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-accent/20 before:to-transparent before:-translate-x-full before:transition-transform before:duration-700 hover:before:translate-x-full",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:scale-95 transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { ripples, createRipple } = useRippleEffect();
    const { position, handleMouseMove, handleMouseLeave, elementRef } = useMagneticHover();
    const combinedRef = React.useRef<HTMLButtonElement>(null);
    
    React.useImperativeHandle(ref, () => combinedRef.current!);
    React.useEffect(() => {
      if (elementRef.current) {
        elementRef.current = combinedRef.current;
      }
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      props.onClick?.(event);
    };

    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={combinedRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        {...props}
      >
        {props.children}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
