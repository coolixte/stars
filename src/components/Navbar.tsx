import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode on initial load
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    
    // Dispatch a custom event to notify other components about the theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { isDarkMode: !isDarkMode } 
    }));
  };

  // Dark mode toggle component to ensure consistency
  const DarkModeToggle = () => (
    <div
      onClick={toggleDarkMode}
      className="relative inline-flex items-center cursor-pointer"
    >
      <Sun className="h-4 w-4 text-yellow-400 mr-1" />
      <div className="w-11 h-6 bg-green-600 dark:bg-green-600 rounded-full transition-colors duration-300">
        <div 
          className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform ${
            isDarkMode ? "translate-x-6" : "translate-x-1"
          }`}
        ></div>
      </div>
      <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300 ml-1" />
    </div>
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 py-4 transition-all duration-300 mx-auto max-w-[260px] rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-md dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)] border border-black dark:border-white w-[260px]"
    >
      <div className="container mx-auto flex justify-center items-center">
        {/* Dark Mode Toggle Slider */}
        <DarkModeToggle />
      </div>
    </motion.nav>
  );
};

export default Navbar;