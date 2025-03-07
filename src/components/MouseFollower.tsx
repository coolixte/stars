import React, { useState, useEffect } from 'react';

const MouseFollower = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if the device is mobile or tablet
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      setIsMobileOrTablet(
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(
          userAgent
        )
      );
    };

    // Check for dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDevice();
    checkDarkMode();

    // Listen for theme changes
    const handleThemeChange = (e: CustomEvent) => {
      setIsDarkMode(e.detail.isDarkMode);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    // If it's a mobile device, don't initialize the mouse follower
    if (isMobileOrTablet) return;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, [isVisible, isMobileOrTablet]);

  // If it's a mobile device, don't render anything
  if (isMobileOrTablet) return null;

  // Define the color based on theme
  const cursorColor = isDarkMode ? 'rgb(22, 163, 74)' : 'white';

  return (
    <>
      {/* Circle outline with shadow - follows with lag */}
      <div
        className={`fixed pointer-events-none z-50 rounded-full transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: isClicking ? '18px' : '24px',
          height: isClicking ? '18px' : '24px',
          border: `2px solid ${cursorColor}`,
          backgroundColor: 'transparent',
          boxShadow: `0 0 10px ${cursorColor}`,
          transform: `translate(${position.x - (isClicking ? 9 : 12)}px, ${
            position.y - (isClicking ? 9 : 12)
          }px)`,
          transition: isClicking
            ? 'width 0.15s, height 0.15s, transform 0.05s'
            : 'width 0.15s, height 0.15s, transform 0.1s ease-out',
          mixBlendMode: isDarkMode ? 'normal' : 'difference'
        }}
      />
    </>
  );
};

export default MouseFollower;