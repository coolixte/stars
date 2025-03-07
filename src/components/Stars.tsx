import React, { useState, useEffect } from "react";
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
    
    // Listen for star settings changes
    const handleStarSettingsChange = (e: CustomEvent) => {
      if (e.detail && e.detail.settings) {
        setStarSettings(e.detail.settings);
      }
    };
    
    window.addEventListener('starSettingsChanged', handleStarSettingsChange as EventListener);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
      window.removeEventListener('starSettingsChanged', handleStarSettingsChange as EventListener);
    };
  }, []);

  // Set title
  useEffect(() => {
    document.title = "STARS ⸱ CALIXTE LAMOTTE";
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden">
      <BackgroundAnimation customSettings={starSettings} />
      <MouseFollower />
      <Navbar />
      
      {/* Footer text */}
      <div className="fixed bottom-4 left-0 right-0 text-center z-10">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={`text-xs font-light ${isDarkMode ? 'text-green-600' : 'text-black'}`}
        >
          2025 ⸱ @Calixte Lamotte
        </motion.p>
      </div>
    </div>
  );
};

export default Stars;