'use client';

import React, { useEffect, useRef } from 'react';

interface Droplet {
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

interface ClickEventItem {
  x: number;
  y: number;
  start: number;
  droplets: Droplet[];
}

export const GlobalSpark: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const items: ClickEventItem[] = [];
    let raf = 0;
    const DURATION = 360; // 360ms quick clean animation

    // Draw diamond glint (tia sáng mặt kính sạch)
    const drawCleanGlint = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      alpha: number
    ) => {
      if (size <= 0.5 || alpha <= 0) return;
      context.save();
      context.translate(cx, cy);
      context.rotate(Math.PI / 4); // 45 deg angle

      // Horizontal ray
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.beginPath();
      context.moveTo(-size, 0);
      context.quadraticCurveTo(0, -size * 0.2, 0, -size);
      context.quadraticCurveTo(0, -size * 0.2, size, 0);
      context.quadraticCurveTo(0, size * 0.2, 0, size);
      context.quadraticCurveTo(0, size * 0.2, -size, 0);
      context.fill();

      // Soft cyan glow in center
      context.beginPath();
      context.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      context.fillStyle = `rgba(56, 189, 248, ${alpha * 0.9})`;
      context.fill();

      context.restore();
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const elapsed = now - item.start;
        const p = Math.min(1, elapsed / DURATION);

        if (p >= 1) {
          items.splice(i, 1);
          continue;
        }

        // Ease-out cubic
        const ease = 1 - Math.pow(1 - p, 3);
        const fade = 1 - p;

        // 1. Water Ripple: Outer concentric wave
        const rippleRadius = 4 + 36 * ease;
        ctx.beginPath();
        ctx.arc(item.x, item.y, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${fade * 0.45})`;
        ctx.lineWidth = Math.max(0.6, 1.8 * fade);
        ctx.stroke();

        // 2. Inner soft ripple ring
        const innerRadius = 2 + 20 * ease;
        ctx.beginPath();
        ctx.arc(item.x, item.y, innerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(169, 231, 245, ${fade * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Central Clean Glint (Tia lóe sáng tinh tươm)
        const glintScale = p < 0.25 ? p / 0.25 : Math.max(0, 1 - (p - 0.25) / 0.75);
        const glintSize = 10 * glintScale;
        drawCleanGlint(ctx, item.x, item.y, glintSize, fade);

        // 4. Pure micro water droplets (bọt nước tinh khiết nổi nhẹ lên)
        for (const drop of item.droplets) {
          const dropX = item.x + drop.dx * ease;
          const dropY = item.y + drop.dy * ease - 12 * ease; // floats slightly upward
          const dropR = Math.max(0.5, drop.radius * fade);

          ctx.beginPath();
          ctx.arc(dropX, dropY, dropR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 242, 254, ${fade * 0.75})`;
          ctx.fill();

          // Tiny specular spot
          ctx.beginPath();
          ctx.arc(dropX - dropR * 0.3, dropY - dropR * 0.3, dropR * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${fade * 0.9})`;
          ctx.fill();
        }
      }

      if (items.length > 0) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    const spawn = (clientX: number, clientY: number) => {
      // Create 3 tiny water droplets
      const droplets: Droplet[] = [];
      const count = 3 + Math.floor(Math.random() * 2); // 3-4 droplets
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
        const dist = 12 + Math.random() * 16;
        droplets.push({
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          radius: 1.5 + Math.random() * 1.5,
          speed: 0.8 + Math.random() * 0.4
        });
      }

      items.push({
        x: clientX,
        y: clientY,
        start: performance.now(),
        droplets
      });

      if (!raf) {
        raf = requestAnimationFrame(render);
      }
    };

    const handleClick = (e: MouseEvent | PointerEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      spawn(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handleClick, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', handleClick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    />
  );
};

export default GlobalSpark;
