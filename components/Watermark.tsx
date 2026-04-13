import React, { useMemo } from 'react';
import { useAuth } from './AuthProvider';

interface WatermarkProps {
  opacity?: number;
}

const Watermark: React.FC<WatermarkProps> = ({ opacity = 0.06 }) => {
  const { user, profile } = useAuth();
  
  const watermarkText = useMemo(() => {
    let text = 'BFI NOTES • CONFIDENTIAL MATERIAL';
    if (user) {
      const name = profile?.full_name || 'BFI NOTES';
      const identifier = user.email || user.phone || 'USER';
      text = `${name} • ${identifier}`;
    }
    return text.toUpperCase();
  }, [user, profile]);

  const backgroundUrl = useMemo(() => {
    const svg = `
      <svg width="450" height="450" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="50%" 
          y="50%" 
          transform="translate(225, 225) rotate(-35) translate(-225, -225)"
          fill="rgb(128, 128, 128)"
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="14" 
          font-weight="400" 
          letter-spacing="4"
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
