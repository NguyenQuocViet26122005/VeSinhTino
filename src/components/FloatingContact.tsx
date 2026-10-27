'use client';

import React from 'react';
import Magnet from './react-bits/Magnet/Magnet';

interface FloatingContactProps {
  phone: string;
  display: string;
  zalo: string;
}

export const FloatingContact: React.FC<FloatingContactProps> = ({ phone, display, zalo }) => {
  return (
    <div className="floating-contact">
      <Magnet padding={45} magnetStrength={2} tilt={6} scale={1.05}>
        <a
          href={zalo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo với Vệ Sinh Tino"
          className="floating-btn floating-zalo"
        >
          Zalo
        </a>
      </Magnet>
      <Magnet padding={45} magnetStrength={2} tilt={6} scale={1.05}>
        <a
          href={`tel:${phone}`}
          aria-label={`Gọi Hotline Vệ Sinh Tino: ${display}`}
          className="floating-btn floating-phone"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M5 3h4l2 5-3 2c1 3 3 5 6 6l2-3 5 2v4c0 2-2 3-4 2C9 19 5 15 3 7c-1-2 0-4 2-4Z" />
          </svg>
        </a>
      </Magnet>
    </div>
  );
};

export default FloatingContact;
