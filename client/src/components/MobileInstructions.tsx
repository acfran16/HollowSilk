import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/use-is-mobile';

export default function MobileInstructions() {
  const isMobile = useIsMobile();
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (isMobile) {
      // Show instructions for first-time mobile users
      const hasSeenInstructions = localStorage.getItem('mobileInstructionsSeen');
      if (!hasSeenInstructions) {
        setShowInstructions(true);
      }
    }
  }, [isMobile]);

  const dismissInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem('mobileInstructionsSeen', 'true');
  };

  if (!isMobile || !showInstructions) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-auto text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Mobile Controls</h2>
        
        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center justify-between">
            <span>Move:</span>
            <span className="text-blue-600 font-semibold">← → arrows</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Jump:</span>
            <span className="text-blue-600 font-semibold">↑ arrow</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Dash:</span>
            <span className="text-blue-600 font-semibold">DASH button</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Attack:</span>
            <span className="text-blue-600 font-semibold">ATK button</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Special:</span>
            <span className="text-blue-600 font-semibold">SPL button</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Pause:</span>
            <span className="text-blue-600 font-semibold">⏸ button</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mb-4">
          Build combos by attacking to unlock special attacks!
        </p>
        
        <button
          onClick={dismissInstructions}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Got It!
        </button>
      </div>
    </div>
  );
}