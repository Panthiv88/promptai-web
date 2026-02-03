"use client";

import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type AnimationType = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "fade" | "zoom" | "slide-up";

interface ScrollAnimationProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  once?: boolean; // If true, only animate once. If false, animate in/out on scroll
}

export function ScrollAnimation({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  className = "",
  threshold = 0.1,
  once = false,
}: ScrollAnimationProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold, triggerOnce: once });

  const getAnimationStyles = () => {
    const baseStyles = {
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      transitionDelay: `${delay}ms`,
    };

    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return { ...baseStyles, opacity: 0, transform: "translateY(40px)" };
        case "fade-down":
          return { ...baseStyles, opacity: 0, transform: "translateY(-40px)" };
        case "fade-left":
          return { ...baseStyles, opacity: 0, transform: "translateX(40px)" };
        case "fade-right":
          return { ...baseStyles, opacity: 0, transform: "translateX(-40px)" };
        case "fade":
          return { ...baseStyles, opacity: 0 };
        case "zoom":
          return { ...baseStyles, opacity: 0, transform: "scale(0.95)" };
        case "slide-up":
          return { ...baseStyles, opacity: 0, transform: "translateY(60px)" };
        default:
          return { ...baseStyles, opacity: 0 };
      }
    }

    return { ...baseStyles, opacity: 1, transform: "translateY(0) translateX(0) scale(1)" };
  };

  return (
    <div ref={ref} style={getAnimationStyles()} className={className}>
      {children}
    </div>
  );
}

// Staggered animation for lists
interface StaggeredAnimationProps {
  children: ReactNode[];
  animation?: AnimationType;
  staggerDelay?: number;
  duration?: number;
  className?: string;
  itemClassName?: string;
  once?: boolean;
}

export function StaggeredAnimation({
  children,
  animation = "fade-up",
  staggerDelay = 100,
  duration = 600,
  className = "",
  itemClassName = "",
  once = false,
}: StaggeredAnimationProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: once });

  const getAnimationStyles = (index: number) => {
    const baseStyles = {
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      transitionDelay: `${index * staggerDelay}ms`,
    };

    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return { ...baseStyles, opacity: 0, transform: "translateY(40px)" };
        case "fade-down":
          return { ...baseStyles, opacity: 0, transform: "translateY(-40px)" };
        case "fade-left":
          return { ...baseStyles, opacity: 0, transform: "translateX(40px)" };
        case "fade-right":
          return { ...baseStyles, opacity: 0, transform: "translateX(-40px)" };
        case "fade":
          return { ...baseStyles, opacity: 0 };
        case "zoom":
          return { ...baseStyles, opacity: 0, transform: "scale(0.95)" };
        default:
          return { ...baseStyles, opacity: 0 };
      }
    }

    return { ...baseStyles, opacity: 1, transform: "translateY(0) translateX(0) scale(1)" };
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div key={index} style={getAnimationStyles(index)} className={itemClassName}>
          {child}
        </div>
      ))}
    </div>
  );
}
