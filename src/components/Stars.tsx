import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { motion } from "framer-motion";
import BackgroundAnimation from "./BackgroundAnimation";
import StarsSettings from "./StarsSettings";
import Navbar from "./Navbar";
import MouseFollower from "./MouseFollower";

const Stars = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [starSettings, setStarSettings] = useState<Record<string, number>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle theme detection and changes
  useEffect(() => {
    // Function to check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    // Check initial theme
    checkDarkMode();
    
    // Listen for theme changes using the custom event
    const handleThemeChange = (e: CustomEvent) => {
      checkDarkMode();
    };
    
    // Also listen for class changes on the html element as a fallback
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleApplySettings = (settings: Record<string, number>) => {
    setStarSettings(settings);
    setIsSettingsOpen(false);
  };

  // Set title
  useEffect(() => {
    document.title = "Play with the Stars";
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden">
      <BackgroundAnimation customSettings={starSettings} />
      <MouseFollower />
      <Navbar />
      
      {/* Settings button */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed top-24 left-0 right-0 mx-auto w-fit z-40"
      >
        <button
          onClick={handleOpenSettings}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl backdrop-blur-md shadow-md transition-colors font-light text-sm
            ${isDarkMode 
              ? 'bg-black text-white border border-white hover:border-white/80' 
              : 'bg-white text-black border border-black hover:border-black/80'}`}
        >
          <span>Settings</span>
          <Settings size={16} className="ml-1" />
        </button>
      </motion.div>
      
      {/* Stars Settings Popup */}
      <StarsSettings 
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onApply={handleApplySettings}
        isDarkMode={isDarkMode}
        key={`settings-${isDarkMode}`} // Force re-render when theme changes
      />
    </div>
  );
};

export default Stars;