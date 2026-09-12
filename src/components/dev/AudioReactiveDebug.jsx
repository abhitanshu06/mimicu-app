import React, { useEffect, useRef, useState } from 'react';
import { audioReactiveManager } from '../../utils/audioReactiveManager';

/**
 * AudioReactiveDebug
 * 
 * Development-only visual HUD showing real-time Bass, Mid, Treble, and Energy meters.
 * 
 * Strictly disabled in production builds (`import.meta.env.PROD`).
 * Activated in development via `?debugAudio=true` query param or `window.__MIMICU_DEBUG_AUDIO__ = true`.
 * 
 * Performance:
 * Uses a decoupled requestAnimationFrame loop with direct DOM element styling (zero React re-renders).
 */
export default function AudioReactiveDebug() {
  // Completely disabled in production
  if (!import.meta.env.DEV) {
    return null;
  }

  const [visible, setVisible] = useState(false);
  const bassBarRef = useRef(null);
  const midBarRef = useRef(null);
  const trebleBarRef = useRef(null);
  const energyBarRef = useRef(null);
  const vibeLabelRef = useRef(null);

  useEffect(() => {
    // Check if activated
    const isDebug = window.location.search.includes('debugAudio=true') || window.__MIMICU_DEBUG_AUDIO__ === true;
    if (isDebug) {
      setVisible(true);
    }

    // Allow hotkey Shift + D in dev mode
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key === 'D') {
        setVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!visible) return;

    let animId;
    const updateHUD = () => {
      const audio = audioReactiveManager.getValues();

      if (bassBarRef.current) {
        bassBarRef.current.style.width = `${Math.min(100, Math.round(audio.bass * 100))}%`;
      }
      if (midBarRef.current) {
        midBarRef.current.style.width = `${Math.min(100, Math.round(audio.mid * 100))}%`;
      }
      if (trebleBarRef.current) {
        trebleBarRef.current.style.width = `${Math.min(100, Math.round(audio.treble * 100))}%`;
      }
      if (energyBarRef.current) {
        energyBarRef.current.style.width = `${Math.min(100, Math.round(audio.overallEnergy * 100))}%`;
      }
      if (vibeLabelRef.current) {
        vibeLabelRef.current.textContent = `${audio.vibeId} (${audioReactiveManager.mode})`;
      }

      animId = requestAnimationFrame(updateHUD);
    };

    animId = requestAnimationFrame(updateHUD);
    return () => cancelAnimationFrame(animId);
  }, [visible]);

  if (!visible) return null;

  return (
    <aside 
      aria-label="Audio Reactive Telemetry Debug HUD"
      className="fixed bottom-24 right-5 z-50 p-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl bg-black/70 text-white font-mono text-[11px] w-56 select-none pointer-events-auto transition-all"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <span className="font-bold text-emerald-400">AUDIO REACTIVE HUD</span>
        <button 
          onClick={() => setVisible(false)}
          className="text-white/50 hover:text-white px-1"
        >
          ×
        </button>
      </div>

      <div ref={vibeLabelRef} className="text-white/70 text-[10px] mb-2 truncate">
        Loading vibe...
      </div>

      <div className="flex flex-col gap-1.5">
        <div>
          <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
            <span>BASS</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div ref={bassBarRef} className="h-full bg-amber-400 transition-all duration-75" style={{ width: '0%' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
            <span>MID</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div ref={midBarRef} className="h-full bg-purple-400 transition-all duration-75" style={{ width: '0%' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
            <span>TREBLE</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div ref={trebleBarRef} className="h-full bg-cyan-400 transition-all duration-75" style={{ width: '0%' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
            <span>ENERGY</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div ref={energyBarRef} className="h-full bg-emerald-400 transition-all duration-75" style={{ width: '0%' }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
