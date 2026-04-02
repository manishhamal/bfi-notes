import React, { useState, useEffect, useCallback } from 'react';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ children }) => {
  const [isBlurred, setIsBlurred] = useState(false);

  // Prevent right-click, text selection, and common shortcuts
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
    // Block common screenshot/dev/copy shortcuts
    // F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P, PrintScreen
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

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
    // Add global listeners
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    // Blurring on focus loss (prevents background capture)
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleContextMenu, handleSelectStart, handleDragStart, handleKeyDown]);

  return (
    <div className={`security-protected ${isBlurred ? 'security-blur' : ''}`}>
      {children}
      
      {/* Subtle Watermark */}
      <div className="watermark-container">
        <div className="watermark-text">
          BFI Notes Protected Content
        </div>
      </div>

      {/* Warning for PrintScreen (Experimental detection) */}
      {/* Note: Standard web cannot reliably detect PrintScreen, but we can try to blink or show a message if Clipboard is accessed */}
    </div>
  );
};

export default SecurityWrapper;
