import React, { useState, useEffect } from 'react';
import { DEFAULT_VALUES, resetToDefaultValues } from './BackgroundAnimation'; // Import default values

// Define the settings parameters and their ranges
const SETTINGS_PARAMS = [
  { id: 'totalStarCount', name: 'Star Count', min: 50, max: 200, step: 10 },
  { id: 'minStarSize', name: 'Min Star Size', min: 0.5, max: 3, step: 0.1 },
  { id: 'maxStarSize', name: 'Max Star Size', min: 1.5, max: 20, step: 0.1 },
  { id: 'minStarOpacity', name: 'Min Opacity', min: 0.1, max: 0.5, step: 0.05 },
  { id: 'maxStarOpacity', name: 'Max Opacity', min: 0.5, max: 1, step: 0.05 },
  { id: 'baseMovementSpeed', name: 'Base Speed', min: 0.1, max: 1, step: 0.05 },
  { id: 'minMovementSpeed', name: 'Min Speed', min: 0.05, max: 0.5, step: 0.05 },
  { id: 'maxMovementSpeed', name: 'Max Speed', min: 0.2, max: 2, step: 0.1 },
  { id: 'directionChangeChance', name: 'Direction Change Chance', min: 0.001, max: 0.05, step: 0.001 },
  { id: 'directionChangeStrength', name: 'Direction Change Strength', min: 0.1, max: 1, step: 0.1 },
  { id: 'pushRecoveryRate', name: 'Push Recovery Rate', min: 0.9, max: 0.99, step: 0.01 },
  { id: 'cursorEffectRadius', name: 'Cursor Effect Radius', min: 50, max: 300, step: 10 },
  { id: 'cursorEffectPower', name: 'Cursor Effect Power', min: 0.5, max: 3, step: 0.1 },
  { id: 'minLineDistance', name: 'Line Connection Distance', min: 50, max: 300, step: 10 },
  { id: 'maxLineOpacity', name: 'Line Opacity', min: 0.1, max: 1, step: 0.1 },
  { id: 'maxLineThickness', name: 'Line Thickness', min: 0.5, max: 5, step: 0.5 },
];

interface StarsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (settings: Record<string, number>) => void;
  isDarkMode?: boolean;
}

const StarsSettings: React.FC<StarsSettingsProps> = ({ isOpen, onClose, onApply, isDarkMode = false }) => {
  const [settings, setSettings] = useState<Record<string, number>>({});
  
  // Initialize settings with current default values
  useEffect(() => {
    const defaults: Record<string, number> = {};
    SETTINGS_PARAMS.forEach(param => {
      // Type assertion needed since DEFAULT_VALUES contains both number and RGB object values
      const value = DEFAULT_VALUES[param.id as keyof typeof DEFAULT_VALUES];
      if (typeof value === "number") {
        defaults[param.id] = value;
      } else {
        // Skip RGB color values as they're not compatible with the Record<string, number> type
        console.warn(`Skipping non-number value for ${param.id}`);
      }
    });
    setSettings(defaults);
  }, [isOpen]); // Re-initialize when popup opens

  const handleChange = (id: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleApply = () => {
    onApply(settings);
  };

  const handleResetSettings = () => {
    // Reset to default values
    const numericDefaults = resetToDefaultValues();
    
    // Update the state with default values
    setSettings(numericDefaults);
    
    // Save to localStorage
    localStorage.removeItem("starSettings"); // Remove custom settings
    
    // Show success message using alert instead of toast
    alert("Settings reset to defaults");
    
    // Apply the default settings immediately
    onApply(numericDefaults);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Settings panel */}
      <div 
        className={`relative max-w-2xl w-full max-h-[80vh] overflow-auto flex flex-col rounded-xl shadow-xl border ${
          isDarkMode 
            ? 'bg-black border-white text-white' 
            : 'bg-white border-black text-black'
        } backdrop-blur-md`}
      >
        <div className={`p-4 flex justify-between items-center border-b ${
          isDarkMode ? 'border-white/50' : 'border-black/50'
        }`}>
          <h2 className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>Stars Settings</h2>
          <button 
            onClick={onClose}
            className={`${
              isDarkMode 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-black'
            } transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Settings content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SETTINGS_PARAMS.map(param => (
              <div key={param.id} className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <label className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {param.name}
                  </label>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {settings[param.id]}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={settings[param.id] || 0}
                  onChange={(e) => handleChange(param.id, parseFloat(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-green-600 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer with action buttons */}
        <div className={`p-4 flex justify-between items-center border-t ${
          isDarkMode ? 'border-white/50' : 'border-black/50'
        }`}>
          <button
            onClick={handleResetSettings}
            className={`px-4 py-2 text-sm font-light rounded-md ${
              isDarkMode 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-white/50' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-black/50'
            }`}
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-light text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StarsSettings;
