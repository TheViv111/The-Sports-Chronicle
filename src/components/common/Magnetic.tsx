import React, { useRef, useState, useEffect } from "react";

interface MagneticProps {
  children: React.ReactElement;
  /** How intensely the component pulls towards the cursor (0 to 1) */
  strength?: number;
}

export const Magnetic: React.FC<MagneticProps> = ({ children, strength = 0.4 }) => {
  const ref = useRef<HTMLButtonElement | HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    if (ref.current) {
      const { height, width, left, top } = ref.current.getBoundingClientRect();
      const x = (clientX - (left + width / 2)) * strength;
      const y = (clientY - (top + height / 2)) * strength;
      setPosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mousemove", handleMouse as EventListener);
      node.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        node.removeEventListener("mousemove", handleMouse as EventListener);
        node.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [strength]);

  return React.cloneElement(children as React.ReactElement<any>, {
    ref,
    style: {
      ...((children as React.ReactElement<any>).props.style || {}),
      transform: `translate(${position.x}px, ${position.y}px)`,
      transition: position.x === 0 && position.y === 0 
        ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)" 
        : "transform 0.1s ease-out",
    },
  });
};
