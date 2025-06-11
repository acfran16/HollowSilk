import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../hooks/use-is-mobile';

interface MobileControlsProps {
  onInput: (action: string, pressed: boolean) => void;
}

export default function MobileControls({ onInput }: MobileControlsProps) {
  const isMobile = useIsMobile();
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set());
  const touchStartRef = useRef<{ [key: string]: number }>({});

  if (!isMobile) return null;

  const handleTouchStart = (action: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current[action] = touch.identifier;
    
    setActiveButtons(prev => new Set(prev).add(action));
    onInput(action, true);
  };

  const handleTouchEnd = (action: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    
    // Check if the touch that ended was the one that started this action
    const wasActive = Array.from(e.changedTouches).some(
      touch => touch.identifier === touchStartRef.current[action]
    );
    
    if (wasActive) {
      delete touchStartRef.current[action];
      setActiveButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(action);
        return newSet;
      });
      onInput(action, false);
    }
  };

  const buttonClass = (action: string) =>
    `select-none touch-none rounded-lg border-2 font-bold text-white transition-all duration-100 ${
      activeButtons.has(action)
        ? 'bg-blue-600 border-blue-400 scale-95 shadow-inner'
        : 'bg-blue-500 border-blue-300 shadow-lg active:scale-95'
    }`;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Movement Controls - Left Side */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        {/* D-Pad */}
        <div className="relative w-32 h-32">
          {/* Left Arrow */}
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 ${buttonClass('ArrowLeft')}`}
            onTouchStart={handleTouchStart('ArrowLeft')}
            onTouchEnd={handleTouchEnd('ArrowLeft')}
            onTouchCancel={handleTouchEnd('ArrowLeft')}
          >
            ←
          </button>
          
          {/* Right Arrow */}
          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 ${buttonClass('ArrowRight')}`}
            onTouchStart={handleTouchStart('ArrowRight')}
            onTouchEnd={handleTouchEnd('ArrowRight')}
            onTouchCancel={handleTouchEnd('ArrowRight')}
          >
            →
          </button>
          
          {/* Up Arrow (Jump) */}
          <button
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 ${buttonClass(' ')}`}
            onTouchStart={handleTouchStart(' ')}
            onTouchEnd={handleTouchEnd(' ')}
            onTouchCancel={handleTouchEnd(' ')}
          >
            ↑
          </button>
        </div>
      </div>

      {/* Action Controls - Right Side */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="flex flex-col gap-3">
          {/* Top Row - Dash */}
          <div className="flex justify-center">
            <button
              className={`w-16 h-12 ${buttonClass('ShiftLeft')} text-sm`}
              onTouchStart={handleTouchStart('ShiftLeft')}
              onTouchEnd={handleTouchEnd('ShiftLeft')}
              onTouchCancel={handleTouchEnd('ShiftLeft')}
            >
              DASH
            </button>
          </div>
          
          {/* Bottom Row - Attack Buttons */}
          <div className="flex gap-3">
            <button
              className={`w-16 h-16 rounded-full ${buttonClass('KeyX')} text-sm`}
              onTouchStart={handleTouchStart('KeyX')}
              onTouchEnd={handleTouchEnd('KeyX')}
              onTouchCancel={handleTouchEnd('KeyX')}
            >
              ATK
            </button>
            
            <button
              className={`w-16 h-16 rounded-full ${buttonClass('KeyZ')} text-sm`}
              onTouchStart={handleTouchStart('KeyZ')}
              onTouchEnd={handleTouchEnd('KeyZ')}
              onTouchCancel={handleTouchEnd('KeyZ')}
            >
              SPL
            </button>
          </div>
        </div>
      </div>

      {/* Pause Button - Top Right */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          className={`w-12 h-12 ${buttonClass('Escape')} text-xs`}
          onTouchStart={handleTouchStart('Escape')}
          onTouchEnd={handleTouchEnd('Escape')}
          onTouchCancel={handleTouchEnd('Escape')}
        >
          ⏸
        </button>
      </div>
    </div>
  );
}