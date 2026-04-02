import React, { useState, useEffect, useCallback, useRef } from 'react';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ children }) => {
  const [isProtected, setIsProtected] = useState(false);
  const [isMouseOut, setIsMouseOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent right-click, selection, and common shortcuts
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleSelectStart = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const handleDragStart = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    // Block F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P, PrintScreen
    if (
        e.key === 'F12' || 
        (isCtrl && isShift && e.key === 'I') || 
        (isCtrl && e.key === 'u') || 
        (isCtrl && e.key === 's') || 
        (isCtrl && e.key === 'p') ||
        e.key === 'PrintScreen'
    ) {
      e.preventDefault();
      return false;
    }
  }, []);

  useEffect(() => {
    // Add global security listeners
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    // Aggressive Visibility & Focus Management
    const handleBlur = () => setIsProtected(true);
    const handleFocus = () => {
      setIsProtected(false);
      setIsMouseOut(false);
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsProtected(true);
      } else {
        // Only restore if user is actually focused
        if (document.hasFocus()) {
          setIsProtected(false);
        }
      }
    };

    // Detect mouse leaving the window (often for screenshot tool selection)
    const handleMouseLeave = () => setIsMouseOut(true);
    const handleMouseEnter = () => setIsMouseOut(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Extra mobile protection: prevent long-press context menus specifically
    const handleTouchStart = (e: TouchEvent) => {
      // Potentially block multi-touch screenshots if browsers supported it (they don't yet)
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleContextMenu, handleSelectStart, handleDragStart, handleKeyDown]);

  const showSecurityScreen = isProtected || isMouseOut;

  return (
    <div 
      ref={containerRef}
      className={`security-protected ${showSecurityScreen ? 'security-hide' : ''}`}
    >
      {/* The Actual Content */}
      <div style={{ visibility: showSecurityScreen ? 'hidden' : 'visible' }}>
        {children}
      </div>
      
      {/* Security Overlay Warning */}
      {showSecurityScreen && (
        <div className="security-warning-overlay">
          <h2 className="text-2xl font-bold mb-4">Protected Security Screen</h2>
          <p className="text-slate-400">Content is hidden because the window is not focused.</p>
          <p className="text-sm mt-8 opacity-50">Click back into the window to resume reading.</p>
        </div>
      )}

      {/* Dynamic Watermark - Drifts across screen via CSS animation */}
      {!showSecurityScreen && (
        <div className="watermark-container">
          <div className="watermark-text">
             BFI NOTES • SECURED • {new Date().toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityWrapper;
