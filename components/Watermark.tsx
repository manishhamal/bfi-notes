import React, { useMemo } from 'react';
import { useAuth } from './AuthProvider';

interface WatermarkProps {
  opacity?: number;
}

const Watermark: React.FC<WatermarkProps> = ({ opacity = 0.04 }) => {
  const { user, profile } = useAuth();
  
  const watermarkText = useMemo(() => {
    if (user) {
      const name = profile?.full_name || 'BFI Notes';
      const identifier = user.email || user.phone || 'User';
      return `${name} • ${identifier}`;
    }
    return 'BFI Notes • Confidential Material';
  }, [user, profile]);

  const backgroundUrl = useMemo(() => {
    const svg = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="50%" 
          y="50%" 
          transform="translate(150, 150) rotate(-45) translate(-150, -150)"
          fill="rgb(128, 128, 128)"
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="15" 
          font-weight="600" 
          text-anchor="middle"
          dominant-baseline="middle"
        >
          ${watermarkText}
        </text>
      </svg>
    `;
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `url(data:image/svg+xml;base64,${encoded})`;
  }, [watermarkText]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[50] select-none"
      style={{
        backgroundImage: backgroundUrl,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        opacity: opacity,
      }}
      aria-hidden="true"
    />
  );
};

export default Watermark;
