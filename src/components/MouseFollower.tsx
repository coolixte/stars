import React, { useState, useEffect } from 'react';

const MouseFollower = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

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

    checkDevice();

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
    };
  }, [isVisible, isMobileOrTablet]);

  // If it's a mobile device, don't render anything
  if (isMobileOrTablet) return null;

  return (
    <>
      {/* Large circle - follows with lag */}
      <div
        className={`fixed pointer-events-none z-50 rounded-full mix-blend-difference transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: isClicking ? '18px' : '24px',
          height: isClicking ? '18px' : '24px',
          backgroundColor: 'white', 
          transform: `translate(${position.x - (isClicking ? 9 : 12)}px, ${
            position.y - (isClicking ? 9 : 12)
          }px)`,
          transition: isClicking
            ? 'width 0.15s, height 0.15s, transform 0.05s'
            : 'width 0.15s, height 0.15s, transform 0.1s ease-out'
        }}
      />
      
      {/* Small dot - follows cursor exactly */}
      <div
        className={`fixed pointer-events-none z-50 rounded-full mix-blend-difference transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: '4px',
          height: '4px',
          backgroundColor: 'white',
          transform: `translate(${position.x - 2}px, ${position.y - 2}px)`,
        }}
      />
    </>
  );
};

export default MouseFollower;