'use client';

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { createMagnet, resolveMagnetSettings, type MagnetOptions } from '../../../lib/magnet';
export type { MagnetAxis, MagnetSpring } from '../../../lib/magnet';

export interface MagnetProps extends HTMLAttributes<HTMLDivElement>, MagnetOptions {
  children: ReactNode;
  wrapperClassName?: string;
  innerClassName?: string;
}

const Magnet = ({ children, padding, disabled, magnetStrength, maxOffset, exclusive, axis, tilt, scale, spring, onActiveChange, wrapperClassName = '', innerClassName = '', style, ...props }: MagnetProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ReturnType<typeof createMagnet> | null>(null);
  const settingsRef = useRef(resolveMagnetSettings({}));
  settingsRef.current = resolveMagnetSettings({ padding, disabled, magnetStrength, maxOffset, exclusive, axis, tilt, scale, spring, onActiveChange });

  useEffect(() => {
    if (!wrapperRef.current || !innerRef.current) return;
    const controller = createMagnet(wrapperRef.current, innerRef.current, settingsRef);
    controllerRef.current = controller;
    return () => { controller.destroy(); controllerRef.current = null; };
  }, []);
  useEffect(() => { controllerRef.current?.refresh(); });

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...props}
    >
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
};

export default Magnet;
