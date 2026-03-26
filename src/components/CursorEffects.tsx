"use client";

import { useEffect, useRef } from "react";

export default function CursorEffects() {
  const gridRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const animate = () => {
      const grid = gridRef.current;

      if (grid) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const offsetX = ((mouse.current.x - vw / 2) / vw) * -35;
        const offsetY = ((mouse.current.y - vh / 2) / vh) * -35;
        grid.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
      }

      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className="fixed inset-0 pointer-events-none z-0 transition-[background-position] duration-75"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)",
        backgroundSize: "120px 120px",
        maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, black 20%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, black 20%, transparent 100%)",
      }}
    />
  );
}
